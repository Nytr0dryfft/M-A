import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Send,
  Download,
  Copy,
  Check,
  Phone,
  User,
  Hash,
  Sparkles,
} from 'lucide-react';
import { OrderQuoteData } from '../../types/configurator';

interface QuoteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: OrderQuoteData | null;
  onConfirmOrder: (order: OrderQuoteData) => void;
}

export const QuoteReviewModal: React.FC<QuoteReviewModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onConfirmOrder,
}) => {
  if (!isOpen || !orderData) return null;

  const [clientName, setClientName] = useState(orderData.clientName || '');
  const [clientContact, setClientContact] = useState(orderData.clientContact || '');
  const [clientEmail, setClientEmail] = useState(orderData.clientEmail || '');
  const [quantity, setQuantity] = useState(orderData.quantity || 1);
  const [notes, setNotes] = useState(orderData.notes || '');
  const [imageRightsConfirmed, setImageRightsConfirmed] = useState(
    orderData.imageRightsConfirmed || false
  );
  const [copiedId, setCopiedId] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderData.orderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownloadSheet = () => {
    const textContent = `=====================================================
ATELIER SOB MEDIDA — FICHA TÉCNICA DE ORÇAMENTO CNC
Identificador: ${orderData.orderId}
Data: ${new Date().toLocaleDateString('pt-BR')}
=====================================================
PRODUTO: ${orderData.pieceLabel}
MADEIRA: ${orderData.woodName} Maciça
DIMENSÕES: ${orderData.dimensions.lengthCm} x ${orderData.dimensions.widthCm} x ${orderData.dimensions.thicknessCm.toFixed(1)} cm
TÉCNICA CNC: ${orderData.technique.name}
ACABAMENTO: ${orderData.finish.name}
QUANTIDADE: ${quantity} unidade(s)

ELEMENTOS DA COMPOSIÇÃO (${orderData.elements.length}):
${orderData.elements
  .map(
    (el, i) =>
      `  ${i + 1}. [${el.type.toUpperCase()}] ${
        el.type === 'text' ? `"${el.text}" (${el.fontFamily})` : el.imageFileName || 'Arte gráfica'
      } - ${el.widthCm}x${el.heightCm}cm`
  )
  .join('\n')}

ESTIMATIVA DE INVESTIMENTO:
  • Peça base + dimensões: R$ ${(orderData.budget.basePrice + orderData.budget.dimensionsAddon).toFixed(2).replace('.', ',')}
  • Adicional da madeira: R$ ${orderData.budget.woodAddon.toFixed(2).replace('.', ',')}
  • Técnica / Resina: R$ ${orderData.budget.techniqueAddon.toFixed(2).replace('.', ',')}
  • Preparação técnica de arte: R$ ${orderData.budget.artPrepFee.toFixed(2).replace('.', ',')}
  TOTAL ESTIMADO: R$ ${(orderData.budget.totalEstimated * quantity).toFixed(2).replace('.', ',')}

DADOS DO CLIENTE:
Nome: ${clientName}
Contato: ${clientContact}
E-mail: ${clientEmail || 'Não informado'}
Observações: ${notes || 'Nenhuma'}

* NOTA TÉCNICA: A viabilidade geométrica das ferramentas e o tempo de máquina serão confirmados previamente pelos mestres marceneiros do atelier antes da produção.
=====================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ficha-tecnica-${orderData.orderId.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return;
    }
    if (!clientContact.trim()) {
      setErrorMsg('Por favor, informe seu número de WhatsApp ou telefone de contato.');
      return;
    }
    if (!imageRightsConfirmed && orderData.elements.some((el) => el.type === 'image')) {
      setErrorMsg(
        'É obrigatório confirmar a declaração de responsabilidade sobre os direitos autorais da imagem enviada.'
      );
      return;
    }

    setErrorMsg('');
    const finalOrder: OrderQuoteData = {
      ...orderData,
      clientName: clientName.trim(),
      clientContact: clientContact.trim(),
      clientEmail: clientEmail.trim(),
      quantity,
      notes: notes.trim(),
      imageRightsConfirmed,
    };

    onConfirmOrder(finalOrder);
    setSubmitted(true);
  };

  // Gerador de mensagem profissional para WhatsApp
  const generateWhatsAppUrl = () => {
    const totalVal = (orderData.budget.totalEstimated * quantity).toFixed(2).replace('.', ',');
    const elementsList = orderData.elements
      .map((el) => (el.type === 'text' ? `"${el.text}"` : el.imageFileName || 'Arte do cliente'))
      .join(', ');

    const text = encodeURIComponent(
      `Olá Atelier Sob Medida! Gostaria de solicitar a análise técnica e orçamento do meu projeto autoral:\n\n` +
        `🆔 *Código do Pedido:* ${orderData.orderId}\n` +
        `🪵 *Peça:* ${orderData.pieceLabel}\n` +
        `🌲 *Madeira:* ${orderData.woodName} (${orderData.dimensions.lengthCm}x${orderData.dimensions.widthCm}x${orderData.dimensions.thicknessCm.toFixed(1)} cm)\n` +
        `⚙️ *Técnica:* ${orderData.technique.name}\n` +
        `🎨 *Acabamento:* ${orderData.finish.name}\n` +
        `📐 *Elementos configurados:* ${elementsList || 'Peça lisa com canaleta'}\n` +
        `🔢 *Quantidade:* ${quantity} unid.\n` +
        `💰 *Estimativa:* R$ ${totalVal}\n\n` +
        `👤 *Cliente:* ${clientName}\n` +
        `📞 *Contato:* ${clientContact}\n` +
        `📝 *Observações:* ${notes || 'Nenhuma'}\n\n` +
        `Declaro ter autorização de uso das artes enviadas e aguardo a confirmação da viabilidade CNC.`
    );

    return `https://wa.me/5511994821200?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-[#FAF8F5] max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-[#DFD3C3] shadow-2xl relative text-[#111111]">
        {/* Header do Modal */}
        <div className="p-4 sm:p-6 bg-[#2A1E17] text-white flex items-center justify-between border-b border-[#DFD3C3]/20">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#C29B68]" />
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight">
                {submitted ? 'Orçamento Registrado com Sucesso' : 'Revisão & Solicitação de Orçamento'}
              </h3>
              <span className="text-[11px] text-[#DFD3C3]/80">
                Atelier Sob Medida · Análise Técnica de Viabilidade CNC
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 sm:p-8 space-y-6">
          {submitted ? (
            /* Tela de Confirmação & Próximos Passos */
            <div className="space-y-6 text-center animate-fadeIn py-2">
              <div className="w-16 h-16 rounded-full bg-[#8A5835]/15 text-[#8A5835] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="font-serif text-2xl font-bold text-[#111111]">
                  Solicitação {orderData.orderId} Recebida!
                </h4>
                <p className="text-xs sm:text-sm text-[#5C4033] max-w-md mx-auto mt-2 leading-relaxed">
                  Obrigado, <strong>{clientName}</strong>. Sua especificação autoral para a peça em{' '}
                  <strong>{orderData.woodName}</strong> foi registrada no atelier para conferência técnica de fresas e grãos.
                </p>
              </div>

              {/* Card com Código do Pedido */}
              <div className="p-4 bg-[#FCF9F3] border border-[#DFD3C3] max-w-md mx-auto text-center space-y-2">
                <span className="text-[11px] text-[#8A5835] uppercase font-bold tracking-wider block">
                  Identificador Único do Projeto
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-[#1C1917] tracking-wider">
                    {orderData.orderId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1.5 hover:bg-[#DFD3C3]/50 text-[#8A5835] transition-colors cursor-pointer"
                    title="Copiar código"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-[#5C4033] block">
                  Utilize este código para acompanhar o status e o envio da sua peça.
                </span>
              </div>

              {/* Ações pós-envio */}
              <div className="max-w-md mx-auto space-y-3 pt-2">
                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Especificação no WhatsApp Agora</span>
                </a>

                <button
                  type="button"
                  onClick={handleDownloadSheet}
                  className="w-full py-3 bg-white border border-[#DFD3C3] hover:border-[#8A5835] text-[#111111] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#8A5835]" />
                  <span>Baixar Ficha Técnica do Projeto (.txt)</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-[#8A5835] hover:text-[#111111] font-semibold underline cursor-pointer"
                >
                  Voltar ao Configurador
                </button>
              </div>
            </div>
          ) : (
            /* Formulário de Revisão e Coleta de Dados */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Resumo Visual & Técnico */}
              <div className="p-4 bg-[#FCF9F3] border border-[#DFD3C3] space-y-3">
                <div className="flex items-center justify-between border-b border-[#DFD3C3]/60 pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8A5835]">
                    Resumo do Pedido Sob Medida
                  </span>
                  <span className="font-mono text-xs font-bold text-[#1C1917]">
                    ID: {orderData.orderId}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#3E2D22]">
                  <div>
                    <span className="text-[10px] text-[#8A5835] font-semibold block uppercase">Peça</span>
                    <span className="font-bold text-[#111]">{orderData.pieceLabel}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A5835] font-semibold block uppercase">Madeira</span>
                    <span className="font-bold text-[#111]">{orderData.woodName} Maciça</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A5835] font-semibold block uppercase">Dimensões</span>
                    <span className="font-mono text-[#111]">
                      {orderData.dimensions.lengthCm}×{orderData.dimensions.widthCm}×{orderData.dimensions.thicknessCm.toFixed(1)}cm
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A5835] font-semibold block uppercase">Técnica CNC</span>
                    <span className="font-bold text-[#111]">{orderData.technique.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A5835] font-semibold block uppercase">Acabamento</span>
                    <span className="text-[#111]">{orderData.finish.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A5835] font-semibold block uppercase">Elementos</span>
                    <span className="text-[#111]">{orderData.elements.length} adicionados</span>
                  </div>
                </div>

                {/* Discriminação de Valores */}
                <div className="pt-2 border-t border-[#DFD3C3]/60 flex items-center justify-between text-xs">
                  <span className="text-[#5C4033]">Estimativa Unitária:</span>
                  <span className="font-serif font-bold text-base text-[#1C1917]">
                    R$ {orderData.budget.totalEstimated.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Campos do Cliente */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A5835]">
                  Dados para Contato e Envio do Orçamento
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E2D22] mb-1.5">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Ex: Carlos Eduardo Silveira"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DFD3C3] text-xs text-[#111] focus:outline-[#8A5835] shadow-xs"
                      />
                      <User className="w-4 h-4 text-[#8A5835] absolute left-2.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E2D22] mb-1.5">
                      WhatsApp / Telefone *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={clientContact}
                        onChange={(e) => setClientContact(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DFD3C3] text-xs text-[#111] focus:outline-[#8A5835] shadow-xs"
                      />
                      <Phone className="w-4 h-4 text-[#8A5835] absolute left-2.5 top-3" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E2D22] mb-1.5">
                      E-mail (opcional)
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full px-3 py-2.5 bg-white border border-[#DFD3C3] text-xs text-[#111] focus:outline-[#8A5835] shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E2D22] mb-1.5">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2.5 bg-white border border-[#DFD3C3] text-xs text-[#111] focus:outline-[#8A5835] shadow-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3E2D22] mb-1.5">
                    Observações Especiais ou Instruções para os Marceneiros
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Gostaria de uma canaleta mais profunda, ou desejo gravação de data no verso..."
                    className="w-full p-2.5 bg-white border border-[#DFD3C3] text-xs text-[#111] focus:outline-[#8A5835] shadow-xs"
                  />
                </div>
              </div>

              {/* Declaração Obrigatória de Direitos de Uso da Imagem */}
              <div className="p-3.5 bg-[#FAF3EA] border border-[#DFD3C3] space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={imageRightsConfirmed}
                    onChange={(e) => setImageRightsConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#8A5835] cursor-pointer"
                  />
                  <span className="text-xs text-[#3E2D22] leading-relaxed">
                    <strong>Declaração de Direitos &amp; Viabilidade CNC:</strong> Declaro que possuo o direito de
                    uso, autorização ou licença para a arte/logotipo enviado para personalização. Reconheço que esta
                    visualização é uma prévia comercial e que a viabilidade de fabricação e tempo de máquina serão
                    confirmados pelo atelier antes do início da usinagem.
                  </span>
                </label>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Botão de Envio */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-4 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#C29B68]" />
                  <span>
                    Confirmar Solicitação de Orçamento (
                    {quantity > 1
                      ? `${quantity} un. · R$ ${(orderData.budget.totalEstimated * quantity).toFixed(2).replace('.', ',')}`
                      : `R$ ${orderData.budget.totalEstimated.toFixed(2).replace('.', ',')}`}
                    )
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto py-3.5 px-6 border border-[#DFD3C3] hover:bg-white text-xs font-semibold text-[#5C4033] cursor-pointer"
                >
                  Voltar e Ajustar Peça
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
