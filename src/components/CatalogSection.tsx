import React, { useState } from 'react';
import { Product } from '../types';
import {
  Utensils,
  Armchair,
  Ruler,
  ShieldCheck,
  Hammer,
  Sparkles,
  Layers,
  Droplets,
  Gift,
  TreePine,
  Scissors,
  Lock,
  Leaf,
  Truck,
  Eye,
  PenTool,
  ShoppingBag,
  SlidersHorizontal,
  Camera,
  ZoomIn,
  X,
} from 'lucide-react';
import { CustomerPhotosModal, PhotoCategory } from './CustomerPhotosModal';
import { InfiniteSpecsMarquee } from './InfiniteSpecsMarquee';

interface CatalogSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onCustomizeLaser: (product: Product) => void;
  onOpenCustomStudio?: (pieceType?: 'tabua_carne' | 'porta_copos') => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onCustomizeLaser,
  onOpenCustomStudio,
}) => {
  const [filter, setFilter] = useState<'all' | 'tabua' | 'movel'>('all');
  const [isCustomerPhotosOpen, setIsCustomerPhotosOpen] = useState(false);
  const [customerPhotosCategory, setCustomerPhotosCategory] = useState<PhotoCategory | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const handleOpenCustomerPhotos = (category: PhotoCategory) => {
    setCustomerPhotosCategory(category);
    setIsCustomerPhotosOpen(true);
  };

  const handleGoToCustomizer = (pieceType: 'tabua_carne' | 'porta_copos' | 'movel' = 'tabua_carne') => {
    if (pieceType === 'movel') {
      const element = document.getElementById('moveis');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    if (onOpenCustomStudio) {
      onOpenCustomStudio(pieceType === 'porta_copos' ? 'porta_copos' : 'tabua_carne');
    } else {
      const element = document.getElementById('encomenda');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const filteredProducts =
    filter === 'all' ? products : products.filter((p) => p.category === filter);

  // Helper to render icon by name
  const renderSpecIcon = (name: string) => {
    switch (name) {
      case 'Ruler':
        return <Ruler className="w-3.5 h-3.5 text-[#8A5835]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#8A5835]" />;
      case 'Hammer':
        return <Hammer className="w-3.5 h-3.5 text-[#8A5835]" />;
      case 'Layers':
        return <Layers className="w-3.5 h-3.5 text-[#8A5835]" />;
      case 'Droplets':
        return <Droplets className="w-3.5 h-3.5 text-[#8A5835]" />;
      case 'Gift':
        return <Gift className="w-3.5 h-3.5 text-[#8A5835]" />;
      case 'TreePine':
        return <TreePine className="w-3.5 h-3.5 text-[#8A5835]" />;
      case 'Scissors':
        return <Scissors className="w-3.5 h-3.5 text-[#8A5835]" />;
      case 'Lock':
        return <Lock className="w-3.5 h-3.5 text-[#8A5835]" />;
      case 'Leaf':
        return <Leaf className="w-3.5 h-3.5 text-[#8A5835]" />;
      case 'Truck':
        return <Truck className="w-3.5 h-3.5 text-[#8A5835]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#8A5835]" />;
    }
  };

  const tabuas = products.filter((p) => p.category === 'tabua');
  const moveis = products.filter((p) => p.category === 'movel');

  return (
    <section className="py-10 sm:py-20 lg:py-28 2xl:py-36 bg-[#FCF9F3] relative" id="catalogo">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 2xl:px-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
          <div>
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <span className="w-8 h-[2px] bg-[#8A5835]" />
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#8A5835] font-bold">
                Coleções Autorais 2025
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl 2xl:text-5xl text-[#111111] font-bold tracking-tight">
              A Arte do Grão &amp; Escultura Utilitária
            </h2>
          </div>
        </div>

        {/* Interactive Segmented Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-12">
          <div className="w-full sm:w-auto flex items-center overflow-x-auto no-scrollbar gap-1 sm:gap-1.5 p-1 bg-[#FAF8F5] border border-[#DFD3C3] shadow-sm">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 sm:py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer text-center whitespace-nowrap min-h-[38px] ${
                filter === 'all'
                  ? 'bg-[#2A1E17] text-white shadow-sm'
                  : 'text-[#1C1917] hover:text-[#8A5835]'
              }`}
            >
              Todas ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('tabua')}
              className={`px-3 sm:px-4 py-2 sm:py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[38px] ${
                filter === 'tabua'
                  ? 'bg-[#2A1E17] text-white shadow-sm'
                  : 'text-[#1C1917] hover:text-[#8A5835]'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 shrink-0" />
              <span>Tábuas ({tabuas.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('movel')}
              className={`px-3 sm:px-4 py-2 sm:py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[38px] ${
                filter === 'movel'
                  ? 'bg-[#2A1E17] text-white shadow-sm'
                  : 'text-[#1C1917] hover:text-[#8A5835]'
              }`}
            >
              <Armchair className="w-3.5 h-3.5 shrink-0" />
              <span>Pequenos Móveis ({moveis.length})</span>
            </button>
          </div>
        </div>

        {/* SEÇÃO 1: TÁBUAS DE CORTE & BUTCHER BLOCKS */}
        {(filter === 'all' || filter === 'tabua') && (
          <div className="mb-14 sm:mb-20 2xl:mb-28" id="tabuas">
            <div className="flex items-center justify-between border-b border-[#DFD3C3] pb-3 sm:pb-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-[#8A5835]" />
                <h3 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold text-[#111111]">
                  Coleção Tábuas de Carne &amp; Corte de Precisão
                </h3>
              </div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#B88658] hidden sm:inline">
                End-Grain &amp; Resina Atóxica CNC
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 xl:gap-12 2xl:gap-14 items-stretch">
              {tabuas.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#FAF8F5] border border-[#DFD3C3]/80 shadow-lg group hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Image Box with Parallax Scale */}
                    <div className="relative overflow-hidden aspect-[16/10] bg-[#2A1E17]">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out will-change-transform"
                        referrerPolicy="no-referrer"
                      />

                      {product.badge && (
                        <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#111111]/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 sm:px-3 sm:py-1.5">
                          {product.badge}
                        </span>
                      )}
                      {product.highlightTag && (
                        <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#C29B68] text-[#111111] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 sm:px-3 sm:py-1 shadow">
                          {product.highlightTag}
                        </span>
                      )}
                    </div>

                    {/* Content Box */}
                    <div className="p-4 sm:p-9 xl:p-10">
                      <div className="flex items-center justify-between gap-3 text-[11px] sm:text-xs text-[#8A5835] font-bold uppercase tracking-wider mb-2 flex-nowrap">
                        <span className="truncate min-w-0">Madeiras: {product.woods}</span>
                        <span className="text-[#1C1917] font-serif text-base sm:text-xl xl:text-2xl font-bold tabular-nums whitespace-nowrap shrink-0">
                          {product.priceRange || (product.priceMin && product.priceMax
                            ? `R$ ${product.priceMin.toFixed(2).replace('.', ',')} - R$ ${product.priceMax.toFixed(2).replace('.', ',')}`
                            : `R$ ${product.price.toFixed(2).replace('.', ',')}`)}
                        </span>
                      </div>

                      <h4 className="font-serif text-xl sm:text-2xl xl:text-3xl font-bold text-[#111111] mb-2 sm:mb-3">
                        {product.name}
                      </h4>

                      <p className="text-xs sm:text-sm text-[#5C4033] leading-relaxed mb-4 sm:mb-6">
                        {product.description}
                      </p>

                      {/* Letreiro contínuo infinito no mobile (sem corte de textos) */}
                      <div className="block sm:hidden mb-4 -mx-4 w-[calc(100%+2rem)]">
                        <InfiniteSpecsMarquee items={product.specs} />
                      </div>

                      {/* Grade tradicional e alinhada para desktop */}
                      <ul className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 text-xs text-[#3E2D22] mb-4 sm:mb-6 py-2.5 sm:py-4 border-y border-[#DFD3C3]/60">
                        {product.specs.map((spec, i) => (
                          <li key={i} className="flex items-center gap-1.5 sm:gap-2">
                            {renderSpecIcon(spec.icon)}
                            <span className="truncate text-[11px] sm:text-xs">{spec.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 sm:p-9 xl:p-10 pt-0">
                    {product.id === 'tabua-churrasco-time' ? (
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3.5">
                        <button
                          onClick={() => handleGoToCustomizer('tabua_carne')}
                          className="py-2.5 sm:py-4 px-2 sm:px-6 sm:flex-1 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest text-center transition-colors shadow-md flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#C29B68] shrink-0" />
                          <span className="truncate">Personalizar Tábua</span>
                        </button>

                        <button
                          onClick={() => handleOpenCustomerPhotos('tabua')}
                          className="py-2.5 sm:py-4 px-2 sm:px-6 sm:flex-1 border-2 border-[#2A1E17] hover:border-[#8A5835] hover:bg-[#FAF8F5] text-[#111111] hover:text-[#8A5835] text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer bg-white shadow-sm"
                          title="Ver fotos de tábuas de corte entregues aos clientes"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#8A5835] shrink-0" />
                          <span className="truncate">Fotos de Clientes</span>
                        </button>
                      </div>
                    ) : product.id === 'porta-copos-personalizados' ? (
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3.5">
                        <button
                          onClick={() => handleGoToCustomizer('porta_copos')}
                          className="py-2.5 sm:py-4 px-2 sm:px-6 sm:flex-1 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest text-center transition-colors shadow-md flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#C29B68] shrink-0" />
                          <span className="truncate">Personalizar Porta-Copos</span>
                        </button>

                        <button
                          onClick={() => handleOpenCustomerPhotos('porta-copos')}
                          className="py-2.5 sm:py-4 px-2 sm:px-6 sm:flex-1 border-2 border-[#2A1E17] hover:border-[#8A5835] hover:bg-[#FAF8F5] text-[#111111] hover:text-[#8A5835] text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer bg-white shadow-sm"
                          title="Ver fotos de porta-copos entregues aos clientes"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#8A5835] shrink-0" />
                          <span className="truncate">Fotos de Clientes</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3.5">
                        <button
                          onClick={() => onAddToCart(product)}
                          className="col-span-2 sm:flex-1 py-2.5 sm:py-4 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest text-center transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Adicionar ao Pedido</span>
                        </button>

                        <button
                          onClick={() => onCustomizeLaser(product)}
                          className="col-span-1 py-2.5 sm:py-4 px-2 sm:px-5 border border-[#DFD3C3] hover:border-[#8A5835] text-[#111111] hover:text-[#8A5835] text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                          title="Simular personalização feita por CNC (brasão ou nome)"
                        >
                          <PenTool className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                          <span className="truncate">Personalização CNC</span>
                        </button>

                        <button
                          onClick={() => onSelectProduct(product)}
                          className="col-span-1 py-2.5 sm:p-4 border border-[#DFD3C3] hover:border-[#2A1E17] text-[#1C1917] transition-colors cursor-pointer bg-white flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider"
                          title="Ver detalhes técnicos da obra"
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="sm:hidden">Detalhes</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEÇÃO 2: PEQUENOS MÓVEIS ESCULTURAIS */}
        {(filter === 'all' || filter === 'movel') && (
          <div id="moveis" className="pt-2 sm:pt-6">
            <div className="flex items-center justify-between border-b border-[#DFD3C3] pb-3 sm:pb-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Armchair className="w-5 h-5 sm:w-6 sm:h-6 text-[#8A5835]" />
                <h3 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold text-[#111111]">
                  Coleção Móveis em Madeira Maciça
                </h3>
              </div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#B88658] hidden sm:inline">
                Mesas &amp; Mobiliário em Madeira Maciça
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 xl:gap-12 2xl:gap-14 items-stretch">
              {moveis.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#FAF8F5] border border-[#DFD3C3]/80 shadow-lg group hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Image Box with Adaptive Framing (sem corte para banquetas) */}
                    <div className="relative overflow-hidden aspect-[4/3] sm:aspect-[16/11] bg-[#1A1410]">
                      {product.imageFit === 'contain' ? (
                        <div
                          className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-pointer bg-[#18110D]"
                          onClick={() => setPreviewImage({ url: product.imageUrl, title: product.name })}
                          title="Clique para ver a foto completa por inteiro"
                        >
                          {/* Fundo suave desfocado para compor o enquadramento sem cortes e sem barras pretas secas */}
                          <img
                            src={product.imageUrl}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-35 brightness-75 pointer-events-none select-none"
                          />
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="relative z-10 max-h-full max-w-full object-contain p-2 sm:p-3.5 group-hover:scale-102 transition-transform duration-500 ease-out will-change-transform drop-shadow-md"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage({ url: product.imageUrl, title: product.name });
                            }}
                            className="absolute bottom-3 right-3 z-20 bg-black/75 hover:bg-black text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 flex items-center gap-1.5 backdrop-blur-xs transition-colors border border-white/10"
                            title="Ver foto inteira sem cortes"
                          >
                            <ZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C29B68]" />
                            <span>Ver foto inteira</span>
                          </button>
                        </div>
                      ) : (
                        <div
                          className="relative w-full h-full cursor-pointer"
                          onClick={() => setPreviewImage({ url: product.imageUrl, title: product.name })}
                          title="Clique para ampliar a foto"
                        >
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out will-change-transform"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage({ url: product.imageUrl, title: product.name });
                            }}
                            className="absolute bottom-3 right-3 z-20 bg-black/75 hover:bg-black text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 flex items-center gap-1.5 backdrop-blur-xs transition-colors border border-white/10"
                            title="Ampliar foto"
                          >
                            <ZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C29B68]" />
                            <span>Ampliar</span>
                          </button>
                        </div>
                      )}

                      {product.badge && (
                        <span className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 bg-[#111111]/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 sm:px-3 sm:py-1.5">
                          {product.badge}
                        </span>
                      )}
                      {product.highlightTag && (
                        <span className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-[#DFD3C3] text-[#111111] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 sm:px-3 sm:py-1 shadow">
                          {product.highlightTag}
                        </span>
                      )}
                    </div>

                    {/* Content Box */}
                    <div className="p-4 sm:p-9 xl:p-10">
                      <div className="flex items-center justify-between gap-3 text-[11px] sm:text-xs text-[#8A5835] font-bold uppercase tracking-wider mb-2 flex-nowrap">
                        <span className="truncate min-w-0">Madeira: {product.woods}</span>
                        <span className="text-[#1C1917] font-serif text-base sm:text-xl xl:text-2xl font-bold tabular-nums whitespace-nowrap shrink-0">
                          {product.priceRange || (product.priceMin && product.priceMax
                            ? `R$ ${product.priceMin.toFixed(2).replace('.', ',')} - R$ ${product.priceMax.toFixed(2).replace('.', ',')}`
                            : `R$ ${product.price.toFixed(2).replace('.', ',')}`)}
                        </span>
                      </div>

                      <h4 className="font-serif text-xl sm:text-2xl xl:text-3xl font-bold text-[#111111] mb-2 sm:mb-3">
                        {product.name}
                      </h4>

                      <p className="text-xs sm:text-sm text-[#5C4033] leading-relaxed mb-4 sm:mb-6">
                        {product.description}
                      </p>

                      {/* Letreiro contínuo infinito no mobile (sem corte de textos) */}
                      <div className="block sm:hidden mb-4 -mx-4 w-[calc(100%+2rem)]">
                        <InfiniteSpecsMarquee items={product.specs} />
                      </div>

                      {/* Grade tradicional e alinhada para desktop */}
                      <ul className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 text-xs text-[#3E2D22] mb-4 sm:mb-6 py-2.5 sm:py-4 border-y border-[#DFD3C3]/60">
                        {product.specs.map((spec, i) => (
                          <li key={i} className="flex items-center gap-1.5 sm:gap-2">
                            {renderSpecIcon(spec.icon)}
                            <span className="truncate text-[11px] sm:text-xs">{spec.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 sm:p-9 xl:p-10 pt-0">
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3.5">
                      <button
                        onClick={() => onAddToCart(product)}
                        className="col-span-2 sm:flex-1 py-2.5 sm:py-4 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest text-center transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Encomendar Peça</span>
                      </button>

                      <button
                        onClick={() => handleOpenCustomerPhotos('moveis')}
                        className="col-span-1 py-2.5 sm:py-4 px-2 sm:px-4 border-2 border-[#2A1E17] hover:border-[#8A5835] hover:bg-[#FAF8F5] text-[#111111] hover:text-[#8A5835] text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                        title="Ver fotos reais de móveis entregues aos clientes"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#8A5835] shrink-0" />
                        <span className="truncate">Fotos Reais</span>
                      </button>

                      <button
                        onClick={() => onSelectProduct(product)}
                        className="col-span-1 py-2.5 sm:py-4 px-2 sm:px-4 border border-[#DFD3C3] hover:border-[#8A5835] text-[#111111] hover:text-[#8A5835] text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                      >
                        <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span className="truncate">Dimensões</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CustomerPhotosModal
        isOpen={isCustomerPhotosOpen}
        onClose={() => setIsCustomerPhotosOpen(false)}
        onGoToCustomizer={handleGoToCustomizer}
        categoryFilter={customerPhotosCategory}
      />

      {/* Lightbox para visualização de foto em alta definição e 100% inteira sem cortes */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[92vh] w-full flex flex-col items-center justify-center bg-[#18110D] border border-[#DFD3C3]/30 p-3 sm:p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 px-1 border-b border-white/10 text-white">
              <span className="font-serif text-sm sm:text-base font-bold text-[#E6DAC8] truncate pr-4">
                {previewImage.title} — Visualização Completa
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20 cursor-pointer"
                aria-label="Fechar foto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-4">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[76vh] max-w-full object-contain drop-shadow-2xl"
              />
            </div>
            <div className="w-full text-center pt-2 text-[11px] text-[#C29B68] font-mono">
              Foto 100% completa sem nenhum corte
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
