import React from 'react';
import {
  Ruler,
  Droplets,
  Hammer,
  ShieldCheck,
  Sparkles,
  Layers,
  Scissors,
  Lock,
  Leaf,
  Truck,
  TreePine,
  Armchair,
  UtensilsCrossed,
} from 'lucide-react';

/**
 * Símbolo Autoral para "Madeira"
 * Representa uma tora / prancha de madeira maciça nobre com veios anelares naturais de crescimento.
 */
export const WoodSymbol: React.FC<{ className?: string }> = ({
  className = 'w-3.5 h-3.5 text-[#8A5835]',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label="Símbolo de Madeira Nobre"
  >
    {/* Corte transversal da tora de madeira maciça */}
    <ellipse cx="7.5" cy="12" rx="4.5" ry="7.5" />
    {/* Corpo longitudinal da prancha de madeira */}
    <path d="M7.5 4.5h9c2.5 0 4.5 3.36 4.5 7.5s-2 7.5-4.5 7.5h-9" />
    {/* Anel de crescimento central (veios da madeira) */}
    <ellipse cx="7.5" cy="12" rx="2" ry="3.5" strokeDasharray="1.2 1.5" />
    {/* Ranhura e veios naturais do cerne */}
    <path d="M14 8c1.3.8 2 2.2 2 4s-.7 3.2-2 4" />
  </svg>
);

/**
 * Símbolo Autoral para "Mesas / Cadeiras / Cozinha e Copa"
 * Representa com fidelidade um conjunto de mesa de jantar/copa em madeira com cadeiras artesanais.
 */
export const TableAndChairsSymbol: React.FC<{ className?: string }> = ({
  className = 'w-3.5 h-3.5 text-[#8A5835]',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label="Símbolo de Mesa e Cadeiras - Cozinha e Copa"
  >
    {/* Tampo da mesa maciça */}
    <path d="M6 10.5h12" />
    {/* Pés estruturais da mesa */}
    <path d="M8 10.5v9" />
    <path d="M16 10.5v9" />
    {/* Cadeira esquerda com encosto ripado e assento */}
    <path d="M3 5v8.5" />
    <path d="M1.5 13.5h3.5v6" />
    {/* Cadeira direita com encosto ripado e assento */}
    <path d="M21 5v8.5" />
    <path d="M19 13.5h3.5v6" />
  </svg>
);

/**
 * Símbolo Autoral para "Banqueta / Banquetas Artesanais"
 */
export const StoolSymbol: React.FC<{ className?: string }> = ({
  className = 'w-3.5 h-3.5 text-[#8A5835]',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label="Símbolo de Banqueta Artesanal"
  >
    {/* Assento maciço circular da banqueta */}
    <ellipse cx="12" cy="6" rx="6" ry="2" />
    {/* Pernas torneadas anguladas */}
    <path d="M8 7.5L5.5 20" />
    <path d="M16 7.5L18.5 20" />
    <path d="M12 8v12" />
    {/* Apoio / travessa para os pés */}
    <path d="M6.8 15h10.4" />
  </svg>
);

/**
 * Renderizador centralizado de ícones de especificações do catálogo
 */
export const renderCraftSpecIcon = (
  iconName: string,
  className = 'w-3.5 h-3.5 text-[#8A5835]'
): React.ReactElement => {
  const normalized = (iconName || '').toLowerCase().trim();

  // 1. Símbolos de Madeira
  if (
    normalized === 'madeira' ||
    normalized === 'wood' ||
    normalized === 'treepine' ||
    normalized.includes('madeira')
  ) {
    return <WoodSymbol className={className} />;
  }

  // 2. Símbolos de Mesa / Cadeiras / Cozinha e Copa
  if (
    normalized === 'mesacadeira' ||
    normalized === 'cozinha' ||
    normalized === 'mesa' ||
    normalized.includes('cozinha') ||
    normalized.includes('copa') ||
    normalized.includes('mesa') ||
    normalized === 'table'
  ) {
    return <TableAndChairsSymbol className={className} />;
  }

  // 3. Símbolos de Banquetas
  if (normalized === 'banqueta' || normalized.includes('banqueta')) {
    return <StoolSymbol className={className} />;
  }

  // 4. Medida / Dimensões
  if (normalized === 'ruler' || normalized === 'medida' || normalized === 'dimensões' || normalized === 'dimensoes') {
    return <Ruler className={className} />;
  }

  // 5. Tratamento / Resina
  if (normalized === 'droplets' || normalized === 'tratamento') {
    return <Droplets className={className} />;
  }

  // 6. Usinagem / Gravação
  if (normalized === 'hammer' || normalized === 'gravação' || normalized === 'gravacao') {
    return <Hammer className={className} />;
  }

  // 7. Acabamento / Brasão
  if (normalized === 'shieldcheck' || normalized === 'brasão' || normalized === 'brasao') {
    return <ShieldCheck className={className} />;
  }

  // 8. Demais ícones do catálogo
  switch (iconName) {
    case 'Layers':
      return <Layers className={className} />;
    case 'Scissors':
      return <Scissors className={className} />;
    case 'Lock':
      return <Lock className={className} />;
    case 'Leaf':
      return <Leaf className={className} />;
    case 'Truck':
      return <Truck className={className} />;
    case 'Armchair':
      return <Armchair className={className} />;
    case 'UtensilsCrossed':
      return <UtensilsCrossed className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};
