import React, { useState } from 'react';
import { Layers, Combine, ShieldCheck, PenTool, Check, Info, X } from 'lucide-react';

export const AnatomySection: React.FC = () => {
  const [activePillar, setActivePillar] = useState<number | null>(null);

  const pillars = [
    {
      id: 1,
      num: '01',
      title: 'Grão de Topo (End-Grain)',
      description:
        'As fibras de madeira ficam na vertical: a lâmina da faca desliza entre os anéis de crescimento sem cortá-los. O fio da faca se mantém afiado até 4x mais tempo e a madeira se autorregenera naturalmente ao longo do uso.',
      badgeCategory: 'Benefício Gourmet',
      badgeValue: 'Preserva o Fio & Auto-Cura',
      deepDive:
        'Diferente das tábuas comuns em edge-grain (fios horizontais cortados que soltam lascas e desgastam o fio de aço), a marchetaria end-grain da M&A agrupa centenas de blocos cúbicos posicionados verticalmente. Quando a faca atinge a superfície, as fibras apenas se afastam momentaneamente e retornam à posição com o banho mineral periódico.',
      stats: 'Até 4x mais durabilidade do fio de facas damasco e alemãs.',
    },
    {
      id: 2,
      num: '02',
      title: 'Encaixes Vivos & Mariposas',
      description:
        'Travamentos mecânicos ancestrais (chaves borboleta "butterfly keys" e respigas de precisão) que permitem à madeira respirar e movimentar-se termicamente sem jamais trincar ou empenar ao longo das estações.',
      badgeCategory: 'Engenharia Estrutural',
      badgeValue: 'Zero Empenamento',
      deepDive:
        'A madeira sólida é um organismo vivo que responde à umidade relativa do ar. Nossos mestres entalham mariposas em madeiras de alta densidade (como Ébano e Jacarandá) nas fissuras naturais de pranchas vivas e usam respigas cegas japonesas que eliminam a necessidade de parafusos metálicos rígidos que causariam rachaduras estruturais.',
      stats: 'Tolerância milimétrica de usinagem com encaixes manuais sem parafusos aparentes.',
    },
    {
      id: 3,
      num: '03',
      title: 'Grau Culinário 100% Seguro',
      description:
        'Três demãos de banho quente em óleo mineral farmacêutico puro sem solventes químicos, seladas com cera virgem de abelha silvestre de apicultura orgânica. Hidrorrepelente natural certificado para contato alimentar.',
      badgeCategory: 'Segurança Alimentar',
      badgeValue: 'Atóxico & Antibacteriano',
      deepDive:
        'Jamais utilizamos vernizes sintéticos, poliuretanos ou óleos vegetais de cozinha (como soja ou azeite, que rançam e atraem bactérias). Nossa fórmula autoral combina Óleo Mineral USP com Cera de Abelha Apis Mellifera da Serra da Mantiqueira, criando uma barreira bacteriostática hidrofóbica que repele sangue e sucos de carne.',
      stats: 'Em conformidade com normas sanitárias internacionais FDA para superfícies de corte.',
    },
    {
      id: 4,
      num: '04',
      title: 'Personalização Autoral',
      description:
        'Usinagem de precisão milimétrica em CNC com brasão de família, monogramas, assinatura de chef ou logotipo institucional para presentes de alto impacto.',
      badgeCategory: 'Exclusividade',
      badgeValue: 'Usinagem CNC & Medidas',
      deepDive:
        'Seja para marcar a data de um casamento, o brasão da sua propriedade, assinatura de mestre-churrasqueiro ou lotes corporativos para diretorias e clientes VIP, executamos usinagem milimétrica computadorizada CNC na própria madeira maciça, acompanhado de certificado de autenticidade e procedência.',
      stats: 'Usinagem em fresa de precisão CNC com profundidade milimétrica calibrada.',
    },
  ];

  return (
    <section className="py-10 sm:py-20 lg:py-28 2xl:py-36 max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 2xl:px-20 bg-[#FCF9F3] border-t border-[#DFD3C3]/60" id="anatomia">
      <div className="max-w-4xl 2xl:max-w-5xl mb-8 sm:mb-14 lg:mb-16">
        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
          <span className="w-8 h-[2px] bg-[#8A5835]" />
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#8A5835] font-bold">
            Rigor Marceneiro
          </span>
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl 2xl:text-5xl text-[#111111] font-bold tracking-tight inline-flex items-baseline gap-1.5 flex-wrap">
          <span>Anatomia de uma Obra</span>
          <span className="inline-flex items-baseline font-serif">
            <span>M</span>
            <span className="text-[0.62em] font-medium text-[#8A5835] mx-[1.5px] -translate-y-[1px]">&amp;</span>
            <span>A</span>
          </span>
          <span>: 4 Pilares de Excelência</span>
        </h2>
        <p className="text-xs sm:text-base 2xl:text-lg text-[#5C4033] mt-2 sm:mt-3 leading-relaxed">
          Por que uma peça esculpida em marcenaria autoral atravessa décadas intacta enquanto tábuas
          comuns empenam e perdem a vida.
        </p>
      </div>

      {/* Grid of 4 Pillars: 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 xl:gap-8">
        {pillars.map((pillar) => (
          <div
            key={pillar.id}
            onClick={() => setActivePillar(pillar.id === activePillar ? null : pillar.id)}
            className={`bg-[#FAF8F5] p-3.5 sm:p-7 xl:p-8 border-t-4 border-[#8A5835] shadow-md flex flex-col justify-between group transition-all duration-300 cursor-pointer ${
              activePillar === pillar.id
                ? 'ring-2 ring-[#8A5835] -translate-y-1.5 shadow-xl bg-white'
                : 'hover:-translate-y-1 hover:shadow-lg'
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-3 sm:mb-6">
                <span className="font-serif text-2xl sm:text-4xl font-bold text-[#DFD3C3] group-hover:text-[#8A5835] transition-colors">
                  {pillar.num}
                </span>
                <span className="text-[10px] sm:text-xs text-[#8A5835] font-semibold flex items-center gap-1 group-hover:underline">
                  <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">Saber mais</span>
                </span>
              </div>

              <h4 className="font-serif text-sm sm:text-xl font-bold text-[#111111] mb-1.5 sm:mb-2.5 leading-snug">
                {pillar.title}
              </h4>

              <p className="text-[11px] sm:text-sm text-[#5C4033] leading-relaxed line-clamp-4 sm:line-clamp-none">
                {pillar.description}
              </p>
            </div>

            <div className="mt-4 sm:mt-8 pt-2.5 sm:pt-4 border-t border-[#DFD3C3]/60">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#B88658] font-bold block mb-0.5 truncate">
                {pillar.badgeCategory}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-[#111111] truncate block">
                {pillar.badgeValue}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Deep Dive Panel if selected */}
      {activePillar !== null && (
        <div className="mt-4 sm:mt-8 p-4 sm:p-8 bg-[#2A1E17] text-[#FAF8F5] shadow-xl relative animate-fadeIn border-l-4 border-[#C29B68]">
          <button
            onClick={() => setActivePillar(null)}
            className="absolute top-4 right-4 text-[#DFD3C3] hover:text-white p-1"
            aria-label="Fechar detalhe do pilar"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest text-[#C29B68] font-bold">
              Caderno de Oficina · Pilar {pillars[activePillar - 1].num}
            </span>
            <h3 className="font-serif text-2xl font-bold text-white mt-1 mb-3">
              {pillars[activePillar - 1].title}
            </h3>
            <p className="text-sm text-[#DFD3C3] leading-relaxed mb-4">
              {pillars[activePillar - 1].deepDive}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FAF8F5]/10 text-xs text-[#C29B68] border border-[#C29B68]/30">
              <Check className="w-4 h-4 text-[#C29B68]" />
              <span>{pillars[activePillar - 1].stats}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
