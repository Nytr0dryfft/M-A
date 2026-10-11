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
} from 'lucide-react';

interface CatalogSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onCustomizeLaser: (product: Product) => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onCustomizeLaser,
}) => {
  const [filter, setFilter] = useState<'all' | 'tabua' | 'movel'>('all');

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
    <section className="py-20 lg:py-28 2xl:py-36 bg-[#FCF9F3] relative" id="catalogo">
      <div className="max-w-[1560px] mx-auto px-6 sm:px-8 lg:px-14 xl:px-16 2xl:px-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-[2px] bg-[#8A5835]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#8A5835] font-bold">
                Coleções Autorais 2025
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl 2xl:text-5xl text-[#111111] font-bold tracking-tight">
              A Arte do Grão &amp; Escultura Utilitária
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-sm sm:text-base text-[#5C4033] max-w-xl leading-relaxed">
              Cada tábua de carne resinada e móvel escultural é numerado e finalizado à mão em nosso
              atelier, valorizando nós naturais, entalhe de precisão e encaixes tradicionais.
            </p>
          </div>
        </div>

        {/* Interactive Segmented Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] border border-[#DFD3C3] shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#2A1E17] text-white shadow-sm'
                  : 'text-[#1C1917] hover:text-[#8A5835]'
              }`}
            >
              Todas as Obras ({products.length})
            </button>
            <button
              onClick={() => setFilter('tabua')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                filter === 'tabua'
                  ? 'bg-[#2A1E17] text-white shadow-sm'
                  : 'text-[#1C1917] hover:text-[#8A5835]'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Tábuas de Corte ({tabuas.length})</span>
            </button>
            <button
              onClick={() => setFilter('movel')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                filter === 'movel'
                  ? 'bg-[#2A1E17] text-white shadow-sm'
                  : 'text-[#1C1917] hover:text-[#8A5835]'
              }`}
            >
              <Armchair className="w-3.5 h-3.5" />
              <span>Pequenos Móveis ({moveis.length})</span>
            </button>
          </div>
        </div>

        {/* SEÇÃO 1: TÁBUAS DE CORTE & BUTCHER BLOCKS */}
        {(filter === 'all' || filter === 'tabua') && (
          <div className="mb-20 2xl:mb-28" id="tabuas">
            <div className="flex items-center justify-between border-b border-[#DFD3C3] pb-4 mb-8">
              <div className="flex items-center gap-3">
                <Utensils className="w-6 h-6 text-[#8A5835]" />
                <h3 className="font-serif text-2xl 2xl:text-3xl font-bold text-[#111111]">
                  Coleção Tábuas de Carne &amp; Corte de Precisão
                </h3>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#B88658] hidden sm:inline">
                End-Grain &amp; Resina Atóxica CNC
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 2xl:gap-14 items-stretch">
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
                        <span className="absolute top-4 left-4 bg-[#111111]/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5">
                          {product.badge}
                        </span>
                      )}
                      {product.highlightTag && (
                        <span className="absolute top-4 right-4 bg-[#C29B68] text-[#111111] text-[11px] font-bold uppercase tracking-wider px-3 py-1 shadow">
                          {product.highlightTag}
                        </span>
                      )}
                    </div>

                    {/* Content Box */}
                    <div className="p-7 sm:p-9 xl:p-10">
                      <div className="flex items-center justify-between text-xs text-[#8A5835] font-bold uppercase tracking-wider mb-2">
                        <span>Madeiras: {product.woods}</span>
                        <span className="text-[#1C1917] font-serif text-xl xl:text-2xl font-bold tabular-nums">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <h4 className="font-serif text-2xl xl:text-3xl font-bold text-[#111111] mb-3">
                        {product.name}
                      </h4>

                      <p className="text-xs sm:text-sm text-[#5C4033] leading-relaxed mb-6">
                        {product.description}
                      </p>

                      <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 text-xs text-[#3E2D22] mb-6 py-4 border-y border-[#DFD3C3]/60">
                        {product.specs.map((spec, i) => (
                          <li key={i} className="flex items-center gap-2">
                            {renderSpecIcon(spec.icon)}
                            <span className="truncate">{spec.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-7 sm:p-9 xl:p-10 pt-0 flex flex-wrap items-center gap-3.5">
                    <button
                      onClick={() => onAddToCart(product)}
                      className="flex-1 py-4 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest text-center transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Adicionar ao Pedido</span>
                    </button>

                    <button
                      onClick={() => onCustomizeLaser(product)}
                      className="px-5 py-4 border border-[#DFD3C3] hover:border-[#8A5835] text-[#111111] hover:text-[#8A5835] text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer bg-white"
                      title="Simular gravação de brasão ou nome"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Personalizar a Laser</span>
                    </button>

                    <button
                      onClick={() => onSelectProduct(product)}
                      className="p-4 border border-[#DFD3C3] hover:border-[#2A1E17] text-[#1C1917] transition-colors cursor-pointer bg-white"
                      title="Ver detalhes técnicos da obra"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEÇÃO 2: PEQUENOS MÓVEIS ESCULTURAIS */}
        {(filter === 'all' || filter === 'movel') && (
          <div id="moveis" className="pt-6">
            <div className="flex items-center justify-between border-b border-[#DFD3C3] pb-4 mb-8">
              <div className="flex items-center gap-3">
                <Armchair className="w-6 h-6 text-[#8A5835]" />
                <h3 className="font-serif text-2xl 2xl:text-3xl font-bold text-[#111111]">
                  Coleção Pequenos Móveis Esculturais
                </h3>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#B88658] hidden sm:inline">
                Encaixes Japoneses &amp; Pranchas Vivas
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 2xl:gap-14 items-stretch">
              {moveis.map((product) => (
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
                        <span className="absolute top-4 left-4 bg-[#111111]/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5">
                          {product.badge}
                        </span>
                      )}
                      {product.highlightTag && (
                        <span className="absolute top-4 right-4 bg-[#DFD3C3] text-[#111111] text-[11px] font-bold uppercase tracking-wider px-3 py-1 shadow">
                          {product.highlightTag}
                        </span>
                      )}
                    </div>

                    {/* Content Box */}
                    <div className="p-7 sm:p-9 xl:p-10">
                      <div className="flex items-center justify-between text-xs text-[#8A5835] font-bold uppercase tracking-wider mb-2">
                        <span>Madeira: {product.woods}</span>
                        <span className="text-[#1C1917] font-serif text-xl xl:text-2xl font-bold tabular-nums">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <h4 className="font-serif text-2xl xl:text-3xl font-bold text-[#111111] mb-3">
                        {product.name}
                      </h4>

                      <p className="text-xs sm:text-sm text-[#5C4033] leading-relaxed mb-6">
                        {product.description}
                      </p>

                      <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 text-xs text-[#3E2D22] mb-6 py-4 border-y border-[#DFD3C3]/60">
                        {product.specs.map((spec, i) => (
                          <li key={i} className="flex items-center gap-2">
                            {renderSpecIcon(spec.icon)}
                            <span className="truncate">{spec.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-7 sm:p-9 xl:p-10 pt-0 flex flex-wrap items-center gap-3.5">
                    <button
                      onClick={() => onAddToCart(product)}
                      className="flex-1 py-4 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest text-center transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Encomendar Peça</span>
                    </button>

                    <button
                      onClick={() => onSelectProduct(product)}
                      className="px-5 py-4 border border-[#DFD3C3] hover:border-[#8A5835] text-[#111111] hover:text-[#8A5835] text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer bg-white"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Ajustar Dimensões</span>
                    </button>

                    <button
                      onClick={() => onSelectProduct(product)}
                      className="p-4 border border-[#DFD3C3] hover:border-[#2A1E17] text-[#1C1917] transition-colors cursor-pointer bg-white"
                      title="Ver galeria e especificações"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
