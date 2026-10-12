import { Product } from '../types';
import { ATELIER_WOODS_LIST } from './woods';

export const PRODUCTS: Product[] = [
  {
    id: 'tabua-churrasco-time',
    name: 'Tábua de Carne & Churrasco Personalizada - Usinagem CNC & Resina',
    category: 'tabua',
    categoryLabel: 'Tábua Personalizada CNC',
    badge: '100% Personalizável em CNC',
    highlightTag: 'Sob Medida & Escudos',
    woods: 'Pinus, Angelim ou Maçaranduba',
    price: 149.9,
    priceMin: 149.9,
    priceMax: 209.9,
    priceRange: 'R$ 149,90 - R$ 209,90',
    weight: '3.4 kg Maciça',
    dimensions: '40 x 29 x 3,5 cm (ou sob medida)',
    description:
      'Peça exclusiva usinada com máxima precisão em fresadora CNC no atelier. Personalize com o brasão do seu time, monograma de família ou logotipo, com canaleta profunda de sucos e resina culinária atóxica.',
    specs: [
      { label: 'Dimensões', value: '40 x 29 x 3,5 cm (personalizável)', icon: 'Ruler' },
      { label: 'Gravação', value: 'Entalhe de precisão por CNC', icon: 'Hammer' },
      { label: 'Brasão', value: 'Resinado com resina atóxica', icon: 'ShieldCheck' },
      { label: 'Tratamento', value: 'Tratamento em resina atóxica', icon: 'Droplets' },
    ],
    imageUrl: '/tabua-personalizada.png',
    inStock: true,
    joineryType: 'Usinagem de precisão em router CNC com preenchimento em resina epóxi atóxica certificada para alimentos',
    finishType: 'Resina atóxica na área do brasão, selagem em óleo mineral farmacêutico USP e cera virgem de abelha silvestre',
  },
  {
    id: 'porta-copos-personalizados',
    name: 'Porta-Copos Personalizados em Madeira Maciça - Usinagem CNC',
    category: 'tabua',
    categoryLabel: 'Porta-Copos Personalizados CNC',
    badge: '100% Personalizável em CNC',
    highlightTag: 'Sob Medida & Escudos',
    woods: 'Pinus, Angelim ou Maçaranduba',
    price: 25.0,
    priceMin: 25.0,
    priceMax: 35.0,
    priceRange: 'R$ 25,00 - R$ 35,00',
    weight: '120g Maciço',
    dimensions: '9 a 12 cm | Espessura 1,0 cm',
    description:
      'Porta-copos maciço usinado com máxima precisão em router CNC no atelier. Personalize com o brasão do seu time do coração, monograma ou logotipo, com acabamento acetinado impermeável e canaleta perimétrica elegante.',
    specs: [
      { label: 'Dimensões', value: '9 a 12 cm (1,0 cm espessura)', icon: 'Ruler' },
      { label: 'Gravação', value: 'Entalhe de precisão por CNC', icon: 'Hammer' },
      { label: 'Proteção', value: 'Tratamento em resina atóxica', icon: 'Droplets' },
      { label: 'Usinagem', value: 'Bordas chanfradas em CNC', icon: 'Sparkles' },
    ],
    imageUrl: '/porta-copos-personalizados.jpg',
    inStock: true,
    joineryType: 'Usinagem de precisão em router CNC em madeira maciça com bordas chanfradas',
    finishType: 'Banho de óleo mineral farmacêutico USP e selante impermeabilizante de alta durabilidade',
  },
  {
    id: 'mesa-lateral-komorebi',
    name: 'Mesa Lateral Orgânica & Banco Komorebi',
    category: 'movel',
    categoryLabel: 'Móvel Escultural Autoral',
    badge: 'Design Wabi-Sabi',
    highlightTag: 'Edição Limitada',
    woods: 'Cedrinho com Tratamento em Resina',
    price: 1950,
    weight: '11.5 kg',
    dimensions: 'Banco: 75 x 30 x 42 cm',
    description:
      'Inspirado na marcenaria de encaixes japonesa Sashimono: sem pregos nem parafusos metálicos visíveis. Tampo escavado manualmente preservando o contorno do tronco e pés curvos com espigas passantes em cunha.',
    specs: [
      { label: 'Dimensões', value: 'Banco: 75 x 30 x 42 cm', icon: 'Ruler' },
      { label: 'Tratamento', value: 'Tratamento em resina atóxica', icon: 'Droplets' },
      { label: 'Tradição', value: 'Encaixe espiga passante', icon: 'Scissors' },
      { label: 'Textura', value: 'Toque sedoso poro aberto', icon: 'Sparkles' },
    ],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBoyE7bhcjtq4GHn-eqU3ZTFDad8Np0vTDrDDyQn_bV2f0teYUBWpqiW9KX1IRQrBefz8sMCn19_vrr7bhOiV0t1XGJHRtR1JbL4IukcMhw1mEujzQSX1CfBXfV6TUhE5ALlQFDhSz1_mZgAW1G0iLgXBzuzqHobhz0EIjudeqEuLQBcU8HjP9QC0wKcJ6FzOZXJGhSM3MOVi1zmNFXUKHfKTYr4Q6bOuS7KafuHLVmgkkqVi1CDnL3fw',
    inStock: true,
    joineryType: 'Sashimono tradicional japonês com encaixes em cauda de andorinha e cunhas de contraste',
    finishType: 'Óleo dinamarquês atóxico com polimento manual com lixas grão 1200',
  },
  {
    id: 'mesa-prancha-viva-mariposa',
    name: 'Mesa de Centro Prancha Viva com Mariposa',
    category: 'movel',
    categoryLabel: 'Móvel Escultural de Centro',
    badge: 'Live Edge de Tronco Único',
    highlightTag: 'Peça Escultórica',
    woods: 'Maçaranduba com Tratamento em Resina',
    price: 3400,
    weight: '24 kg',
    dimensions: '130 x 60 x 38 cm',
    description:
      'Prancha maciça com borda orgânica viva (live edge) de 8 cm de espessura. As fissuras naturais do tempo são travadas com mariposas "butterfly keys" artesanais e base em cavalete rústico maciço.',
    specs: [
      { label: 'Dimensões', value: '130 x 60 x 38 cm', icon: 'Ruler' },
      { label: 'Estrutura', value: 'Travamento mariposa', icon: 'Lock' },
      { label: 'Tratamento', value: 'Tratamento em resina atóxica', icon: 'Droplets' },
      { label: 'Logística', value: 'Frete seguro especializado', icon: 'Truck' },
    ],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBz5ccxXC0Z_G1AaGjwEEBNds3zFQ25YZJ812JeZjaUqdH7l8wccKlSkXvagB0SK9SAC0T4CxRAlWQfDmCB8KOITbSaT1zL4apG6CCakh2mZVAps9Mm0mw-Dt7d9pWlu8vGJ5Vua9qGZ8F9XGiWXg14hhZZkMvbzB7ZaGiTtrRRAtUm2j5wf-Up6T09Tkiu1LyQ8Z3sZf1ByYHlJ0C2tG2gEtrN0-pMsHIZ6gqxnyF34YGGizVhBODfEA',
    inStock: true,
    joineryType: 'Chaves borboleta (butterfly keys) entalhadas milimetricamente',
    finishType: 'Tratamento em resina vegetal, selagem com ceras naturais e fundo fosco acetinado',
  },
];

