import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  ZoomIn,
} from 'lucide-react';
import {
  vectorizeImageData,
  calculateOtsuThreshold,
  VectorizeResult,
} from '../../utils/vectorizer';
import { ImageUploadResult } from '../../utils/imageUpload';

interface VectorizeModalProps {
  uploadResult: ImageUploadResult | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyVector: (vectorSvgUrl: string, fileName: string, pathCount: number, width: number, height: number) => void;
  onUseOriginalRaster: (uploadResult: ImageUploadResult) => void;
}

export const VectorizeModal: React.FC<VectorizeModalProps> = ({
  uploadResult,
  isOpen,
  onClose,
  onApplyVector,
  onUseOriginalRaster,
}) => {
  const [threshold, setThreshold] = useState<number>(128);
  const [invert, setInvert] = useState<boolean>(false);
  const [smoothing, setSmoothing] = useState<number>(1.2);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [vectorResult, setVectorResult] = useState<VectorizeResult | null>(null);
  const [activeTab, setActiveTab] = useState<'comparison' | 'vector_only' | 'original_only'>('comparison');

  const canvasSourceRef = useRef<HTMLCanvasElement | null>(null);
  const rawImageDataRef = useRef<ImageData | null>(null);

  // Inicializa a imagem no canvas e calcula o limiar inicial
  useEffect(() => {
    if (!isOpen || !uploadResult) {
      setVectorResult(null);
      rawImageDataRef.current = null;
      return;
    }

    let isMounted = true;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!isMounted) return;

      // Redimensiona moderadamente para fluidez de interação em tempo real (< 100ms)
      const maxDim = 600;
      let targetW = img.naturalWidth || 600;
      let targetH = img.naturalHeight || 600;

      if (targetW > maxDim || targetH > maxDim) {
        if (targetW >= targetH) {
          targetH = Math.round((targetH * maxDim) / targetW);
          targetW = maxDim;
        } else {
          targetW = Math.round((targetW * maxDim) / targetH);
          targetH = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.drawImage(img, 0, 0, targetW, targetH);
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      rawImageDataRef.current = imgData;

      // Calcula limiar ótimo de Otsu
      const initialOtsu = calculateOtsuThreshold(imgData.data, targetW, targetH);
      setThreshold(initialOtsu);
      setInvert(false);
      setSmoothing(1.2);

      const res = vectorizeImageData(imgData, {
        threshold: initialOtsu,
        invert: false,
        smoothing: 1.2,
      });

      setVectorResult(res);
      setIsProcessing(false);
    };

    img.onerror = () => {
      if (isMounted) setIsProcessing(false);
    };

    img.src = uploadResult.dataUrl;

    return () => {
      isMounted = false;
    };
  }, [isOpen, uploadResult]);

  // Recalcula o vetor quando o usuário mexe nos sliders
  const handleRecalculate = (
    newThreshold: number,
    newInvert: boolean,
    newSmoothing: number
  ) => {
    if (!rawImageDataRef.current) return;
    setIsProcessing(true);

    try {
      const res = vectorizeImageData(rawImageDataRef.current, {
        threshold: newThreshold,
        invert: newInvert,
        smoothing: newSmoothing,
      });
      setVectorResult(res);
    } catch {
      // Ignora erro
    } finally {
      setIsProcessing(false);
    }
  };

  const handleThresholdChange = (val: number) => {
    setThreshold(val);
    handleRecalculate(val, invert, smoothing);
  };

  const handleInvertToggle = () => {
    const nextInvert = !invert;
    setInvert(nextInvert);
    handleRecalculate(threshold, nextInvert, smoothing);
  };

  const handleSmoothingChange = (val: number) => {
    setSmoothing(val);
    handleRecalculate(threshold, invert, val);
  };

  const handleResetOtsu = () => {
    if (!vectorResult) return;
    const otsu = vectorResult.otsuOptimalThreshold;
    setThreshold(otsu);
    setInvert(false);
    setSmoothing(1.2);
    handleRecalculate(otsu, false, 1.2);
  };

  if (!isOpen || !uploadResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative max-w-4xl w-full bg-[#18110D] border border-[#DFD3C3]/30 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#FAF8F5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Laboratório */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#140D09]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#C29B68]/20 border border-[#C29B68]/40">
              <Sparkles className="w-4 h-4 text-[#C29B68]" />
            </div>
            <div>
              <h2 className="font-serif text-sm sm:text-base font-bold text-[#E6DAC8] tracking-wide">
                Preparação &amp; Vetorização CNC de Imagem
              </h2>
              <p className="text-[11px] text-[#DFD3C3] truncate max-w-[280px] sm:max-w-md">
                Arquivo: <span className="text-[#FAF8F5] font-mono">{uploadResult.fileName}</span> (
                {uploadResult.width}×{uploadResult.height}px · {(uploadResult.fileSize / 1024).toFixed(0)} KB)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#DFD3C3] hover:text-[#FAF8F5] hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar e cancelar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo: Painel de Controles e Área de Pré-Visualização */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Coluna Esquerda: Controles de Binarização e Contorno (5 colunas) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-[#1F1611] p-4 border border-white/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C29B68] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Ajustes de Vetorização</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetOtsu}
                  className="text-[10px] text-[#C29B68] hover:underline flex items-center gap-1 cursor-pointer"
                  title="Restaurar limiar automático ideal calculado para esta imagem"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Auto-Otsu</span>
                </button>
              </div>

              {/* Slider 1: Limiar de Gravação (Threshold) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#E6DAC8]">Limiar de Contraste (Gravação)</span>
                  <span className="font-mono text-[#C29B68] font-bold text-[11px]">
                    {threshold} / 255
                  </span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={240}
                  step={1}
                  value={threshold}
                  onChange={(e) => handleThresholdChange(Number(e.target.value))}
                  className="w-full accent-[#C29B68] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#DFD3C3]/60">
                  <span>Mais Fino / Menos Traços</span>
                  <span>Mais Cheio / Mais Traços</span>
                </div>
              </div>

              {/* Slider 2: Suavização RDP (Tolerância das Fresas) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#E6DAC8]">Suavização de Contornos</span>
                  <span className="font-mono text-[#C29B68] font-bold text-[11px]">
                    {smoothing.toFixed(1)} px
                  </span>
                </div>
                <input
                  type="range"
                  min={0.6}
                  max={2.8}
                  step={0.2}
                  value={smoothing}
                  onChange={(e) => handleSmoothingChange(Number(e.target.value))}
                  className="w-full accent-[#C29B68] cursor-pointer"
                />
                <p className="text-[10px] text-[#DFD3C3]/70 leading-tight">
                  Remove degraus de pixel e gera curvas limpas para a ponta da fresa CNC.
                </p>
              </div>

              {/* Toggle: Inverter Preto e Branco */}
              <div className="pt-2 border-t border-white/10">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={invert}
                    onChange={handleInvertToggle}
                    className="w-4 h-4 rounded-xs accent-[#C29B68] cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#E6DAC8]">
                      Inverter Cores (Preto ↔ Branco)
                    </span>
                    <span className="text-[10px] text-[#DFD3C3]/70">
                      Útil para logotipos claros sobre fundo escuro
                    </span>
                  </div>
                </label>
              </div>

              {/* Diagnóstico Técnico da Vetorização */}
              {vectorResult && (
                <div className="p-3 bg-[#140D09] border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <span className="font-mono text-[10px] uppercase text-[#C29B68] font-bold">
                      Métricas da Geometria CNC
                    </span>
                    <span className="font-mono text-[11px] text-[#FAF8F5]">
                      {vectorResult.pathCount} caminhos · {vectorResult.pointCount} nós
                    </span>
                  </div>

                  {vectorResult.isComplexPhoto ? (
                    <div className="flex items-start gap-2 text-[11px] text-[#E0B16D]">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#E0B16D]" />
                      <div>
                        <strong className="block font-semibold text-[#FAF3EA]">Fotografia / Arte Complexa</strong>
                        <p className="text-[#DFD3C3] text-[10px] leading-relaxed">
                          A imagem possui muitos gradientes e caminhos finos. Você pode usar o vetor automático ou solicitar que a equipe do Atelier faça a vetorização manual especializada da sua foto para garantir um entalhe impecável.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-[11px] text-[#C29B68]">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#C29B68]" />
                      <div>
                        <strong className="block font-semibold text-[#FAF3EA]">Geometria CNC Excelente</strong>
                        <p className="text-[#DFD3C3] text-[10px] leading-relaxed">
                          Caminhos fechados de alto contraste, ideais para usinagem em madeira maciça ou preenchimento com resina.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-[10px] text-[#DFD3C3]/60 italic pt-2">
              * O vetor gerado é um arquivo SVG puro com caminhos fechados reais (não é uma imagem embutida).
            </div>
          </div>

          {/* Coluna Direita: Comparativo Visual (7 colunas) */}
          <div className="lg:col-span-7 flex flex-col space-y-2">
            {/* Seletor de Aba de Pré-Visualização */}
            <div className="flex items-center justify-between bg-[#140D09] p-1 border border-white/10 text-xs">
              <span className="text-[11px] font-bold text-[#E6DAC8] px-2 font-mono">
                Prévia em Tempo Real:
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('comparison')}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === 'comparison'
                      ? 'bg-[#C29B68] text-[#2A1E17]'
                      : 'text-[#DFD3C3] hover:text-[#FAF8F5]'
                  }`}
                >
                  Lado a Lado
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('vector_only')}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === 'vector_only'
                      ? 'bg-[#C29B68] text-[#2A1E17]'
                      : 'text-[#DFD3C3] hover:text-[#FAF8F5]'
                  }`}
                >
                  Vetor CNC
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('original_only')}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === 'original_only'
                      ? 'bg-[#C29B68] text-[#2A1E17]'
                      : 'text-[#DFD3C3] hover:text-[#FAF8F5]'
                  }`}
                >
                  Original
                </button>
              </div>
            </div>

            {/* Caixa de Exibição das Imagens */}
            <div className="flex-1 min-h-[300px] sm:min-h-[360px] bg-[#110B08] border border-white/10 p-3 flex items-center justify-center relative overflow-hidden">
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-20 text-xs text-[#C29B68] font-bold uppercase tracking-wider">
                  Processando geometria vetorial...
                </div>
              )}

              {activeTab === 'comparison' && (
                <div className="grid grid-cols-2 gap-3 w-full h-full items-center">
                  {/* Esquerda: Original */}
                  <div className="flex flex-col items-center justify-center p-2 bg-[#1C140F] border border-white/10 h-full">
                    <span className="text-[10px] font-mono text-[#DFD3C3]/70 uppercase mb-2">
                      Imagem Original
                    </span>
                    <div className="flex-1 flex items-center justify-center overflow-hidden max-h-[260px]">
                      <img
                        src={uploadResult.dataUrl}
                        alt="Original"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Direita: Vetor CNC */}
                  <div className="flex flex-col items-center justify-center p-2 bg-[#FAF8F5] border border-[#DFD3C3] h-full text-[#2A1E17]">
                    <span className="text-[10px] font-mono text-[#8A5835] font-bold uppercase mb-2">
                      Vetor CNC (Simulação na Madeira)
                    </span>
                    <div className="flex-1 flex items-center justify-center overflow-hidden max-h-[260px] w-full">
                      {vectorResult && (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: vectorResult.svgString }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'vector_only' && vectorResult && (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#FAF8F5] text-[#2A1E17]">
                  <span className="text-[11px] font-mono text-[#8A5835] font-bold uppercase mb-2">
                    Arte Vetorial Limpa para Fresagem CNC
                  </span>
                  <div
                    className="flex-1 flex items-center justify-center max-h-[320px] w-full"
                    dangerouslySetInnerHTML={{ __html: vectorResult.svgString }}
                  />
                </div>
              )}

              {activeTab === 'original_only' && (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <span className="text-[11px] font-mono text-[#DFD3C3]/70 uppercase mb-2">
                    Imagem Original Enviada
                  </span>
                  <img
                    src={uploadResult.dataUrl}
                    alt="Original"
                    className="max-h-[320px] max-w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rodapé: Botões de Decisão do Cliente */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#140D09] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 bg-transparent hover:bg-white/10 text-[#DFD3C3] hover:text-[#FAF8F5] text-xs transition-colors cursor-pointer border border-white/20"
          >
            Cancelar
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Opção Secundária: Usar Imagem Original para o Atelier Tratar Manualmente */}
            <button
              type="button"
              onClick={() => onUseOriginalRaster(uploadResult)}
              className="px-3.5 py-2 bg-[#2A1E17] hover:bg-[#3D2C22] text-[#DFD3C3] text-xs font-semibold transition-colors cursor-pointer border border-[#DFD3C3]/30"
              title="Inserir imagem original; nossa equipe técnica fará o ajuste fino manual da arte antes da usinagem"
            >
              Usar Imagem Original (Revisão Manual do Atelier)
            </button>

            {/* Opção Primária: Inserir Vetor Gerado */}
            <button
              type="button"
              disabled={!vectorResult || vectorResult.pathCount === 0}
              onClick={() => {
                if (vectorResult) {
                  onApplyVector(
                    vectorResult.dataUrl,
                    `${uploadResult.fileName.replace(/\.[^/.]+$/, '')}-vetor.svg`,
                    vectorResult.pathCount,
                    vectorResult.width,
                    vectorResult.height
                  );
                }
              }}
              className="px-4 py-2 bg-[#C29B68] hover:bg-[#D4AC7D] text-[#2A1E17] text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Adicionar Vetor ao Editor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
