import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight, Menu, X, ShieldCheck, Sparkles } from 'lucide-react';
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
            ? 'bg-[#FAF8F5]/95 backdrop-blur-md shadow-sm border-b border-[#DFD3C3]/70 py-3'
            : 'bg-[#FAF8F5]/90 backdrop-blur-sm border-b border-[#DFD3C3]/50 py-4'
        }`}
      >
        <div className="max-w-[1560px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 flex items-center justify-between">
          {/* Brand Wordmark & Icon */}
          <a href="#" className="flex items-center gap-3.5 group focus:outline-none">
            <img
              src={logoUrl}
              alt="M&A Atelier & Marcenaria Autoral"
              className="h-10 w-10 sm:h-11 sm:w-11 object-contain rounded-sm border border-[#DFD3C3]/70 group-hover:scale-105 transition-transform bg-white"
            />
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#111111] leading-tight group-hover:text-[#8A5835] transition-colors inline-flex items-baseline">
                <span>M</span>
                <span className="text-[0.62em] font-medium text-[#8A5835] mx-[1.5px] -translate-y-[1px]">&amp;</span>
                <span>A</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.24em] text-[#3E2D22] font-semibold">
                Atelier &amp; Marcenaria Autoral
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7">
            <a
              href="#catalogo"
              className="text-xs uppercase tracking-widest text-[#1C1917] hover:text-[#8A5835] font-semibold transition-colors"
            >
              Coleções
            </a>
            <a
              href="#tabuas"
              className="text-xs uppercase tracking-widest text-[#1C1917] hover:text-[#8A5835] font-semibold transition-colors"
            >
              Tábuas de Corte
            </a>
            <a
              href="#moveis"
              className="text-xs uppercase tracking-widest text-[#1C1917] hover:text-[#8A5835] font-semibold transition-colors"
            >
              Pequenos Móveis
            </a>
            <a
              href="#anatomia"
              className="text-xs uppercase tracking-widest text-[#1C1917] hover:text-[#8A5835] font-semibold transition-colors"
            >
              Processo &amp; Madeiras
            </a>
            <a
              href="#encomenda"
              className="text-xs uppercase tracking-widest text-[#1C1917] hover:text-[#8A5835] font-semibold transition-colors"
            >
              Sob Medida
            </a>
            <button
              onClick={onOpenCareGuide}
              className="text-xs uppercase tracking-widest text-[#5C4033] hover:text-[#8A5835] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Garantia &amp; Cuidados</span>
            </button>
          </nav>

          {/* Action Zone */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 sm:px-3 sm:py-2.5 bg-white border border-[#DFD3C3] text-[#111111] hover:border-[#8A5835] hover:text-[#8A5835] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
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
              onClick={onOpenCustomStudio}
              className="hidden sm:inline-flex items-center gap-2 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest px-4 sm:px-5 py-2.5 sm:py-3 transition-all duration-200 shadow-md cursor-pointer"
            >
              <span>Encomendar Peça</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#111111] hover:text-[#8A5835] focus:outline-none"
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF8F5] border-b border-[#DFD3C3] px-5 py-4 space-y-3 shadow-xl">
            <nav className="grid grid-cols-2 gap-2">
              <a
                href="#catalogo"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] uppercase tracking-wider text-[#1C1917] font-semibold py-2 px-2.5 bg-white border border-[#DFD3C3]/70 truncate text-center"
              >
                Coleções
              </a>
              <a
                href="#tabuas"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] uppercase tracking-wider text-[#1C1917] font-semibold py-2 px-2.5 bg-white border border-[#DFD3C3]/70 truncate text-center"
              >
                Tábuas
              </a>
              <a
                href="#moveis"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] uppercase tracking-wider text-[#1C1917] font-semibold py-2 px-2.5 bg-white border border-[#DFD3C3]/70 truncate text-center"
              >
                Móveis
              </a>
              <a
                href="#anatomia"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] uppercase tracking-wider text-[#1C1917] font-semibold py-2 px-2.5 bg-white border border-[#DFD3C3]/70 truncate text-center"
              >
                Processo
              </a>
              <a
                href="#encomenda"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] uppercase tracking-wider text-[#1C1917] font-semibold py-2 px-2.5 bg-white border border-[#DFD3C3]/70 truncate text-center col-span-1"
              >
                Sob Medida
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCareGuide();
                }}
                className="text-[11px] uppercase tracking-wider text-[#5C4033] font-semibold py-2 px-2.5 bg-white border border-[#DFD3C3]/70 flex items-center justify-center gap-1 cursor-pointer truncate"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#8A5835] shrink-0" />
                <span>Cuidados</span>
              </button>
            </nav>
            <div className="pt-2 border-t border-[#DFD3C3]/60">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCustomStudio();
                }}
                className="w-full text-center py-2.5 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
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

