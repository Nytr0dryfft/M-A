import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Clock, Sparkles, Sliders, PenTool, Check, MessageSquare, Shield } from 'lucide-react';
import { TeamShield } from '../types';
import { TeamShieldGallery } from './TeamShieldGallery';
import { TEAM_SHIELDS } from '../data/teams';
import { CuttingBoardPreview, ShieldPosition } from './CuttingBoardPreview';
import { ATELIER_WOODS_LIST, getWoodById, DEFAULT_WOOD } from '../data/woods';

interface CustomOrderStudioProps {
  initialWood?: string;
  initialPieceType?: 'tabua_carne' | 'porta_copos';
  onSuccessOrder?: (summary: string) => void;
}

export const CustomOrderStudio: React.FC<CustomOrderStudioProps> = ({
  initialWood = DEFAULT_WOOD.name,
  initialPieceType,
  onSuccessOrder,
}) => {
  type ProductType = 'tabua_carne' | 'porta_copos';
  const [pieceType, setPieceType] = useState<ProductType>(initialPieceType || 'tabua_carne');
  const isCuttingBoard = pieceType === 'tabua_carne';
  const isPortaCopos = pieceType === 'porta_copos';

  // Espessura FIXA rigorosa (não configurável via slider nem input)
  // Tábua de Carne: 3.5 cm SEMPRE
  // Porta-Copos: 1.0 cm SEMPRE
  const thicknessCm = isCuttingBoard ? 3.5 : 1.0;

  // Limites dimensionais:
  // Tábua de Carne: 35 cm <= comprimento <= 50 cm | 20 cm <= largura <= 29 cm
  // Porta-Copos: 9 cm <= comprimento <= 12 cm | 9 cm <= largura <= 12 cm
  const minLength = isCuttingBoard ? 35 : 9;
  const maxLength = isCuttingBoard ? 50 : 12;
  const minWidth = isCuttingBoard ? 20 : 9;
  const maxWidth = isCuttingBoard ? 29 : 12;

  const [lengthCm, setLengthCm] = useState(isCuttingBoard ? 40 : 10);
  const [widthCm, setWidthCm] = useState(isCuttingBoard ? 29 : 10);
  const [woodType, setWoodType] = useState(initialWood);
  const [engravingType, setEngravingType] = useState('sim_brasao_cnc');
  const [selectedTeam, setSelectedTeam] = useState<TeamShield | null>(
    TEAM_SHIELDS.find((t) => t.id === 'flamengo') || null
  );
  const [engravingText, setEngravingText] = useState('');
  const [shieldPosition, setShieldPosition] = useState<ShieldPosition>('center');
  const [shieldScaleCm, setShieldScaleCm] = useState<number>(isCuttingBoard ? 14 : 6.5);
  const [showTechnicalView, setShowTechnicalView] = useState<boolean>(false);
  const [details, setDetails] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Sincronização da madeira selecionada externamente
  useEffect(() => {
    if (initialWood) {
      const found = getWoodById(initialWood);
      setWoodType(found.name);
    }
  }, [initialWood]);

  // Sincronização do tipo de peça selecionado externamente
  useEffect(() => {
    if (initialPieceType) {
      handlePieceTypeChange(initialPieceType);
    }
  }, [initialPieceType]);

  // Objeto da madeira selecionada vindo da única fonte de verdade
  const selectedWoodObj = getWoodById(woodType);

  // Switch product type handler com calibração automática de limites
  const handlePieceTypeChange = (newType: ProductType) => {
    setPieceType(newType);
    if (newType === 'tabua_carne') {
      setLengthCm((prev) => (prev >= 35 && prev <= 50 ? prev : 40));
      setWidthCm((prev) => (prev >= 20 && prev <= 29 ? prev : 29));
      setShieldScaleCm(14);
      if (woodType.toLowerCase().includes('cedr')) {
        setWoodType('Pinus');
      }
    } else {
      setLengthCm((prev) => (prev >= 9 && prev <= 12 ? prev : 10));
      setWidthCm((prev) => (prev >= 9 && prev <= 12 ? prev : 10));
      setShieldScaleCm(6.5);
    }
  };

  const availableWoods = pieceType === 'tabua_carne'
    ? ATELIER_WOODS_LIST.filter((w) => w.id !== 'cedrinho')
    : ATELIER_WOODS_LIST;

  // Switch team handler that preserves other state without forcing automatic slogans
  const handleSelectTeam = (team: TeamShield | null) => {
    setSelectedTeam(team);
  };

  // Price estimate calculation based on volume and piece type
  const calculateEstimate = () => {
    if (isPortaCopos) {
      // Porta-copos personalizado: variação entre 25,00 e 35,00
      let price = 25.0; // base unitária para porta-copos
      if (engravingType === 'sim_brasao_resinado') {
        price += 5.0;
      } else if (engravingType !== 'nao') {
        price += 3.0;
      }
      if (woodType.toLowerCase().includes('macaranduba') || woodType.toLowerCase().includes('maçaranduba')) {
        price += 5.0;
      } else if (woodType.toLowerCase().includes('angelim')) {
        price += 3.0;
      }
      price = Math.max(25.0, Math.min(35.0, price));
      return Number(price.toFixed(2));
    }

    // Tábua de corte personalizada: variação entre 149,90 e 209,90
    const minVol = 35 * 20; // 700 cm2
    const maxVol = 50 * 29; // 1450 cm2
    const curVol = lengthCm * widthCm;
    const volFactor = Math.min(1, Math.max(0, (curVol - minVol) / (maxVol - minVol)));

    let price = 149.90 + volFactor * 35; // base 149,90 + dimensões até 184,90

    if (woodType.toLowerCase().includes('macaranduba') || woodType.toLowerCase().includes('maçaranduba')) {
      price += 15;
    } else if (woodType.toLowerCase().includes('angelim')) {
      price += 10;
    }

    if (engravingType === 'sim_brasao_resinado') {
      price += 10;
    }

    price = Math.max(149.90, Math.min(209.90, price));
    return Number(price.toFixed(2));
  };

  const estimatedPrice = calculateEstimate();

  const getEngravingLabel = () => {
    if (engravingType === 'sim_brasao_resinado') return 'Usinagem CNC com Resina Epóxi Atóxica';
    if (engravingType === 'sim_brasao_cnc') return 'Entalhe CNC em Baixo-Relevo (Madeira Pura)';
    if (engravingType === 'sim_laser') return 'Gravação Computadorizada em CNC';
    if (engravingType === 'sim_monograma') return 'Monograma Usinado em CNC';
    if (engravingType === 'sim_logotipo') return 'Logomarca CNC';
    return 'Sem gravação (Madeira com canaleta pura)';
  };

  const getPositionLabel = () => {
    if (shieldPosition === 'center') return 'Centro da Tábua';
    if (shieldPosition === 'top_right') return 'Canto Superior Direito';
    if (shieldPosition === 'top_left') return 'Canto Superior Esquerdo';
    if (shieldPosition === 'bottom_right') return 'Canto Inferior Direito';
    return 'Centro';
  };

  const pieceLabel = isCuttingBoard ? 'TÁBUA DE CARNE' : 'PORTA-COPOS';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const teamSummary = selectedTeam ? ` [Time: ${selectedTeam.name}]` : '';
    const textSummary = engravingText.trim() ? ` [Texto: "${engravingText.trim()}"]` : '';
    if (onSuccessOrder) {
      onSuccessOrder(
        `Solicitação de Orçamento: ${pieceLabel} em ${woodType}, medidas ${lengthCm}x${widthCm}x${thicknessCm.toFixed(1).replace('.', ',')}cm. Técnica: ${getEngravingLabel()}${teamSummary}${textSummary}. Posição: ${getPositionLabel()}. Cliente: ${clientName} (${clientPhone})`
      );
    }
  };

  // Generate WhatsApp link
  const generateWhatsAppLink = () => {
    const teamInfo = selectedTeam ? `• Time Escolhido: ${selectedTeam.name} (${selectedTeam.categoryLabel})\n` : '';
    const posInfo = selectedTeam ? `• Posição do Brasão: ${getPositionLabel()} (Ø ${shieldScaleCm}cm)\n` : '';
    const customText = engravingText.trim() ? `• Texto gravado: "${engravingText.trim()}"\n` : '';
    const formattedEstimatedPrice = estimatedPrice.toFixed(2).replace('.', ',');
    const text = encodeURIComponent(
      `Olá Atelier M&A! Gostaria de formalizar o orçamento da minha peça sob medida:\n\n` +
        `• Peça: ${pieceLabel}\n` +
        `• Madeira: ${woodType}\n` +
        `• Dimensões: ${lengthCm} x ${widthCm} x ${thicknessCm.toFixed(1).replace('.', ',')} cm\n` +
        teamInfo +
        posInfo +
        `• Técnica de Usinagem: ${getEngravingLabel()}\n` +
        customText +
        `• Estimativa Base: R$ ${formattedEstimatedPrice}\n` +
        `• Detalhes adicionais: ${details || 'Nenhum'}\n\n` +
        `Meu nome: ${clientName}\nContato: ${clientPhone}`
    );
    return `https://wa.me/5511994821200?text=${text}`;
  };

  return (
    <section className="py-10 sm:py-20 lg:py-28 2xl:py-36 bg-[#2A1E17] text-[#FAF8F5] relative overflow-hidden" id="encomenda">
      {/* Ambient background blur */}
      <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-[#8A5835]/20 blur-3xl pointer-events-none" />

      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 2xl:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 xl:gap-16 items-start">
          {/* Coluna 1: Informações e Diferenciais Sob Medida */}
          <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-[#C29B68]" />
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#C29B68] font-bold">
                Atelier Sob Medida
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl text-white font-bold tracking-tight">
              Encomende sua Peça Exclusiva ou Lote Corporativo
            </h2>

            <div className="flex flex-col gap-2.5 sm:gap-4 mt-1 sm:mt-2">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#C29B68] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-[#DFD3C3]">
                  Gravação e usinagem de alta precisão em CNC de brasões, monogramas, nomes ou logomarcas.
                </span>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#C29B68] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-[#DFD3C3]">
                  Seleção fotográfica da prancha antes do início da usinagem pelo WhatsApp.
                </span>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#C29B68] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-[#DFD3C3]">
                  Certificado de autenticidade numerado e lata de cera restauradora pura grátis.
                </span>
              </div>
            </div>

            {/* Interactive Visual 2D/3D Blueprint Canvas */}
            <div className="mt-2 sm:mt-4 p-3 sm:p-5 bg-[#1C1917] border border-[#DFD3C3]/25 shadow-lg">
              <CuttingBoardPreview
                lengthCm={lengthCm}
                widthCm={widthCm}
                thicknessCm={thicknessCm}
                pieceType={pieceType}
                woodType={woodType}
                selectedTeam={selectedTeam}
                engravingType={engravingType}
                engravingText={engravingText}
                shieldPosition={shieldPosition}
                onPositionChange={setShieldPosition}
                shieldScaleCm={shieldScaleCm}
                onScaleChange={(val) => setShieldScaleCm(Math.min(17, val))}
                showTechnicalView={showTechnicalView}
                onToggleTechnicalView={() => setShowTechnicalView(!showTechnicalView)}
              />

              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-[#DFD3C3]">Estimativa do Atelier:</span>
                <span className="text-[#C29B68] font-serif font-bold text-base sm:text-lg tabular-nums">
                  R$ {estimatedPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>

          {/* Coluna 2: Formulário Interativo */}
          <div className="lg:col-span-7 bg-[#FAF8F5] p-4 sm:p-8 lg:p-10 text-[#111111] shadow-2xl">
            {submitted ? (
              <div className="text-center py-6 sm:py-8 space-y-4 sm:space-y-5 animate-fadeIn">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#8A5835]/15 text-[#8A5835] flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#111111]">
                  Solicitação Recebida com Sucesso!
                </h3>
                <p className="text-xs sm:text-sm text-[#5C4033] max-w-md mx-auto leading-relaxed">
                  Obrigado, <strong>{clientName}</strong>. Nossos mestres marceneiros já receberam sua
                  especificação para a peça em <strong>{woodType}</strong> ({lengthCm}×{widthCm}×{thicknessCm.toFixed(1).replace('.', ',')}cm).
                </p>

                <div className="p-3.5 sm:p-4 bg-[#FCF9F3] border border-[#DFD3C3] max-w-md mx-auto text-left text-xs space-y-1.5 text-[#3E2D22]">
                  <p>
                    <strong>Estimativa Prévia:</strong> R$ {estimatedPrice.toFixed(2).replace('.', ',')}
                  </p>
                  {selectedTeam && (
                    <p className="flex items-center gap-1.5">
                      <strong>Clube Selecionado:</strong>
                      <span className="inline-flex items-center gap-1 text-[#8A5835] font-bold">
                        <img
                          src={selectedTeam.imageUrl || selectedTeam.displayLogo}
                          alt={selectedTeam.name}
                          className="w-3.5 h-3.5 object-contain"
                          referrerPolicy="no-referrer"
                        />
                        {selectedTeam.name}
                      </span>
                    </p>
                  )}
                  <p>
                    <strong>Técnica de Usinagem:</strong> {getEngravingLabel()}
                  </p>
                  {selectedTeam && (
                    <p>
                      <strong>Posicionamento do Brasão:</strong> {getPositionLabel()} (Ø {shieldScaleCm}cm)
                    </p>
                  )}
                  {engravingText.trim() && (
                    <p>
                      <strong>Texto Personalizado Adicional:</strong> "{engravingText.trim()}"
                    </p>
                  )}
                  <p>
                    <strong>Prazo estimado:</strong> 7 a 10 dias úteis com banho culinário medicinal
                  </p>
                </div>

                <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 sm:px-6 py-3 sm:py-3.5 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow"
                  >
                    <MessageSquare className="w-4 h-4 text-[#C29B68]" />
                    <span>Abrir Chat Técnico no WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-5 sm:px-6 py-3 sm:py-3.5 border border-[#DFD3C3] text-xs font-bold uppercase tracking-wider hover:bg-white text-[#111111]"
                  >
                    Novo Orçamento
                  </button>
                </div>
              </div>
            ) : (
              <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit}>
                {/* Passo 1: Tipo de Peça */}
                <div>
                  <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#3E2D22] block mb-2">
                    1. Tipo de Peça Desejada
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {[
                      { id: 'tabua_carne' as ProductType, label: 'Tábua de Carne' },
                      { id: 'porta_copos' as ProductType, label: 'Porta-Copos' },
                    ].map((type) => (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => handlePieceTypeChange(type.id)}
                        className={`py-2.5 sm:py-3.5 px-3 sm:px-4 text-center border text-xs sm:text-sm font-bold uppercase tracking-wider sm:tracking-widest transition-all duration-200 cursor-pointer ${
                          pieceType === type.id
                            ? 'bg-[#111111] text-white border-[#111111] shadow-md ring-1 ring-[#C29B68]/40'
                            : 'bg-[#FCF9F3] text-[#111111] border-[#DFD3C3]/80 hover:border-[#8A5835] hover:bg-white'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Passo 2: Seleção de Madeira e Gravação */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#3E2D22] block mb-1.5">
                      Madeira de Preferência
                    </label>
                    <select
                      value={woodType}
                      onChange={(e) => setWoodType(e.target.value)}
                      className="w-full p-2.5 sm:p-3 bg-[#FCF9F3] border border-[#DFD3C3] text-xs text-[#111111] focus:bg-white focus:outline-[#8A5835]"
                    >
                      {availableWoods.map((wood) => (
                        <option key={wood.id} value={wood.name}>
                          {wood.name}
                        </option>
                      ))}
                    </select>

                    {/* Identificação da madeira selecionada */}
                    <div className="mt-2 p-2 sm:p-2.5 bg-[#F6F2E9] border border-[#DFD3C3] text-[11px] leading-relaxed">
                      <div className="font-bold text-[#8A5835] flex items-center justify-between">
                        <span>{selectedWoodObj.name}</span>
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-[#8A5835] bg-[#8A5835]/10 px-2 py-0.5 rounded-sm">
                          {selectedWoodObj.treatment}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#3E2D22] block mb-1.5">
                      Técnica de Usinagem &amp; Personalização
                    </label>
                    <select
                      value={engravingType}
                      onChange={(e) => setEngravingType(e.target.value)}
                      className="w-full p-2.5 sm:p-3 bg-[#FCF9F3] border border-[#DFD3C3] text-xs text-[#111111] focus:bg-white focus:outline-[#8A5835]"
                    >
                      <option value="sim_brasao_cnc">
                        Entalhe CNC em Baixo-Relevo (Madeira Pura) (+ R$ 80)
                      </option>
                      <option value="sim_brasao_resinado">
                        Usinagem CNC com Resina Atóxica (+ R$ 80)
                      </option>
                      <option value="sim_laser">
                        Gravação Computadorizada em CNC (+ R$ 60)
                      </option>
                      <option value="sim_monograma">
                        Monograma / Iniciais Usinadas em CNC (+ R$ 60)
                      </option>
                      <option value="nao">
                        Sem gravação (Madeira maciça pura)
                      </option>
                    </select>
                  </div>
                </div>

                {/* SEÇÃO INTEGRADA: Galeria Visual de Escudos de Times */}
                {engravingType !== 'nao' && (
                  <div className="p-3 sm:p-5 bg-white border border-[#DFD3C3] shadow-sm">
                    <TeamShieldGallery
                      selectedTeam={selectedTeam}
                      onSelectTeam={handleSelectTeam}
                    />
                  </div>
                )}

                {/* Texto da Gravação se aplicável (opcional) */}
                {engravingType !== 'nao' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#3E2D22] flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-[#8A5835]" />
                        <span>Texto Complementar na Madeira</span>
                      </label>
                      <span className="text-[10px] text-[#8A5835] font-semibold uppercase tracking-wider">
                        Opcional
                      </span>
                    </div>
                    <input
                      type="text"
                      value={engravingText}
                      onChange={(e) => setEngravingText(e.target.value)}
                      placeholder="Deixe em branco para gravar somente o brasão, ou digite: Ex: CHEF CARLOS"
                      className="w-full p-2.5 sm:p-3 bg-[#FCF9F3] border border-[#DFD3C3] text-xs text-[#111111] focus:bg-white focus:outline-[#8A5835]"
                    />
                    <p className="text-[10px] sm:text-[11px] text-[#5C4033] mt-1 leading-normal">
                      Se informado, o texto é gravado diretamente na madeira abaixo do brasão ou na área indicada. Se deixado vazio, apenas o brasão oficial será usinado.
                    </p>
                  </div>
                )}

                {/* Passo 3: Dimensões Interativas - 2 Colunas em Mobile para Comprimento e Largura */}
                <div className="p-3 sm:p-5 bg-[#FCF9F3] border border-[#DFD3C3]/80 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#3E2D22]">
                    <span className="flex items-center gap-1.5 truncate">
                      <Sliders className="w-3.5 h-3.5 text-[#8A5835] shrink-0" />
                      <span className="truncate">Dimensões ({isCuttingBoard ? 'Tábua' : 'Porta-Copos'})</span>
                    </span>
                    <span className="text-[#8A5835] font-serif font-bold text-xs sm:text-sm tabular-nums shrink-0 ml-2">
                      {lengthCm} × {widthCm} × {thicknessCm.toFixed(1).replace('.', ',')} cm
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 pt-1">
                    {/* Slider Comprimento (col-span-1) */}
                    <div className="col-span-1 bg-white p-2.5 sm:p-3.5 border border-[#DFD3C3]/70 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-xs text-[#5C4033] mb-1.5 sm:mb-2">
                        <span className="font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">Comprimento</span>
                        <strong className="text-[#111111] font-mono text-xs sm:text-sm">{lengthCm} cm</strong>
                      </div>
                      <input
                        type="range"
                        min={minLength}
                        max={maxLength}
                        step={1}
                        value={lengthCm}
                        onChange={(e) => setLengthCm(Number(e.target.value))}
                        className="w-full accent-[#8A5835] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] sm:text-[10px] text-[#8C7A6B] mt-1.5 font-mono">
                        <span>{minLength} cm</span>
                        <span>{maxLength} cm</span>
                      </div>
                    </div>

                    {/* Slider Largura (col-span-1) */}
                    <div className="col-span-1 bg-white p-2.5 sm:p-3.5 border border-[#DFD3C3]/70 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-xs text-[#5C4033] mb-1.5 sm:mb-2">
                        <span className="font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">Largura</span>
                        <strong className="text-[#111111] font-mono text-xs sm:text-sm">{widthCm} cm</strong>
                      </div>
                      <input
                        type="range"
                        min={minWidth}
                        max={maxWidth}
                        step={1}
                        value={widthCm}
                        onChange={(e) => setWidthCm(Number(e.target.value))}
                        className="w-full accent-[#8A5835] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] sm:text-[10px] text-[#8C7A6B] mt-1.5 font-mono">
                        <span>{minWidth} cm</span>
                        <span>{maxWidth} cm</span>
                      </div>
                    </div>

                    {/* Espessura Fixa (col-span-2 on mobile, col-span-1 on desktop) */}
                    <div className="col-span-2 sm:col-span-1 bg-white p-2.5 sm:p-3.5 border border-[#DFD3C3]/70 flex flex-col justify-between select-none">
                      <div className="flex justify-between items-center text-xs text-[#5C4033] mb-1">
                        <span className="font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">Espessura</span>
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 bg-[#8A5835]/15 text-[#8A5835] border border-[#8A5835]/30">
                          FIXA
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between my-auto py-1">
                        <strong className="text-[#111111] font-mono text-base sm:text-xl font-bold">
                          {thicknessCm.toFixed(1).replace('.', ',')} cm
                        </strong>
                        <span className="text-[9px] sm:text-[10px] text-[#8C7A6B] uppercase tracking-wider font-semibold">
                          Padrão Atelier
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-[#8C7A6B] leading-tight border-t border-[#DFD3C3]/40 pt-1">
                        {isCuttingBoard
                          ? 'Espessura de 3,5 cm fixa para máxima estabilidade e precisão CNC'
                          : 'Espessura de 1,0 cm fixa para apoio estável e refinado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Passo 4: Detalhes Especiais */}
                <div>
                  <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#3E2D22] block mb-1.5">
                    Detalhes Adicionais ou Solicitação Específica
                  </label>
                  <input
                    type="text"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Ex: Canaleta profunda com alças em latão escovado e pés de silicone"
                    className="w-full p-2.5 sm:p-3 bg-[#FCF9F3] border border-[#DFD3C3] text-xs text-[#111111] focus:bg-white focus:outline-[#8A5835]"
                  />
                </div>

                {/* Dados de Contato: 2 Colunas quando largura permitir */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold text-[#1C1917] block mb-1.5">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Chef Carlos Eduardo"
                      className="w-full p-2.5 sm:p-3 bg-[#FCF9F3] border border-[#DFD3C3] text-xs text-[#111111] focus:bg-white focus:outline-[#8A5835]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] sm:text-xs font-bold text-[#1C1917] block mb-1.5">
                      WhatsApp para Contato Rápido *
                    </label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(11) 99876-5432"
                      className="w-full p-2.5 sm:p-3 bg-[#FCF9F3] border border-[#DFD3C3] text-xs text-[#111111] focus:bg-white focus:outline-[#8A5835]"
                    />
                  </div>
                </div>

                {/* Botão de Envio */}
                <button
                  type="submit"
                  className="w-full py-3.5 sm:py-4 px-4 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer mt-1 sm:mt-2 text-center"
                >
                  <Sparkles className="w-4 h-4 text-[#C29B68] shrink-0" />
                  <span className="truncate">Solicitar Proposta &amp; Esboço 3D (R$ {estimatedPrice.toFixed(2).replace('.', ',')})</span>
                  <Send className="w-3.5 h-3.5 ml-1 shrink-0" />
                </button>

                <span className="text-[10px] sm:text-[11px] text-center text-[#5C4033] block -mt-1">
                  Envio para todo o Brasil em engradado de madeira protegido anti-impacto.
                </span>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
