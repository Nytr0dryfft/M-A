import React, { useState } from 'react';
import { Sparkles, Check, Droplets } from 'lucide-react';
import { ATELIER_WOODS_LIST } from '../data/woods';

interface WoodCuratorProps {
  woodSpecimens?: unknown[];
  onSelectWoodForCustom: (woodName: string) => void;
}

export const WoodCurator: React.FC<WoodCuratorProps> = ({
  onSelectWoodForCustom,
}) => {
  const [activeWoodId, setActiveWoodId] = useState<string>('pinus');

  const selectedWood =
    ATELIER_WOODS_LIST.find((w) => w.id === activeWoodId) || ATELIER_WOODS_LIST[0];

  return (
    <section className="py-10 sm:py-20 lg:py-28 2xl:py-36 bg-[#FAF8F5] border-y border-[#DFD3C3]/60" id="madeiras">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 2xl:px-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <span className="w-8 h-[2px] bg-[#8A5835]" />
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#8A5835] font-bold">
                Atelier M&amp;A
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl 2xl:text-5xl text-[#111111] font-bold tracking-tight">
              Madeiras do Atelier
            </h2>
            <p className="text-xs sm:text-base 2xl:text-lg text-[#5C4033] mt-2 sm:mt-3 leading-relaxed">
              Trabalhamos exclusivamente com 4 espécies selecionadas. Todas recebem tratamento em resina para máxima durabilidade e acabamento refinado.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B88658] bg-[#FCF9F3] px-4 py-2 border border-[#DFD3C3]">
            <Droplets className="w-4 h-4 text-[#8A5835]" />
            <span>Tratamento em Resina em Todas as Peças</span>
          </div>
        </div>

        {/* 4 Cards: PINUS, ANGELIM, CEDRINHO, MAÇARANDUBA (2 cols on mobile, 4 cols on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5 xl:gap-6 mb-6 sm:mb-8">
          {ATELIER_WOODS_LIST.map((wood) => {
            const isActive = wood.id === activeWoodId;
            return (
              <div
                key={wood.id}
                onClick={() => setActiveWoodId(wood.id)}
                className={`p-2.5 sm:p-5 shadow-sm transition-all duration-300 flex flex-col justify-between cursor-pointer border-2 ${
                  isActive
                    ? 'bg-white border-[#8A5835] shadow-xl -translate-y-1'
                    : 'bg-[#FCF9F3] border-transparent hover:border-[#DFD3C3] hover:shadow-md'
                }`}
              >
                <div>
                  {/* Swatch com Textura Real da Madeira */}
                  <div className="w-full h-24 sm:h-40 bg-[#DFD3C3]/40 overflow-hidden relative mb-2 sm:mb-4 border border-black/10">
                    <img
                      src={wood.textureUrl}
                      alt={`Madeira ${wood.name}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-[#111111] text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 truncate max-w-[85%]">
                      {wood.treatment}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <h3 className="font-serif text-sm sm:text-xl font-bold uppercase tracking-wider text-[#111111] truncate">
                      {wood.name}
                    </h3>
                    {isActive && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#8A5835] shrink-0" />}
                  </div>

                  <p className="text-[10px] sm:text-xs text-[#5C4033] font-medium leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {wood.treatment}
                  </p>
                </div>

                <div className="mt-3 sm:mt-5 pt-2 sm:pt-3 border-t border-[#DFD3C3]/70">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveWoodId(wood.id);
                      onSelectWoodForCustom(wood.name);
                    }}
                    className={`w-full py-1.5 sm:py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 border truncate ${
                      isActive
                        ? 'bg-[#8A5835] text-white border-[#8A5835]'
                        : 'bg-white text-[#2A1E17] border-[#DFD3C3] hover:border-[#8A5835]'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="truncate">Selecionar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Wood Callout */}
        {selectedWood && (
          <div className="p-4 sm:p-8 bg-[#FAF8F5] border border-[#DFD3C3] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#8A5835] font-bold">
                Madeira Selecionada
              </span>
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#111111]">
                {selectedWood.name}
              </h4>
              <p className="text-[11px] sm:text-xs text-[#5C4033]">
                {selectedWood.treatment} — Peça produzida em madeira maciça com acabamento artesanal do atelier.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectWoodForCustom(selectedWood.name)}
              className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Configurar Peça em {selectedWood.name}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
