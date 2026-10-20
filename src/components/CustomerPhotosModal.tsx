import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Lock,
  ZoomIn,
} from 'lucide-react';
import {
  CustomerPhoto,
  loadCustomerPhotos,
  getCachedCustomerPhotos,
} from '../services/customerPhotosService';
import { CustomerPhotosAdminModal } from './CustomerPhotosAdminModal';

export type PhotoCategory = 'tabua' | 'porta-copos' | 'moveis';

interface CustomerPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToCustomizer: (pieceType?: 'tabua_carne' | 'porta_copos' | 'movel') => void;
  categoryFilter?: PhotoCategory | null;
}

/**
 * Cartão de foto na galeria do modal com miniatura compacta,
 * skeleton de carregamento e transição suave.
 */
const ModalPhotoCard: React.FC<{
  photo: CustomerPhoto;
  onSelect: (photo: CustomerPhoto) => void;
}> = ({ photo, onSelect }) => {
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
    if (currentSrc !== photo.imageUrl && photo.imageUrl) {
      setCurrentSrc(photo.imageUrl);
      setImageLoaded(false);
    } else {
      setImageError(true);
    }
  };

  return (
    <div
      onClick={() => onSelect(photo)}
      className="bg-white border border-[#DFD3C3] overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div className="relative aspect-[16/10] bg-[#2A1E17] overflow-hidden">
        {/* Skeleton de carregamento */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-[#2A1E17]/25 animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-[#8A5835]/40 border-t-transparent animate-spin" />
          </div>
        )}

        <img
          src={currentSrc}
          alt={photo.title || photo.category}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
          className={`w-full h-full object-cover group-hover:scale-104 transition-all duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#111111]/85 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 z-10">
          {photo.category}
        </span>

        {/* Botão Ver Foto */}
        <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1 z-10">
          <ZoomIn className="w-3 h-3 text-[#C29B68]" />
          <span>Ver</span>
        </div>
      </div>

      <div className="p-3 sm:p-4 bg-white flex-1 flex flex-col justify-between">
        <div>
          {typeof photo.rating === 'number' && (
            <div className="flex items-center gap-0.5 text-[#C29B68] text-xs mb-1">
              {[...Array(photo.rating)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
              <span className="text-[10px] text-[#8A5835] ml-1 font-mono font-bold">{photo.rating}.0</span>
            </div>
          )}

          {photo.title && (
            <h4 className="font-serif text-sm sm:text-base font-bold text-[#111] line-clamp-1 mb-1">
              {photo.title}
            </h4>
          )}

          {(photo.clientName || photo.city) && (
            <p className="text-[11px] text-[#8A5835] font-semibold truncate mb-1">
              {photo.clientName && <span>{photo.clientName}</span>}
              {photo.clientName && photo.city && <span> • </span>}
              {photo.city && <span>{photo.city}</span>}
            </p>
          )}

          {photo.comment && (
            <p className="text-xs text-[#5C4033] italic line-clamp-2 mt-1">
              "{photo.comment}"
            </p>
          )}
        </div>

        <div className="pt-3 mt-2 border-t border-[#DFD3C3]/50 flex items-center justify-between text-xs font-bold text-[#8A5835]">
          <span>Ver detalhes</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export const CustomerPhotosModal: React.FC<CustomerPhotosModalProps> = ({
  isOpen,
  onClose,
  onGoToCustomizer,
  categoryFilter = null,
}) => {
  // Inicialização com cache local instantâneo (0ms)
  const [photos, setPhotos] = useState<CustomerPhoto[]>(() => getCachedCustomerPhotos(true));
  const [loading, setLoading] = useState<boolean>(() => getCachedCustomerPhotos(true).length === 0);
  const [selectedPhoto, setSelectedPhoto] = useState<CustomerPhoto | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [fullImageLoaded, setFullImageLoaded] = useState(false);

  const fetchPhotos = async () => {
    if (photos.length === 0) {
      setLoading(true);
    }
    try {
      const data = await loadCustomerPhotos(true); // Apenas publicadas
      if (Array.isArray(data)) {
        setPhotos(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      let isMounted = true;
      const safetyTimer = setTimeout(() => {
        if (isMounted) setLoading(false);
      }, 2800);

      fetchPhotos().finally(() => {
        clearTimeout(safetyTimer);
        if (isMounted) setLoading(false);
      });

      setSelectedPhoto(null);
      setFullImageLoaded(false);

      return () => {
        isMounted = false;
        clearTimeout(safetyTimer);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (categoryFilter === 'tabua') {
      setActiveCategory('Tábuas de Carne');
    } else if (categoryFilter === 'porta-copos') {
      setActiveCategory('Porta-Copos');
    } else if (categoryFilter === 'moveis') {
      setActiveCategory('Pequenos Móveis');
    } else {
      setActiveCategory('todos');
    }
  }, [categoryFilter]);

  if (!isOpen) return null;

  // Categorias disponíveis
  const availableCategories = Array.from(new Set(photos.map((p) => p.category))).filter(Boolean);

  // Filtragem estrita
  const filteredPhotos = photos.filter((photo) => {
    if (activeCategory === 'todos') return true;
    return photo.category.toLowerCase().includes(activeCategory.toLowerCase());
  });

  // Cálculo real da nota média e total de avaliações reais
  const ratedPhotos = photos.filter((p) => typeof p.rating === 'number' && p.rating >= 1);
  const totalRatings = ratedPhotos.length;
  const averageRating =
    totalRatings > 0
      ? (ratedPhotos.reduce((acc, p) => acc + (p.rating || 0), 0) / totalRatings).toFixed(1)
      : null;

  const handleActionClick = (pieceCategory?: string) => {
    onClose();
    const cat = (pieceCategory || activeCategory).toLowerCase();
    if (cat.includes('porta')) {
      onGoToCustomizer('porta_copos');
    } else if (cat.includes('móvel') || cat.includes('movel') || cat.includes('mesa') || cat.includes('banqueta')) {
      onGoToCustomizer('movel');
    } else {
      onGoToCustomizer('tabua_carne');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#FAF8F5] text-[#111111] shadow-2xl border border-[#DFD3C3] my-auto overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#DFD3C3] flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-[#8A5835]/15 text-[#8A5835] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                GALERIA EXCLUSIVA DE CLIENTES
              </span>

              {/* Avaliação Média Real - Apenas se houver notas reais cadastradas */}
              {averageRating !== null && totalRatings > 0 && (
                <span className="text-xs text-[#8A5835] font-semibold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#C29B68] text-[#C29B68]" /> {averageRating}/5 ({totalRatings} {totalRatings === 1 ? 'avaliação' : 'avaliações'})
                </span>
              )}
            </div>
            <h3 className="font-serif text-lg sm:text-2xl font-bold text-[#1C1917]">
              Fotos de Clientes
            </h3>
            <p className="text-xs sm:text-sm text-[#5C4033] mt-0.5 max-w-3xl leading-relaxed">
              Fotografias reais de peças produzidas pela M&amp;A Ateliê de Marcenaria e compartilhadas por nossos clientes.
            </p>
          </div>

          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="p-2 text-xs font-bold text-[#8A5835] hover:text-[#111] hover:bg-[#F0EAE1] transition-colors flex items-center gap-1 cursor-pointer"
              title="Acessar painel administrativo para cadastrar fotos reais"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Gerenciar</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#5C4033] hover:text-[#111111] hover:bg-[#F0EAE1] transition-colors cursor-pointer"
              title="Fechar galeria"
              aria-label="Fechar galeria"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categoria Selector Tabs (se houver mais de uma categoria cadastrada) */}
        {availableCategories.length > 1 && (
          <div className="px-4 sm:px-6 py-2.5 bg-[#F5EFE6]/80 border-b border-[#DFD3C3]/60 flex items-center gap-2 overflow-x-auto text-xs font-bold uppercase tracking-wider no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveCategory('todos')}
              className={`px-3 py-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === 'todos'
                  ? 'bg-[#2A1E17] text-white shadow-xs'
                  : 'bg-white text-[#5C4033] hover:bg-[#DFD3C3]/50'
              }`}
            >
              Todas ({photos.length})
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-[#2A1E17] text-white shadow-xs'
                    : 'bg-white text-[#5C4033] hover:bg-[#DFD3C3]/50'
                }`}
              >
                {cat} ({photos.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length})
              </button>
            ))}
          </div>
        )}

        {/* Conteúdo da Galeria */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block w-6 h-6 border-2 border-[#8A5835] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-[#5C4033]">Carregando fotos reais de clientes...</p>
            </div>
          ) : photos.length === 0 ? (
            /* Estado Vazio Obrigatório (Sem fotos fictícias) */
            <div className="py-16 px-6 text-center bg-white border border-[#DFD3C3]">
              <Sparkles className="w-8 h-8 text-[#8A5835] mx-auto mb-3 opacity-80" />
              <h4 className="font-serif text-lg font-bold text-[#111] mb-2">
                Em breve, novas fotos de trabalhos realizados pela M&amp;A.
              </h4>
              <p className="text-xs text-[#5C4033] max-w-md mx-auto mb-5 leading-relaxed">
                Esta seção é uma galeria documental e exibe exclusivamente registros reais cadastrados pelo atelier.
              </p>
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(true)}
                className="px-5 py-2.5 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow"
              >
                Cadastrar Primeira Fotografia
              </button>
            </div>
          ) : selectedPhoto ? (
            /* Selected Photo Detailed Lightbox View */
            <div className="bg-white border border-[#DFD3C3] p-4 sm:p-6 space-y-4">
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="text-xs text-[#8A5835] hover:text-[#111111] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para todas as fotos</span>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="relative aspect-[4/3] bg-[#111] overflow-hidden border border-[#DFD3C3] flex items-center justify-center">
                  {!fullImageLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#1C1917]/80 text-[#DFD3C3]">
                      <div className="w-7 h-7 rounded-full border-2 border-[#8A5835] border-t-transparent animate-spin" />
                      <span className="text-xs font-semibold">Carregando imagem original...</span>
                    </div>
                  )}
                  <img
                    src={selectedPhoto.imageUrl}
                    alt={selectedPhoto.title || selectedPhoto.category}
                    className={`w-full h-full object-contain transition-opacity duration-300 ${
                      fullImageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setFullImageLoaded(true)}
                  />
                  <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 z-10">
                    {selectedPhoto.category}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    {typeof selectedPhoto.rating === 'number' && (
                      <div className="flex items-center gap-1 text-[#C29B68] mb-1">
                        {[...Array(selectedPhoto.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                        <span className="text-xs font-bold text-[#8A5835] ml-1 font-mono">
                          {selectedPhoto.rating}.0
                        </span>
                      </div>
                    )}
                    {selectedPhoto.title && (
                      <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917]">
                        {selectedPhoto.title}
                      </h4>
                    )}
                    {(selectedPhoto.clientName || selectedPhoto.city) && (
                      <p className="text-xs text-[#8A5835] font-semibold mt-1">
                        {selectedPhoto.clientName && <span>Cliente: {selectedPhoto.clientName}</span>}
                        {selectedPhoto.clientName && selectedPhoto.city && <span> • </span>}
                        {selectedPhoto.city && <span>{selectedPhoto.city}</span>}
                      </p>
                    )}
                    {selectedPhoto.wood && (
                      <p className="text-xs text-[#5C4033] mt-0.5">
                        Madeira: <span className="font-semibold text-[#111]">{selectedPhoto.wood}</span>
                      </p>
                    )}
                  </div>

                  {selectedPhoto.comment && (
                    <blockquote className="p-4 bg-[#FAF8F5] border-l-2 border-[#8A5835] text-xs sm:text-sm text-[#3E2D22] italic leading-relaxed">
                      "{selectedPhoto.comment}"
                    </blockquote>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleActionClick(selectedPhoto.category)}
                      className="flex-1 py-3 px-5 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest text-center transition-colors flex items-center justify-center gap-2 cursor-pointer shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C29B68]" />
                      <span>Personalizar Peça Similar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPhoto(null)}
                      className="py-3 px-4 border border-[#DFD3C3] text-xs font-bold uppercase tracking-wider text-[#5C4033] hover:text-[#111] hover:bg-[#F5EFE6] transition-colors cursor-pointer"
                    >
                      Outras Fotos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Grid of Customer Photos - 2 columns com miniaturas otimizadas */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {filteredPhotos.map((photo) => (
                <ModalPhotoCard
                  key={photo.id}
                  photo={photo}
                  onSelect={(p) => {
                    setFullImageLoaded(false);
                    setSelectedPhoto(p);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal de Gestão do Administrador */}
        <CustomerPhotosAdminModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          onPhotosUpdated={fetchPhotos}
        />
      </div>
    </div>
  );
};
