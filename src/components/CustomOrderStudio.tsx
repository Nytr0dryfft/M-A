import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Type,
  FileText,
  Layers,
  RotateCcw,
  RotateCw,
  Plus,
  Trash2,
  Copy,
  Info,
  Check,
  Send,
  Eye,
  Ruler,
  TreePine,
  ShieldAlert,
  HelpCircle,
  FolderOpen,
} from 'lucide-react';
import {
  ProductPieceType,
  WoodId,
  CncTechniqueId,
  FinishId,
  PreviewMode,
  CanvasElement,
  CncTechniqueOption,
  FinishOption,
  TechnicalAnalysis,
  BudgetBreakdown,
  OrderQuoteData,
} from '../types/configurator';
import { ATELIER_WOODS_LIST, getWoodById, DEFAULT_WOOD } from '../data/woods';
import { processUploadedFile, ImageUploadResult } from '../utils/imageUpload';
import { AVAILABLE_FONTS } from '../data/fonts';
import { InteractiveBoardCanvas } from './configurator/InteractiveBoardCanvas';
import { QuoteReviewModal } from './configurator/QuoteReviewModal';
import { VectorizeModal } from './configurator/VectorizeModal';

// Opções de Técnicas de Usinagem CNC do Atelier
const CNC_TECHNIQUES: CncTechniqueOption[] = [
  {
    id: 'baixo_relevo_resina',
    name: 'Baixo-Relevo CNC com Resina Epóxi Atóxica',
    shortDesc: 'Usinagem profunda com preenchimento em resina culinária polida à mão',
    badge: 'Mais Pedido · Impermeável',
    priceModifier: 15.0,
    applicableTo: ['tabua_carne', 'porta_copos'],
    isResin: true,
  },
  {
    id: 'baixo_relevo_puro',
    name: 'Baixo-Relevo em Madeira Pura Maciça',
    shortDesc: 'Entalhe escavado na própria madeira preservando as fibras e veios',
    badge: '100% Madeira Pura',
    priceModifier: 0.0,
    applicableTo: ['tabua_carne', 'porta_copos'],
    isResin: false,
  },
];

// Opções de Acabamento & Cura
const FINISH_OPTIONS: FinishOption[] = [
  {
    id: 'oleo_cera',
    name: 'Óleo Mineral USP & Cera Virgem de Abelha',
    shortDesc: 'Tratamento hidrorrepelente 100% natural, atóxico e próprio para alimentos',
    foodSafe: true,
    priceModifier: 0.0,
  },
  {
    id: 'verniz_impermeavel',
    name: 'Selante Impermeabilizante Acetinado',
    shortDesc: 'Máxima proteção contra respingos e condensação (recomendado para porta-copos)',
    foodSafe: false,
    priceModifier: 5.0,
  },
];

interface CustomOrderStudioProps {
  initialWood?: string;
  initialPieceType?: 'tabua_carne' | 'porta_copos';
  onSuccessOrder?: (summary: string) => void;
}

