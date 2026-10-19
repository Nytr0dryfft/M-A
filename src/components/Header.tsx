import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight, Menu, X, Sparkles } from 'lucide-react';
import logoImg from '../assets/images/logo.png';

interface HeaderProps {
  cartCount: number;
  logoUrl?: string;
  onOpenCart: () => void;
  onOpenCareGuide: () => void;
  onOpenCustomStudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  logoUrl = logoImg,
  onOpenCart,
  onOpenCareGuide,
  onOpenCustomStudio,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#FAF8F5]/95 backdrop-blur-md shadow-sm border-b border-[#DFD3C3]/70 py-2.5 sm:py-3'
            : 'bg-[#FAF8F5]/90 backdrop-blur-sm border-b border-[#DFD3C3]/50 py-3 sm:py-3.5'
        }`}
      >
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between gap-3">
          {/* Identidade Visual da Marca no Topo: Símbolo original + Ateliê / Marcenaria Autoral */}
          <a href="#" className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none shrink-0">
            <img
              src={logoUrl}
              alt="Ateliê Marcenaria Autoral"
              className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-xs border border-[#DFD3C3]/70 group-hover:scale-105 transition-transform bg-white shrink-0"
            />
            <div className="flex flex-col justify-center">
              <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-[#111111] group-hover:text-[#8A5835] transition-colors leading-tight">
                Ateliê
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#5C4033] font-semibold leading-tight mt-0.5 whitespace-nowrap">
                Marcenaria Autoral
              </span>
            </div>
          </a>

          {/* Desktop Nav Links — Sem sobreposição, espaçamento balanceado e legível */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5.5 2xl:gap-6.5 shrink min-w-0">
            <a
              href="#catalogo"
              className="text-[11px] xl:text-xs uppercase tracking-wider xl:tracking-widest text-[#1C1917] hover:text-[#8A5835] font-semibold transition-colors whitespace-nowrap"
            >
              Coleções
            </a>
            <a
              href="#tabuas"
              className="text-[11px] xl:text-xs uppercase tracking-wider xl:tracking-widest text-[#1C1917] hover:text-[#8A5835] font-semibold transition-colors whitespace-nowrap"
            >
              Tábuas de Corte
            </a>
            <a
              href="#moveis"
              className="text-[11px] xl:text-xs uppercase tracking-wider xl:tracking-widest text-[#1C1917] hover:text-[#8A5835] font-semibold transition-colors whitespace-nowrap"
            >
              Pequenos Móveis
            </a>
            <a
              href="#anatomia"
              className="text-[11px] xl:text-xs uppercase tracking-wider xl:tracking-widest text-[#1C1917] hover:text-[#8A5835] font-semibold transition-colors whitespace-nowrap"
            >
              Processo &amp; Madeiras
            </a>
            <a
              href="#fotos-clientes"
              className="text-[11px] xl:text-xs uppercase tracking-wider xl:tracking-widest text-[#1C1917] hover:text-[#8A5835] font-semibold transition-colors whitespace-nowrap"
            >
              Fotos de Clientes
            </a>
            <a
              href="#encomenda"
              className="text-[11px] xl:text-xs uppercase tracking-wider xl:tracking-widest text-[#1C1917] hover:text-[#8A5835] font-semibold transition-colors whitespace-nowrap"
            >
              Sob Medida
            </a>
            <button
              type="button"
              onClick={onOpenCareGuide}
              className="text-[11px] xl:text-xs uppercase tracking-wider xl:tracking-widest text-[#1C1917] hover:text-[#8A5835] font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              Garantia e Cuidados
            </button>
          </nav>

          {/* Action Zone */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 sm:px-3 sm:py-2 bg-white border border-[#DFD3C3] text-[#111111] hover:border-[#8A5835] hover:text-[#8A5835] transition-all flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
              title="Ver Sacola de Pedidos"
            >
              <ShoppingBag className="w-4 h-4 text-[#2A1E17]" />
              <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">
                Sacola
              </span>
              {cartCount > 0 && (
                <span className="bg-[#8A5835] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* CTA Order / Custom Studio */}
            <button
              type="button"
              onClick={onOpenCustomStudio}
              className="hidden md:inline-flex items-center gap-1.5 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-wider px-3.5 sm:px-4 py-2 sm:py-2.5 transition-all duration-200 shadow-sm cursor-pointer shrink-0"
            >
              <span>Encomendar Peça</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#111111] hover:text-[#8A5835] focus:outline-none shrink-0 cursor-pointer"
              aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF8F5] border-b border-[#DFD3C3] px-4 py-3.5 space-y-3 shadow-xl animate-fadeIn">
            <nav className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="#catalogo"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] uppercase tracking-wider text-[#1C1917] font-semibold py-2.5 px-2 bg-white border border-[#DFD3C3]/70 text-center flex items-center justify-center min-h-[40px]"
              >
                Coleções
              </a>
              <a
                href="#tabuas"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] uppercase tracking-wider text-[#1C1917] font-semibold py-2.5 px-2 bg-white border border-[#DFD3C3]/70 text-center flex items-center justify-center min-h-[40px]"
              >
                Tábuas de Corte
              </a>
              <a
                href="#moveis"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] uppercase tracking-wider text-[#1C1917] font-semibold py-2.5 px-2 bg-white border border-[#DFD3C3]/70 text-center flex items-center justify-center min-h-[40px]"
              >
                Pequenos Móveis
              </a>
              <a
                href="#anatomia"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] uppercase tracking-wider text-[#1C1917] font-semibold py-2.5 px-2 bg-white border border-[#DFD3C3]/70 text-center flex items-center justify-center min-h-[40px]"
              >
                Processo &amp; Madeiras
              </a>
              <a
                href="#fotos-clientes"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] uppercase tracking-wider text-[#1C1917] font-semibold py-2.5 px-2 bg-white border border-[#DFD3C3]/70 text-center flex items-center justify-center min-h-[40px]"
              >
                Fotos de Clientes
              </a>
              <a
                href="#encomenda"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] uppercase tracking-wider text-[#1C1917] font-semibold py-2.5 px-2 bg-white border border-[#DFD3C3]/70 text-center flex items-center justify-center min-h-[40px]"
              >
                Sob Medida
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCareGuide();
                }}
                className="col-span-2 text-[11px] uppercase tracking-wider text-[#1C1917] font-semibold py-2.5 px-3 bg-white border border-[#DFD3C3]/70 flex items-center justify-center cursor-pointer min-h-[40px] text-center"
              >
                Garantia e Cuidados
              </button>
            </nav>
            <div className="pt-1.5 border-t border-[#DFD3C3]/60">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCustomStudio();
                }}
                className="w-full text-center py-2.5 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C29B68]" />
                <span>Personalizar Peça Exclusiva</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

