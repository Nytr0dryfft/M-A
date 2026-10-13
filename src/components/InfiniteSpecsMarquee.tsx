import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Ruler, Hammer, ShieldCheck, Droplets, ChevronLeft, ChevronRight } from 'lucide-react';

export interface SpecItem {
  icon: string;
  value: string;
  label?: string;
}

const DEFAULT_BOARD_SPECS: SpecItem[] = [
  { icon: 'Ruler', value: '3,5 cm (personalizável)', label: 'Espessura' },
  { icon: 'Hammer', value: 'Entalhe de precisão por CNC', label: 'Usinagem' },
  { icon: 'ShieldCheck', value: 'Resinado com resina atóxica', label: 'Acabamento' },
  { icon: 'Droplets', value: 'Tratamento em resina', label: 'Proteção' },
];

interface InfiniteSpecsMarqueeProps {
  items?: SpecItem[];
  className?: string;
}

export const InfiniteSpecsMarquee: React.FC<InfiniteSpecsMarqueeProps> = ({
  items = DEFAULT_BOARD_SPECS,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Ruler':
        return <Ruler className="w-4 h-4 text-[#8A5835] shrink-0" />;
      case 'Hammer':
        return <Hammer className="w-4 h-4 text-[#8A5835] shrink-0" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-[#8A5835] shrink-0" />;
      case 'Droplets':
        return <Droplets className="w-4 h-4 text-[#8A5835] shrink-0" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-[#8A5835]" />;
    }
  };

  // Atualiza o índice ativo baseado na posição de rolagem horizontal
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, offsetWidth } = scrollRef.current;
    if (offsetWidth === 0) return;
    const newIndex = Math.round(scrollLeft / (offsetWidth * 0.75));
    setActiveIndex(Math.min(Math.max(newIndex, 0), items.length - 1));
  }, [items.length]);

  // Avanço automático lento (velocidade reduzida pela metade para conforto de leitura)
  useEffect(() => {
    if (isInteracting) return;

    autoScrollTimer.current = setInterval(() => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
        setActiveIndex(0);
      } else {
        const nextScroll = container.scrollLeft + 220;
        container.scrollTo({ left: nextScroll, behavior: 'smooth' });
      }
    }, 4500); // 4.5 segundos por transição suave

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [isInteracting, items.length]);

  const scrollToItem = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const child = container.children[index] as HTMLElement;
    if (child) {
      container.scrollTo({
        left: child.offsetLeft - 16,
        behavior: 'smooth',
      });
      setActiveIndex(index);
    }
  };

  const scrollPrev = () => {
    const nextIdx = Math.max(0, activeIndex - 1);
    scrollToItem(nextIdx);
  };

  const scrollNext = () => {
    const nextIdx = Math.min(items.length - 1, activeIndex + 1);
    scrollToItem(nextIdx);
  };

  return (
    <div
      className={`relative w-full py-2.5 sm:py-3 bg-[#FAF8F5] border-y border-[#DFD3C3]/70 select-none overflow-hidden ${className}`}
      aria-label="Carrossel de características da tábua"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onTouchStart={() => setIsInteracting(true)}
      onTouchEnd={() => {
        setTimeout(() => setIsInteracting(false), 2000);
      }}
    >
      {/* Sombras suaves nas extremidades para indicação visual de continuidade */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-4 sm:w-8 bg-gradient-to-r from-[#FAF8F5] to-transparent z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-4 sm:w-8 bg-gradient-to-l from-[#FAF8F5] to-transparent z-10"
        aria-hidden="true"
      />

      {/* Contêiner com rolagem horizontal natural por toque e snap */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none px-4 scroll-smooth snap-x snap-mandatory"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            className="shrink-0 snap-start flex items-center gap-2.5 px-3 py-1.5 rounded-sm bg-white border border-[#DFD3C3]/80 shadow-xs hover:border-[#8A5835] transition-colors"
          >
            <span className="p-1 rounded bg-[#FAF3EA] border border-[#DFD3C3]/70 flex items-center justify-center">
              {renderIcon(item.icon)}
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-xs font-semibold text-[#2A1E17] whitespace-nowrap">
                {item.value}
              </span>
            </div>
            {idx < items.length - 1 && (
              <span className="text-[#C29B68] ml-1 text-xs select-none hidden sm:inline" aria-hidden="true">
                ✦
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Indicadores discretos e controles no mobile */}
      <div className="flex items-center justify-between px-4 pt-2">
        <div className="flex items-center gap-1.5">
          {items.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => scrollToItem(dotIdx)}
              aria-label={`Ir para característica ${dotIdx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                dotIdx === activeIndex
                  ? 'w-5 bg-[#8A5835]'
                  : 'w-1.5 bg-[#DFD3C3] hover:bg-[#8A5835]/60'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1 text-[10px] text-[#5C4033] font-medium">
          <button
            onClick={scrollPrev}
            disabled={activeIndex === 0}
            aria-label="Característica anterior"
            className="p-1 rounded hover:bg-[#FAF3EA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#8A5835] cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span>
            {activeIndex + 1}/{items.length}
          </span>
          <button
            onClick={scrollNext}
            disabled={activeIndex === items.length - 1}
            aria-label="Próxima característica"
            className="p-1 rounded hover:bg-[#FAF3EA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#8A5835] cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
