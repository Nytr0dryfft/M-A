/**
 * Configuração Centralizada de Contato, Endereço & WhatsApp do Atelier Sob Medida
 */
export const ATELIER_CONTACT = {
  // Número comercial oficial (com código do país e DDD, sem espaços ou símbolos para links)
  whatsappNumber: '5524999619770',

  // Telefone formatado para exibição visual
  displayPhone: '+55 (24) 99961-9770',

  // Endereço oficial do Atelier
  address: {
    street: 'Rua Santa Maria Madalena, 198',
    neighborhood: 'Siderlândia',
    city: 'Volta Redonda',
    state: 'RJ',
    cep: '27273-545',
    fullFormatted: 'Rua Santa Maria Madalena, 198 - Siderlândia, Volta Redonda - RJ, CEP 27273-545',
  },

  // E-mail de atendimento
  email: 'atelier@cerne.design',

  // Instagram Oficial do Ateliê
  instagramUrl: 'https://www.instagram.com/ma.ateliedemarcenaria?cplk=ZWt0eDRtOXhtdHhw',
  instagramHandle: '@ma.ateliedemarcenaria',

  // Mensagem padrão para início de conversa no WhatsApp
  defaultMessage: 'Olá! Gostaria de saber mais sobre as tábuas e peças personalizadas do Atelier Sob Medida.',

  // Link oficial gerado para o WhatsApp com garantia de codificação única (sem %20/%0A vazados)
  getWhatsAppUrl(customMessage?: string): string {
    let rawText = customMessage || this.defaultMessage;
    // Se a mensagem já contiver sequências percent-encoded, decodifica para garantir aplicação única de encodeURIComponent
    if (/%[0-9A-Fa-f]{2}/.test(rawText)) {
      try {
        rawText = decodeURIComponent(rawText);
      } catch {
        // mantém texto original caso não seja URI válida
      }
    }
    const text = encodeURIComponent(rawText);
    return `https://wa.me/${this.whatsappNumber}?text=${text}`;
  },
};
