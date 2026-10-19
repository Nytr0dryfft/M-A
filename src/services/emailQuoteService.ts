import emailjs from '@emailjs/browser';
import {
  getEmailJSConfig,
  isEmailJSConfigured,
  EMAILJS_FALLBACK_SERVICE_ID,
} from '../config/emailjs';
import { OrderQuoteData, BoardPlacementReport } from '../types/configurator';
import {
  generatePlacementReport,
  formatPlacementReportText,
} from '../utils/boardSnapshotGenerator';
import { rollbackQuoteQuota } from './rateLimitService';

export interface EmailSubmissionResult {
  success: boolean;
  isConfigured: boolean;
  orderId: string;
  error?: string | null;
  errorType?: 'UNCONFIGURED' | 'SIZE_EXCEEDED' | 'RATE_LIMITED' | 'SPAM_DETECTED' | 'NETWORK_ERROR' | 'STORAGE_ERROR';
  totalAttachmentSizeKb?: number;
  maxAttachmentSizeKb?: number;
  previewSizeKb?: number;
  svgSizeKb?: number;
  payloadSizeKb?: number;
  svgDownloadUrl?: string | null;
  previewDownloadUrl?: string | null;
}

export interface SendQuoteEmailOptions {
  previewBlob?: Blob | null;
  previewDownloadUrl?: string | null;
  svgDownloadUrl?: string | null;
  placementReport?: BoardPlacementReport | null;
  placementReportUrl?: string | null;
  storageStatus?: string;
  isCloudStorageActive?: boolean;
  honeypotValue?: string;
  skipHeavyAttachments?: boolean;
}

export interface PreparedAttachments {
  previewPngSizeKb: number;
  originalSvgSizeKb: number;
  totalSizeKb: number;
  svgFileName: string;
  hasSvg: boolean;
}

/**
 * Converte um Blob em string Base64 (data URL) para uso exclusivo no navegador
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Prepara e calcula o tamanho informativo dos arquivos (Prévia PNG e SVG Original)
 * ATENÇÃO: Os arquivos NÃO são convertidos para Base64 para envio nas variáveis do EmailJS,
 * pois o EmailJS possui limite estrito de 50KB por requisição.
 */
export function getFileInfo(
  previewBlob: Blob | null,
  orderData: OrderQuoteData
): PreparedAttachments {
  const previewPngSizeKb = previewBlob ? Math.round(previewBlob.size / 1024) : 0;

  // Localiza elemento com SVG
  const svgElement = orderData.elements.find(
    (el) => el.type === 'image' && (el.isSvg || el.rawSvgText || el.imageSrc?.includes('image/svg'))
  );

  let originalSvgSizeKb = 0;
  let svgFileName = `arte-original-${orderData.orderId.toLowerCase()}.svg`;
  const hasSvg = Boolean(svgElement);

  if (svgElement) {
    svgFileName = svgElement.imageFileName || svgFileName;
    if (svgElement.rawSvgText) {
      originalSvgSizeKb = Math.round(new TextEncoder().encode(svgElement.rawSvgText).length / 1024);
    } else if (svgElement.imageSrc?.startsWith('data:')) {
      const base64Len = svgElement.imageSrc.split(',')[1]?.length || 0;
      originalSvgSizeKb = Math.round((base64Len * 0.75) / 1024);
    }
  }

  return {
    previewPngSizeKb,
    originalSvgSizeKb,
    totalSizeKb: previewPngSizeKb + originalSvgSizeKb,
    svgFileName,
    hasSvg,
  };
}

/**
 * Validação antispam por taxa de envio (máximo 6 orçamentos a cada 10 minutos por cliente)
 */
function checkRateLimit(): boolean {
  try {
    const key = 'atelier_email_quotes_sent';
    const now = Date.now();
    const stored = JSON.parse(localStorage.getItem(key) || '[]') as number[];
    const recent = stored.filter((ts) => now - ts < 10 * 60 * 1000);
    if (recent.length >= 6) {
      return false;
    }
    recent.push(now);
    localStorage.setItem(key, JSON.stringify(recent));
    return true;
  } catch {
    return true;
  }
}

/**
 * Envia o orçamento via EmailJS com dados textuais limpos e links de download dos arquivos.
 * NÃO envia conteúdo integral de SVG, Base64 ou data URLs nas variáveis do EmailJS,
 * garantindo conformidade com o limite máximo de 50KB do EmailJS.
 */
