import React, { useState } from 'react';
import { Send, CheckCircle2, Clock, Sparkles, Sliders, PenTool, Check, MessageSquare } from 'lucide-react';

interface CustomOrderStudioProps {
  initialWood?: string;
  onSuccessOrder?: (summary: string) => void;
}

export const CustomOrderStudio: React.FC<CustomOrderStudioProps> = ({
  initialWood = 'Mix Teca & Nogueira Americana',
  onSuccessOrder,
}) => {
  const [pieceType, setPieceType] = useState('tabua_carne_resinada');
  const [woodType, setWoodType] = useState(initialWood);
  const [engravingType, setEngravingType] = useState('sim_brasao_resinado');
  const [engravingText, setEngravingText] = useState('M&A · 2025');
  const [lengthCm, setLengthCm] = useState(40);
  const [widthCm, setWidthCm] = useState(29);
  const [thicknessCm, setThicknessCm] = useState(3.5);
  const [details, setDetails] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Price estimate calculation based on volume and piece type
  const calculateEstimate = () => {
    let baseRate = 0.08; // per cm3
    if (pieceType === 'mesa_centro') baseRate = 0.045;
    if (pieceType === 'mesa_lateral') baseRate = 0.06;
    if (pieceType === 'banco') baseRate = 0.055;
    if (pieceType === 'lote_corporativo') baseRate = 0.07;

    const volume = lengthCm * widthCm * thicknessCm;
    let price = Math.round(volume * baseRate);
    if (engravingType !== 'nao') price += 80;
    if (woodType.includes('Cumaru') || woodType.includes('Imbuia')) price = Math.round(price * 1.25);
    return Math.max(350, price);
  };

  const estimatedPrice = calculateEstimate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (onSuccessOrder) {
      onSuccessOrder(
        `Solicitação de Orçamento: ${pieceType.toUpperCase()} em ${woodType}, medidas ${lengthCm}x${widthCm}x${thicknessCm}cm. Gravação: "${engravingText}". Cliente: ${clientName} (${clientPhone})`
      );
    }
  };

  // Generate WhatsApp link
  const generateWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Olá Atelier M&A! Gostaria de formalizar o orçamento da minha peça sob medida:\n\n` +
        `• Peça: ${pieceType.replace('_', ' ').toUpperCase()}\n` +
        `• Madeira: ${woodType}\n` +
        `• Dimensões: ${lengthCm} x ${widthCm} x ${thicknessCm} cm\n` +
        `• Gravação Laser: ${engravingType !== 'nao' ? `"${engravingText}"` : 'Sem gravação'}\n` +
        `• Estimativa Base: R$ ${estimatedPrice},00\n` +
        `• Detalhes adicionais: ${details || 'Nenhum'}\n\n` +
        `Meu nome: ${clientName}\nContato: ${clientPhone}`
    );
    return `https://wa.me/5511994821200?text=${text}`;
  };

  // Wood color simulation
  const getWoodColor = () => {
    if (woodType.includes('Nogueira')) return '#3E2D22';
    if (woodType.includes('Cumaru')) return '#7B3B18';
    if (woodType.includes('Freijó')) return '#B88658';
    if (woodType.includes('Imbuia')) return '#4A3528';
    return '#8A5835';
  };

  return (
    <section className="py-20 lg:py-28 2xl:py-36 bg-[#2A1E17] text-[#FAF8F5] relative overflow-hidden" id="encomenda">
      {/* Ambient background blur */}
      <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-[#8A5835]/20 blur-3xl pointer-events-none" />

      <div className="max-w-[1560px] mx-auto px-6 sm:px-8 lg:px-14 xl:px-16 2xl:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-start">
          {/* Coluna 1: Informações e Diferenciais Sob Medida */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-[#C29B68]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#C29B68] font-bold">
                Atelier Sob Medida
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-white font-bold tracking-tight">
              Encomende sua Peça Exclusiva ou Lote Corporativo
            </h2>

            <p className="text-sm sm:text-base text-[#DFD3C3] leading-relaxed">
              Seja para uma tábua de churrasco com dimensões gigantes, mesa de centro orgânica para sua sala
              ou brindes corporativos de luxo gravados com sua marca, nossos mestres artesãos darão vida ao
              seu projeto.
            </p>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C29B68] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-[#DFD3C3]">
                  Gravação a laser computadorizada de monogramas, nomes de família ou logomarcas.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C29B68] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-[#DFD3C3]">
                  Seleção fotográfica da prancha antes do início da usinagem pelo WhatsApp.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C29B68] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-[#DFD3C3]">
                  Certificado de autenticidade numerado e lata de cera restauradora pura grátis.
                </span>
              </div>
            </div>

            {/* Quick response commitment box */}
            <div className="p-5 bg-[#111111]/50 border border-[#DFD3C3]/20 mt-4 flex items-center gap-4">
              <Clock className="w-9 h-9 text-[#C29B68] shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#DFD3C3] block font-bold">
                  Tempo de Resposta
                </span>
                <span className="font-serif text-lg sm:text-xl font-bold text-white">
                  Retorno técnico em até 2 horas úteis
                </span>
              </div>
            </div>

            {/* Interactive Visual 2D/3D Blueprint Canvas */}
            <div className="mt-4 p-5 bg-[#1C1917] border border-[#DFD3C3]/25 shadow-lg">
              <div className="flex items-center justify-between text-xs text-[#C29B68] font-bold uppercase tracking-wider mb-3">
                <span>Esboço Dimensional ao Vivo</span>
                <span>Proporção {lengthCm} × {widthCm} × {thicknessCm} cm</span>
              </div>

              {/* Graphical Blueprint Rendering */}
              <div className="w-full h-44 bg-[#111111] border border-[#DFD3C3]/15 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Simulated Wood Block */}
                <div
                  className="transition-all duration-300 relative shadow-2xl flex items-center justify-center border border-white/20"
                  style={{
                    backgroundColor: getWoodColor(),
                    width: `${Math.min(240, Math.max(120, (lengthCm / 80) * 220))}px`,
                    height: `${Math.min(140, Math.max(70, (widthCm / 60) * 120))}px`,
                    transform: 'perspective(400px) rotateX(25deg) rotateZ(-10deg)',
                    boxShadow: '10px 15px 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Subtle Wood Grain Pattern Lines */}
                  <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]" />

                  {/* Simulated Laser Engraving */}
                  {engravingType !== 'nao' && engravingText && (
                    <div className="relative z-10 text-center px-2 py-1 bg-black/40 border border-black/50 text-[#C29B68] font-serif text-[11px] font-bold tracking-widest uppercase">
                      {engravingText}
                    </div>
                  )}

                  {/* Canaleta simulada for butcher block */}
                  {pieceType === 'butcher_block' && (
                    <div className="absolute inset-2 border border-black/40 pointer-events-none" />
                  )}
                </div>

                <span className="absolute bottom-2 right-2 text-[9px] uppercase tracking-wider text-[#DFD3C3]/60">
                  Madeira: {woodType.split(' ')[0]}
                </span>
              </div>

              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-[#DFD3C3]">Estimativa do Atelier:</span>
                <span className="text-[#C29B68] font-serif font-bold text-lg tabular-nums">
                  R$ {estimatedPrice.toLocaleString('pt-BR')},00
                </span>
              </div>
            </div>
          </div>

          {/* Coluna 2: Formulário Interativo */}
          <div className="lg:col-span-7 bg-[#FAF8F5] p-7 sm:p-10 text-[#111111] shadow-2xl">
            {submitted ? (
              <div className="text-center py-8 space-y-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-[#8A5835]/15 text-[#8A5835] flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#111111]">
                  Solicitação Recebida com Sucesso!
                </h3>
                <p className="text-sm text-[#5C4033] max-w-md mx-auto leading-relaxed">
                  Obrigado, <strong>{clientName}</strong>. Nossos mestres marceneiros já receberam sua
                  especificação para a peça em <strong>{woodType}</strong> ({lengthCm}×{widthCm}×{thicknessCm}cm).
                </p>

                <div className="p-4 bg-[#FCF9F3] border border-[#DFD3C3] max-w-md mx-auto text-left text-xs space-y-1.5 text-[#3E2D22]">
                  <p>
                    <strong>Estimativa Prévia:</strong> R$ {estimatedPrice.toLocaleString('pt-BR')},00
                  </p>
                  <p>
                    <strong>Gravação:</strong> {engravingType !== 'nao' ? `"${engravingText}"` : 'Padrão atelier'}
                  </p>
                  <p>
                    <strong>Prazo estimado:</strong> 7 a 10 dias úteis com banho culinário medicinal
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow"
                  >
                    <MessageSquare className="w-4 h-4 text-[#C29B68]" />
                    <span>Abrir Chat Técnico no WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-3.5 border border-[#DFD3C3] text-xs font-bold uppercase tracking-wider hover:bg-white text-[#111111]"
                  >
                    Novo Orçamento
                  </button>
                </div>
              </div>
            ) : (
              <form className="flex flex-col gap-5 sm:gap-6" onSubmit={handleSubmit}>
                {/* Passo 1: Tipo de Peça */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#3E2D22] block mb-2.5">
                    1. Tipo de Peça Desejada
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'tabua_carne_resinada', label: 'Tábua de Carne Resinada' },
                      { id: 'tabua_servir', label: 'Tábua de Servir' },
                      { id: 'mesa_centro', label: 'Mesa de Centro' },
                      { id: 'mesa_lateral', label: 'Mesa Lateral' },
                      { id: 'banco', label: 'Banco Escultural' },
                      { id: 'lote_corporativo', label: 'Lote Corporativo' },
                    ].map((type) => (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => setPieceType(type.id)}
                        className={`p-3 text-center border text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                          pieceType === type.id
                            ? 'bg-[#111111] text-white border-[#111111] shadow'
                            : 'bg-[#FCF9F3] text-[#111111] border-[#DFD3C3]/70 hover:border-[#8A5835]'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Passo 2: Seleção de Madeira e Gravação */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#3E2D22] block mb-1.5">
                      Madeira de Preferência
                    </label>
                    <select
                      value={woodType}
                      onChange={(e) => setWoodType(e.target.value)}
                      className="w-full p-3 bg-[#FCF9F3] border border-[#DFD3C3] text-xs text-[#111111] focus:bg-white focus:outline-[#8A5835]"
                    >
                      <option value="Mix Teca & Nogueira Americana">Mix Teca &amp; Nogueira Americana</option>
                      <option value="Louro Freijó Maciço">Louro Freijó Maciço</option>
                      <option value="Cumaru Nobre (Alta Dureza)">Cumaru Nobre (Alta Dureza)</option>
                      <option value="Imbuia Autêntica Escavada">Imbuia Autêntica Escavada</option>
                      <option value="Muiracatiara Rajada">Muiracatiara Rajada</option>
                      <option value="Sugestão do Mestre Marceneiro">Sugestão do Mestre Marceneiro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#3E2D22] block mb-1.5">
                      Deseja Gravação Personalizada?
                    </label>
                    <select
                      value={engravingType}
                      onChange={(e) => setEngravingType(e.target.value)}
                      className="w-full p-3 bg-[#FCF9F3] border border-[#DFD3C3] text-xs text-[#111111] focus:bg-white focus:outline-[#8A5835]"
                    >
                      <option value="sim_brasao_resinado">Sim, Brasão de Time com Resina Atóxica (CNC) (+ R$ 80)</option>
                      <option value="sim_monograma">Sim, Monograma / Nome Próprio (+ R$ 80)</option>
                      <option value="sim_logotipo">Sim, Logomarca / Brasão Institucional (+ R$ 80)</option>
                      <option value="nao">Não, apenas acabamento clássico M&amp;A</option>
                    </select>
                  </div>
                </div>

                {/* Texto da Gravação se aplicável */}
                {engravingType !== 'nao' && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#3E2D22] block mb-1.5 flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-[#8A5835]" />
                      <span>Texto ou Iniciais para Gravação a Laser</span>
                    </label>
                    <input
                      type="text"
                      value={engravingText}
                      onChange={(e) => setEngravingText(e.target.value)}
                      placeholder="Ex: CHEF CARLOS EDUARDO ou FAMÍLIA MARTINS"
                      className="w-full p-3 bg-[#FCF9F3] border border-[#DFD3C3] text-xs text-[#111111] focus:bg-white focus:outline-[#8A5835]"
                    />
                  </div>
                )}

                {/* Passo 3: Dimensões Interativas */}
                <div className="p-4 bg-[#FCF9F3] border border-[#DFD3C3]/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#3E2D22]">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#8A5835]" />
                      <span>Calibrador de Dimensões (cm)</span>
                    </span>
                    <span className="text-[#8A5835] font-serif font-bold tabular-nums">
                      {lengthCm} × {widthCm} × {thicknessCm} cm
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] text-[#5C4033] mb-1">
                        <span>Comprimento:</span>
                        <strong className="text-[#111111]">{lengthCm} cm</strong>
                      </div>
                      <input
                        type="range"
                        min="25"
                        max="160"
                        value={lengthCm}
                        onChange={(e) => setLengthCm(Number(e.target.value))}
                        className="w-full accent-[#8A5835]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-[#5C4033] mb-1">
                        <span>Largura:</span>
                        <strong className="text-[#111111]">{widthCm} cm</strong>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="90"
                        value={widthCm}
                        onChange={(e) => setWidthCm(Number(e.target.value))}
                        className="w-full accent-[#8A5835]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-[#5C4033] mb-1">
                        <span>Espessura:</span>
                        <strong className="text-[#111111]">{thicknessCm} cm</strong>
                      </div>
                      <input
                        type="range"
                        min="2.5"
                        max="10"
                        step="0.5"
                        value={thicknessCm}
                        onChange={(e) => setThicknessCm(Number(e.target.value))}
                        className="w-full accent-[#8A5835]"
                      />
                    </div>
                  </div>
                </div>

                {/* Passo 4: Detalhes Especiais */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#3E2D22] block mb-1.5">
                    Detalhes Adicionais ou Solicitação Específica
                  </label>
                  <input
                    type="text"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Ex: Canaleta profunda com alças em latão escovado e pés de silicone"
                    className="w-full p-3 bg-[#FCF9F3] border border-[#DFD3C3] text-xs text-[#111111] focus:bg-white focus:outline-[#8A5835]"
                  />
                </div>

                {/* Dados de Contato */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#1C1917] block mb-1.5">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Chef Carlos Eduardo"
                      className="w-full p-3 bg-[#FCF9F3] border border-[#DFD3C3] text-xs text-[#111111] focus:bg-white focus:outline-[#8A5835]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#1C1917] block mb-1.5">
                      WhatsApp para Contato Rápido *
                    </label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(11) 99876-5432"
                      className="w-full p-3 bg-[#FCF9F3] border border-[#DFD3C3] text-xs text-[#111111] focus:bg-white focus:outline-[#8A5835]"
                    />
                  </div>
                </div>

                {/* Botão de Envio */}
                <button
                  type="submit"
                  className="w-full py-4 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Sparkles className="w-4 h-4 text-[#C29B68]" />
                  <span>Solicitar Proposta &amp; Esboço 3D (R$ {estimatedPrice},00)</span>
                  <Send className="w-3.5 h-3.5 ml-1" />
                </button>

                <span className="text-[11px] text-center text-[#5C4033] block -mt-1">
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
