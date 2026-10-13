import { Product } from '../types';
import { ATELIER_WOODS_LIST } from './woods';
import tabuaPersonalizadaImg from '../assets/images/tabua-personalizada.png';
import portaCoposImg from '../assets/images/porta-copos-personalizados.jpg';
import banquetaImg from '../assets/images/banqueta.png';
import mesaImg from '../assets/images/mesa.png';

export const PRODUCTS: Product[] = [
  {
    id: 'tabua-churrasco-time',
    name: 'Tábua de Carne & Churrasco Personalizada - Usinagem CNC & Resina',
    category: 'tabua',
    categoryLabel: 'Tábua Personalizada CNC',
    badge: '100% Personalizável Sob sua escolha',
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
      { label: 'Dimensões', value: '3,5 cm (personalizável)', icon: 'Ruler' },
      { label: 'Gravação', value: 'Entalhe de precisão por CNC', icon: 'Hammer' },
      { label: 'Brasão', value: 'Resinado com resina atóxica', icon: 'ShieldCheck' },
      { label: 'Tratamento', value: 'Tratamento em resina', icon: 'Droplets' },
    ],
    imageUrl: tabuaPersonalizadaImg,
    inStock: true,
    joineryType: 'Usinagem de precisão em router CNC com preenchimento em resina epóxi atóxica certificada para alimentos',
    finishType: 'Resina atóxica na área do brasão, selagem em óleo mineral farmacêutico USP e cera virgem de abelha silvestre',
  },
  {
    id: 'porta-copos-personalizados',
    name: 'Porta-Copos Personalizados em Madeira Maciça - Usinagem CNC',
    category: 'tabua',
    categoryLabel: 'Porta-Copos Personalizados CNC',
    badge: '100% Personalizável Sob sua escolha',
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
    imageUrl: portaCoposImg,
    inStock: true,
    joineryType: 'Usinagem de precisão em router CNC em madeira maciça com bordas chanfradas',
    finishType: 'Banho de óleo mineral farmacêutico USP e selante impermeabilizante de alta durabilidade',
  },
  {
    id: 'par-de-banquetas-pinus',
    name: 'Par de Banquetas em Pinus (Conjunto)',
    category: 'movel',
    categoryLabel: 'Móvel & Assento Artesanal',
    badge: 'Conjunto com 2 Unidades',
    highlightTag: 'Par de Banquetas',
    woods: 'Pinus com Queima & Verniz',
    price: 300,
    weight: '8 kg (o par)',
    dimensions: 'Altura 70 cm | Assento 30 x 30 cm (cada)',
    description:
      'Conjunto com par de banquetas artesanais fabricadas em madeira maciça de pinus. Acabamento especial com técnica de queima da madeira e envernizamento impermeabilizante de alta durabilidade, combinando perfeitamente com a mesa de cozinha.',
    specs: [
      { label: 'Quantidade', value: 'Conjunto com 2 banquetas', icon: 'Sparkles' },
      { label: 'Madeira', value: 'Pinus com queima e verniz', icon: 'TreePine' },
      { label: 'Tratamento', value: 'Envernizada & Impermeável', icon: 'Droplets' },
      { label: 'Dimensões', value: 'Altura 70 cm (cada)', icon: 'Ruler' },
    ],
    imageUrl: banquetaImg,
    inStock: true,
    joineryType: 'Estrutura reforçada em pinus maciço com travessas de apoio para os pés e fixação robusta',
    finishType: 'Técnica de queima rústica controlada, selagem protetora e acabamento em verniz acetinado hidrorrepelente',
    imageFit: 'contain',
  },
  {
    id: 'mesa-pinus-cozinha-1',
    name: 'Mesa de Cozinha Pinus 1',
    category: 'movel',
    categoryLabel: 'Mesa de Cozinha Maciça',
    badge: '100% Madeira de Pinus',
    highlightTag: 'Cozinha & Jantar',
    woods: 'Pinus com Tratamento em Resina',
    price: 400,
    weight: '18 kg',
    dimensions: '140 x 80 x 76 cm',
    description:
      'Mesa de cozinha artesanal fabricada em madeira maciça de pinus selecionada com tratamento especial em resina atóxica. Estrutura robusta e estável com toque sedoso acetinado, resistente à umidade e perfeita para as refeições diárias da família.',
    specs: [
      { label: 'Dimensões', value: '140 x 80 x 76 cm', icon: 'Ruler' },
      { label: 'Madeira', value: 'Pinus Maciço Tratado', icon: 'TreePine' },
      { label: 'Tratamento', value: 'Tratamento em resina atóxica', icon: 'Droplets' },
      { label: 'Uso Ideal', value: 'Cozinha & Copa Familiar', icon: 'Sparkles' },
    ],
    imageUrl: mesaImg,
    inStock: true,
    joineryType: 'Encaixes e travamento em espiga maciça com parafusos embutidos e acabamento em cavilha artesanal',
    finishType: 'Tratamento em resina atóxica impermeabilizante, selagem em óleo mineral e acabamento acetinado',
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