export const WOOD_SPECIMENS = ATELIER_WOODS_LIST;

export const TESTIMONIALS = [
  {
    quote:
      'A tábua personalizada de churrasco da M&A é simplesmente impecável. A usinagem do escudo do time em CNC tem uma nitidez impressionante e a canaleta funda retém todo o suco da picanha sem sujar a bancada. O peso maciço traz uma imponência única.',
    author: 'Chef Felipe Martins',
    role: 'Restaurante Fogo & Brasa',
    initials: 'FM',
    avatarBg: 'bg-[#2A1E17]',
  },
  {
    quote:
      'Comprei o banco Komorebi e duas mesas laterais orgânicas para um projeto de living no Itaim. A junção sem parafusos e o acabamento aveludado em cera deixaram os clientes encantados. É arte utilitária pura.',
    author: 'Camila Lins',
    role: 'Lins Arquitetura & Interiores',
    initials: 'CL',
    avatarBg: 'bg-[#8A5835]',
  },
  {
    quote:
      'Encomendei 30 tábuas com canaleta e personalização usinada em CNC para presentear parceiros VIP da nossa marca. O acabamento com óleo culinário medicinal e o estojo de linho deixaram uma impressão inesquecível.',
    author: 'Rodrigo Torres',
    role: 'Torres Prime Meats',
    initials: 'RT',
    avatarBg: 'bg-[#3E2D22]',
  },
];
