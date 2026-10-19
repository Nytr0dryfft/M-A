/**
 * Configuração Centralizada do Serviço EmailJS para Frontend Estático (GitHub Pages)
 * Utiliza EmailJS Browser SDK com as credenciais:
 * - Service ID: service_8kyaov7
 * - Template ID: template_40pdxm1
 * - Public Key: Dp1KqhfoNcPlExVG_
 */

export interface EmailJSClientConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  toEmail?: string;
  maxAttachmentSizeKb: number;
}

export const EMAILJS_SERVICE_ID = 'service_937xps8';
export const EMAILJS_FALLBACK_SERVICE_ID = 'service_8kyaov7';
export const EMAILJS_TEMPLATE_ID = 'template_40pdxm1';
export const EMAILJS_PUBLIC_KEY = 'Dp1KqhfoNcPlExVG_';
export const EMAILJS_TO_EMAIL = 'matheuseamarildo@gmail.com';

export const getEmailJSConfig = (): EmailJSClientConfig => {
  const env =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env
      : ({} as Record<string, string>);

  const localServiceId =
    typeof window !== 'undefined'
      ? localStorage.getItem('atelier_emailjs_service_id')
      : null;

  return {
    serviceId: localServiceId || env.VITE_EMAILJS_SERVICE_ID || EMAILJS_SERVICE_ID,
    templateId: env.VITE_EMAILJS_TEMPLATE_ID || EMAILJS_TEMPLATE_ID,
    publicKey: env.VITE_EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY,
    toEmail: env.VITE_EMAILJS_TO_EMAIL || EMAILJS_TO_EMAIL,
    // Limite padrão seguro de anexos por requisição (2 MB para EmailJS Pro, ou 500 KB para Personal)
    maxAttachmentSizeKb: parseInt(
      env.VITE_EMAILJS_MAX_ATTACHMENT_SIZE_KB || '2048',
      10
    ),
  };
};

/**
 * Verifica se o EmailJS possui os identificadores essenciais válidos
 */
export const isEmailJSConfigured = (): boolean => {
  const config = getEmailJSConfig();
  return Boolean(
    config.serviceId &&
    config.templateId &&
    config.publicKey &&
    !config.serviceId.includes('YOUR_') &&
    !config.templateId.includes('YOUR_') &&
    !config.publicKey.includes('YOUR_')
  );
};
