import React, { useRef, useState, useEffect } from 'react';
import { renderCraftSpecIcon } from './CraftIcons';

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
  const [isInteracting, setIsInteracting] = useState(false);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  const renderIcon = (iconName: string) => {
    return renderCraftSpecIcon(iconName, 'w-4 h-4 text-[#8A5835] shrink-0');
  };

  // Avanço automático suave com suporte a pausa por interação
  useEffect(() => {
    if (isInteracting) return;

    autoScrollTimer.current = setInterval(() => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const nextScroll = container.scrollLeft + 220;
        container.scrollTo({ left: nextScroll, behavior: 'smooth' });
      }
    }, 4500);

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [isInteracting, items.length]);

  return (
    <div
      className={`relative w-full py-2.5 sm:py-3 bg-[#FAF8F5] border-y border-[#DFD3C3]/70 select-none overflow-hidden ${className}`}
      aria-label="Características do produto"
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
              {item.label && (
                <span className="text-[9px] uppercase tracking-wider text-[#8A5835] font-bold leading-none mb-0.5">
                  {item.label}
                </span>
              )}
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
    </div>
  );
};
