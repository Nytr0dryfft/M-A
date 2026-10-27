import {
  ProductPieceType,
  BudgetBreakdown,
  CncTechniqueOption,
  FinishOption,
} from '../types/configurator';

/**
 * =======================================================================
 * SERVIÇO CENTRALIZADO DE PRECIFICAÇÃO DO ATELIÊ M&A
 * =======================================================================
 * Lógica Oficial e Estrita de Precificação de Tábuas de Carne e Porta-Copos:
 *
 * 1. PREÇO-BASE OFICIAL DA TÁBUA DE CARNE: R$ 109,90
 *    - Dimensões padrão: 40 × 29 × 3,5 cm
 *    - Madeira padrão: Pinus (acréscimo R$ 0,00)
 *    - Acabamento e tratamento em resina epóxi culinária JÁ INCLUSOS (R$ 0,00 extra)
 *    - Usinagem de precisão CNC e canaleta profunda JÁ INCLUSAS (R$ 0,00 extra)
 *    - Acabamento padrão (Óleo Mineral USP & Cera de Abelha) JÁ INCLUSO (R$ 0,00 extra)
 *
 * 2. ELIMINAÇÃO DA DUPLA COBRANÇA:
 *    - Não somar segunda cobrança por resina padrão
 *    - Não somar segunda cobrança por CNC padrão
 *    - Não adicionar custo de dimensões quando mantidas as padrão (40×29×3,5 cm = R$ 0,00)
 *
 * 3. FÓRMULA OFICIAL DE DIFERENÇAS:
 *    PREÇO FINAL = PREÇO-BASE (R$ 109,90)
 *                + DIFERENÇA DA MADEIRA
 *                + DIFERENÇA DAS DIMENSÕES
 *                + ADICIONAIS OPCIONAIS
 *
 * 4. CENÁRIOS HOMOLOGADOS:
 *    - Cenário A (Padrão 40x29x3,5 Pinus): R$ 109,90
 *    - Cenário B (Idem A): R$ 109,90
 *    - Cenário C (Pinus + Dimensões alteradas): R$ 109,90 +/- diferença proporcional
 *    - Cenário D (Angelim 40x29x3,5): R$ 109,90 + R$ 10,00 = R$ 119,90
 *    - Cenário E (Angelim + Dimensões alteradas): R$ 109,90 + R$ 10,00 + diferença de dimensões
 * =======================================================================
 */

export const STANDARD_BOARD_CONFIG = {
  BASE_PRICE: 109.90,
  LENGTH_CM: 40.0,
  WIDTH_CM: 29.0,
  THICKNESS_CM: 3.5,
  WOOD_NAME: 'Pinus',
  // Volume padrão da tábua oficial: 40 × 29 × 3,5 = 4060 cm³
  VOLUME_CM3: 40.0 * 29.0 * 3.5,
  // Cota variável de matéria-prima Pinus no preço-base (utilizada para cálculo proporcional de volume)
  WOOD_MATERIAL_BASE_VALUE: 40.00,
} as const;

export interface CalculateBudgetParams {
  pieceType: ProductPieceType;
  lengthCm: number;
  widthCm: number;
  thicknessCm: number;
  woodType: string;
  technique?: CncTechniqueOption;
  finish?: FinishOption;
  needsVectorization?: boolean;
}

/**
 * Calcula a diferença de preço da madeira selecionada em relação ao Pinus.
 * Pinus é a madeira base oficial (R$ 0,00 de acréscimo).
 */
export function calculateWoodDifference(woodNameOrId: string): { diff: number; isBase: boolean } {
  const normalized = (woodNameOrId || '').toLowerCase().trim();

  if (normalized.includes('macaranduba') || normalized.includes('maçaranduba')) {
    return { diff: 15.00, isBase: false };
  }
  if (normalized.includes('angelim')) {
    return { diff: 10.00, isBase: false };
  }
  if (normalized.includes('cedr')) {
    return { diff: 8.00, isBase: false };
  }

  // Pinus é a referência padrão (R$ 0,00)
  return { diff: 0.00, isBase: true };
}

/**
 * Calcula a diferença de preço dimensional em relação à tábua padrão de 40×29×3,5 cm.
 * Se as dimensões forem as padrão, a diferença é estritamente R$ 0,00.
 */
export function calculateBoardDimensionsDifference(
  lengthCm: number,
  widthCm: number,
  thicknessCm: number
): { diff: number; isStandard: boolean; currentVol: number; standardVol: number } {
  const standardVol = STANDARD_BOARD_CONFIG.VOLUME_CM3;
  const currentVol = lengthCm * widthCm * thicknessCm;

  // Tolerância de ponto flutuante para garantir R$ 0,00 absoluto na configuração padrão
  const isStandard =
    Math.abs(lengthCm - STANDARD_BOARD_CONFIG.LENGTH_CM) < 0.001 &&
    Math.abs(widthCm - STANDARD_BOARD_CONFIG.WIDTH_CM) < 0.001 &&
    Math.abs(thicknessCm - STANDARD_BOARD_CONFIG.THICKNESS_CM) < 0.001;

  if (isStandard) {
    return { diff: 0.00, isStandard: true, currentVol, standardVol };
  }

  // Diferença proporcional em relação ao volume da tábua padrão
  const volumeRatio = (currentVol - standardVol) / standardVol;
  const rawDiff = volumeRatio * STANDARD_BOARD_CONFIG.WOOD_MATERIAL_BASE_VALUE;
  const diff = Number(rawDiff.toFixed(2));

  return { diff, isStandard: false, currentVol, standardVol };
}

