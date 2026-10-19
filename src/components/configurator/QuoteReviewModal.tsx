import React, { useState, useEffect } from 'react';
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
  Mail,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Settings,
  Cloud,
  Key,
} from 'lucide-react';
import { OrderQuoteData, BoardPlacementReport } from '../../types/configurator';
import { ATELIER_CONTACT } from '../../config/contact';
import {
  sendQuoteByEmail,
  type EmailSubmissionResult,
} from '../../services/emailQuoteService';
import {
  generateBoardSnapshot,
  formatPlacementReportText,
} from '../../utils/boardSnapshotGenerator';
import {
  dataUrlToBlob,
  persistOrderToCloud,
  saveOrderToLocalStore,
} from '../../services/orderStorage';
import {
  isFirebaseConfigured,
  getFirebaseConfig,
} from '../../config/firebase';
import {
  checkQuoteQuota,
  validateOrderFilesBeforeUpload,
} from '../../services/rateLimitService';
import { SECURITY_CONFIG } from '../../config/security';

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
  // Snapshot imutável e profundo do pedido no momento de abertura do modal (Garantia de consistência estrita)
  const [frozenOrder, setFrozenOrder] = useState<OrderQuoteData | null>(() =>
    orderData ? JSON.parse(JSON.stringify(orderData)) : null
  );

  const [clientName, setClientName] = useState(() => orderData?.clientName || '');
  const [clientContact, setClientContact] = useState(() => orderData?.clientContact || '');
  const [clientEmail, setClientEmail] = useState(() => orderData?.clientEmail || '');
  const [quantity, setQuantity] = useState(() => orderData?.quantity || 1);
  const [notes, setNotes] = useState(() => orderData?.notes || '');
  const [imageRightsConfirmed, setImageRightsConfirmed] = useState(
    () => orderData?.imageRightsConfirmed || false
  );
  const [honeypot, setHoneypot] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processStage, setProcessStage] = useState<
    'idle' | 'gerando_previa' | 'salvando_arquivos' | 'enviando_email' | 'pronto'
  >('idle');
  const [emailResult, setEmailResult] = useState<EmailSubmissionResult | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>(() => orderData?.previewDataUrl || '');
  const [placementReport, setPlacementReport] = useState<BoardPlacementReport | null>(
    () => orderData?.placementReport || null
  );
  const [showPlacementDetails, setShowPlacementDetails] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Sincroniza estado de forma incondicional quando o modal é acionado
  useEffect(() => {
    if (isOpen && orderData) {
      setFrozenOrder(JSON.parse(JSON.stringify(orderData)));
      setClientName(orderData.clientName || '');
      setClientContact(orderData.clientContact || '');
      setClientEmail(orderData.clientEmail || '');
      setQuantity(orderData.quantity || 1);
      setNotes(orderData.notes || '');
      setImageRightsConfirmed(orderData.imageRightsConfirmed || false);
      setPreviewDataUrl(orderData.previewDataUrl || '');
      setPlacementReport(orderData.placementReport || null);
      setErrorMsg('');
      setSubmitted(false);
      setEmailResult(null);
    }
  }, [isOpen, orderData]);


  // Gera prévia visual da montagem e coordenadas estruturadas CNC ao abrir o modal
  useEffect(() => {
    if (!isOpen || !frozenOrder) return;
    let isMounted = true;
    const generatePreview = async () => {
      setIsGeneratingPreview(true);
      try {
        const snapshot = await generateBoardSnapshot({
          orderId: frozenOrder.orderId,
          pieceType: frozenOrder.pieceType,
          pieceLabel: frozenOrder.pieceLabel,
          lengthCm: frozenOrder.dimensions.lengthCm,
          widthCm: frozenOrder.dimensions.widthCm,
          thicknessCm: frozenOrder.dimensions.thicknessCm,
          woodType: frozenOrder.woodName,
          isResin: frozenOrder.technique.isResin,
          elements: frozenOrder.elements,
          targetWidth: 1200,
        });

        if (isMounted) {
          setPreviewBlob(snapshot.blob);
          setPreviewDataUrl(snapshot.dataUrl);
          setPlacementReport(snapshot.placementReport);
        }
      } catch (err) {
        console.warn('Aviso: falha na geração antecipada da prévia:', err);
      } finally {
        if (isMounted) setIsGeneratingPreview(false);
      }
    };

    generatePreview();
    return () => {
      isMounted = false;
    };
  }, [isOpen, frozenOrder?.orderId]);

  const handleCopyId = () => {
    if (!frozenOrder) return;
    navigator.clipboard.writeText(frozenOrder.orderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Download da Ficha Técnica completa em texto com relatório estruturado de posicionamento
  const handleDownloadSheet = () => {
    if (!frozenOrder) return;
    const placementText = placementReport
      ? formatPlacementReportText(placementReport)
      : 'Sem dados adicionais de posicionamento.';

    const textContent = `=====================================================
ATELIER SOB MEDIDA — FICHA TÉCNICA DE ORÇAMENTO CNC
Identificador do Pedido: ${frozenOrder.orderId}
Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
=====================================================
PRODUTO: ${frozenOrder.pieceLabel}
MADEIRA: ${frozenOrder.woodName} Maciça
DIMENSÕES: ${frozenOrder.dimensions.lengthCm} x ${frozenOrder.dimensions.widthCm} x ${frozenOrder.dimensions.thicknessCm.toFixed(1)} cm
TÉCNICA CNC: ${frozenOrder.technique.name}
ACABAMENTO: ${frozenOrder.finish.name}
QUANTIDADE: ${quantity} unidade(s)

ELEMENTOS DA COMPOSIÇÃO (${frozenOrder.elements.length}):
${frozenOrder.elements
  .map(
    (el, i) =>
      `  ${i + 1}. [${el.type.toUpperCase()}] ${
        el.type === 'text' ? `"${el.text}" (${el.fontFamily || 'serif'})` : el.imageFileName || 'Arte gráfica'
      } - ${el.widthCm}x${el.heightCm} cm (Posição: ${el.xPercent.toFixed(1)}% X, ${el.yPercent.toFixed(1)}% Y, Rot: ${el.rotationDeg}°)`
  )
  .join('\n')}

=====================================================
RELATÓRIO DE POSICIONAMENTO & COORDENADAS CNC:
${placementText}
=====================================================

ESTIMATIVA DE INVESTIMENTO:
  • Peça base + dimensões: R$ ${(frozenOrder.budget.basePrice + frozenOrder.budget.dimensionsAddon).toFixed(2).replace('.', ',')}
  • Adicional da madeira: R$ ${frozenOrder.budget.woodAddon.toFixed(2).replace('.', ',')}
  • Técnica / Resina: R$ ${frozenOrder.budget.techniqueAddon.toFixed(2).replace('.', ',')}
  • Preparação técnica de arte: R$ ${frozenOrder.budget.artPrepFee.toFixed(2).replace('.', ',')}
  TOTAL ESTIMADO: R$ ${(frozenOrder.budget.totalEstimated * quantity).toFixed(2).replace('.', ',')}

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
    a.download = `ficha-tecnica-cnc-${frozenOrder.orderId.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download da prévia visual da montagem do cliente (PNG de alta definição)
  const handleDownloadPreview = () => {
    if (!frozenOrder) return;
    const preview = previewDataUrl || frozenOrder.previewDataUrl;
    if (!preview && !previewBlob) return;
    try {
      const blob = previewBlob || (preview ? dataUrlToBlob(preview) : null);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `previa-montagem-${frozenOrder.orderId.toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Falha ao baixar prévia da montagem:', e);
    }
  };

  // Download do arquivo SVG original ÍNTEGRO (sem conversão) para calibração CNC
  const handleDownloadArtworks = () => {
    if (!frozenOrder) return;
    const images = frozenOrder.elements.filter((el) => el.type === 'image' && (el.rawSvgText || el.imageSrc));
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
        a.download = `${cleanName}-${frozenOrder.orderId.toLowerCase()}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('Falha ao baixar arte original:', e);
      }
    });
  };

  // Envio por e-mail via EmailJS com dados textuais e links de download
  const handleSendEmail = async (skipHeavy = false) => {
    if (!frozenOrder || isSubmitting) return;

    if (!clientName.trim() || clientName.trim().length < 2) {
      setErrorMsg('Por favor, informe seu nome completo (mínimo 2 caracteres).');
      return;
    }
    if (!clientContact.trim() || clientContact.replace(/\D/g, '').length < 8) {
      setErrorMsg('Por favor, informe seu número de WhatsApp com DDD para contato.');
      return;
    }
    if (!imageRightsConfirmed && frozenOrder.elements.some((el) => el.type === 'image')) {
      setErrorMsg(
        'É obrigatório confirmar a declaração de responsabilidade sobre os direitos autorais da arte enviada.'
      );
      return;
    }

    // Validação estrita da espessura da peça (máximo 3,5 cm permitido na marcenaria autoral)
    if (
      frozenOrder.dimensions.thicknessCm > SECURITY_CONFIG.MAX_BOARD_THICKNESS_CM ||
      frozenOrder.dimensions.thicknessCm <= 0
    ) {
      setErrorMsg(
        `A espessura máxima permitida para fabricação no atelier é de ${SECURITY_CONFIG.MAX_BOARD_THICKNESS_CM.toFixed(1).replace('.', ',')} cm. Por favor, ajuste as dimensões.`
      );
      return;
    }

    // 0. Verificação antecipada de cota de orçamentos (Rate Limit)
    const quotaCheck = await checkQuoteQuota();
    if (!quotaCheck.allowed) {
      setErrorMsg(quotaCheck.friendlyMessage || SECURITY_CONFIG.MESSAGES.RATE_LIMIT_EXCEEDED);
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    setProcessStage('gerando_previa');

    const finalOrder: OrderQuoteData = {
      ...frozenOrder,
      clientName: clientName.trim(),
      clientContact: clientContact.trim(),
      clientEmail: clientEmail.trim(),
      quantity,
      notes: notes.trim(),
      imageRightsConfirmed,
      placementReport: placementReport || undefined,
    };

    try {
      // 1. Gera prévia PNG fiel e dados de posicionamento se ainda não foram concluídos
      let currentPreviewBlob = previewBlob;
      let currentPreviewUrl = previewDataUrl;
      let currentPlacementReport = placementReport;

      if (!currentPreviewBlob || !currentPlacementReport) {
        try {
          const snapshot = await generateBoardSnapshot({
            orderId: finalOrder.orderId,
            pieceType: finalOrder.pieceType,
            pieceLabel: finalOrder.pieceLabel,
            lengthCm: finalOrder.dimensions.lengthCm,
            widthCm: finalOrder.dimensions.widthCm,
            thicknessCm: finalOrder.dimensions.thicknessCm,
            woodType: finalOrder.woodName,
            isResin: finalOrder.technique.isResin,
            elements: finalOrder.elements,
            targetWidth: 1200,
          });
          currentPreviewBlob = snapshot.blob;
          currentPreviewUrl = snapshot.dataUrl;
          currentPlacementReport = snapshot.placementReport;
          setPreviewBlob(snapshot.blob);
          setPreviewDataUrl(snapshot.dataUrl);
          setPlacementReport(snapshot.placementReport);
        } catch (snapshotErr) {
          console.warn('Snapshot fallback:', snapshotErr);
          if (finalOrder.previewDataUrl) {
            currentPreviewBlob = dataUrlToBlob(finalOrder.previewDataUrl);
          }
        }
      }

      finalOrder.placementReport = currentPlacementReport || undefined;

      // 1.1 Validação de integridade e tamanho dos arquivos
      const fileValidation = validateOrderFilesBeforeUpload(finalOrder, currentPreviewBlob);
      if (!fileValidation.valid) {
        setErrorMsg(fileValidation.friendlyError || SECURITY_CONFIG.MESSAGES.FILE_SIZE_EXCEEDED);
        setIsSubmitting(false);
        setProcessStage('pronto');
        return;
      }

      // 2. Garante armazenamento local primeiro (para não perder arte em caso de falha de rede)
      saveOrderToLocalStore(finalOrder, currentPreviewUrl, currentPlacementReport || undefined);

      // 3. Upload dos arquivos (SVG original, prévia da montagem e ficha de posicionamento JSON)
      let svgDownloadUrl: string | null = null;
      let previewCloudUrl: string | null = null;
      let placementReportUrl: string | null = null;
      const hasFirebase = isFirebaseConfigured();

      if (!hasFirebase) {
        setErrorMsg(
          'O armazenamento em nuvem está temporariamente em manutenção. Suas configurações foram salvas no navegador. Por favor, utilize o botão do WhatsApp para enviar seu pedido aos marceneiros.'
        );
        setIsSubmitting(false);
        setProcessStage('pronto');
        return;
      }

      setProcessStage('salvando_arquivos');
      const uploadResult = await persistOrderToCloud(finalOrder);

      if (!uploadResult.success) {
        setErrorMsg(
          uploadResult.error || SECURITY_CONFIG.MESSAGES.GENERIC_SUBMISSION_ERROR
        );
        setIsSubmitting(false);
        setProcessStage('pronto');
        return;
      }

      previewCloudUrl = uploadResult.previewUrl || null;
      placementReportUrl = uploadResult.placementReportUrl || null;
      const svgArtwork =
        uploadResult.artworkUrls.find((a) => a.isSvg) || uploadResult.artworkUrls[0];
      svgDownloadUrl = svgArtwork?.downloadUrl || null;

      const hasSvgImages = finalOrder.elements.some((el) => el.type === 'image');
      if (hasSvgImages && !svgDownloadUrl) {
        setErrorMsg(
          'Falha ao obter o link público de download do SVG original no Firebase Storage. O pedido não foi concluído para evitar envio sem o arquivo da arte.'
        );
        setIsSubmitting(false);
        setProcessStage('pronto');
        return;
      }

      if (!previewCloudUrl) {
        setErrorMsg(
          'Falha ao obter o link público de download da prévia PNG no Firebase Storage. O pedido não foi concluído para evitar envio sem a prévia.'
        );
        setIsSubmitting(false);
        setProcessStage('pronto');
        return;
      }

      setProcessStage('enviando_email');

      // 4. Dispara e-mail via EmailJS com dados textuais e links de download (sem Base64/XML para respeitar os 50KB)
      const result = await sendQuoteByEmail(finalOrder, {
        previewBlob: currentPreviewBlob,
        previewDownloadUrl: previewCloudUrl,
        svgDownloadUrl: svgDownloadUrl,
        placementReport: currentPlacementReport,
        placementReportUrl: placementReportUrl,
        isCloudStorageActive: true,
        honeypotValue: honeypot,
        skipHeavyAttachments: skipHeavy,
      });

      setEmailResult(result);
      setSubmitted(true);

      if (result.success) {
        onConfirmOrder(finalOrder);
      }
    } catch (err: any) {
      setEmailResult({
        success: false,
        isConfigured: true,
        orderId: frozenOrder.orderId,
        errorType: 'NETWORK_ERROR',
        error: err.message || 'Erro inesperado ao enviar e-mail.',
      });
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
      setProcessStage('pronto');
    }
  };

  // Gerador de mensagem profissional para WhatsApp com resumo técnico
  const generateWhatsAppUrl = () => {
    if (!frozenOrder) return '';
    const totalVal = (frozenOrder.budget.totalEstimated * quantity).toFixed(2).replace('.', ',');

    const rawMessage =
      `Olá Atelier Sob Medida! Gostaria de solicitar a análise técnica e orçamento do meu projeto autoral.\n\n` +
      `🆔 *Código do Pedido:* ${frozenOrder.orderId}\n\n` +
      `🪵 *Peça:* ${frozenOrder.pieceLabel}\n\n` +
      `🌲 *Madeira:* ${frozenOrder.woodName} (${frozenOrder.dimensions.lengthCm}x${frozenOrder.dimensions.widthCm}x${frozenOrder.dimensions.thicknessCm.toFixed(1)} cm)\n\n` +
      `⚙️ *Técnica:* ${frozenOrder.technique.name}\n\n` +
      `🎨 *Acabamento:* ${frozenOrder.finish.name}\n\n` +
      `🔢 *Quantidade:* ${quantity} unid.\n\n` +
      `💰 *Estimativa:* R$ ${totalVal}\n\n` +
      `👤 *Cliente:* ${clientName || 'Cliente'}\n\n` +
      `📞 *Contato:* ${clientContact || 'WhatsApp'}\n\n` +
      `📝 *Observações:* ${notes || 'Nenhuma'}\n\n` +
      `📎 *Arquivos de Montagem:* Prévia visual PNG, dados de posicionamento CNC e SVG original gerados pelo site (código: ${frozenOrder.orderId}).\n\n` +
      `Declaro ter autorização de uso das artes enviadas e aguardo a confirmação da viabilidade CNC.`;

    return ATELIER_CONTACT.getWhatsAppUrl(rawMessage);
  };

  if (!isOpen || !orderData || !frozenOrder) return null;

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
                  ? emailResult?.success
                    ? 'Orçamento Enviado com Sucesso por E-mail'
                    : 'Aviso sobre o Envio do Orçamento'
                  : 'Revisão & Envio do Orçamento com Prévia CNC'}
              </h3>
              <span className="text-[11px] text-[#DFD3C3]/80">
                Atelier Sob Medida · Envio Direto ao Marceneiro com SVG Original e Prévia da Montagem
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
              {emailResult?.success ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-[#8A5835]/15 text-[#8A5835] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <h4 className="font-serif text-2xl font-bold text-[#111111]">
                      Orçamento {frozenOrder.orderId} Enviado por E-mail!
                    </h4>
                    <p className="text-xs sm:text-sm text-[#5C4033] max-w-md mx-auto mt-2 leading-relaxed">
                      Obrigado, <strong>{clientName}</strong>. A ficha técnica da peça em{' '}
                      <strong>{frozenOrder.woodName}</strong> foi despachada com sucesso com a prévia visual e dados de posicionamento.
                    </p>
                  </div>

                  {/* Card com a Prévia Visual da Montagem Concluída */}
                  {previewDataUrl && (
                    <div className="max-w-md mx-auto p-3 bg-white border border-[#DFD3C3] shadow-md space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A5835] block text-left">
                        Prévia da Composição Aprovada:
                      </span>
                      <div className="bg-[#15100D] p-2 flex items-center justify-center">
                        <img
                          src={previewDataUrl}
                          alt="Prévia da tábua"
                          className="max-h-48 object-contain shadow-lg"
                        />
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 bg-[#FAF3EA] border border-[#C29B68]/60 text-left space-y-2 max-w-md mx-auto">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#8A5835]">
                      <Mail className="w-4 h-4 text-[#8A5835]" />
                      <span>Assunto: Novo orçamento — {frozenOrder.orderId}</span>
                    </div>
                    {emailResult?.svgDownloadUrl && emailResult?.previewDownloadUrl ? (
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-emerald-800 font-semibold leading-relaxed">
                          ✓ Upload concluído com sucesso no Firebase Storage. Links públicos para download do SVG original e da imagem PNG da prévia foram incluídos no e-mail.
                        </p>
                        <div className="pt-1 flex flex-col gap-1 text-[11px]">
                          <a
                            href={emailResult.svgDownloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#8A5835] hover:underline font-semibold flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Download do SVG Original (Nuvem)</span>
                          </a>
                          <a
                            href={emailResult.previewDownloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#8A5835] hover:underline font-semibold flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Download da Prévia PNG (Nuvem)</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#5C4033] leading-relaxed">
                        Os dados do pedido e o relatório estruturado de coordenadas CNC foram entregues no e-mail dos marceneiros. (Para hospedar os arquivos em nuvem com links de download diretos, conecte o Firebase Storage no painel).
                      </p>
                    )}
                  </div>
                </>
              ) : emailResult?.errorType === 'SIZE_EXCEEDED' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-9 h-9" />
                  </div>

                  <div>
                    <h4 className="font-serif text-2xl font-bold text-amber-950">
                      Arquivos Excedem o Limite do Plano de E-mail
                    </h4>
                    <p className="text-xs sm:text-sm text-[#5C4033] max-w-md mx-auto mt-2 leading-relaxed">
                      O tamanho total dos arquivos ultrapassou o limite do serviço de e-mail.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-300 text-left space-y-3 max-w-md mx-auto text-xs">
                    <strong className="text-amber-950 block">Escolha como prefere proceder:</strong>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleSendEmail(true)}
                        className="w-full py-2.5 px-3 bg-[#8A5835] hover:bg-[#6F4226] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Enviar Ficha por E-mail &amp; Baixar Artes</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-9 h-9" />
                  </div>

                  <div>
                    <h4 className="font-serif text-2xl font-bold text-[#111111]">
                      {emailResult?.svgDownloadUrl
                        ? 'Arquivos Gravados na Nuvem · Erro no E-mail'
                        : `Orçamento ${frozenOrder.orderId} Salvo`}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#5C4033] max-w-md mx-auto mt-2 leading-relaxed">
                      {emailResult?.svgDownloadUrl
                        ? 'Seus arquivos (SVG original e PNG da montagem) já estão armazenados no Firebase Storage. Ocorreu uma falha apenas no disparo da notificação por e-mail.'
                        : `Olá, ${clientName}. Seu pedido foi registrado e os dados de posicionamento foram estruturados.`}
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50/90 border border-amber-300 text-left space-y-2 max-w-lg mx-auto text-xs">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Detalhes da Notificação</span>
                    </div>
                    <p className="text-[11px] text-amber-950 leading-relaxed">
                      {emailResult?.error || 'A conexão de e-mail requer validação das credenciais no painel.'}
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false);
                          handleSendEmail(false);
                        }}
                        className="w-full py-2.5 px-3 bg-[#8A5835] hover:bg-[#6F4226] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Tentar Reenviar E-mail Novamente</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Identificador com Cópia Rápida */}
              <div className="p-4 bg-white border border-[#DFD3C3] max-w-md mx-auto space-y-1.5 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A5835] block">
                  Código de Identificação do Pedido
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-[#111111]">
                    {frozenOrder.orderId}
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
                  <MessageSquare className="w-4 h-4 text-[#FAF8F5]" />
                  <span>Abrir WhatsApp com Especificação Legível</span>
                </a>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadSheet}
                    className="py-2.5 px-3 bg-white border border-[#DFD3C3] hover:border-[#8A5835] text-[#111111] text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#8A5835]" />
                    <span>Ficha CNC (.txt)</span>
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

                {frozenOrder.elements.some((el) => el.type === 'image' && (el.rawSvgText || el.imageSrc)) && (
                  <button
                    type="button"
                    onClick={handleDownloadArtworks}
                    className="w-full py-2.5 bg-[#FAF3EA] border border-[#C29B68]/60 hover:bg-[#DFD3C3]/40 text-[#8A5835] text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#8A5835]" />
                    <span>Baixar SVG Original Íntegro</span>
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendEmail(false);
              }}
              className="space-y-6"
            >
              {/* Campo Honeypot Oculto (Antispam) */}
              <input
                type="text"
                name="website_url_check"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Resumo Visual & Técnico */}
              <div className="p-4 bg-[#FCF9F3] border border-[#DFD3C3] space-y-3">
                <div className="flex items-center justify-between border-b border-[#DFD3C3]/60 pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8A5835]">
                    Resumo do Pedido Sob Medida
                  </span>
                  <span className="font-mono text-xs font-bold text-[#1C1917]">
                    ID: {frozenOrder.orderId}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#3E2D22]">
                  <div>
                    <span className="text-[10px] text-[#8A5835] font-semibold block uppercase">Peça</span>
                    <span className="font-bold text-[#111]">{frozenOrder.pieceLabel}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A5835] font-semibold block uppercase">Madeira</span>
                    <span className="font-bold text-[#111]">{frozenOrder.woodName} Maciça</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A5835] font-semibold block uppercase">Dimensões</span>
                    <span className="font-mono text-[#111]">
                      {frozenOrder.dimensions.lengthCm}×{frozenOrder.dimensions.widthCm}×{frozenOrder.dimensions.thicknessCm.toFixed(1)}cm
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A5835] font-semibold block uppercase">Técnica CNC</span>
                    <span className="font-bold text-[#111]">{frozenOrder.technique.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A5835] font-semibold block uppercase">Acabamento</span>
                    <span className="text-[#111]">{frozenOrder.finish.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A5835] font-semibold block uppercase">Elementos</span>
                    <span className="text-[#111]">{frozenOrder.elements.length} configurados</span>
                  </div>
                </div>

                {/* Discriminação de Valores */}
                <div className="pt-2 border-t border-[#DFD3C3]/60 flex items-center justify-between text-xs">
                  <span className="text-[#5C4033]">Estimativa Unitária:</span>
                  <span className="font-serif font-bold text-base text-[#1C1917]">
                    R$ {frozenOrder.budget.totalEstimated.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* PRÉVIA VISUAL DA MONTAGEM DO CLIENTE (RENDERIZAÇÃO REAL DO CONFIGURADOR) */}
              <div className="p-4 bg-[#1B1410] border border-[#DFD3C3]/30 text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#C29B68]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5]">
                      Prévia Visual da Montagem CNC
                    </span>
                  </div>
                  <span className="text-[10px] text-[#C29B68] font-mono">
                    Escala Real ({frozenOrder.dimensions.lengthCm}×{frozenOrder.dimensions.widthCm} cm)
                  </span>
                </div>

                <div className="relative w-full flex items-center justify-center p-2 bg-[#120D0A] border border-white/5 overflow-hidden min-h-[180px]">
                  {previewDataUrl ? (
                    <img
                      src={previewDataUrl}
                      alt={`Prévia da montagem CNC ${frozenOrder.orderId}`}
                      className="max-h-64 sm:max-h-80 w-auto object-contain shadow-2xl border border-white/10"
                    />
                  ) : isGeneratingPreview ? (
                    <div className="py-10 flex flex-col items-center justify-center gap-2 text-white/60 text-xs">
                      <Loader2 className="w-6 h-6 animate-spin text-[#C29B68]" />
                      <span>Renderizando prévia em alta definição da tábua...</span>
                    </div>
                  ) : (
                    <div className="py-10 text-white/50 text-xs text-center">
                      Prévia pronta para geração no envio.
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                  <span className="text-[#DFD3C3]/80">
                    Posicionamento visual da tábua e dos elementos aprovado para produção.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadPreview}
                      className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-[#FAF8F5] border border-white/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                      title="Baixar imagem PNG da prévia"
                    >
                      <Download className="w-3 h-3 text-[#C29B68]" />
                      <span>Baixar Imagem da Prévia</span>
                    </button>

                    {frozenOrder.elements.some((el) => el.type === 'image' && (el.rawSvgText || el.imageSrc)) && (
                      <button
                        type="button"
                        onClick={handleDownloadArtworks}
                        className="px-2.5 py-1.5 bg-[#8A5835] hover:bg-[#6F4226] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                        title="Baixar arquivo SVG vetorial original"
                      >
                        <Download className="w-3 h-3 text-[#FAF8F5]" />
                        <span>Baixar SVG Original</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* DADOS ESTRUTURADOS DE POSICIONAMENTO CNC (EXPANDÍVEL) */}
              {frozenOrder.elements.length > 0 && (
                <div className="border border-[#DFD3C3] bg-white text-xs">
                  <button
                    type="button"
                    onClick={() => setShowPlacementDetails(!showPlacementDetails)}
                    className="w-full p-3 bg-[#FAF8F5] hover:bg-[#F3EFE9] flex items-center justify-between text-left font-bold text-[#8A5835] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#8A5835]" />
                      <span>
                        Dados Estruturados de Posicionamento CNC ({frozenOrder.elements.length} elemento{frozenOrder.elements.length > 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#5C4033] font-normal underline">
                      <span>{showPlacementDetails ? 'Ocultar detalhes' : 'Ver coordenadas exatas (cm / %)'}</span>
                      {showPlacementDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </button>

                  {showPlacementDetails && (
                    <div className="p-3 space-y-3 bg-[#FCF9F3] border-t border-[#DFD3C3] overflow-x-auto">
                      <p className="text-[11px] text-[#5C4033] leading-relaxed">
                        Coordenadas de referência calculadas a partir da escala real do configurador (Eixo X = {frozenOrder.dimensions.lengthCm} cm, Eixo Y = {frozenOrder.dimensions.widthCm} cm):
                      </p>

                      <div className="space-y-2">
                        {frozenOrder.elements.map((el, i) => {
                          const centerXCm = ((el.xPercent / 100) * frozenOrder.dimensions.lengthCm).toFixed(2);
                          const centerYCm = ((el.yPercent / 100) * frozenOrder.dimensions.widthCm).toFixed(2);
                          return (
                            <div key={el.id} className="p-2.5 bg-white border border-[#DFD3C3]/80 rounded-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#111]">
                                  #{i + 1} {el.type === 'text' ? `Texto: "${el.text}"` : el.imageFileName || 'Arte Vetorial SVG'}
                                </span>
                                <span className="text-[10px] font-mono bg-[#FAF3EA] text-[#8A5835] px-1.5 py-0.5 border border-[#DFD3C3]">
                                  {el.type.toUpperCase()}{el.isSvg ? ' (SVG)' : ''}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#5C4033]">
                                <div>
                                  <span className="block text-[9px] uppercase font-bold text-[#8A5835]">Centro (X, Y)</span>
                                  <span className="font-mono text-[#111]">{centerXCm} cm, {centerYCm} cm</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] uppercase font-bold text-[#8A5835]">Posição Relativa</span>
                                  <span className="font-mono text-[#111]">{el.xPercent.toFixed(1)}% X, {el.yPercent.toFixed(1)}% Y</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] uppercase font-bold text-[#8A5835]">Dimensões (L × A)</span>
                                  <span className="font-mono text-[#111]">{el.widthCm.toFixed(1)} × {el.heightCm.toFixed(1)} cm</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] uppercase font-bold text-[#8A5835]">Rotação / Camada</span>
                                  <span className="font-mono text-[#111]">{el.rotationDeg}° · z={el.zIndex}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Arquivos de Arte Anexados: SVG Original e Prévia */}
              {frozenOrder.elements.some((el) => el.type === 'image') && (
                <div className="p-3.5 bg-[#FAF8F5] border border-[#C29B68]/60 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A5835] block">
                    Arte Vetorial Anexada para Usinagem CNC
                  </span>

                  {frozenOrder.elements
                    .filter((el) => el.type === 'image')
                    .map((el) => (
                      <div
                        key={el.id}
                        className="flex items-center justify-between p-2 bg-white border border-[#DFD3C3] text-xs gap-2"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-[#8A5835] shrink-0" />
                          <span className="font-bold text-[#111] truncate">{el.imageFileName || 'arte-personalizada.svg'}</span>
                          <span className="text-[10px] text-[#5C4033] hidden sm:inline">
                            ({el.isSvg ? 'Vetor SVG Original' : 'Arte CNC'} · {el.widthCm}×{el.heightCm} cm)
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-bold shrink-0">
                          ✓ Pronto para envio
                        </span>
                      </div>
                    ))}

                  <p className="text-[10px] text-[#5C4033] leading-relaxed">
                    O arquivo SVG original será mantido íntegro com seu código vetorial 100% preservado (sem conversão para bitmap) para calibração no software da CNC.
                  </p>
                </div>
              )}


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
                      Seu E-mail (para receber cópia da ficha)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DFD3C3] text-xs text-[#111] focus:outline-[#8A5835] shadow-xs"
                      />
                      <Mail className="w-4 h-4 text-[#8A5835] absolute left-2.5 top-3" />
                    </div>
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

              {/* Mensagem de Erro com Orientações */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <div className="space-y-1">
                    <p className="font-semibold">{errorMsg}</p>
                    <p className="text-[11px] text-red-700">
                      Você também pode concluir a solicitação diretamente pelo WhatsApp utilizando o botão abaixo.
                    </p>
                  </div>
                </div>
              )}

              {/* Botões de Ação Principal */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                    isSubmitting
                      ? 'bg-neutral-600 text-white cursor-not-allowed opacity-90'
                      : 'bg-[#8A5835] hover:bg-[#6F4226] text-white hover:shadow-2xl'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#C29B68]" />
                      <span>
                        {processStage === 'gerando_previa'
                          ? 'Gerando Prévia PNG e Preparando SVG...'
                          : processStage === 'salvando_arquivos'
                          ? 'Salvando Arte no Armazenamento Seguro...'
                          : 'Despachando E-mail via EmailJS...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 text-[#FAF8F5]" />
                      <span>
                        Enviar Orçamento por E-mail (com Prévia &amp; SVG) —{' '}
                        {quantity > 1
                          ? `${quantity} un. · R$ ${(frozenOrder.budget.totalEstimated * quantity).toFixed(2).replace('.', ',')}`
                          : `R$ ${frozenOrder.budget.totalEstimated.toFixed(2).replace('.', ',')}`}
                      </span>
                    </>
                  )}
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <a
                    href={generateWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-3 px-4 bg-white border border-[#2A1E17] hover:border-[#8A5835] text-[#111111] hover:text-[#8A5835] text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <MessageSquare className="w-4 h-4 text-[#8A5835]" />
                    <span>Ou Enviar Diretamente pelo WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto py-3 px-5 border border-[#DFD3C3] hover:bg-white text-xs font-semibold text-[#5C4033] cursor-pointer"
                  >
                    Voltar ao Editor
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

    </div>
  );
};
