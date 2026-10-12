export type WoodId = 'pinus' | 'angelim' | 'cedrinho' | 'macaranduba';

export interface AtelierWood {
  id: WoodId;
  name: string;
  treatment: string;
  textureUrl: string;
  baseColor: string;
  gradient: string;
  grooveBottom: string;
  borderTone: string;
  grainColor: string;
  secondaryGrain: string;
  highlight: string;
  filterTint?: string;
}

export const ALLOWED_WOODS: WoodId[] = ['pinus', 'angelim', 'cedrinho', 'macaranduba'];

export const ATELIER_WOODS: Record<WoodId, AtelierWood> = {
  pinus: {
    id: 'pinus',
    name: 'Pinus',
    treatment: 'Tratamento em resina',
    textureUrl: '/textures/pinus_wood.jpg',
    baseColor: '#E2CEAF',
    gradient: 'linear-gradient(135deg, #EAD7BA 0%, #DEC5A2 50%, #D4BA95 100%)',
    grooveBottom: '#8A7052',
    borderTone: '#9C8060',
    grainColor: 'rgba(120, 90, 60, 0.25)',
    secondaryGrain: 'rgba(160, 125, 90, 0.2)',
    highlight: 'rgba(255, 250, 240, 0.6)',
  },
  angelim: {
    id: 'angelim',
    name: 'Angelim',
    treatment: 'Tratamento em resina',
    textureUrl: '/textures/angelim_wood.jpg',
    baseColor: '#B67E3E',
    gradient: 'linear-gradient(135deg, #C28B48 0%, #A97133 50%, #996227 100%)',
    grooveBottom: '#5C3814',
    borderTone: '#6E441B',
    grainColor: 'rgba(70, 40, 15, 0.45)',
    secondaryGrain: 'rgba(130, 80, 35, 0.3)',
    highlight: 'rgba(255, 235, 200, 0.45)',
  },
  cedrinho: {
    id: 'cedrinho',
    name: 'Cedrinho',
    treatment: 'Tratamento em resina',
    textureUrl: '/textures/cedrinho_wood.jpg',
    baseColor: '#B06856',
    gradient: 'linear-gradient(135deg, #BC7260 0%, #A25C4B 50%, #934E3F 100%)',
    grooveBottom: '#5A2A20',
    borderTone: '#6E3427',
    grainColor: 'rgba(65, 28, 20, 0.45)',
    secondaryGrain: 'rgba(125, 60, 48, 0.25)',
    highlight: 'rgba(255, 225, 215, 0.4)',
  },
  macaranduba: {
    id: 'macaranduba',
    name: 'Maçaranduba',
    treatment: 'Tratamento em resina',
    textureUrl: '/textures/macaranduba_wood.jpg',
    baseColor: '#4A1D1B',
    gradient: 'linear-gradient(135deg, #582422 0%, #421817 50%, #341211 100%)',
    grooveBottom: '#220A09',
    borderTone: '#2E0E0D',
    grainColor: 'rgba(25, 8, 7, 0.6)',
    secondaryGrain: 'rgba(65, 22, 20, 0.35)',
    highlight: 'rgba(255, 205, 200, 0.25)',
  },
};

export const ATELIER_WOODS_LIST: AtelierWood[] = ALLOWED_WOODS.map(
  (id) => ATELIER_WOODS[id]
);

export const DEFAULT_WOOD_ID: WoodId = 'pinus';
export const DEFAULT_WOOD: AtelierWood = ATELIER_WOODS[DEFAULT_WOOD_ID];

export function getWoodById(idOrName: string): AtelierWood {
  const normalized = idOrName.toLowerCase().trim();
  if (normalized.includes('macaranduba') || normalized.includes('maçaranduba')) {
    return ATELIER_WOODS.macaranduba;
  }
  if (normalized.includes('cedrinho')) {
    return ATELIER_WOODS.cedrinho;
  }
  if (normalized.includes('angelim')) {
    return ATELIER_WOODS.angelim;
  }
  if (normalized.includes('pinus')) {
    return ATELIER_WOODS.pinus;
  }
  return DEFAULT_WOOD;
}
