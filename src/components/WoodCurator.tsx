import React, { useState } from 'react';
import { WoodSpecimen } from '../types';
import { ShieldCheck, BarChart2, Compass, Wind, Sparkles, Check } from 'lucide-react';

interface WoodCuratorProps {
  woodSpecimens: WoodSpecimen[];
  onSelectWoodForCustom: (woodName: string) => void;
}

export const WoodCurator: React.FC<WoodCuratorProps> = ({
  woodSpecimens,
  onSelectWoodForCustom,
}) => {
  const [activeWoodId, setActiveWoodId] = useState<string>(woodSpecimens[0]?.id || 'freijo');

  const selectedWood = woodSpecimens.find((w) => w.id === activeWoodId) || woodSpecimens[0];
  const maxJanka = 16000;

  return (
    <section className="py-20 lg:py-28 2xl:py-36 bg-[#FAF8F5] border-y border-[#DFD3C3]/60" id="madeiras">
      <div className="max-w-[1560px] mx-auto px-6 sm:px-8 lg:px-14 xl:px-16 2xl:px-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-[2px] bg-[#8A5835]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#8A5835] font-bold">
                Origem das Fibras
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl 2xl:text-5xl text-[#111111] font-bold tracking-tight">
              Curadoria de Madeiras Nobres Brasileiras
            </h2>
            <p className="text-sm sm:text-base 2xl:text-lg text-[#5C4033] mt-3 leading-relaxed">
              Trabalhamos exclusivamente com toras rastreadas de manejo florestal sustentável com
              certificação ambiental. Cada espécie possui densidade, dureza Janka e notas aromáticas
              singulares.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B88658] bg-[#FCF9F3] px-4 py-2 border border-[#DFD3C3]">
            <ShieldCheck className="w-4 h-4 text-[#8A5835]" />
            <span>Manejo Sustentável &amp; Secagem em Estufa</span>
          </div>
        </div>

        {/* 5 Wood Specimens Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 xl:gap-6 mb-8">
          {woodSpecimens.map((specimen) => {
            const isActive = specimen.id === activeWoodId;
            return (
              <div
                key={specimen.id}
                onClick={() => setActiveWoodId(specimen.id)}
                className={`p-5 shadow-sm transition-all duration-300 flex flex-col justify-between cursor-pointer border-2 ${
                  isActive
                    ? 'bg-white border-[#8A5835] shadow-xl -translate-y-1'
                    : 'bg-[#FCF9F3] border-transparent hover:border-[#DFD3C3] hover:shadow-md'
                }`}
              >
                <div>
                  {/* Swatch Sample Box */}
                  <div className="w-full h-36 bg-[#DFD3C3]/40 overflow-hidden relative mb-3.5">
                    <div
                      className={`w-full h-full bg-gradient-to-tr ${specimen.colorGradient} opacity-95 flex items-center justify-center p-2 text-center shadow-inner`}
                    >
                      <span className="font-serif italic text-white/95 text-xs drop-shadow-sm px-2">
                        {specimen.scientificName}
                      </span>
                    </div>
                    <span className="absolute top-2 right-2 bg-[#111111] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                      {specimen.badge}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-serif text-lg font-bold text-[#111111]">
                      {specimen.name}
                    </h3>
                    {isActive && <Check className="w-4 h-4 text-[#8A5835]" />}
                  </div>

                  <p className="text-xs text-[#5C4033] leading-relaxed">
                    {specimen.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#DFD3C3]/70 flex flex-col gap-1.5 text-[11px]">
                  <div className="flex justify-between text-[#3E2D22]">
                    <span>Dureza Janka:</span>
                    <strong className="text-[#111111] tabular-nums">
                      {specimen.jankaHardness.toLocaleString('pt-BR')} N
                    </strong>
                  </div>
                  <div className="flex justify-between text-[#3E2D22]">
                    <span>Aplicação:</span>
                    <strong className="text-[#111111]">{specimen.application}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Wood Deep Dive & Comparative Tool */}
        {selectedWood && (
          <div className="p-6 sm:p-8 bg-[#FAF8F5] border border-[#DFD3C3] shadow-md flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-[#8A5835] font-bold">
                  Especificação Técnica em Atelier
                </span>
                <span className="text-[#DFD3C3]">·</span>
                <span className="font-serif italic text-xs text-[#5C4033]">
                  {selectedWood.scientificName}
                </span>
              </div>

              <h4 className="font-serif text-2xl font-bold text-[#111111]">
                {selectedWood.name} — Perfil Físico &amp; Sensorial
              </h4>

              {/* Janka Scale Comparison Visualizer */}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-[#5C4033] mb-1.5">
                  <span className="font-medium">Escala de Dureza Janka (Resistência ao Impacto):</span>
                  <span className="font-bold text-[#111111] tabular-nums">
                    {selectedWood.jankaHardness.toLocaleString('pt-BR')} Newtons / {maxJanka.toLocaleString('pt-BR')} N
                  </span>
                </div>
                <div className="w-full h-3 bg-[#DFD3C3]/50 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8A5835] to-[#2A1E17] transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (selectedWood.jankaHardness / maxJanka) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Details Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-[#3E2D22]">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#8A5835]" />
                  <span>
                    Origem: <strong>{selectedWood.origin}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#8A5835]" />
                  <span>
                    Densidade Seca: <strong>{selectedWood.density}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-[#8A5835]" />
                  <span>
                    Perfil Olfativo: <strong>{selectedWood.aroma}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Direct action CTA */}
            <div className="w-full lg:w-auto shrink-0 flex flex-col gap-2">
              <button
                onClick={() => onSelectWoodForCustom(selectedWood.name)}
                className="w-full lg:w-auto px-6 py-3.5 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Escolher para Peça Sob Medida</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