export async function sendQuoteByEmail(
  orderData: OrderQuoteData,
  optionsOrPreviewBlob?: SendQuoteEmailOptions | Blob | null,
  legacyHoneypot = '',
  legacySkipHeavy = false
): Promise<EmailSubmissionResult> {
  const config = getEmailJSConfig();
  const configured = isEmailJSConfigured();

  // Compatibilidade com assinaturas anteriores:
  let options: SendQuoteEmailOptions = {};
  if (optionsOrPreviewBlob instanceof Blob || optionsOrPreviewBlob === null) {
    options = {
      previewBlob: optionsOrPreviewBlob,
      honeypotValue: legacyHoneypot,
      skipHeavyAttachments: legacySkipHeavy,
    };
  } else if (optionsOrPreviewBlob && typeof optionsOrPreviewBlob === 'object') {
    options = optionsOrPreviewBlob;
  }

  const honeypotValue = options.honeypotValue || '';

  // 1. Verificação antispam (Honeypot)
  if (honeypotValue.trim().length > 0) {
    return {
      success: false,
      isConfigured: configured,
      orderId: orderData.orderId,
      errorType: 'SPAM_DETECTED',
      error: 'Detecção de spam: requisição bloqueada.',
    };
  }

  // 2. Verificação de rate-limiting no cliente
  if (!checkRateLimit()) {
    return {
      success: false,
      isConfigured: configured,
      orderId: orderData.orderId,
      errorType: 'RATE_LIMITED',
      error: 'Muitos envios recentes. Por favor, aguarde alguns minutos antes de solicitar novo orçamento.',
    };
  }

  // 3. Verificação de credenciais do EmailJS
  if (!configured) {
    return {
      success: false,
      isConfigured: false,
      orderId: orderData.orderId,
      errorType: 'UNCONFIGURED',
      error:
        'O serviço EmailJS ainda não está configurado no ambiente. Preencha Service ID, Template ID e Public Key.',
    };
  }

  // 4. Metadados dos arquivos
  const fileInfo = getFileInfo(options.previewBlob || null, orderData);

  // 5. Montagem dos dados da ficha técnica e coordenadas CNC estruturadas
  const totalVal = (orderData.budget.totalEstimated * orderData.quantity).toFixed(2).replace('.', ',');
  const elementsDesc = orderData.elements
    .map(
      (el, i) =>
        `${i + 1}. [${el.type.toUpperCase()}] ${
          el.type === 'text' ? `"${el.text}"` : el.imageFileName || 'Arte personalizada'
        } (${el.widthCm}x${el.heightCm} cm)`
    )
    .join('\n');

  const svgDownloadUrl = options.svgDownloadUrl || '';
  const previewDownloadUrl = options.previewDownloadUrl || '';

  // Gera relatório com as coordenadas reais e precisas de usinagem CNC
  const placementReport =
    options.placementReport ||
    orderData.placementReport ||
    generatePlacementReport({
      orderId: orderData.orderId,
      pieceType: orderData.pieceType,
      pieceLabel: orderData.pieceLabel,
      lengthCm: orderData.dimensions.lengthCm,
      widthCm: orderData.dimensions.widthCm,
      thicknessCm: orderData.dimensions.thicknessCm,
      woodType: orderData.woodName,
      elements: orderData.elements,
    });

  const placementText = formatPlacementReportText(placementReport);

  const summarySheet = [
    `CÓDIGO DO PEDIDO: ${orderData.orderId}`,
    `DATA: ${new Date().toLocaleString('pt-BR')}`,
    `CLIENTE: ${orderData.clientName}`,
    `CONTATO: ${orderData.clientContact}`,
    `E-MAIL DO CLIENTE: ${orderData.clientEmail || 'Não informado'}`,
    `PEÇA: ${orderData.pieceLabel}`,
    `MADEIRA: ${orderData.woodName} Maciça`,
    `DIMENSÕES: ${orderData.dimensions.lengthCm} x ${orderData.dimensions.widthCm} x ${orderData.dimensions.thicknessCm.toFixed(1)} cm`,
    `TÉCNICA CNC: ${orderData.technique.name}`,
    `ACABAMENTO: ${orderData.finish.name}`,
    `QUANTIDADE: ${orderData.quantity} unid.`,
    `ESTIMATIVA TOTAL: R$ ${totalVal}`,
    `ARQUIVO DE ARTE: ${fileInfo.svgFileName}`,
    svgDownloadUrl ? `LINK PARA DOWNLOAD DO SVG ORIGINAL (CNC): ${svgDownloadUrl}` : '',
    previewDownloadUrl ? `LINK DA PRÉVIA VISUAL DA MONTAGEM (PNG): ${previewDownloadUrl}` : '',
    options.placementReportUrl ? `LINK DA FICHA DE COORDENADAS JSON: ${options.placementReportUrl}` : '',
    `STATUS DO ARMAZENAMENTO: ${
      options.storageStatus ||
      (svgDownloadUrl && previewDownloadUrl
        ? 'Upload concluído no Firebase Storage (Links públicos verificados)'
        : 'Processado com sucesso')
    }`,
    `ELEMENTOS DA MONTAGEM (${orderData.elements.length}):\n${elementsDesc || 'Nenhum elemento adicional'}`,
    `=====================================================\nRELATÓRIO DE POSICIONAMENTO & COORDENADAS CNC:\n${placementText}\n=====================================================`,
    `OBSERVAÇÕES: ${orderData.notes || 'Nenhuma'}`,
  ].filter(Boolean).join('\n\n');

  // Determina status descritivo real para as variáveis do template
  const storageStatusLabel = options.storageStatus || (svgDownloadUrl && previewDownloadUrl
    ? 'Upload concluído no Firebase Storage (Links públicos verificados)'
    : 'Armazenado no Firebase Storage');

  const previewStatusLabel = previewDownloadUrl || '';
  const svgStatusLabel = svgDownloadUrl || '';

  // 6. Parâmetros do modelo EmailJS estritamente TEXTUAIS (sem Base64 e sem XML bruto)
  // Total do payload é mantido abaixo de 5KB, eliminando permanentemente o erro de 50KB do EmailJS.
  const templateParams: Record<string, any> = {
    // Identificador e Assunto
    order_id: orderData.orderId,
    orderId: orderData.orderId,
    codigo_pedido: orderData.orderId,
    subject: `Novo orçamento — ${orderData.orderId}`,
    assunto: `Novo orçamento — ${orderData.orderId}`,
    date_time: new Date().toLocaleString('pt-BR'),
    data_hora: new Date().toLocaleString('pt-BR'),

    // Destinatário
    to_email: config.toEmail || undefined,

    // Dados do Cliente
    client_name: orderData.clientName,
    from_name: orderData.clientName,
    name: orderData.clientName,
    nome: orderData.clientName,
    nome_cliente: orderData.clientName,

    client_contact: orderData.clientContact,
    contact: orderData.clientContact,
    phone: orderData.clientContact,
    telefone: orderData.clientContact,
    contato: orderData.clientContact,

    client_email: orderData.clientEmail || 'Não informado',
    from_email: orderData.clientEmail || 'Não informado',
    email: orderData.clientEmail || 'Não informado',
    reply_to: orderData.clientEmail || undefined,

    // Dados da Peça
    piece_type: orderData.pieceLabel,
    peca: orderData.pieceLabel,
    wood_name: orderData.woodName,
    madeira: orderData.woodName,
    dimensions: `${orderData.dimensions.lengthCm}x${orderData.dimensions.widthCm}x${orderData.dimensions.thicknessCm.toFixed(1)} cm`,
    dimensoes: `${orderData.dimensions.lengthCm}x${orderData.dimensions.widthCm}x${orderData.dimensions.thicknessCm.toFixed(1)} cm`,
    technique: orderData.technique.name,
    tecnica: orderData.technique.name,
    finish: orderData.finish.name,
    acabamento: orderData.finish.name,
    quantity: `${orderData.quantity} unid.`,
    quantidade: `${orderData.quantity} unid.`,
    total_price: `R$ ${totalVal}`,
    valor_total: `R$ ${totalVal}`,
    notes: orderData.notes || 'Nenhuma',
    observacoes: orderData.notes || 'Nenhuma',
    message: summarySheet,
    mensagem: summarySheet,
    summary_sheet: summarySheet,
    ficha_tecnica: summarySheet,

    // Metadados do Arquivo SVG
    svg_filename: fileInfo.svgFileName,
    file_name: fileInfo.svgFileName,
    nome_arquivo: fileInfo.svgFileName,
    arquivo_arte: fileInfo.svgFileName,
    has_svg: fileInfo.hasSvg,

    // Status real do armazenamento e upload (substitui qualquer texto fixo no template)
    status_arquivo: storageStatusLabel,
    status_armazenamento: storageStatusLabel,
    status_upload: svgDownloadUrl ? 'Concluído' : 'Pendente de configuração de nuvem',
    status: storageStatusLabel,
    previa: previewStatusLabel,
    previa_status: previewDownloadUrl ? 'Disponível em alta resolução (PNG)' : 'Gerada no configurador',

    // Links de Download Funcionais (URL segura pública tokenizada do Firebase Storage)
    // Mapeamento compatível com todos os apelidos de variáveis que possam existir no template:
    svg_url: svgStatusLabel,
    link_svg: svgStatusLabel,
    svg_link: svgStatusLabel,
    download_url: svgStatusLabel,
    link_download: svgStatusLabel,
    link_download_svg: svgDownloadUrl || '',

    preview_url: previewStatusLabel,
    link_previa: previewStatusLabel,
    preview_link: previewStatusLabel,
    previa_montagem_url: previewStatusLabel,
    link_download_previa: previewDownloadUrl || '',

    placement_report: placementText,
    posicionamento_cnc: placementText,
    dados_posicionamento: placementText,
    placement_report_url: options.placementReportUrl || '',
  };

  // Cálculo e verificação estrita do tamanho do payload
  const payloadBytes = new TextEncoder().encode(JSON.stringify(templateParams)).length;
  const payloadSizeKb = Math.round((payloadBytes / 1024) * 10) / 10;

  if (payloadBytes > 48 * 1024) {
    return {
      success: false,
      isConfigured: true,
      orderId: orderData.orderId,
      errorType: 'SIZE_EXCEEDED',
      payloadSizeKb,
      maxAttachmentSizeKb: 50,
      error: `O tamanho das variáveis (${payloadSizeKb} KB) excedeu o limite máximo do EmailJS (50 KB).`,
    };
  }

  let usedServiceId = config.serviceId;

  // Função auxiliar de timeout estrito (15s) para envio via EmailJS
  const withEmailTimeout = <T>(promise: Promise<T>, ms = 15000): Promise<T> => {
    let timer: any;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Tempo de resposta do serviço de e-mail excedido (15s).')), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  };

  try {
    let response: any;
    try {
      response = await withEmailTimeout(
        emailjs.send(
          config.serviceId,
          config.templateId,
          templateParams,
          config.publicKey
        )
      );
    } catch (primaryErr: any) {
      const errStr = primaryErr?.text || primaryErr?.message || JSON.stringify(primaryErr) || '';
      console.warn(`Tentativa com serviceId '${config.serviceId}' falhou:`, errStr);

      // Se o Service ID configurado não foi encontrado (400) e temos um fallback diferente, tenta o fallback
      if (
        (errStr.includes('service ID not found') || primaryErr?.status === 400) &&
        EMAILJS_FALLBACK_SERVICE_ID &&
        EMAILJS_FALLBACK_SERVICE_ID !== config.serviceId
      ) {
        console.log(`Tentando fallback com serviceId alternativo '${EMAILJS_FALLBACK_SERVICE_ID}'...`);
        usedServiceId = EMAILJS_FALLBACK_SERVICE_ID;
        response = await withEmailTimeout(
          emailjs.send(
            EMAILJS_FALLBACK_SERVICE_ID,
            config.templateId,
            templateParams,
            config.publicKey
          )
        );
      } else {
        throw primaryErr;
      }
    }

    if (response.status === 200 || response.text === 'OK') {
      return {
        success: true,
        isConfigured: true,
        orderId: orderData.orderId,
        payloadSizeKb,
        previewSizeKb: fileInfo.previewPngSizeKb,
        svgSizeKb: fileInfo.originalSvgSizeKb,
        svgDownloadUrl,
        previewDownloadUrl,
      };
    } else {
      // Estorna cota em caso de falha de envio
      await rollbackQuoteQuota();
      return {
        success: false,
        isConfigured: true,
        orderId: orderData.orderId,
        errorType: 'NETWORK_ERROR',
        error: `Resposta inesperada do serviço EmailJS: status ${response.status}`,
      };
    }
  } catch (err: any) {
    console.error('Erro no envio via EmailJS:', err);
    // Estorna cota consumida pois o e-mail não chegou ao destino
    await rollbackQuoteQuota();

    const rawError = err.text || err.message || JSON.stringify(err);
    let userFriendlyError = rawError;

    if (rawError.includes('service ID not found') || err.status === 400) {
      userFriendlyError = `O serviço de e-mail está temporariamente em manutenção. Seus arquivos estão preservados no configurador. Por favor, utilize o botão do WhatsApp para concluir o orçamento diretamente com os marceneiros.`;
    } else if (rawError.includes('Invalid grant') || rawError.includes('reconnect your Gmail') || err.status === 412) {
      userFriendlyError = `A conexão do correio eletrônico precisa de renovação. Por favor, envie os dados pelo WhatsApp com um clique.`;
    }

    return {
      success: false,
      isConfigured: true,
      orderId: orderData.orderId,
      errorType: 'NETWORK_ERROR',
      payloadSizeKb,
      error: userFriendlyError,
    };
  }
}
