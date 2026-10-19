import React, { useState } from 'react';
import { Info, X, Check } from 'lucide-react';

export const AnatomySection: React.FC = () => {
  const [activePillar, setActivePillar] = useState<number | null>(null);

  const pillars = [
    {
      id: 1,
      num: '01',
      title: 'Tábuas Personalizadas',
      description:
        'Peças utilitárias e gourmet de padrão superior, desenvolvidas com atenção minuciosa aos detalhes, acabamento refinado e possibilidade de personalização sob medida.',
      badgeCategory: 'Alta Gastronomia & Uso Diário',
      badgeValue: 'Personalização Exclusiva',
      deepDive:
        'Cada tábua é confeccionada a partir de pranchas nobres selecionadas, passando por rigoroso processo de calibração, colagem atóxica e acabamento sedoso. No configurador ou sob encomenda, o cliente define dimensões, canaletas, pegadores e gravações que tornam cada peça singular e duradoura.',
      stats: 'Madeiras nobres certificadas, seladas com produtos atóxicos para corte e serviço.',
    },
    {
      id: 2,
      num: '02',
      title: 'Móveis de Autoria Própria',
      description:
        'Mobiliário autoral desenvolvido com identidade própria, criatividade e cuidado em cada etapa da execução, valorizando o desenho original e as formas da madeira.',
      badgeCategory: 'Autoria & Design',
      badgeValue: 'Criação Original',
      deepDive:
        'Nossos móveis nascem da busca pelo equilíbrio entre estética contemporânea e a força expressiva da madeira maciça. Cada banco, mesa ou peça de apoio é concebida com desenho próprio, respeitando os veios, as tonalidades naturais e a ergonomia, resultando em peças autênticas que marcam presença em qualquer ambiente.',
      stats: 'Tiragens limitadas e projetos autorais com assinatura e autenticidade.',
    },
    {
      id: 3,
      num: '03',
      title: 'Precisão na Marcenaria',
      description:
        'Usinagem milimétrica em CNC combinada a encaixes e travamentos executados com rigor técnico, garantindo encaixes perfeitos e estabilidade estrutural.',
      badgeCategory: 'Engenharia Marceneira',
      badgeValue: 'Rigor Técnico & CNC',
      deepDive:
        'Aliamos a tecnologia da fresadora CNC computadorizada ao conhecimento construtivo tradicional. Essa precisão milimétrica permite realizar rebaixos, perfis, encaixes de alta exatidão e gravações detalhadas, conferindo solidez estrutural e fidelidade geométrica a cada peça do ateliê.',
      stats: 'Tolerância milimétrica na usinagem CNC integrada a encaixes tradicionais.',
    },
    {
      id: 4,
      num: '04',
      title: 'Acabamento Artesanal',
      description:
        'Trabalho manual minucioso que valoriza os veios naturais da madeira, a qualidade dos materiais e a durabilidade excepcional em cada detalhe final.',
      badgeCategory: 'Toque & Longevidade',
      badgeValue: 'Acabamento Nobre',
      deepDive:
        'A etapa de finalização é inteiramente manual: lixamento progressivo em múltiplas granulações, selagem criteriosa com óleos minerais puros e cera natural de abelha silvestre. Esse processo nutre as fibras, repele umidade sem criar filmes plásticos e assegura um toque aveludado e resistência para atravessar anos.',
      stats: 'Selagem atóxica que nutre a madeira, preserva o toque orgânico e facilita a manutenção.',
    },
  ];

  return (
    <section className="py-10 sm:py-20 lg:py-28 2xl:py-36 max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 2xl:px-20 bg-[#FCF9F3] border-t border-[#DFD3C3]/60" id="anatomia">
      <div className="max-w-5xl 2xl:max-w-6xl mb-8 sm:mb-14 lg:mb-16">
        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
          <span className="w-8 h-[2px] bg-[#8A5835]" />
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#8A5835] font-bold">
            Rigor Marceneiro
          </span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-[2.1rem] xl:text-4xl 2xl:text-5xl text-[#111111] font-bold tracking-tight flex flex-wrap lg:flex-nowrap items-baseline gap-x-2 gap-y-1 lg:whitespace-nowrap">
          <span className="whitespace-nowrap">Anatomia de uma Obra</span>
          <span className="inline-flex items-baseline font-serif whitespace-nowrap">
            <span>M</span>
            <span className="text-[0.62em] font-medium text-[#8A5835] mx-[1.5px] -translate-y-[1px]">&amp;</span>
            <span>A</span>
          </span>
          <span className="whitespace-nowrap">: 4 Pilares de Excelência</span>
        </h2>
        <p className="text-xs sm:text-base 2xl:text-lg text-[#5C4033] mt-2 sm:mt-3 leading-relaxed max-w-3xl">
          Como unimos design autoral, rigor na usinagem CNC e acabamento artesanal para criar tábuas personalizadas e móveis exclusivos que atravessam gerações.
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
