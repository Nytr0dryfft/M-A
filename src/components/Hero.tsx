import React, { useState } from 'react';
import { Utensils, Armchair, Sparkles, Shield, Award, CheckCircle2 } from 'lucide-react';
import { useParallax } from '../hooks/useParallax';

interface HeroProps {
  heroBgUrl: string;
  onOpenCustomStudio: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  heroBgUrl,
  onOpenCustomStudio,
}) => {
  const scrollY = useParallax();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle gentle mouse parallax tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Parallax calculations
  const bgTranslateY = scrollY * 0.38;
  const contentTranslateY = scrollY * -0.06;
  const cardsDriftY = scrollY * -0.12;

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[85vh] sm:min-h-[95vh] flex items-center justify-center overflow-hidden bg-[#2A1E17] pt-16 sm:pt-20"
    >
      {/* Background Image with Deep Parallax Translation & Scale */}
      <div
        className="absolute inset-0 w-full h-[135%] -top-[15%] bg-cover bg-center will-change-transform scale-105 pointer-events-none transition-transform duration-100 ease-out"
        style={{
          backgroundImage: `url('${heroBgUrl}')`,
          transform: `translate3d(${mousePos.x * -14}px, ${bgTranslateY + mousePos.y * -14}px, 0) scale(1.06)`,
        }}
      />

      {/* Earthy Dark Gradient Overlays for High Contrast Typography */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/95 via-[#2A1E17]/85 to-[#111111]/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#FCF9F3] via-transparent to-[#111111]/50 pointer-events-none" />

      {/* Main Content with Counter-Parallax */}
      <div
        className="relative z-10 max-w-[1560px] mx-auto px-5 sm:px-8 lg:px-14 xl:px-16 2xl:px-20 py-10 sm:py-20 lg:py-28 2xl:py-36 w-full transition-transform duration-100 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * 6}px, ${contentTranslateY + mousePos.y * 6}px, 0)`,
        }}
      >
        <div className="max-w-3xl lg:max-w-4xl 2xl:max-w-5xl flex flex-col gap-4 sm:gap-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 bg-[#FAF8F5]/90 backdrop-blur-md self-start shadow-sm border border-[#DFD3C3]">
            <span className="w-2 h-2 rounded-full bg-[#C29B68] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#111111]">
              Atelier Gourmet &amp; Marcenaria Fina de Precisão
            </span>
          </div>

          {/* Display Headline */}
          <h1 className="font-serif text-2xl sm:text-5xl lg:text-6xl 2xl:text-7xl text-[#FAF8F5] font-semibold tracking-tight leading-[1.15] sm:leading-[1.12]">
            A Alma da Madeira em Pequenos Móveis &amp; Tábuas Gourmet de Alta Precisão.
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-lg 2xl:text-xl text-[#DFD3C3] max-w-2xl 2xl:max-w-3xl font-normal leading-relaxed">
            Peças exclusivas usinadas com precisão CNC em madeiras certificadas. Design 100% personalizável ao gosto do cliente, unindo tecnologia, sofisticação e alta durabilidade para a gastronomia e ambientes contemporâneos
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-4 pt-1 sm:pt-4">
            <a
              href="#tabuas"
              className="px-5 sm:px-8 py-3 sm:py-4 bg-[#8A5835] hover:bg-[#B88658] text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-xl flex items-center justify-center gap-2.5 cursor-pointer text-center"
            >
              <span>Explorar Catálogo de Tábuas</span>
              <Utensils className="w-4 h-4" />
            </a>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-4">
              <a
                href="#moveis"
                className="px-3.5 sm:px-8 py-3 sm:py-4 bg-white/95 hover:bg-white text-[#111111] text-xs font-bold uppercase tracking-widest transition-all duration-300 backdrop-blur-sm shadow-md flex items-center justify-center gap-2 cursor-pointer text-center truncate"
              >
                <span>Pequenos Móveis</span>
                <Armchair className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </a>

              <button
                onClick={onOpenCustomStudio}
                className="px-3.5 sm:px-5 py-3 sm:py-4 border border-[#C29B68]/60 hover:border-[#C29B68] text-[#FAF8F5] hover:bg-white/10 text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer text-center truncate"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C29B68] shrink-0" />
                <span>Sob Medida</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Metrics Cards with Parallax Drift */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mt-8 sm:mt-14 lg:mt-20 2xl:mt-24 max-w-5xl 2xl:max-w-6xl transition-transform duration-150 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * -8}px, ${cardsDriftY + mousePos.y * -8}px, 0)`,
          }}
        >
          {/* Metric 1 */}
          <div className="bg-[#FAF8F5]/95 backdrop-blur-md p-3.5 sm:p-6 border-l-4 border-[#C29B68] shadow-2xl hover:-translate-y-1 transition-transform">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] block">100%</span>
            <span className="text-[11px] sm:text-xs uppercase tracking-wider text-[#3E2D22] font-semibold mt-0.5 sm:mt-1 block">
              Madeira Maciça Nobre
            </span>
            <p className="text-[11px] sm:text-xs text-[#5C4033] mt-1 sm:mt-1.5 leading-relaxed">
              Sem compensados ou MDF. Densidade pura e veios contínuos naturais com certificação de origem.
            </p>
          </div>

          {/* Metric 2 */}
          <div className="bg-[#FAF8F5]/95 backdrop-blur-md p-3.5 sm:p-6 border-l-4 border-[#C29B68] shadow-2xl hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#111111]">Grau Puro</span>
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#8A5835]" />
            </div>
            <span className="text-[11px] sm:text-xs uppercase tracking-wider text-[#3E2D22] font-semibold mt-0.5 sm:mt-1 block">
              Tratamento Culinário Puro
            </span>
            <p className="text-[11px] sm:text-xs text-[#5C4033] mt-1 sm:mt-1.5 leading-relaxed">
              Selagem atóxica com cera de abelha silvestre e óleo mineral farmacêutico USP de grau alimentício.
            </p>
          </div>

          {/* Metric 3 */}
          <div className="bg-[#FAF8F5]/95 backdrop-blur-md p-3.5 sm:p-6 border-l-4 border-[#C29B68] shadow-2xl hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#111111]">
                Peças Vendidas
              </span>
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#8A5835]" />
            </div>
            <span className="text-[11px] sm:text-xs uppercase tracking-wider text-[#3E2D22] font-semibold mt-0.5 sm:mt-1 block">
              Obras Entregues a Clientes
            </span>
            <p className="text-[11px] sm:text-xs text-[#5C4033] mt-1 sm:mt-1.5 leading-relaxed">
              Criações autorais já vendidas e entregues a clientes e assadores em todo o Brasil. Trabalhamos sob encomenda exclusiva.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
