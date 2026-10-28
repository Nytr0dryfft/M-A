import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CustomerPhotosModal, PhotoCategory } from './CustomerPhotosModal';
import { InfiniteSpecsMarquee } from './InfiniteSpecsMarquee';
import { renderCraftSpecIcon } from './CraftIcons';

interface CatalogSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onCustomizeLaser: (product: Product) => void;
  onOpenCustomStudio?: (pieceType?: 'tabua_carne' | 'porta_copos') => void;
}

type CatalogFilter = 'all' | 'tabuas' | 'moveis';

interface ProductRotatingImageProps {
  product: Product;
  onPreview: (url: string, title: string) => void;
}

const ProductRotatingImage: React.FC<ProductRotatingImageProps> = ({ product, onPreview }) => {
  const images = product.images && product.images.length > 0
    ? product.images
    : product.secondaryImageUrl
    ? [product.imageUrl, product.secondaryImageUrl]
    : [product.imageUrl];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Rotação automática suave a cada 4 segundos
  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [images.length, isHovered]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[currentIndex] || product.imageUrl;

  return (
    <div
      className="relative overflow-hidden aspect-[16/10] bg-[#2A1E17] group/img"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagens com transição suave de opacidade */}
      {images.map((img, idx) => (
        <img
          key={img}
          src={img}
          alt={`${product.name} - Foto ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-all duration-700 ease-out will-change-transform cursor-pointer ${
            idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => onPreview(currentImage, product.name)}
          referrerPolicy="no-referrer"
          loading="eager"
        />
      ))}

      {product.badge && (
        <span className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 bg-[#111111]/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 sm:px-3 sm:py-1.5 pointer-events-none">
          {product.badge}
        </span>
      )}
      {product.highlightTag && (
        <span className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-[#C29B68] text-[#111111] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 sm:px-3 sm:py-1 shadow pointer-events-none">
          {product.highlightTag}
        </span>
      )}

      {/* Botão de Ampliação */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPreview(currentImage, product.name);
        }}
        className="absolute bottom-3 right-3 z-20 bg-black/75 hover:bg-black text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 flex items-center gap-1.5 backdrop-blur-xs transition-colors border border-white/10 cursor-pointer"
        title="Ampliar foto em alta resolução"
      >
        <ZoomIn className="w-3.5 h-3.5 text-[#C29B68]" />
        <span>Ampliar</span>
      </button>

      {/* Controles de rotação se houver mais de uma foto */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Foto anterior"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-0 group-hover/img:opacity-100 sm:opacity-75 cursor-pointer backdrop-blur-xs shadow-md"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Próxima foto"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-0 group-hover/img:opacity-100 sm:opacity-75 cursor-pointer backdrop-blur-xs shadow-md"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>

          {/* Indicadores de bolinhas na barra inferior */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10">
            {images.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(dotIdx);
                }}
                aria-label={`Rotacionar para imagem ${dotIdx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  dotIdx === currentIndex
                    ? 'w-5 h-1.5 bg-[#C29B68]'
                    : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onCustomizeLaser,
  onOpenCustomStudio,
}) => {
  const [filter, setFilter] = useState<CatalogFilter>('all');
  const [isCustomerPhotosOpen, setIsCustomerPhotosOpen] = useState(false);
  const [customerPhotosCategory, setCustomerPhotosCategory] = useState<PhotoCategory | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Grupo 1: Tábuas de Carne & Porta-Copos juntos
  const tabuasEPortaCopos = products.filter(
    (p) => p.id === 'tabua-churrasco-time' || p.id === 'porta-copos-personalizados'
  );

  // Grupo 2: Mesas & Banquetas juntas
  const mesasEBanquetas = products.filter(
    (p) => p.id === 'mesa-pinus-cozinha-1' || p.id === 'par-de-banquetas-pinus'
  );

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

  // Helper para renderizar ícone de especificação com símbolos autorais
  const renderSpecIcon = (name: string) => {
    return renderCraftSpecIcon(name, 'w-3.5 h-3.5 text-[#8A5835]');
  };

  return (
    <section className="py-10 sm:py-20 lg:py-28 2xl:py-36 bg-[#FCF9F3] relative" id="catalogo">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 2xl:px-20">
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
          <div>
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <span className="w-8 h-[2px] bg-[#8A5835]" />
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#8A5835] font-bold">
                Coleções Autorais 2026
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl 2xl:text-5xl text-[#111111] font-bold tracking-tight">
              A Arte do Grão &amp; Escultura Utilitária
            </h2>
          </div>
        </div>

        {/* Controles de Filtros Segmentados */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-12">
          <div className="w-full sm:w-auto flex items-center overflow-x-auto no-scrollbar gap-1 sm:gap-1.5 p-1 bg-[#FAF8F5] border border-[#DFD3C3] shadow-sm">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer text-center whitespace-nowrap min-h-[38px] ${
                filter === 'all'
                  ? 'bg-[#2A1E17] text-white shadow-sm'
                  : 'text-[#1C1917] hover:text-[#8A5835]'
              }`}
            >
              Todas ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('tabuas')}
              className={`px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[38px] ${
                filter === 'tabuas'
                  ? 'bg-[#2A1E17] text-white shadow-sm'
                  : 'text-[#1C1917] hover:text-[#8A5835]'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 shrink-0" />
              <span>Tábuas &amp; Porta-Copos ({tabuasEPortaCopos.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('moveis')}
              className={`px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[38px] ${
                filter === 'moveis'
                  ? 'bg-[#2A1E17] text-white shadow-sm'
                  : 'text-[#1C1917] hover:text-[#8A5835]'
              }`}
            >
              <Armchair className="w-3.5 h-3.5 shrink-0" />
              <span>Mesas &amp; Banquetas ({mesasEBanquetas.length})</span>
            </button>
          </div>
        </div>

        {/* GRUPO 1: TÁBUAS DE CARNE JUNTO COM PORTA-COPOS */}
        {(filter === 'all' || filter === 'tabuas') && (
          <div className="mb-14 sm:mb-20 2xl:mb-28 scroll-mt-24 relative" id="tabuas">
            <span id="porta-copos" className="absolute -top-24 pointer-events-none" aria-hidden="true" />
            <span id="tabuas-de-carne-personalizadas" className="absolute -top-24 pointer-events-none" aria-hidden="true" />

            <div className="flex items-center justify-between border-b border-[#DFD3C3] pb-3 sm:pb-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-[#8A5835]" />
                <h3 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold text-[#111111]">
                  Coleção Tábuas de Carne &amp; Porta-Copos
                </h3>
              </div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#B88658] hidden sm:inline">
                End-Grain &amp; Resina Atóxica CNC
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 xl:gap-12 2xl:gap-14 items-stretch">
              {tabuasEPortaCopos.map((product) => {
                const isTabuaCarne = product.id === 'tabua-churrasco-time';

                return (
                  <div
                    key={product.id}
                    className="bg-[#FAF8F5] border border-[#DFD3C3]/80 shadow-lg group hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Caixa de Imagem com Rotação Automática e Interativa */}
                      <ProductRotatingImage
                        product={product}
                        onPreview={(url, title) => setPreviewImage({ url, title })}
                      />

                      {/* Conteúdo Informativo */}
                      <div className="p-4 sm:p-9 xl:p-10">
                        <div className="flex items-center justify-between gap-3 text-[11px] sm:text-xs text-[#8A5835] font-bold uppercase tracking-wider mb-2 flex-nowrap">
                          <span className="truncate min-w-0">Madeiras: {product.woods}</span>
                          <span className="text-[#1C1917] font-serif text-base sm:text-xl xl:text-2xl font-bold tabular-nums whitespace-nowrap shrink-0">
                            {product.priceRange ||
                              (product.priceMin && product.priceMax
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

                        {/* Barra informativa horizontal no mobile (sem números de 1 a 4) */}
                        <div className="block sm:hidden mb-4 -mx-4 w-[calc(100%+2rem)]">
                          <InfiniteSpecsMarquee items={product.specs} />
                        </div>

                        {/* Grade alinhada no desktop */}
                        <ul className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 text-xs text-[#3E2D22] mb-4 sm:mb-6 py-2.5 sm:py-4 border-y border-[#DFD3C3]/60">
                          {product.specs.map((spec, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-1.5 sm:gap-2 min-w-0"
                              title={spec.label ? `${spec.label}: ${spec.value}` : spec.value}
                            >
                              <span className="p-1 rounded bg-[#FAF3EA] border border-[#DFD3C3]/70 flex items-center justify-center shrink-0">
                                {renderSpecIcon(spec.icon)}
                              </span>
                              <div className="flex flex-col min-w-0">
                                {spec.label && (
                                  <span className="text-[9px] uppercase tracking-wider text-[#8A5835] font-bold leading-none truncate">
                                    {spec.label}
                                  </span>
                                )}
                                <span className="truncate text-[11px] sm:text-xs text-[#2A1E17] font-semibold leading-tight">
                                  {spec.value}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="p-4 sm:p-9 xl:p-10 pt-0">
                      {isTabuaCarne ? (
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
                      ) : (
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
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* GRUPO 2: MESAS JUNTO COM BANQUETAS */}
        {(filter === 'all' || filter === 'moveis') && (
          <div className="pt-2 sm:pt-6 scroll-mt-24 relative" id="moveis">
            <span id="mesas-e-cadeiras" className="absolute -top-24 pointer-events-none" aria-hidden="true" />
            <span id="banquetas" className="absolute -top-24 pointer-events-none" aria-hidden="true" />

            <div className="flex items-center justify-between border-b border-[#DFD3C3] pb-3 sm:pb-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Armchair className="w-5 h-5 sm:w-6 sm:h-6 text-[#8A5835]" />
                <h3 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold text-[#111111]">
                  Coleção Mesas &amp; Banquetas em Madeira Maciça
                </h3>
              </div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#B88658] hidden sm:inline">
                Mesas de Jantar, Cozinha &amp; Banquetas Artesanais
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 xl:gap-12 2xl:gap-14 items-stretch">
              {mesasEBanquetas.map((product) => {
                const isContain = product.imageFit === 'contain';

                return (
                  <div
                    key={product.id}
                    className="bg-[#FAF8F5] border border-[#DFD3C3]/80 shadow-lg group hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Caixa de Imagem com enquadramento adaptativo para banquetas e mesas */}
                      <div
                        className={`relative overflow-hidden ${
                          isContain
                            ? 'aspect-[4/3] sm:aspect-[16/11] bg-[#18110D]'
                            : 'aspect-[4/3] sm:aspect-[16/11] bg-[#1A1410]'
                        }`}
                      >
                        {isContain ? (
                          <div
                            className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-pointer"
                            onClick={() => setPreviewImage({ url: product.imageUrl, title: product.name })}
                            title="Clique para ver a foto completa por inteiro"
                          >
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

                      {/* Conteúdo Informativo */}
                      <div className="p-4 sm:p-9 xl:p-10">
                        <div className="flex items-center justify-between gap-3 text-[11px] sm:text-xs text-[#8A5835] font-bold uppercase tracking-wider mb-2 flex-nowrap">
                          <span className="truncate min-w-0">Madeira: {product.woods}</span>
                          <span className="text-[#1C1917] font-serif text-base sm:text-xl xl:text-2xl font-bold tabular-nums whitespace-nowrap shrink-0">
                            {product.priceRange ||
                              (product.priceMin && product.priceMax
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

                        {/* Barra informativa horizontal no mobile (sem números de 1 a 4) */}
                        <div className="block sm:hidden mb-4 -mx-4 w-[calc(100%+2rem)]">
                          <InfiniteSpecsMarquee items={product.specs} />
                        </div>

                        {/* Grade alinhada no desktop */}
                        <ul className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 text-xs text-[#3E2D22] mb-4 sm:mb-6 py-2.5 sm:py-4 border-y border-[#DFD3C3]/60">
                          {product.specs.map((spec, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-1.5 sm:gap-2 min-w-0"
                              title={spec.label ? `${spec.label}: ${spec.value}` : spec.value}
                            >
                              <span className="p-1 rounded bg-[#FAF3EA] border border-[#DFD3C3]/70 flex items-center justify-center shrink-0">
                                {renderSpecIcon(spec.icon)}
                              </span>
                              <div className="flex flex-col min-w-0">
                                {spec.label && (
                                  <span className="text-[9px] uppercase tracking-wider text-[#8A5835] font-bold leading-none truncate">
                                    {spec.label}
                                  </span>
                                )}
                                <span className="truncate text-[11px] sm:text-xs text-[#2A1E17] font-semibold leading-tight">
                                  {spec.value}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Botões de Ação */}
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
                          title="Ver fotos reais de clientes de móveis entregues"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#8A5835] shrink-0" />
                          <span className="truncate">Fotos de clientes</span>
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
                );
              })}
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
            className="relative max-w-5xl max-h-[90vh] bg-[#140D0A] border border-[#DFD3C3]/30 p-2 sm:p-4 flex flex-col items-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-[#DFD3C3]/20">
              <span className="text-xs sm:text-sm font-semibold text-[#DFD3C3] truncate">
                {previewImage.title}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 text-[#DFD3C3] hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Fechar visualização"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-4">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[75vh] max-w-full object-contain shadow-2xl rounded-xs"
              />
            </div>
            <span className="text-[10px] sm:text-xs text-[#DFD3C3]/60 pt-2 text-center">
              Fotografia real de fabricação e acabamento em madeira maciça no Atelier M&amp;A
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
