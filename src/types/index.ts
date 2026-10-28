export interface Product {
  id: string;
  name: string;
  category: 'tabua' | 'movel';
  categoryLabel: string;
  badge?: string;
  highlightTag?: string;
  woods: string;
  price: number;
  priceRange?: string;
  priceMin?: number;
  priceMax?: number;
  weight?: string;
  dimensions: string;
  description: string;
  specs: {
    label: string;
    value: string;
    icon: string;
  }[];
  imageUrl: string;
  secondaryImageUrl?: string;
  images?: string[];
  inStock: boolean;
  joineryType: string;
  finishType: string;
  imageFit?: 'cover' | 'contain';
  imagePosition?: string;
}

export interface WoodSpecimen {
  id: string;
  name: string;
  scientificName: string;
  badge: string;
  colorGradient: string;
  description: string;
  jankaHardness: number;
  density: string;
  application: string;
  aroma: string;
  origin: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customEngraving?: string;
  customWood?: string;
  customDimensions?: string;
  unitPrice: number;
}

export interface TeamShield {
  id: string;
  name: string;
  shortName: string;
  category: 'brasileirao_a' | 'brasileirao_b' | 'internacional';
  categoryLabel: string;
  displayLogo: string; // Utilizada apenas no seletor de clubes
  cncArtwork: string;  // SVG monocromático preparado especificamente para CNC
  imageUrl?: string;   // Compatibilidade legada (espelho de displayLogo)
  city?: string;
  state?: string;
  country?: string;
  primaryColor?: string;
}

export interface CustomOrderState {
  pieceType: string;
  woodType: string;
  engravingType: string;
  engravingText: string;
  selectedTeam?: TeamShield | null;
  dimensions: string;
  lengthCm: number;
  widthCm: number;
  thicknessCm: number;
  notes: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
}
