import React, { useState, useId } from 'react';
import { Search, ShieldAlert, Shield, Check, X, Info } from 'lucide-react';
import { TeamShield } from '../types';
import { TEAM_SHIELDS, SHIELD_CATEGORIES, ShieldCategory } from '../data/teams';

interface TeamShieldGalleryProps {
  selectedTeam: TeamShield | null;
  onSelectTeam: (team: TeamShield | null) => void;
  disabled?: boolean;
}

export const TeamShieldGallery: React.FC<TeamShieldGalleryProps> = ({
  selectedTeam,
  onSelectTeam,
  disabled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ShieldCategory['id']>('all');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [retriedLocal, setRetriedLocal] = useState<Record<string, boolean>>({});
  const searchInputId = useId();

  const handleImageError = (teamId: string) => {
    if (!retriedLocal[teamId]) {
      setRetriedLocal((prev) => ({ ...prev, [teamId]: true }));
      return;
    }
    setFailedImages((prev) => ({ ...prev, [teamId]: true }));
  };

  const handleImageLoad = (teamId: string) => {
    setLoadedImages((prev) => ({ ...prev, [teamId]: true }));
  };

  // Filter teams by category and search query
  const filteredTeams = TEAM_SHIELDS.filter((team) => {
    const matchesCategory =
      selectedCategory === 'all' || team.category === selectedCategory;

    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesName =
      team.name.toLowerCase().includes(query) ||
      team.shortName.toLowerCase().includes(query) ||
      (team.city && team.city.toLowerCase().includes(query)) ||
      (team.state && team.state.toLowerCase().includes(query)) ||
      (team.country && team.country.toLowerCase().includes(query));

    return matchesCategory && matchesName;
  });

  return (
    <div className="space-y-4 pt-2">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#3E2D22] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#C29B68]" />
            <span>Escolha seu Time de Coração</span>
          </span>
          <p className="text-[11px] text-[#785D48] mt-0.5">
            Usinado em baixo-relevo CNC e finalizado com resina epóxi culinária atóxica.
          </p>
        </div>

        {/* Selected team indicator badge */}
        {selectedTeam && (
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#111111] text-white text-[11px] font-medium border border-[#C29B68]/50 shadow-sm self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#C29B68] animate-pulse" />
            <span className="truncate max-w-[150px]">Selecionado: <strong>{selectedTeam.shortName}</strong></span>
            <button
              type="button"
              onClick={() => onSelectTeam(null)}
              className="text-[#DFD3C3] hover:text-white p-0.5 ml-1 transition-colors"
              title="Remover seleção"
              aria-label="Remover seleção de time"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Search Input & Category Filters */}
      <div className="space-y-2.5">
        {/* Search Field */}
        <div className="relative">
          <label htmlFor={searchInputId} className="sr-only">
            Buscar time por nome, cidade ou estado
          </label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#785D48]">
            <Search className="w-4 h-4" />
          </div>
          <input
            id={searchInputId}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            placeholder="Buscar clube (ex: Flamengo, Palmeiras, Real Madrid, Santos...)"
            className="w-full pl-9 pr-8 py-2.5 bg-[#FCF9F3] border border-[#DFD3C3] text-xs text-[#111111] placeholder:text-[#A38D7D] focus:bg-white focus:outline-[#8A5835] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#785D48] hover:text-[#111111]"
              aria-label="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap no-scrollbar" role="tablist" aria-label="Categorias de times">
          {SHIELD_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(cat.id)}
                disabled={disabled}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#2A1E17] text-white border-[#2A1E17] shadow-sm'
                    : 'bg-[#FCF9F3] text-[#5C4033] border-[#DFD3C3]/80 hover:bg-[#F2ECE1] hover:border-[#8A5835]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Option: "Sem escudo / Personalização própria" + Shield Grid */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5 max-h-[260px] sm:max-h-[340px] overflow-y-auto p-1 pr-1.5 scrollbar-thin scrollbar-thumb-[#C29B68]/40">
          {/* Card: Sem Escudo / Personalização Própria */}
          <button
            type="button"
            onClick={() => onSelectTeam(null)}
            disabled={disabled}
            className={`flex flex-col items-center justify-center p-2 sm:p-3 text-center border transition-all cursor-pointer relative group min-h-[90px] sm:min-h-[110px] ${
              selectedTeam === null
                ? 'bg-[#FAF8F5] border-2 border-[#8A5835] shadow-md ring-1 ring-[#8A5835]/30'
                : 'bg-[#FCF9F3] border-[#DFD3C3]/80 hover:border-[#8A5835] hover:bg-white'
            }`}
          >
            {selectedTeam === null && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#8A5835] text-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5" />
              </span>
            )}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-dashed border-[#8A5835]/40 flex items-center justify-center mb-1 text-[#8A5835] group-hover:border-[#8A5835] transition-colors">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 opacity-60" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#2A1E17] leading-tight">
              Sem Escudo
            </span>
            <span className="text-[8px] sm:text-[9px] text-[#785D48] mt-0.5 uppercase tracking-wider truncate max-w-full">
              Texto Próprio
            </span>
          </button>

          {/* Cards dos Times */}
          {filteredTeams.map((team) => {
            const isSelected = selectedTeam?.id === team.id;
            const hasError = failedImages[team.id];
            const isLoaded = loadedImages[team.id];

            return (
              <button
                key={team.id}
                type="button"
                onClick={() => onSelectTeam(team)}
                disabled={disabled}
                aria-pressed={isSelected}
                className={`flex flex-col items-center justify-between p-2 sm:p-2.5 text-center border transition-all cursor-pointer relative group min-h-[90px] sm:min-h-[110px] ${
                  isSelected
                    ? 'bg-[#1C1917] text-white border-2 border-[#C29B68] shadow-lg ring-2 ring-[#C29B68]/30'
                    : 'bg-[#FCF9F3] text-[#111111] border-[#DFD3C3]/80 hover:border-[#C29B68] hover:bg-white hover:shadow-sm'
                }`}
              >
                {/* Active check indicator */}
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#C29B68] text-white flex items-center justify-center shadow">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}

                {/* Team Shield Image with Skeleton / Fallback */}
                <div className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center relative my-0.5 sm:my-1">
                  {!isLoaded && !hasError && (
                    <div className="absolute inset-0 bg-[#E8DFD4] animate-pulse rounded-full opacity-60" />
                  )}

                  {!hasError ? (
                    <img
                      src={
                        retriedLocal[team.id]
                          ? `/clubs/${team.id}/logo.png`
                          : (team.displayLogo || team.imageUrl)
                      }
                      alt={`Escudo oficial do ${team.name}`}
                      loading="lazy"
                      onError={() => handleImageError(team.id)}
                      onLoad={() => handleImageLoad(team.id)}
                      referrerPolicy="no-referrer"
                      className={`max-w-full max-h-full object-contain filter drop-shadow-sm transition-transform duration-200 group-hover:scale-110 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ) : (
                    /* Fallback elegante com o monograma do clube caso ocorra falha de rede */
                    <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-[#2A1E17] text-[#C29B68] border border-[#C29B68]/40 flex flex-col items-center justify-center">
                      <span className="font-serif font-bold text-[10px] sm:text-xs tracking-wider">
                        {team.shortName.slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Team Info */}
                <div className="w-full">
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold block leading-tight line-clamp-1 ${
                      isSelected ? 'text-white' : 'text-[#111111]'
                    }`}
                  >
                    {team.shortName}
                  </span>
                  <span
                    className={`text-[8px] sm:text-[9px] uppercase tracking-wider block mt-0.5 truncate ${
                      isSelected ? 'text-[#C29B68]' : 'text-[#785D48]'
                    }`}
                  >
                    {team.state || team.country || team.categoryLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty Search State */}
        {filteredTeams.length === 0 && (
          <div className="p-6 text-center bg-[#FCF9F3] border border-dashed border-[#DFD3C3] space-y-2">
            <ShieldAlert className="w-7 h-7 text-[#8A5835] mx-auto opacity-70" />
            <p className="text-xs font-semibold text-[#2A1E17]">
              Nenhum clube encontrado para &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-[11px] text-[#785D48] max-w-sm mx-auto">
              Podemos usinar qualquer brasão sob encomenda! Digite o nome do seu time no campo de gravação abaixo ou envie o vetor pelo WhatsApp.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs font-bold text-[#8A5835] underline hover:text-[#2A1E17] pt-1 inline-block"
            >
              Ver todos os clubes disponíveis
            </button>
          </div>
        )}
      </div>

      {/* Disclaimers & Cadastros de novos times */}
      <div className="p-2.5 bg-[#F4EFE6] border-l-2 border-[#C29B68] text-[10px] text-[#5C4033] flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-[#8A5835] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Personalização Autoral sob Encomenda:</strong> O atelier realiza entalhes artísticos individuais em baixo-relevo CNC e aplicação de resina culinária atóxica a pedido de torcedores e colecionadores. Para cadastrar outros clubes nacionais ou internacionais, basta solicitar pelo canal técnico.
        </p>
      </div>
    </div>
  );
};
