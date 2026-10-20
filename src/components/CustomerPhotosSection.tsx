import React, { useState, useEffect } from 'react';
import {
  Star,
  Lock,
  ChevronRight,
  ZoomIn,
  X,
  Sparkles,
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import {
  CustomerPhoto,
  loadCustomerPhotos,
  getCachedCustomerPhotos,
} from '../services/customerPhotosService';
import { CustomerPhotosAdminModal } from './CustomerPhotosAdminModal';

interface CustomerPhotosSectionProps {
  onGoToCustomizer?: (pieceType?: 'tabua_carne' | 'porta_copos' | 'movel') => void;
  externalCategoryFilter?: string | null;
}

/**
 * Card individual com estado isolado de carregamento de imagem,
 * miniatura leve e skeleton progressivo.
 */
const CustomerPhotoCard: React.FC<{
  photo: CustomerPhoto;
  onSelect: (photo: CustomerPhoto) => void;
  onGoToCustomizer?: (pieceType?: 'tabua_carne' | 'porta_copos' | 'movel') => void;
  priority?: boolean;
}> = ({ photo, onSelect, onGoToCustomizer, priority = false }) => {
  const initialUrl = photo.thumbnailUrl || photo.imageUrl;
  const [currentSrc, setCurrentSrc] = useState<string>(initialUrl);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setCurrentSrc(photo.thumbnailUrl || photo.imageUrl);
    setImageLoaded(false);
    setImageError(false);
  }, [photo.thumbnailUrl, photo.imageUrl]);

  const handleImageError = () => {
    // Se a miniatura falhou, tenta carregar diretamente a URL original da foto
    if (currentSrc !== photo.imageUrl && photo.imageUrl) {
      setCurrentSrc(photo.imageUrl);
      setImageLoaded(false);
    } else {
      setImageError(true);
    }
  };

  return (
    <div className="bg-white border border-[#DFD3C3] shadow-md group hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Contêiner da Fotografia com Proporção Consistente e Placeholder Progressivo */}
        <div
          className="relative aspect-[16/10] bg-[#1C1917] overflow-hidden cursor-pointer"
          onClick={() => onSelect(photo)}
        >
          {/* Skeleton placeholder enquanto a imagem carrega */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-[#2A1E17]/25 animate-pulse flex items-center justify-center">
              <div className="w-7 h-7 rounded-full border-2 border-[#8A5835]/40 border-t-transparent animate-spin" />
            </div>
          )}

          {/* Mensagem discreta caso ocorra falha na imagem individual */}
          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-[#FAF8F5] text-[#5C4033]">
              <span className="text-xs font-semibold">Fotografia do Atelier</span>
              <span className="text-[10px] text-[#8A5835] mt-1">Clique para tentar visualizar</span>
            </div>
          ) : (
            <img
              src={currentSrc}
              alt={photo.title || `Fotografia de peça artesanal M&A - ${photo.category}`}
              className={`w-full h-full object-cover group-hover:scale-104 transition-all duration-700 ease-out ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
            />
          )}

          {/* Badge da Categoria Real */}
          <span className="absolute top-3 left-3 z-10 bg-[#111111]/85 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2.5 py-1">
            {photo.category}
          </span>

          {/* Botão de Ampliação / Ver Imagem Original */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(photo);
            }}
            className="absolute bottom-3 right-3 z-10 bg-black/75 hover:bg-black text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 flex items-center gap-1.5 backdrop-blur-xs transition-colors border border-white/10 cursor-pointer"
            title="Ver fotografia ampliada com detalhes"
          >
            <ZoomIn className="w-3.5 h-3.5 text-[#C29B68]" />
            <span>Ver foto</span>
          </button>
        </div>

        {/* Detalhes Cadastrados (Exibidos apenas se informados) */}
        <div className="p-4 sm:p-6 lg:p-7">
          {/* Linha de Avaliação e Metadados Reais */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            {typeof photo.rating === 'number' ? (
              <div className="flex items-center gap-1 text-[#C29B68]">
                {[...Array(photo.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
                <span className="text-xs font-bold text-[#8A5835] ml-1 font-mono">
                  {photo.rating}.0
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-[#5C4033]/80 italic">Registro documental</span>
            )}

            {(photo.clientName || photo.city) && (
              <span className="text-[11px] text-[#8A5835] font-semibold truncate">
                {photo.clientName && <span>{photo.clientName}</span>}
                {photo.clientName && photo.city && <span> • </span>}
                {photo.city && <span>{photo.city}</span>}
              </span>
            )}
          </div>

          {/* Título da Peça (se houver) */}
          {photo.title && (
            <h4 className="font-serif text-lg sm:text-xl font-bold text-[#111111] mb-2 leading-snug">
              {photo.title}
            </h4>
          )}

          {/* Madeira e Acabamento (se houver) */}
          {photo.wood && (
            <p className="text-[11px] sm:text-xs text-[#8A5835] font-medium mb-3">
              Madeira: <span className="text-[#111] font-semibold">{photo.wood}</span>
            </p>
          )}

          {/* Depoimento Real do Cliente (se houver) */}
          {photo.comment && (
            <blockquote className="p-3 sm:p-4 bg-[#FAF8F5] border-l-2 border-[#8A5835] text-xs sm:text-sm text-[#3E2D22] italic leading-relaxed mb-2">
              "{photo.comment}"
            </blockquote>
          )}
        </div>
      </div>

      {/* Rodapé do Cartão */}
      <div className="px-4 sm:px-6 lg:px-7 pb-4 sm:pb-6 pt-0 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onSelect(photo)}
          className="text-xs font-bold text-[#8A5835] hover:text-[#111] flex items-center gap-1 uppercase tracking-wider transition-colors cursor-pointer"
        >
          <span>Ver detalhes</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {onGoToCustomizer && (
          <button
            type="button"
            onClick={() => onGoToCustomizer(photo.category.toLowerCase().includes('porta') ? 'porta_copos' : 'tabua_carne')}
            className="text-[11px] font-semibold uppercase tracking-wider text-[#5C4033] hover:text-[#8A5835] transition-colors cursor-pointer"
          >
            Personalizar peça similar
          </button>
        )}
      </div>
    </div>
  );
};

export const CustomerPhotosSection: React.FC<CustomerPhotosSectionProps> = ({
  onGoToCustomizer,
  externalCategoryFilter,
}) => {
  // Inicialização instantânea síncrona com cache local (0ms na renderização inicial)
  const [photos, setPhotos] = useState<CustomerPhoto[]>(() => getCachedCustomerPhotos(true));
  const [isDataLoading, setIsDataLoading] = useState<boolean>(() => getCachedCustomerPhotos(true).length === 0);
  const [selectedPhoto, setSelectedPhoto] = useState<CustomerPhoto | null>(null);
  const [lightboxLoaded, setLightboxLoaded] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Carrega e revalida fotos reais sem bloquear a interface se já houver cache
  const fetchPhotos = async () => {
    try {
      if (photos.length === 0) {
        setIsDataLoading(true);
      }
      const data = await loadCustomerPhotos(true); // Apenas publicadas
      if (data && data.length > 0) {
        setPhotos(data);
      }
    } catch (err) {
      console.warn('Erro ao atualizar fotos reais da galeria:', err);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsDataLoading(false);
      }
    }, 2800);

    fetchPhotos().finally(() => {
      clearTimeout(safetyTimer);
      if (isMounted) {
        setIsDataLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  useEffect(() => {
    if (externalCategoryFilter) {
      setActiveCategory(externalCategoryFilter);
    }
  }, [externalCategoryFilter]);

  // Lista única de categorias cadastradas nas fotos publicadas
  const availableCategories = Array.from(new Set(photos.map((p) => p.category))).filter(Boolean);

  // Filtragem
  const filteredPhotos = photos.filter((p) => {
    if (activeCategory === 'todos') return true;
    return p.category.toLowerCase() === activeCategory.toLowerCase();
  });

  // Cálculo real da nota média e quantidade de avaliações válidas
  // REQUISITO ESTRITO: se não houver notas cadastradas, não inventa estrelas ou números.
  const photosWithRating = photos.filter(
    (p) => typeof p.rating === 'number' && p.rating >= 1 && p.rating <= 5
  );
  const totalRatingsCount = photosWithRating.length;
  const averageRating =
    totalRatingsCount > 0
      ? (photosWithRating.reduce((acc, p) => acc + (p.rating || 0), 0) / totalRatingsCount).toFixed(1)
      : null;

  return (
    <section className="py-12 sm:py-20 lg:py-28 bg-[#FAF8F5] border-t border-[#DFD3C3]/60 relative" id="fotos-clientes">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 2xl:px-20">
        {/* Cabeçalho da Seção com Identificação, Título e Descrição Requisitados */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12 border-b border-[#DFD3C3]/80 pb-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="w-6 h-[2px] bg-[#8A5835]" />
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#8A5835] font-bold">
                GALERIA EXCLUSIVA DE CLIENTES
              </span>

              {/* Avaliação Média Real - Exibida SOMENTE se houver avaliações reais cadastradas */}
              {averageRating !== null && totalRatingsCount > 0 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#8A5835]/10 border border-[#8A5835]/20 text-[#8A5835] text-[11px] font-bold">
                  <Star className="w-3 h-3 fill-[#C29B68] text-[#C29B68]" />
                  <span>{averageRating} / 5.0</span>
                  <span className="text-[#5C4033]/70 font-normal">
                    ({totalRatingsCount} {totalRatingsCount === 1 ? 'avaliação real' : 'avaliações reais'})
                  </span>
                </div>
              )}
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl 2xl:text-5xl text-[#111111] font-bold tracking-tight">
              Fotos de Clientes
            </h2>

            <p className="text-xs sm:text-sm text-[#5C4033] mt-2 leading-relaxed">
              Fotografias reais de peças produzidas pela M&amp;A Ateliê de Marcenaria e compartilhadas por nossos clientes.
            </p>
          </div>

          {/* Botão de Gestão do Administrador (Acesso Autenticado) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(true)}
              className="text-[11px] uppercase tracking-wider font-bold text-[#8A5835] hover:text-[#111] flex items-center gap-1.5 px-3 py-1.5 border border-[#DFD3C3] bg-white hover:bg-[#F5EFE6] transition-colors cursor-pointer"
              title="Acessar painel do administrador para cadastrar ou gerenciar fotos reais"
            >
              <Lock className="w-3 h-3 text-[#8A5835]" />
              <span>Gerenciar Galeria</span>
            </button>
          </div>
        </div>

        {/* Indicador de Carregamento Discreto (apenas exibido se não houver dados em cache) */}
        {isDataLoading && photos.length === 0 && (
          <div className="py-16 text-center">
            <div className="inline-block w-6 h-6 border-2 border-[#8A5835] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-[#5C4033] font-medium">Carregando fotografias da galeria...</p>
          </div>
        )}

        {/* Estado Vazio Elegante (REGRA OBRIGATÓRIA: Sem dados fictícios nem cartões em branco) */}
        {!isDataLoading && photos.length === 0 && (
          <div className="py-14 sm:py-20 px-6 max-w-2xl mx-auto text-center bg-[#FAF8F5] border border-[#DFD3C3]/80 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#8A5835]/10 text-[#8A5835] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-5 h-5 text-[#8A5835]" />
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#111111] mb-2">
              Em breve, novas fotos de trabalhos realizados pela M&amp;A.
            </h3>
            <p className="text-xs sm:text-sm text-[#5C4033] leading-relaxed max-w-md mx-auto mb-6">
              Esta galeria documental exibe exclusivamente fotografias reais de peças entregues aos nossos clientes.
            </p>
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-[#C29B68]" />
              <span>Cadastrar Primeira Fotografia</span>
            </button>
          </div>
        )}

        {/* Abas de Filtros por Categoria Real (apenas se houver mais de uma categoria cadastrada) */}
        {photos.length > 0 && availableCategories.length > 1 && (
          <div className="flex items-center overflow-x-auto gap-2 mb-6 sm:mb-8 pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveCategory('todos')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === 'todos'
                  ? 'bg-[#2A1E17] text-white shadow-xs'
                  : 'bg-white text-[#5C4033] border border-[#DFD3C3] hover:bg-[#F5EFE6]'
              }`}
            >
              Todas ({photos.length})
            </button>

            {availableCategories.map((cat) => {
              const count = photos.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
              const isActive = activeCategory.toLowerCase() === cat.toLowerCase();

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#2A1E17] text-white shadow-xs'
                      : 'bg-white text-[#5C4033] border border-[#DFD3C3] hover:bg-[#F5EFE6]'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Grade Responsiva de Fotografias (2 Colunas no Desktop) */}
        {filteredPhotos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {filteredPhotos.map((photo, index) => (
              <CustomerPhotoCard
                key={photo.id}
                photo={photo}
                onSelect={(p) => {
                  setLightboxLoaded(false);
                  setSelectedPhoto(p);
                }}
                onGoToCustomizer={onGoToCustomizer}
                priority={index < 2}
              />
            ))}
          </div>
        )}

        {/* Modal de Visualização Ampliada (Lightbox) Preservando Resolução e Proporção */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="relative w-full max-w-4xl bg-white text-[#111111] shadow-2xl border border-[#DFD3C3] my-auto overflow-hidden flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar */}
              <div className="p-4 border-b border-[#DFD3C3] flex items-center justify-between bg-[#FAF8F5]">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#8A5835]/15 text-[#8A5835]">
                    {selectedPhoto.category}
                  </span>
                  <span className="font-serif font-bold text-sm sm:text-base text-[#111] truncate">
                    {selectedPhoto.title || 'Fotografia Original de Cliente'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="p-1.5 text-[#5C4033] hover:text-[#111] hover:bg-[#DFD3C3]/40 transition-colors cursor-pointer"
                  title="Fechar visualização"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Imagem Ampliada em Alta Resolução */}
              <div className="bg-[#111111] p-2 sm:p-4 flex items-center justify-center overflow-auto max-h-[65vh] min-h-[260px] relative">
                {!lightboxLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#1C1917]/80 text-[#DFD3C3]">
                    <div className="w-8 h-8 rounded-full border-2 border-[#8A5835] border-t-transparent animate-spin" />
                    <span className="text-xs font-semibold">Carregando imagem original...</span>
                  </div>
                )}
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title || selectedPhoto.category}
                  className={`max-h-[60vh] max-w-full object-contain mx-auto shadow-lg transition-opacity duration-300 ${
                    lightboxLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setLightboxLoaded(true)}
                />
              </div>

              {/* Informações Reais da Foto */}
              <div className="p-4 sm:p-6 bg-white space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {typeof selectedPhoto.rating === 'number' ? (
                    <div className="flex items-center gap-1 text-[#C29B68]">
                      {[...Array(selectedPhoto.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                      <span className="text-xs font-bold text-[#8A5835] ml-1 font-mono">
                        {selectedPhoto.rating}.0 / 5.0
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#5C4033] italic">Registro documental</span>
                  )}

                  {(selectedPhoto.clientName || selectedPhoto.city) && (
                    <p className="text-xs text-[#8A5835] font-bold">
                      {selectedPhoto.clientName && <span>Cliente: {selectedPhoto.clientName}</span>}
                      {selectedPhoto.clientName && selectedPhoto.city && <span> • </span>}
                      {selectedPhoto.city && <span>{selectedPhoto.city}</span>}
                    </p>
                  )}
                </div>

                {selectedPhoto.wood && (
                  <p className="text-xs text-[#5C4033]">
                    Espécie / Acabamento: <strong className="text-[#111]">{selectedPhoto.wood}</strong>
                  </p>
                )}

                {selectedPhoto.comment && (
                  <blockquote className="p-3.5 bg-[#FAF8F5] border-l-2 border-[#8A5835] text-xs sm:text-sm text-[#3E2D22] italic leading-relaxed">
                    "{selectedPhoto.comment}"
                  </blockquote>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#DFD3C3]/60">
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(null)}
                    className="text-xs font-bold text-[#5C4033] hover:text-[#111] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar à galeria</span>
                  </button>

                  {onGoToCustomizer && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(null);
                        onGoToCustomizer(selectedPhoto.category.toLowerCase().includes('porta') ? 'porta_copos' : 'tabua_carne');
                      }}
                      className="px-4 py-2 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C29B68]" />
                      <span>Solicitar orçamento sob medida</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Administração */}
        <CustomerPhotosAdminModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          onPhotosUpdated={fetchPhotos}
        />
      </div>
    </section>
  );
};