/**
 * Função Centralizada Oficial de Cálculo de Orçamento do Atelier M&A
 */
export function calculateBudgetBreakdown(params: CalculateBudgetParams): BudgetBreakdown {
  const {
    pieceType,
    lengthCm,
    widthCm,
    thicknessCm,
    woodType,
    technique,
    finish,
    needsVectorization = false,
  } = params;

  // -------------------------------------------------------------------------
  // CASO 1: PORTA-COPOS (Preservado integralmente conforme regras existentes)
  // -------------------------------------------------------------------------
  if (pieceType === 'porta_copos') {
    const base = 25.00;
    const isResin = technique?.isResin ?? true;
    const techniqueAddon = isResin ? 5.00 : 0.00;

    let woodAddon = 0.00;
    const normalizedWood = (woodType || '').toLowerCase().trim();
    if (normalizedWood.includes('macaranduba') || normalizedWood.includes('maçaranduba')) {
      woodAddon = 5.00;
    } else if (normalizedWood.includes('angelim')) {
      woodAddon = 3.00;
    }

    const finishAddon = finish?.priceModifier ?? 0.00;
    const total = Math.max(25.00, Math.min(35.00, base + techniqueAddon + woodAddon + finishAddon));

    return {
      basePrice: base,
      dimensionsAddon: 0.00,
      woodAddon,
      techniqueAddon,
      finishAddon,
      artPrepFee: 0.00,
      totalEstimated: total,
      items: [
        { label: 'Porta-Copos Maciço (Unidade)', description: 'Madeira usinada em router CNC', value: base },
        ...(woodAddon > 0
          ? [{ label: `Madeira Nobre (${woodType})`, description: 'Espécie com alta densidade', value: woodAddon }]
          : []),
        ...(techniqueAddon > 0
          ? [{ label: 'Resina Epóxi Atóxica', description: 'Acabamento culinário de alto brilho', value: techniqueAddon }]
          : []),
        ...(finishAddon > 0
          ? [{ label: 'Acabamento Especial', description: finish?.name || 'Selante acetinado', value: finishAddon }]
          : []),
      ],
    };
  }

  // -------------------------------------------------------------------------
  // CASO 2: TÁBUA DE CARNE AUTORAL (Lógica de Precificação Corrigida)
  // -------------------------------------------------------------------------
  const basePrice = STANDARD_BOARD_CONFIG.BASE_PRICE; // R$ 109,90

  // 1. Diferença da madeira (Pinus = R$ 0,00; Angelim = +R$ 10,00; Maçaranduba = +R$ 15,00)
  const woodResult = calculateWoodDifference(woodType);
  const woodAddon = woodResult.diff;

  // 2. Diferença das dimensões (40×29×3,5 cm = R$ 0,00)
  const dimResult = calculateBoardDimensionsDifference(lengthCm, widthCm, thicknessCm);
  const dimensionsAddon = dimResult.diff;

  // 3. Resina e CNC: inclusos no preço base de R$ 109,90 para tábuas de carne!
  // NUNCA somar taxa extra pela resina padrão ou pela fresagem CNC padrão
  const techniqueAddon = 0.00;

  // 4. Acabamento especial (apenas se não for o padrão Óleo Mineral & Cera)
  const finishAddon = finish && finish.priceModifier > 0 ? finish.priceModifier : 0.00;

  // 5. Taxa de preparação para artes raster complexas que exigem vetorização manual (R$ 20,00)
  const artPrepFee = needsVectorization ? 20.00 : 0.00;

  // Preço Final = Preço-Base + Diferença da Madeira + Diferença das Dimensões + Adicionais Reais
  const calculatedTotal = basePrice + woodAddon + dimensionsAddon + finishAddon + artPrepFee;
  // Limite de segurança física para evitar valores abaixo do custo da matéria-prima
  const totalEstimated = Math.max(79.90, Number(calculatedTotal.toFixed(2)));

  // Discriminação transparente de itens para o cliente (sem linhas zeradas desnecessárias)
  const items = [
    {
      label: 'Tábua de Carne Maciça (Base 40×29×3,5 cm)',
      description: 'Madeira Pinus com usinagem CNC e resina inclusas',
      value: basePrice,
    },
    ...(woodAddon > 0
      ? [
          {
            label: `Madeira Nobre (${woodType})`,
            description: 'Diferencial de densidade e nobreza da espécie',
            value: woodAddon,
          },
        ]
      : []),
    ...(!dimResult.isStandard && dimensionsAddon !== 0
      ? [
          {
            label:
              dimensionsAddon > 0
                ? `Dimensões Ampliadas (${lengthCm}×${widthCm}×${thicknessCm.toFixed(1).replace('.', ',')} cm)`
                : `Dimensões Compactas (${lengthCm}×${widthCm}×${thicknessCm.toFixed(1).replace('.', ',')} cm)`,
            description:
              dimensionsAddon > 0
                ? 'Volume adicional de madeira maciça sob medida'
                : 'Ajuste proporcional de volume sob medida',
            value: dimensionsAddon,
          },
        ]
      : []),
    ...(finishAddon > 0
      ? [
          {
            label: 'Acabamento Especial',
            description: finish?.name || 'Verniz especial impermeabilizante',
            value: finishAddon,
          },
        ]
      : []),
    ...(artPrepFee > 0
      ? [
          {
            label: 'Vetorização Técnica de Imagem',
            description: 'Preparação do percurso de ferramenta para router CNC',
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
    finishAddon,
    artPrepFee,
    totalEstimated,
    items,
  };
}
