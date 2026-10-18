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
  Sparkles,
  Cloud,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { OrderQuoteData } from '../../types/configurator';
import { ATELIER_CONTACT } from '../../config/contact';
import {
  persistOrderToCloud,
  dataUrlToBlob,
  type OrderSubmissionResult,
} from '../../services/orderStorage';

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
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [processStage, setProcessStage] = useState<
    'idle' | 'preparando' | 'gerando_previa' | 'enviando_arquivos' | 'pronto'
  >('idle');
  const [cloudResult, setCloudResult] = useState<OrderSubmissionResult | null>(null);

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderData.orderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Download da Ficha Técnica completa em texto
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
      } - ${el.widthCm}x${el.heightCm}cm (Posição: ${el.xPercent.toFixed(0)}% X, ${el.yPercent.toFixed(0)}% Y, Rot: ${el.rotationDeg}°)`
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

${
  cloudResult?.previewUrl
    ? `LINKS DE ARMAZENAMENTO SEGURO NA NUVEM:\n• Prévia PNG da Tábua: ${cloudResult.previewUrl}\n${
        cloudResult.artworkUrls.map((a) => `• Arquivo para CNC (${a.fileName}): ${a.downloadUrl}`).join('\n')
      }\n`
    : ''
}
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

  // Download da prévia visual da tábua renderizada em alta resolução
  const handleDownloadPreview = () => {
    const preview = cloudResult?.previewDataUrl || orderData.previewDataUrl;
    if (!preview) return;
    try {
      const blob = dataUrlToBlob(preview);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `previa-tabua-${orderData.orderId.toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Falha ao baixar prévia:', e);
    }
  };

  // Download do arquivo SVG original ÍNTEGRO (sem conversão) para CNC
  const handleDownloadArtworks = () => {
    const images = orderData.elements.filter((el) => el.type === 'image' && (el.rawSvgText || el.imageSrc));
    images.forEach((el, idx) => {
      try {
        let blob: Blob;
        let ext = 'svg';

        if (el.isSvg) {
          ext = 'svg';
          if (el.rawSvgText) {
            blob = new Blob([el.rawSvgText], { type: 'image/svg+xml;charset=utf-8' });
          } else {
            blob = dataUrlToBlob(el.imageSrc || '');
          }
        } else {
          ext = el.imageFileType?.includes('png') ? 'png' : 'jpg';
          blob = dataUrlToBlob(el.imageSrc || '');
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanName = (el.imageFileName || `arte-${idx + 1}`)
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_');
        a.download = `${cleanName}-${orderData.orderId.toLowerCase()}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('Falha ao baixar arte original:', e);
      }
    });
  };

  // Submissão do Orçamento com Gravação Real e Validações
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingCloud) return;

    if (!clientName.trim() || clientName.trim().length < 2) {
      setErrorMsg('Por favor, informe seu nome completo (mínimo 2 caracteres).');
      return;
    }
    if (!clientContact.trim() || clientContact.replace(/\D/g, '').length < 8) {
      setErrorMsg('Por favor, informe seu número de WhatsApp com DDD para contato.');
      return;
    }
    if (!imageRightsConfirmed && orderData.elements.some((el) => el.type === 'image')) {
      setErrorMsg(
        'É obrigatório confirmar a declaração de responsabilidade sobre os direitos autorais da arte enviada.'
      );
      return;
    }

    setErrorMsg('');
    setIsSavingCloud(true);
    setProcessStage('preparando');

    const finalOrder: OrderQuoteData = {
      ...orderData,
      clientName: clientName.trim(),
      clientContact: clientContact.trim(),
      clientEmail: clientEmail.trim(),
      quantity,
      notes: notes.trim(),
      imageRightsConfirmed,
    };

    try {
      // 1. Gera prévia PNG fiel
      // 2. Preserva SVG íntegro
      // 3. Grava no Firebase Storage e Firestore (se configurado)
      // 4. Salva backup local redundante
      const result = await persistOrderToCloud(finalOrder, (stage) => {
        setProcessStage(stage);
      });

      setCloudResult(result);
      setSubmitted(true);

      if (result.success) {
        onConfirmOrder(finalOrder);
      }
    } catch (err: any) {
      setCloudResult({
        success: false,
        isExternalStorageActive: true,
        orderId: orderData.orderId,
        artworkUrls: [],
        error: err.message || 'Erro inesperado na gravação em nuvem.',
      });
      setSubmitted(true);
    } finally {
      setIsSavingCloud(false);
      setProcessStage('pronto');
    }
  };

  // Gerador de mensagem profissional para WhatsApp sem dupla codificação
  const generateWhatsAppUrl = () => {
    const totalVal = (orderData.budget.totalEstimated * quantity).toFixed(2).replace('.', ',');

    let cloudLinksMsg = '';
    if (cloudResult?.success && cloudResult.previewUrl) {
      cloudLinksMsg += `\n🖼️ *Prévia da Tábua:* ${cloudResult.previewUrl}`;
      if (cloudResult.artworkUrls && cloudResult.artworkUrls.length > 0) {
        cloudResult.artworkUrls.forEach((art) => {
          cloudLinksMsg += `\n📐 *SVG Original para CNC:* ${art.downloadUrl}`;
        });
      }
    } else {
      cloudLinksMsg += `\n📎 *Arquivos de Arte:* Prévia PNG e SVG original gerados (código de identificação: ${orderData.orderId}).`;
    }

    // Monta a mensagem primeiro como texto normal com quebras de linha e acentos naturais
    const rawMessage =
      `Olá Atelier Sob Medida! Gostaria de solicitar a análise técnica e orçamento do meu projeto autoral.\n\n` +
      `🆔 *Código do Pedido:* ${orderData.orderId}\n\n` +
      `🪵 *Peça:* ${orderData.pieceLabel}\n\n` +
      `🌲 *Madeira:* ${orderData.woodName} (${orderData.dimensions.lengthCm}x${orderData.dimensions.widthCm}x${orderData.dimensions.thicknessCm.toFixed(1)} cm)\n\n` +
      `⚙️ *Técnica:* ${orderData.technique.name}\n\n` +
      `🎨 *Acabamento:* ${orderData.finish.name}\n\n` +
      `🔢 *Quantidade:* ${quantity} unid.\n\n` +
      `💰 *Estimativa:* R$ ${totalVal}\n\n` +
      `👤 *Cliente:* ${clientName}\n\n` +
      `📞 *Contato:* ${clientContact}\n\n` +
      `📝 *Observações:* ${notes || 'Nenhuma'}\n` +
      cloudLinksMsg +
      `\n\nDeclaro ter autorização de uso das artes enviadas e aguardo a confirmação da viabilidade CNC.`;

    // Passa o texto normal diretamente ao getWhatsAppUrl, garantindo codificação única
    return ATELIER_CONTACT.getWhatsAppUrl(rawMessage);
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
                {submitted
                  ? cloudResult?.success
                    ? 'Orçamento Registrado na Nuvem com Sucesso'
                    : 'Orçamento Preparado para WhatsApp'
                  : 'Revisão & Solicitação de Orçamento'}
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
            /* Tela de Confirmação & Próximos Passos com Feedback Real e Honesto */
            <div className="space-y-6 text-center animate-fadeIn py-2">
              {cloudResult?.success ? (
                /* Cenário 1: Armazenamento Real no Firebase concluído */
                <>
                  <div className="w-16 h-16 rounded-full bg-[#8A5835]/15 text-[#8A5835] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <h4 className="font-serif text-2xl font-bold text-[#111111]">
                      Solicitação {orderData.orderId} Salva na Nuvem!
                    </h4>
                    <p className="text-xs sm:text-sm text-[#5C4033] max-w-md mx-auto mt-2 leading-relaxed">
                      Obrigado, <strong>{clientName}</strong>. Sua especificação autoral para a peça em{' '}
                      <strong>{orderData.woodName}</strong> foi armazenada no banco de dados e no storage em nuvem.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#FAF3EA] border border-[#C29B68]/60 text-left space-y-2 max-w-md mx-auto">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#8A5835]">
                      <Cloud className="w-4 h-4 text-[#8A5835]" />
                      <span>Arquivos Salvos e Prontos para o Atelier</span>
                    </div>
                    <p className="text-[11px] text-[#5C4033] leading-relaxed">
                      A prévia da peça e seus arquivos de arte foram armazenados na nuvem e os links diretos foram incluídos na sua mensagem do WhatsApp.
                    </p>
                    {cloudResult.previewUrl && (
                      <div className="pt-1 flex flex-col gap-1.5 border-t border-[#DFD3C3]/60">
                        <a
                          href={cloudResult.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#8A5835] font-semibold underline flex items-center gap-1 hover:text-[#111]"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span>Conferir Prévia da Tábua (PNG Alta Resolução)</span>
                        </a>
                        {cloudResult.artworkUrls.map((art, idx) => (
                          <a
                            key={idx}
                            href={art.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#8A5835] font-semibold underline flex items-center gap-1 hover:text-[#111]"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span>Baixar SVG Original da Arte ({art.originalFileName})</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : !cloudResult?.isExternalStorageActive ? (
                /* Cenário 2: Nuvem Não Configurada (Aviso Claro sem confirmação falsa) */
                <>
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-9 h-9" />
                  </div>

                  <div>
                    <h4 className="font-serif text-2xl font-bold text-[#111111]">
                      Orçamento {orderData.orderId} Gerado Localmente
                    </h4>
                    <p className="text-xs sm:text-sm text-[#5C4033] max-w-md mx-auto mt-2 leading-relaxed">
                      Olá, <strong>{clientName}</strong>. Seu projeto foi montado, validado e salvo localmente no navegador sob o identificador acima.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50/80 border border-amber-300 text-left space-y-2 max-w-lg mx-auto text-xs">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <Cloud className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Armazenamento em Nuvem Não Configurado</span>
                    </div>
                    <p className="text-[11px] text-amber-950 leading-relaxed">
                      O serviço em nuvem externo (Firebase) ainda não está ativo neste ambiente para hospedar links públicos.
                      Os arquivos de prévia e SVG foram gerados no seu navegador.
                    </p>
                    <div className="p-2.5 bg-white border border-amber-200 rounded-xs space-y-1 text-[11px]">
                      <strong className="text-[#2A1E17] block">Como proceder agora:</strong>
                      <span className="text-[#5C4033] block">
                        1. Clique abaixo em <strong>"Baixar Prévia (.png)"</strong> e <strong>"Baixar Minha Arte"</strong> para guardar os arquivos.
                      </span>
                      <span className="text-[#5C4033] block">
                        2. Abra o WhatsApp e anexe as imagens na conversa junto com a mensagem técnica formatada.
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                /* Cenário 3: Falha na gravação em nuvem */
                <>
                  <div className="w-16 h-16 rounded-full bg-red-100 text-red-800 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-9 h-9" />
                  </div>

                  <div>
                    <h4 className="font-serif text-2xl font-bold text-red-900">
                      Falha ao Gravar no Serviço de Nuvem
                    </h4>
                    <p className="text-xs sm:text-sm text-[#5C4033] max-w-md mx-auto mt-2 leading-relaxed">
                      Não foi possível registrar o pedido no servidor: <strong>{cloudResult?.error}</strong>.
                      Seus dados continuam preservados no navegador.
                    </p>
                  </div>

                  <div className="max-w-md mx-auto">
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="py-2.5 px-4 bg-[#8A5835] hover:bg-[#6F4226] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mx-auto cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Tentar Gravar Novamente</span>
                    </button>
                  </div>
                </>
              )}

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
                    {copiedId ? <Check className="w-4 h-4 text-[#8A5835]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-[#5C4033] block">
                  Guarde este identificador para consultas técnicas com os marceneiros do atelier.
                </span>
              </div>

              {/* Ações pós-envio */}
              <div className="max-w-md mx-auto space-y-2.5 pt-2">
                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#8A5835] hover:bg-[#6F4226] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer border border-[#C29B68]/60"
                >
                  <Send className="w-4 h-4 text-[#FAF8F5]" />
                  <span>Abrir WhatsApp com Especificação Legível</span>
                </a>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadSheet}
                    className="py-2.5 px-3 bg-white border border-[#DFD3C3] hover:border-[#8A5835] text-[#111111] text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#8A5835]" />
                    <span>Ficha (.txt)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPreview}
                    className="py-2.5 px-3 bg-white border border-[#DFD3C3] hover:border-[#8A5835] text-[#111111] text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#8A5835]" />
                    <span>Baixar Prévia (.png)</span>
                  </button>
                </div>

                {orderData.elements.some((el) => el.type === 'image' && el.imageSrc) && (
                  <button
                    type="button"
                    onClick={handleDownloadArtworks}
                    className="w-full py-2.5 bg-[#FAF3EA] border border-[#C29B68]/60 hover:bg-[#DFD3C3]/40 text-[#8A5835] text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#8A5835]" />
                    <span>Baixar Arquivo da Minha Arte (SVG Original)</span>
                  </button>
                )}
              </div>

              <div className="pt-2 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-[#8A5835] hover:text-[#111111] font-semibold underline cursor-pointer"
                >
                  Revisar Dados do Formulário
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-[#5C4033] hover:text-[#111111] font-semibold cursor-pointer"
                >
                  Fechar Modal
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
                    <span className="text-[#111]">{orderData.elements.length} configurados</span>
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
                        placeholder="(24) 99999-9999"
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

              {/* Botão de Envio com Bloqueio de Cliques Repetidos */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingCloud}
                  className="w-full sm:flex-1 py-4 bg-[#2A1E17] hover:bg-[#8A5835] disabled:opacity-60 disabled:pointer-events-none text-white text-xs font-bold uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSavingCloud ? (
                    <>
                      <Loader2 className="w-4 h-4 text-[#C29B68] animate-spin" />
                      <span>
                        {processStage === 'gerando_previa'
                          ? 'Renderizando Prévia em Alta Resolução...'
                          : processStage === 'enviando_arquivos'
                          ? 'Enviando SVG e Prévia para Armazenamento...'
                          : 'Validando e Gravando Pedido...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#C29B68]" />
                      <span>
                        Confirmar Solicitação de Orçamento (
                        {quantity > 1
                          ? `${quantity} un. · R$ ${(orderData.budget.totalEstimated * quantity).toFixed(2).replace('.', ',')}`
                          : `R$ ${orderData.budget.totalEstimated.toFixed(2).replace('.', ',')}`}
                        )
                      </span>
                    </>
                  )}
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
