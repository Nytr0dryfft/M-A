export interface Product {
  id: string;
  name: string;
  category: 'tabua' | 'movel';
  categoryLabel: string;
  badge?: string;
  highlightTag?: string;
  woods: string;
  price: number;
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
  inStock: boolean;
  joineryType: string;
  finishType: string;
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

export interface CustomOrderState {
  pieceType: string;
  woodType: string;
  engravingType: string;
  engravingText: string;
  dimensions: string;
  lengthCm: number;
  widthCm: number;
  thicknessCm: number;
  notes: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
}
