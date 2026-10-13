import React, { useState } from 'react';
import { Product } from '../types';
import { X, ShoppingBag, PenTool, Check, Sparkles, Shield, Heart } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, customEngraving?: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const [enableLaser, setEnableLaser] = useState(false);
  const [engravingText, setEngravingText] = useState('M&A · MASTER CHEF');
  const [selectedAddon, setSelectedAddon] = useState<string>('cera_extra');
  const [added, setAdded] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, enableLaser ? engravingText : undefined);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
        <div className="bg-[#FAF8F5] max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#DFD3C3] shadow-2xl relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-[#FAF8F5]/80 hover:bg-[#2A1E17] hover:text-white text-[#111111] transition-colors border border-[#DFD3C3]"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Column: Visual & Laser Simulator */}
            <div className="p-6 sm:p-8 bg-[#2A1E17] text-[#FAF8F5] flex flex-col justify-between">
              <div>
                <div 
                  className={`relative overflow-hidden aspect-[4/3] bg-black/50 border border-[#DFD3C3]/20 mb-4 group ${
                    product.imageFit === 'contain' ? 'flex items-center justify-center cursor-pointer' : ''
                  }`}
                  onClick={() => product.imageFit === 'contain' && setShowImagePreview(true)}
                  title={product.imageFit === 'contain' ? 'Clique para ver foto em tamanho real' : undefined}
                >
                  {product.imageFit === 'contain' ? (
                    <>
                      {/* Fundo suave desfocado para evitar cortes e preencher barras */}
                      <img
                        src={product.imageUrl}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-35 brightness-75 pointer-events-none select-none"
                      />
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="relative z-10 max-h-full max-w-full object-contain p-2 sm:p-3 transition-transform duration-500 group-hover:scale-103 drop-shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    </>
                  ) : (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Laser engraving overlay simulation */}
                  {enableLaser && engravingText && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-4">
                      <span
                        className="font-serif font-bold text-sm tracking-widest uppercase text-[#1B0F07]"
                        style={{
                          textShadow: '0 1px 1px rgba(255,255,255,0.35), 0 -1px 2px rgba(0,0,0,0.85)',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                        }}
                      >
                        {engravingText}
                      </span>
                    </div>
                  )}

                  {product.badge && (
                    <span className="absolute top-3 left-3 z-20 bg-[#111111]/90 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
                      {product.badge}
                    </span>
                  )}
                </div>

              {/* Laser Simulation Control Box */}
              <div className="p-4 bg-[#1C1917] border border-[#DFD3C3]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#C29B68] flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableLaser}
                      onChange={(e) => setEnableLaser(e.target.checked)}
                      className="accent-[#8A5835] w-4 h-4 cursor-pointer"
                    />
                    <span>Personalização feita por CNC (Brasão ou Nome)</span>
                  </label>
                  <span className="text-[10px] uppercase text-[#DFD3C3]/70 font-mono">
                    {enableLaser ? '+ R$ 50,00' : 'Opcional'}
                  </span>
                </div>

                {enableLaser && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <input
                      type="text"
                      value={engravingText}
                      onChange={(e) => setEngravingText(e.target.value)}
                      placeholder="Nome, monograma ou brasão"
                      maxLength={32}
                      className="w-full p-2.5 bg-black/40 border border-[#DFD3C3]/30 text-xs text-white focus:outline-[#C29B68]"
                    />
                    <span className="text-[10px] text-[#DFD3C3]/60 block">
                      Usinagem milimétrica com alta precisão CNC na madeira maciça.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Atelier Certification Badge */}
            <div className="mt-4 pt-4 border-t border-[#DFD3C3]/20 flex items-center gap-2.5 text-xs text-[#DFD3C3]">
              <Shield className="w-4 h-4 text-[#C29B68]" />
              <span>Garantia Vitalícia de Fibras &amp; Certificado de Autenticidade FSC</span>
            </div>
          </div>

          {/* Right Column: Information, Specs & Buy CTA */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#8A5835]">
                  {product.categoryLabel}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-1">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl font-bold font-serif text-[#1C1917] tabular-nums">
                    {product.priceRange ? product.priceRange : `R$ ${(product.price + (enableLaser ? 50 : 0)).toFixed(2).replace('.', ',')}`}
                  </span>
                  <span className="text-xs text-[#5C4033] font-medium">
                    Madeiras: {product.woods}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#5C4033] leading-relaxed">
                {product.description}
              </p>

              {/* Craft Specifications */}
              <div className="space-y-2 py-3 border-y border-[#DFD3C3]/70 text-xs">
                <div className="flex justify-between text-[#3E2D22]">
                  <span className="font-semibold">Dimensões Reais:</span>
                  <span className="text-[#111111] font-medium">{product.dimensions}</span>
                </div>
                {product.weight && (
                  <div className="flex justify-between text-[#3E2D22]">
                    <span className="font-semibold">Peso Maciço:</span>
                    <span className="text-[#111111] font-medium">{product.weight}</span>
                  </div>
                )}
                <div className="flex flex-col gap-1 text-[#3E2D22] pt-1">
                  <span className="font-semibold">Técnica de Marcenaria:</span>
                  <span className="text-[#5C4033] leading-relaxed">{product.joineryType}</span>
                </div>
                <div className="flex flex-col gap-1 text-[#3E2D22] pt-1">
                  <span className="font-semibold">Tratamento &amp; Cura:</span>
                  <span className="text-[#5C4033] leading-relaxed">{product.finishType}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 space-y-3">
              <button
                onClick={handleAdd}
                disabled={added}
                className="w-full py-4 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-[#C29B68]" />
                    <span>Adicionado à Sacola!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      Adicionar ao Pedido ({product.priceRange ? product.priceRange : `R$ ${(product.price + (enableLaser ? 50 : 0)).toFixed(2).replace('.', ',')}`})
                    </span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 text-center text-xs font-semibold text-[#5C4033] hover:text-[#111111]"
              >
                Continuar Explorando Coleções
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

      {showImagePreview && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowImagePreview(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-[85vh] max-w-full object-contain"
            />
            <button
              onClick={() => setShowImagePreview(false)}
              className="absolute top-2 right-2 p-2 bg-black/60 text-white hover:bg-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
