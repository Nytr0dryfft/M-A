/**
 * Configurações Centralizadas de Segurança, Limites e Proteção contra Abuso
 * Ateliê M&A de Marcenaria Autoral
 */

export const SECURITY_CONFIG = {
  // Limites de Cota de Orçamentos
  MAX_QUOTES_PER_USER_24H: 3,
  MAX_QUOTES_PER_IP_24H: 10,
  WINDOW_MS: 24 * 60 * 60 * 1000, // 24 horas móveis

  // Limites de Arquivos e Dimensões por Solicitação
  MAX_BOARD_THICKNESS_CM: 3.5, // Limite estrito de espessura física no atelier
  MAX_ELEMENTS_COUNT: 5, // Máximo de artes/elementos personalizados por peça
  MAX_SVG_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB para o arquivo vetorial original
  MAX_RASTER_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB para imagens PNG/JPEG
  MAX_PREVIEW_PNG_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB para a prévia renderizada
  MAX_TOTAL_ORDER_FILES_SIZE_BYTES: 15 * 1024 * 1024, // 15 MB total por pedido

  // Tipos MIME estritamente aceitos
  ALLOWED_IMAGE_MIME_TYPES: [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
  ],

  // Limite estrito de payload para o EmailJS (mantido abaixo de 45 KB para folga sobre o limite de 50 KB)
  MAX_EMAILJS_PAYLOAD_BYTES: 45 * 1024,

  // Mensagens amigáveis para o cliente (sem vazamento de detalhes técnicos ou infraestrutura)
  MESSAGES: {
    RATE_LIMIT_EXCEEDED:
      'Você atingiu o limite de solicitações de orçamento para este período. Tente novamente mais tarde. Se precisar de ajuda com seu projeto, entre em contato conosco pelo WhatsApp.',
    FILE_SIZE_EXCEEDED:
      'O arquivo selecionado ultrapassa o limite de tamanho permitido para processamento autoral. Por favor, envie uma imagem de até 10 MB ou fale diretamente com nossos marceneiros pelo WhatsApp.',
    TOO_MANY_ELEMENTS:
      'Para garantir a máxima qualidade de usinagem na CNC, permitimos até 5 elementos personalizados por peça. Por favor, ajuste sua composição.',
    INVALID_FILE_TYPE:
      'Formato de arquivo não suportado. Por favor, utilize imagens nos formatos PNG, JPEG ou vetores SVG.',
    GENERIC_SUBMISSION_ERROR:
      'Não foi possível concluir o envio do orçamento no momento devido a uma instabilidade de conexão. Suas configurações estão salvas. Por favor, tente novamente em instantes ou utilize o botão do WhatsApp.',
  },
} as const;