export const CustomOrderStudio: React.FC<CustomOrderStudioProps> = ({
  initialWood = DEFAULT_WOOD.name,
  initialPieceType,
  onSuccessOrder,
}) => {
  // 1. Estados de Configuração da Peça
  const [pieceType, setPieceType] = useState<ProductPieceType>(initialPieceType || 'tabua_carne');
  const isCuttingBoard = pieceType === 'tabua_carne';
  const isPortaCopos = pieceType === 'porta_copos';

  // Espessura rigorosa da engenharia do atelier (cm)
  const thicknessCm = isCuttingBoard ? 3.5 : 1.0;

  // Dimensões físicas em cm
  const minLength = isCuttingBoard ? 35 : 9;
  const maxLength = isCuttingBoard ? 50 : 12;
  const minWidth = isCuttingBoard ? 20 : 9;
  const maxWidth = isCuttingBoard ? 29 : 12;

  const [lengthCm, setLengthCm] = useState<number>(isCuttingBoard ? 40 : 10);
  const [widthCm, setWidthCm] = useState<number>(isCuttingBoard ? 29 : 10);
  const [woodType, setWoodType] = useState<string>(initialWood);
  const [techniqueId, setTechniqueId] = useState<CncTechniqueId>('baixo_relevo_resina');
  const [finishId, setFinishId] = useState<FinishId>('oleo_cera');

  // 2. Elementos Gráficos no Canvas (Composição)
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Pilha de Histórico para Desfazer / Refazer (Undo / Redo)
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // 3. Ferramentas de Inserção de Texto
  const [inputText, setInputText] = useState<string>('CHURRASCO & FAMÍLIA');
  const [selectedFont, setSelectedFont] = useState<string>(AVAILABLE_FONTS[0].fontFamily);
  const [isTextBold, setIsTextBold] = useState<boolean>(true);

  // 4. Modos de Visualização & Interface
  const [previewMode, setPreviewMode] = useState<PreviewMode>('realista');
  const [activeMobileTab, setActiveMobileTab] = useState<'config' | 'canvas' | 'art' | 'summary'>('canvas');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string>('');
  const [pendingUploadForVectorize, setPendingUploadForVectorize] = useState<ImageUploadResult | null>(null);
  const [isVectorizeModalOpen, setIsVectorizeModalOpen] = useState<boolean>(false);

  // Sincronização inicial de props
  useEffect(() => {
    if (initialWood) {
      const found = getWoodById(initialWood);
      setWoodType(found.name);
    }
  }, [initialWood]);

  useEffect(() => {
    if (initialPieceType) {
      handlePieceTypeChange(initialPieceType);
    }
  }, [initialPieceType]);

  // Recupera rascunho anterior de localStorage se existir
  useEffect(() => {
    try {
      const saved = localStorage.getItem('atelier_board_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.elements && Array.isArray(parsed.elements) && parsed.elements.length > 0) {
          setElements(parsed.elements);
          if (parsed.lengthCm) setLengthCm(parsed.lengthCm);
          if (parsed.widthCm) setWidthCm(parsed.widthCm);
          if (parsed.woodType) setWoodType(parsed.woodType);
          if (parsed.pieceType) setPieceType(parsed.pieceType);
        }
      }
    } catch {
      // Ignora falhas de leitura do cache local
    }
  }, []);

  // Salva rascunho automaticamente a cada mudança
  useEffect(() => {
    try {
      const draft = {
        elements,
        lengthCm,
        widthCm,
        woodType,
        pieceType,
        techniqueId,
      };
      localStorage.setItem('atelier_board_draft', JSON.stringify(draft));
    } catch {
      // Ignora
    }
  }, [elements, lengthCm, widthCm, woodType, pieceType, techniqueId]);

  // Registra alteração no histórico para Undo/Redo
  const pushHistory = useCallback(
    (newElements: CanvasElement[]) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, newElements];
      });
      setHistoryIndex((prev) => prev + 1);
      setElements(newElements);
    },
    [historyIndex]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  };

  // Switch de tipo de peça com calibração de limites
  const handlePieceTypeChange = (newType: ProductPieceType) => {
    setPieceType(newType);
    if (newType === 'tabua_carne') {
      setLengthCm((prev) => (prev >= 35 && prev <= 50 ? prev : 40));
      setWidthCm((prev) => (prev >= 20 && prev <= 29 ? prev : 29));
      if (woodType.toLowerCase().includes('cedr')) {
        setWoodType('Pinus');
      }
    } else {
      setLengthCm((prev) => (prev >= 9 && prev <= 12 ? prev : 10));
      setWidthCm((prev) => (prev >= 9 && prev <= 12 ? prev : 10));
    }
  };

  const availableWoods = pieceType === 'tabua_carne'
    ? ATELIER_WOODS_LIST.filter((w) => w.id !== 'cedrinho')
    : ATELIER_WOODS_LIST;

  const currentTechnique = useMemo(
    () => CNC_TECHNIQUES.find((t) => t.id === techniqueId) || CNC_TECHNIQUES[0],
    [techniqueId]
  );

  const currentFinish = useMemo(
    () => FINISH_OPTIONS.find((f) => f.id === finishId) || FINISH_OPTIONS[0],
    [finishId]
  );

  // 5. Upload e Processamento de Arquivos (SVG Direto ou Vetorização Interativa para Raster)
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError('');
      const result = await processUploadedFile(file);

      // A. Se for SVG Válido e Sanitizado: insere diretamente como arte vetorial pronta
      if (result.isSvg) {
        const aspect = result.width / result.height;
        const initialWidthCm = isPortaCopos
          ? Math.min(6.5, lengthCm - 3)
          : Math.min(15, lengthCm * 0.45);
        const initialHeightCm = +(initialWidthCm / aspect).toFixed(2);

        const newElement: CanvasElement = {
          id: `el-svg-${Date.now()}`,
          type: 'image',
          xPercent: 50,
          yPercent: 50,
          widthCm: +initialWidthCm.toFixed(2),
          heightCm: initialHeightCm,
          rotationDeg: 0,
          zIndex: elements.length + 1,
          aspectRatio: aspect,
          imageSrc: result.dataUrl,
          imageFileName: result.fileName,
          imageFileType: result.fileType,
          imageFileSize: result.fileSize,
          naturalWidth: result.width,
          naturalHeight: result.height,
          isSvg: true,
          isVectorized: false,
          hasAlpha: true,
        };

        const updated = [...elements, newElement];
        pushHistory(updated);
        setSelectedElementId(newElement.id);
        return;
      }

      // B. Se for imagem rasterizada (PNG, JPG, WEBP): abre o Laboratório de Vetorização CNC
      setPendingUploadForVectorize(result);
      setIsVectorizeModalOpen(true);
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao processar imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  // Aplicação da arte convertida no laboratório de vetorização
  const handleApplyVector = (
    vectorSvgUrl: string,
    fileName: string,
    pathCount: number,
    width: number,
    height: number
  ) => {
    const aspect = width / height || 1;
    const initialWidthCm = isPortaCopos
      ? Math.min(6.5, lengthCm - 3)
      : Math.min(15, lengthCm * 0.45);
    const initialHeightCm = +(initialWidthCm / aspect).toFixed(2);

    const newElement: CanvasElement = {
      id: `el-vec-${Date.now()}`,
      type: 'image',
      xPercent: 50,
      yPercent: 50,
      widthCm: +initialWidthCm.toFixed(2),
      heightCm: initialHeightCm,
      rotationDeg: 0,
      zIndex: elements.length + 1,
      aspectRatio: aspect,
      imageSrc: vectorSvgUrl,
      imageFileName: fileName,
      imageFileType: 'image/svg+xml',
      naturalWidth: width,
      naturalHeight: height,
      isSvg: true,
      isVectorized: true,
      vectorPathCount: pathCount,
      hasAlpha: true,
    };

    const updated = [...elements, newElement];
    pushHistory(updated);
    setSelectedElementId(newElement.id);
    setIsVectorizeModalOpen(false);
    setPendingUploadForVectorize(null);
  };

  // Aplicação da imagem original rasterizada para análise técnica do atelier
  const handleUseOriginalRaster = (res: ImageUploadResult) => {
    const aspect = res.width / res.height || 1;
    const initialWidthCm = isPortaCopos
      ? Math.min(6.5, lengthCm - 3)
      : Math.min(15, lengthCm * 0.45);
    const initialHeightCm = +(initialWidthCm / aspect).toFixed(2);

    const newElement: CanvasElement = {
      id: `el-raster-${Date.now()}`,
      type: 'image',
      xPercent: 50,
      yPercent: 50,
      widthCm: +initialWidthCm.toFixed(2),
      heightCm: initialHeightCm,
      rotationDeg: 0,
      zIndex: elements.length + 1,
      aspectRatio: aspect,
      imageSrc: res.dataUrl,
      imageFileName: res.fileName,
      imageFileType: res.fileType,
      imageFileSize: res.fileSize,
      naturalWidth: res.width,
      naturalHeight: res.height,
      isSvg: false,
      isRaster: true,
      needsManualVectorization: true,
      hasAlpha: res.hasAlpha,
    };

    const updated = [...elements, newElement];
    pushHistory(updated);
    setSelectedElementId(newElement.id);
    setIsVectorizeModalOpen(false);
    setPendingUploadForVectorize(null);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
      e.target.value = '';
    }
  };

  const onDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 6. Adição de Texto Personalizado
  const handleAddText = () => {
    if (!inputText.trim()) return;

    const aspect = 4; // Aspecto padrão de faixa de texto
    const textWidthCm = isPortaCopos ? 6.5 : 16;
    const textHeightCm = +(textWidthCm / aspect).toFixed(2);

    const newElement: CanvasElement = {
      id: `el-txt-${Date.now()}`,
      type: 'text',
      xPercent: 50,
      yPercent: 50,
      widthCm: textWidthCm,
      heightCm: textHeightCm,
      rotationDeg: 0,
      zIndex: elements.length + 1,
      aspectRatio: aspect,
      text: inputText.trim(),
      fontFamily: selectedFont,
      fontSizePt: 24,
      textAlign: 'center',
      isBold: isTextBold,
    };

    const updated = [...elements, newElement];
    pushHistory(updated);
    setSelectedElementId(newElement.id);
  };

  // 8. Manipulação de Elementos Existentes
  const handleUpdateElement = (updatedEl: CanvasElement) => {
    const updated = elements.map((el) => (el.id === updatedEl.id ? updatedEl : el));
    setElements(updated);
  };

  const handleDeleteElement = (id: string) => {
    const updated = elements.filter((el) => el.id !== id);
    pushHistory(updated);
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleDuplicateElement = (id: string) => {
    const original = elements.find((el) => el.id === id);
    if (!original) return;

    const clone: CanvasElement = {
      ...original,
      id: `el-clone-${Date.now()}`,
      xPercent: Math.min(90, original.xPercent + 4),
      yPercent: Math.min(90, original.yPercent + 4),
      zIndex: elements.length + 1,
    };

    const updated = [...elements, clone];
    pushHistory(updated);
    setSelectedElementId(clone.id);
  };

  const handleBringForward = (id: string) => {
    const updated = elements.map((el) =>
      el.id === id ? { ...el, zIndex: el.zIndex + 1 } : el
    );
    pushHistory(updated);
  };

  const handleSendBackward = (id: string) => {
    const updated = elements.map((el) =>
      el.id === id ? { ...el, zIndex: Math.max(1, el.zIndex - 1) } : el
    );
    pushHistory(updated);
  };

  const handleAlignElement = (
    id: string,
    alignment: 'center_h' | 'center_v' | 'left' | 'right' | 'top' | 'bottom'
  ) => {
    const updated = elements.map((el) => {
      if (el.id !== id) return el;
      let newX = el.xPercent;
      let newY = el.yPercent;

      if (alignment === 'center_h') newX = 50;
      if (alignment === 'center_v') newY = 50;
      if (alignment === 'left') newX = 25;
      if (alignment === 'right') newX = 75;
      if (alignment === 'top') newY = 25;
      if (alignment === 'bottom') newY = 75;

      return { ...el, xPercent: newX, yPercent: newY };
    });

    pushHistory(updated);
  };

  // 9. Análise Técnica e Verificação de Viabilidade CNC
  const technicalAnalysis: TechnicalAnalysis = useMemo(() => {
    const grooveMarginCm = 1.8;
    const grooveWidthCm = 1.0;
    const safeMarginCm = isPortaCopos ? 1.0 : grooveMarginCm + grooveWidthCm + 0.8;

    let hasCollision = false;
    let hasLowRes = false;
    let needsVec = false;
    let minDpi = 300;
    const warnings: string[] = [];
    const recommendations: string[] = [];

    elements.forEach((el) => {
      const centerX = (el.xPercent / 100) * lengthCm;
      const centerY = (el.yPercent / 100) * widthCm;
      const halfW = el.widthCm / 2;
      const halfH = el.heightCm / 2;

      // Colisão com canaleta/margem
      if (
        centerX - halfW < safeMarginCm ||
        centerX + halfW > lengthCm - safeMarginCm ||
        centerY - halfH < safeMarginCm ||
        centerY + halfH > widthCm - safeMarginCm
      ) {
        hasCollision = true;
      }

      // Verificação de resolução e necessidade de vetorização manual
      if (el.type === 'image') {
        if (el.naturalWidth && el.naturalHeight) {
          const widthInches = el.widthCm / 2.54;
          const dpi = el.naturalWidth / widthInches;
          if (dpi < minDpi) minDpi = Math.round(dpi);

          if (dpi < 150 && !el.isSvg) {
            hasLowRes = true;
          }
        }

        if (el.needsManualVectorization || (!el.isSvg && !el.isVectorized)) {
          needsVec = true;
        }
      }
    });

    if (hasCollision) {
      warnings.push(
        'Elementos estão muito próximos da canaleta de gordura ou bordas. Recomenda-se reduzir ou centralizar para evitar que a fresa CNC atinja a canaleta.'
      );
    }

    if (hasLowRes) {
      warnings.push(
        `Imagem com densidade estimada de ${minDpi} DPI. Arquivos com resolução inferior a 150 DPI podem apresentar serrilhado e necessitam de aprovação técnica.`
      );
    }

    if (needsVec) {
      recommendations.push(
        'Arte rasterizada original mantida: os marceneiros do Atelier realizarão a vetorização técnica e manual da sua arte antes do fresamento CNC.'
      );
    } else if (elements.length > 0) {
      recommendations.push(
        'Composição baseada em curvas limpas ou tipografia vetorial pronta para simulação de percurso de fresa.'
      );
    }

    let status: TechnicalAnalysis['status'] = 'aprovado_previa';
    if (hasCollision) status = 'ajuste_necessario';
    else if (hasLowRes || needsVec) status = 'atencao';

    return {
      hasOutOfBounds: hasCollision,
      hasGrooveCollision: hasCollision,
      hasLowResolution: hasLowRes,
      needsVectorization: needsVec,
      totalElements: elements.length,
      minDpiEstimated: minDpi,
      warnings,
      recommendations,
      status,
    };
  }, [elements, lengthCm, widthCm, isPortaCopos]);

  // 10. Cálculo Dinâmico do Orçamento do Atelier
  const budgetBreakdown: BudgetBreakdown = useMemo(() => {
    if (isPortaCopos) {
      let base = 25.0;
      let techniqueAddon = currentTechnique.isResin ? 5.0 : 0.0;
      let woodAddon = 0.0;
      if (woodType.toLowerCase().includes('macaranduba') || woodType.toLowerCase().includes('maçaranduba')) {
        woodAddon = 5.0;
      } else if (woodType.toLowerCase().includes('angelim')) {
        woodAddon = 3.0;
      }

      const total = Math.max(25.0, Math.min(35.0, base + techniqueAddon + woodAddon));

      return {
        basePrice: 25.0,
        dimensionsAddon: 0.0,
        woodAddon,
        techniqueAddon,
        finishAddon: currentFinish.priceModifier,
        artPrepFee: 0.0,
        totalEstimated: total,
        items: [
          { label: 'Porta-Copos Maciço (Unidade)', description: 'Madeira usinada em CNC', value: base },
          ...(woodAddon > 0
            ? [{ label: `Madeira Nobre (${woodType})`, description: 'Espécie com alta densidade', value: woodAddon }]
            : []),
          ...(techniqueAddon > 0
            ? [{ label: 'Resina Epóxi Atóxica', description: 'Acabamento culinário de alto brilho', value: techniqueAddon }]
            : []),
        ],
      };
    }

    // Tábua de Carne (base de R$ 149,90 a R$ 209,90)
    const minVol = 35 * 20; // 700 cm2
    const maxVol = 50 * 29; // 1450 cm2
    const curVol = lengthCm * widthCm;
    const volFactor = Math.min(1, Math.max(0, (curVol - minVol) / (maxVol - minVol)));

    const basePrice = 149.9;
    const dimensionsAddon = +(volFactor * 35).toFixed(2);

    let woodAddon = 0.0;
    if (woodType.toLowerCase().includes('macaranduba') || woodType.toLowerCase().includes('maçaranduba')) {
      woodAddon = 15.0;
    } else if (woodType.toLowerCase().includes('angelim')) {
      woodAddon = 10.0;
    }

    const techniqueAddon = currentTechnique.isResin ? 15.0 : 0.0;

    // Taxa de preparação para artes raster complexas que exigem vetorização manual (R$ 20, ou 0 se apenas texto/vetor)
    const artPrepFee = technicalAnalysis.needsVectorization ? 20.0 : 0.0;

    const rawTotal = basePrice + dimensionsAddon + woodAddon + techniqueAddon + artPrepFee;
    const totalEstimated = Math.max(149.9, Math.min(229.9, +rawTotal.toFixed(2)));

    const items = [
      { label: 'Tábua de Carne Maciça (Base)', description: '35x20x3,5 cm com canaleta profunda', value: basePrice },
      ...(dimensionsAddon > 0
        ? [
            {
              label: `Dimensões Sob Medida (${lengthCm}x${widthCm} cm)`,
              description: 'Área ampliada de corte',
              value: dimensionsAddon,
            },
          ]
        : []),
      ...(woodAddon > 0
        ? [{ label: `Madeira ${woodType}`, description: 'Espécie nobre de alta durabilidade', value: woodAddon }]
        : []),
      ...(techniqueAddon > 0
        ? [{ label: 'Resina Epóxi Atóxica CNC', description: 'Selagem culinária certificada', value: techniqueAddon }]
        : []),
      ...(artPrepFee > 0
        ? [
            {
              label: 'Vetorização Técnica de Imagem',
              description: 'Preparação do percurso de ferramenta para fresa router',
              value: artPrepFee,
            },
          ]
        : []),
    ];

    return {
      basePrice,
      dimensionsAddon,
      woodAddon,
      techniqueAddon,
      finishAddon: currentFinish.priceModifier,
      artPrepFee,
      totalEstimated,
      items,
    };
  }, [
    isPortaCopos,
    lengthCm,
    widthCm,
    woodType,
    currentTechnique,
    currentFinish,
    technicalAnalysis.needsVectorization,
  ]);

  // Monta objeto completo da solicitação de orçamento
  const currentOrderData: OrderQuoteData = useMemo(() => {
    return {
      orderId: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      pieceType,
      pieceLabel: isCuttingBoard ? 'Tábua de Carne Sob Medida' : 'Porta-Copos Personalizado',
      woodId: (woodType.toLowerCase() as WoodId) || 'pinus',
      woodName: woodType,
      dimensions: {
        lengthCm,
        widthCm,
        thicknessCm,
      },
      technique: currentTechnique,
      finish: currentFinish,
      elements,
      budget: budgetBreakdown,
      analysis: technicalAnalysis,
      clientName: '',
      clientContact: '',
      quantity: 1,
      notes: '',
      imageRightsConfirmed: false,
      previewDataUrl: snapshotUrl,
    };
  }, [
    pieceType,
    isCuttingBoard,
    woodType,
    lengthCm,
    widthCm,
    thicknessCm,
    currentTechnique,
    currentFinish,
    elements,
    budgetBreakdown,
    technicalAnalysis,
    snapshotUrl,
  ]);

  const handleOrderConfirmed = (finalOrder: OrderQuoteData) => {
    if (onSuccessOrder) {
      onSuccessOrder(
        `Orçamento Solicitado (${finalOrder.orderId}): ${finalOrder.pieceLabel} em ${finalOrder.woodName} (${finalOrder.dimensions.lengthCm}x${finalOrder.dimensions.widthCm}cm). Total estimado: R$ ${finalOrder.budget.totalEstimated.toFixed(2).replace('.', ',')}`
      );
    }
  };

  return (
    <section
      className="py-8 sm:py-16 lg:py-24 bg-[#2A1E17] text-[#FAF8F5] relative overflow-hidden"
      id="encomenda"
    >
      {/* Luz ambiente de atelier */}
      <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-[#8A5835]/15 blur-3xl pointer-events-none" />

      <div className="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-10 xl:px-12 relative z-10">
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 border-b border-[#DFD3C3]/15 pb-4 sm:pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[2px] bg-[#C29B68]" />
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#C29B68] font-bold">
                Configurador Interativo · Atelier Sob Medida
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-bold tracking-tight">
              Crie sua Peça Autoral em Madeira Maciça
            </h2>
            <p className="text-xs sm:text-sm text-[#DFD3C3]/80 mt-1 max-w-2xl">
              Envie sua arte, posicione monogramas ou logotipos e visualize a usinagem em CNC com
              resina culinária em tempo real sobre a madeira selecionada.
            </p>
          </div>

          {/* Seletor de Tipo de Peça (Segmented Control Anti-Pill) */}
          <div className="flex items-center bg-[#15100D] p-1 border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => handlePieceTypeChange('tabua_carne')}
              className={`px-3 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                isCuttingBoard
                  ? 'bg-[#C29B68] text-[#111111] shadow'
                  : 'text-[#DFD3C3] hover:text-white'
              }`}
            >
              Tábua de Carne
            </button>
            <button
              type="button"
              onClick={() => handlePieceTypeChange('porta_copos')}
              className={`px-3 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                isPortaCopos
                  ? 'bg-[#C29B68] text-[#111111] shadow'
                  : 'text-[#DFD3C3] hover:text-white'
              }`}
            >
              Porta-Copos
            </button>
          </div>
        </div>

        {/* Abas Rápidas no Mobile para Evitar Rolagem Excessiva */}
        <div className="flex lg:hidden items-center justify-between bg-[#1A1410] border border-white/10 p-1 mb-4 text-xs font-bold uppercase tracking-wider overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveMobileTab('config')}
            className={`flex-1 py-2 text-center whitespace-nowrap px-2 ${
              activeMobileTab === 'config' ? 'bg-[#C29B68] text-[#111]' : 'text-[#DFD3C3]'
            }`}
          >
            1. Peça &amp; Madeira
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('canvas')}
            className={`flex-1 py-2 text-center whitespace-nowrap px-2 ${
              activeMobileTab === 'canvas' ? 'bg-[#C29B68] text-[#111]' : 'text-[#DFD3C3]'
            }`}
          >
            2. Editor Visual
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('art')}
            className={`flex-1 py-2 text-center whitespace-nowrap px-2 ${
              activeMobileTab === 'art' ? 'bg-[#C29B68] text-[#111]' : 'text-[#DFD3C3]'
            }`}
          >
            3. Arte &amp; Textos
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('summary')}
            className={`flex-1 py-2 text-center whitespace-nowrap px-2 ${
              activeMobileTab === 'summary' ? 'bg-[#C29B68] text-[#111]' : 'text-[#DFD3C3]'
            }`}
          >
            4. Orçamento
          </button>
        </div>

        {/* GRID PRINCIPAL EM 3 ÁREAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* =========================================================
              PAINEL A: CONFIGURAÇÃO DE MADEIRA, DIMENSÕES & ARTE
              (Desktop: 4 colunas / Mobile: abas 'config' e 'art')
             ========================================================= */}
          <div
            className={`lg:col-span-4 flex-col gap-4 sm:gap-5 ${
              activeMobileTab === 'config' || activeMobileTab === 'art' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Bloco 1: Seleção de Madeira & Dimensões */}
            {(activeMobileTab === 'config' || activeMobileTab === 'canvas') && (
              <div className="p-4 sm:p-5 bg-[#FAF8F5] text-[#111111] border border-[#DFD3C3] shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-[#DFD3C3]/80 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8A5835] flex items-center gap-1.5">
                    <TreePine className="w-3.5 h-3.5" />
                    <span>Madeira do Atelier</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#111]">
                    Espessura: {thicknessCm.toFixed(1).replace('.', ',')} cm
                  </span>
                </div>

                {/* Seleção de Espécies de Madeira */}
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  {availableWoods.map((wood) => {
                    const isSelected = woodType.toLowerCase() === wood.name.toLowerCase();
                    return (
                      <button
                        key={wood.id}
                        type="button"
                        onClick={() => setWoodType(wood.name)}
                        className={`p-2 sm:p-2.5 border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'border-[#8A5835] bg-[#FAF3EA] ring-1 ring-[#8A5835]'
                            : 'border-[#DFD3C3] bg-white hover:border-[#8A5835]/50'
                        }`}
                      >
                        <div
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xs shrink-0 border border-black/20 shadow-xs"
                          style={{
                            backgroundColor: wood.baseColor,
                            backgroundImage: `url("${wood.textureUrl}")`,
                            backgroundSize: 'cover',
                          }}
                        />
                        <div className="min-w-0">
                          <span className="font-serif font-bold text-xs block text-[#111] truncate">
                            {wood.name}
                          </span>
                          <span className="text-[10px] text-[#8A5835] block truncate">
                            {wood.treatment}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Controles Dimensionais */}
                <div className="space-y-3 pt-2 border-t border-[#DFD3C3]/60 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1 text-[#3E2D22]">
                      <span className="font-bold">Comprimento: {lengthCm} cm</span>
                      <span className="font-mono text-[10px] text-[#8A5835]">
                        ({minLength} a {maxLength} cm)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={minLength}
                      max={maxLength}
                      value={lengthCm}
                      onChange={(e) => setLengthCm(parseInt(e.target.value))}
                      className="w-full accent-[#8A5835] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1 text-[#3E2D22]">
                      <span className="font-bold">Largura: {widthCm} cm</span>
                      <span className="font-mono text-[10px] text-[#8A5835]">
                        ({minWidth} a {maxWidth} cm)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={minWidth}
                      max={maxWidth}
                      value={widthCm}
                      onChange={(e) => setWidthCm(parseInt(e.target.value))}
                      className="w-full accent-[#8A5835] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Técnica de Usinagem CNC */}
                <div className="pt-2 border-t border-[#DFD3C3]/60 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8A5835] block">
                    Técnica de Usinagem CNC
                  </span>
                  <div className="space-y-1.5">
                    {CNC_TECHNIQUES.map((tech) => (
                      <label
                        key={tech.id}
                        className={`flex items-start gap-2.5 p-2 border text-xs cursor-pointer transition-colors ${
                          techniqueId === tech.id
                            ? 'border-[#8A5835] bg-[#FAF3EA]'
                            : 'border-[#DFD3C3] bg-white hover:border-[#8A5835]/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="technique"
                          checked={techniqueId === tech.id}
                          onChange={() => setTechniqueId(tech.id)}
                          className="mt-0.5 accent-[#8A5835]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#111]">{tech.name}</span>
                            {tech.priceModifier > 0 && (
                              <span className="text-[10px] font-mono text-[#8A5835] font-bold">
                                +R$ {tech.priceModifier.toFixed(2).replace('.', ',')}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#5C4033] block leading-tight">
                            {tech.shortDesc}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bloco 2: Upload de Imagens & Textos Personalizados */}
            {(activeMobileTab === 'art' || activeMobileTab === 'canvas' || activeMobileTab === 'config') && (
              <div className="p-4 sm:p-5 bg-[#FAF8F5] text-[#111111] border border-[#DFD3C3] shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-[#DFD3C3]/80 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8A5835] flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload de Arte (SVG, PNG, JPG, WEBP)</span>
                  </span>
                  <span className="text-[10px] text-[#5C4033]">Máx. 15MB</span>
                </div>

                {/* Zona de Drag & Drop */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={onDropFile}
                  className={`p-4 border-2 border-dashed text-center transition-colors ${
                    isDragOver
                      ? 'border-[#8A5835] bg-[#FAF3EA]'
                      : 'border-[#DFD3C3] bg-white hover:border-[#8A5835]/50'
                  }`}
                >
                  <Upload className="w-6 h-6 text-[#8A5835] mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-[#111]">
                    Arraste sua arte aqui ou clique para selecionar
                  </p>
                  <p className="text-[10px] text-[#5C4033] mt-0.5">
                    SVG (vetor direto) ou PNG, JPG e WEBP (com vetorizador CNC)
                  </p>

                  <label className="mt-3 inline-block px-4 py-2 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-[11px] font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-colors">
                    {isUploading ? 'Processando...' : 'Carregar Imagem / Vetor'}
                    <input
                      type="file"
                      accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp"
                      onChange={onFileInputChange}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadError && (
                  <div className="p-2.5 bg-red-100 border border-red-300 text-red-800 text-[11px] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Adição de Textos Gravados */}
                <div className="pt-2 border-t border-[#DFD3C3]/60 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8A5835] flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5" />
                    <span>Adicionar Texto Gravado</span>
                  </span>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ex: Família Silveira · 2026"
                      maxLength={40}
                      className="flex-1 px-3 py-2 bg-white border border-[#DFD3C3] text-xs text-[#111] focus:outline-[#8A5835]"
                    />
                    <button
                      type="button"
                      onClick={handleAddText}
                      className="px-3 py-2 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Inserir
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================
              ÁREA CENTRAL B: EDITOR VISUAL INTERATIVO
              (Desktop: 5 colunas / Mobile: aba 'canvas')
             ========================================================= */}
          <div
            className={`lg:col-span-5 flex-col gap-3 ${
              activeMobileTab === 'canvas' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Toolbar Superior do Editor (Modos e Undo/Redo) */}
            <div className="w-full flex items-center justify-between bg-[#1C140F] p-2 border border-[#DFD3C3]/20 text-xs">
              {/* Botões de Desfazer e Refazer */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-1.5 hover:bg-white/10 text-white/80 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Desfazer alteração (Undo)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-1.5 hover:bg-white/10 text-white/80 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Refazer alteração (Redo)"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <span className="text-white/20 mx-1">|</span>
                <span className="text-[11px] text-[#C29B68] font-mono">
                  {elements.length} {elements.length === 1 ? 'elemento' : 'elementos'}
                </span>
              </div>

              <span className="text-[11px] text-[#C29B68] font-mono">
                {elements.length} {elements.length === 1 ? 'elemento posicionado' : 'elementos posicionados'}
              </span>
            </div>

            {/* O CANVAS INTERATIVO COMPLETO */}
            <InteractiveBoardCanvas
              pieceType={pieceType}
              lengthCm={lengthCm}
              widthCm={widthCm}
              thicknessCm={thicknessCm}
              woodType={woodType}
              isResin={currentTechnique.isResin}
              elements={elements}
              selectedElementId={selectedElementId}
              previewMode={previewMode}
              onSelectElement={setSelectedElementId}
              onUpdateElement={handleUpdateElement}
              onDeleteElement={handleDeleteElement}
              onDuplicateElement={handleDuplicateElement}
              onBringForward={handleBringForward}
              onSendBackward={handleSendBackward}
              onAlignElement={handleAlignElement}
              onSnapshotReady={setSnapshotUrl}
            />

            {/* Dica Contextual de Uso do Editor */}
            <div className="p-2.5 bg-[#1C140F]/80 border border-[#DFD3C3]/15 text-[11px] text-[#DFD3C3]/80 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#C29B68]" />
                <span>Clique e arraste para posicionar. Alças de canto redimensionam proporcionalmente.</span>
              </span>
              {elements.length > 0 && (
                <button
                  type="button"
                  onClick={() => pushHistory([])}
                  className="text-red-400 hover:text-red-300 text-[10px] uppercase font-bold underline cursor-pointer"
                >
                  Limpar Tudo
                </button>
              )}
            </div>
          </div>

          {/* =========================================================
              PAINEL C: RESUMO TÉCNICO & ORÇAMENTO DINÂMICO
              (Desktop: 3 colunas / Mobile: aba 'summary')
             ========================================================= */}
          <div
            className={`lg:col-span-3 flex-col gap-4 ${
              activeMobileTab === 'summary' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Card de Análise de Viabilidade Técnica CNC */}
            <div className="p-4 sm:p-5 bg-[#FAF8F5] text-[#111111] border border-[#DFD3C3] shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-[#DFD3C3]/80 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8A5835] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Análise de Viabilidade CNC</span>
                </span>
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-xs ${
                    technicalAnalysis.status === 'aprovado_previa'
                      ? 'bg-emerald-100 text-emerald-800'
                      : technicalAnalysis.status === 'atencao'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-red-100 text-red-900'
                  }`}
                >
                  {technicalAnalysis.status === 'aprovado_previa'
                    ? 'Zona Permitida OK'
                    : technicalAnalysis.status === 'atencao'
                    ? 'Exige Análise'
                    : 'Ajuste Necessário'}
                </span>
              </div>

              {/* Mensagens de Alerta ou Recomendações */}
              {technicalAnalysis.warnings.length > 0 ? (
                <div className="space-y-1.5">
                  {technicalAnalysis.warnings.map((warn, i) => (
                    <div
                      key={i}
                      className="p-2 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Todos os elementos respeitam a canaleta e as margens seguras.</span>
                </div>
              )}

              {/* Recomendações Técnicas do Atelier */}
              <div className="text-[10px] text-[#5C4033] space-y-1 pt-1 border-t border-[#DFD3C3]/60">
                <p>
                  • Imagens raster passam por vetorização técnica assistida antes do corte router CNC.
                </p>
                <p>
                  • A prévia visual simula a disposição e tonalidade comercial.
                </p>
              </div>
            </div>

            {/* Card de Orçamento Dinâmico com Discriminação */}
            <div className="p-4 sm:p-5 bg-[#FAF8F5] text-[#111111] border border-[#DFD3C3] shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-[#DFD3C3]/80 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8A5835]">
                  Estimativa de Investimento
                </span>
                <span className="text-[10px] text-[#8A5835] font-mono font-bold">
                  Sob Medida
                </span>
              </div>

              {/* Linhas de Discriminação */}
              <div className="space-y-2 text-xs">
                {budgetBreakdown.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[#3E2D22]">
                    <div>
                      <span className="font-semibold block">{item.label}</span>
                      <span className="text-[10px] text-[#5C4033] block">{item.description}</span>
                    </div>
                    <span className="font-mono font-bold text-[#111] shrink-0">
                      R$ {item.value.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totalizador de Destaque */}
              <div className="pt-3 border-t-2 border-[#8A5835]/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#8A5835] font-bold block">
                    Valor Estimado
                  </span>
                  <span className="text-[10px] text-[#5C4033] block">À vista via Pix ou Cartão</span>
                </div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] tabular-nums">
                  R$ {budgetBreakdown.totalEstimated.toFixed(2).replace('.', ',')}
                </span>
              </div>

              {/* Botão Principal de Solicitação de Orçamento */}
              <button
                type="button"
                onClick={() => setIsReviewOpen(true)}
                className="w-full py-4 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#C29B68]" />
                <span>Solicitar Orçamento &amp; Análise</span>
              </button>

              <span className="text-[10px] text-[#5C4033] text-center block leading-tight">
                Sem compromisso. Entraremos em contato pelo WhatsApp com a ficha técnica da fresagem.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Revisão & Confirmação de Orçamento */}
      <QuoteReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        orderData={currentOrderData}
        onConfirmOrder={handleOrderConfirmed}
      />

      {/* Laboratório de Vetorização CNC para PNG / JPG / WEBP */}
      <VectorizeModal
        isOpen={isVectorizeModalOpen}
        uploadResult={pendingUploadForVectorize}
        onClose={() => {
          setIsVectorizeModalOpen(false);
          setPendingUploadForVectorize(null);
        }}
        onApplyVector={handleApplyVector}
        onUseOriginalRaster={handleUseOriginalRaster}
      />
    </section>
  );
};
