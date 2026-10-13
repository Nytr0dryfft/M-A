export type ProductPieceType = 'tabua_carne' | 'porta_copos';

export type WoodId = 'pinus' | 'angelim' | 'cedrinho' | 'macaranduba';

export type CncTechniqueId = 'baixo_relevo_resina' | 'baixo_relevo_puro';

export type FinishId = 'oleo_cera' | 'verniz_impermeavel';

export type PreviewMode = 'realista' | 'monocromatico_cnc' | 'tecnico_guias';

export interface CncTechniqueOption {
  id: CncTechniqueId;
  name: string;
  shortDesc: string;
  badge: string;
  priceModifier: number; // Ex: +15 para resina
  applicableTo: ProductPieceType[];
  isResin: boolean;
}

export interface FinishOption {
  id: FinishId;
  name: string;
  shortDesc: string;
  foodSafe: boolean;
  priceModifier: number;
}

export interface CanvasElement {
  id: string;
  type: 'image' | 'text';
  // Posição central em coordenadas percentuais relativas à tábua (0 a 100%)
  // 50% = centro exato da tábua
  xPercent: number;
  yPercent: number;
  // Dimensões físicas reais em centímetros
  widthCm: number;
  heightCm: number;
  rotationDeg: number; // -180 a 180
  zIndex: number;
  aspectRatio: number; // width / height

  // Dados para tipo 'image'
  imageSrc?: string;
  imageFileName?: string;
  imageFileType?: string;
  imageFileSize?: number;
  naturalWidth?: number;
  naturalHeight?: number;
  isSvg?: boolean;
  hasAlpha?: boolean;
  isRaster?: boolean;
  isVectorized?: boolean;
  needsManualVectorization?: boolean;
  vectorPathCount?: number;

  // Dados para tipo 'text'
  text?: string;
  fontFamily?: string;
  fontSizePt?: number;
  textAlign?: 'left' | 'center' | 'right';
  isBold?: boolean;
  isItalic?: boolean;
  textColor?: string;
}

export interface TechnicalAnalysis {
  hasOutOfBounds: boolean;
  hasGrooveCollision: boolean;
  hasLowResolution: boolean;
  needsVectorization: boolean;
  totalElements: number;
  minDpiEstimated: number;
  warnings: string[];
  recommendations: string[];
  status: 'aprovado_previa' | 'atencao' | 'ajuste_necessario';
}

export interface BudgetBreakdown {
  basePrice: number;
  dimensionsAddon: number;
  woodAddon: number;
  techniqueAddon: number;
  finishAddon: number;
  artPrepFee: number;
  totalEstimated: number;
  items: {
    label: string;
    description: string;
    value: number;
  }[];
}


export interface OrderQuoteData {
  orderId: string;
  createdAt: string;
  pieceType: ProductPieceType;
  pieceLabel: string;
  woodId: WoodId;
  woodName: string;
  dimensions: {
    lengthCm: number;
    widthCm: number;
    thicknessCm: number;
  };
  technique: CncTechniqueOption;
  finish: FinishOption;
  elements: CanvasElement[];
  budget: BudgetBreakdown;
  analysis: TechnicalAnalysis;
  clientName: string;
  clientContact: string; // WhatsApp / Telefone
  clientEmail?: string;
  quantity: number;
  notes: string;
  imageRightsConfirmed: boolean;
  previewDataUrl?: string;
}
