import React, { useState } from 'react';
import { X, Star, Sparkles, ChevronRight, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

export interface CustomerPhoto {
  id: string;
  imageUrl: string;
  title: string;
  clientName: string;
  city: string;
  wood: string;
  rating: number;
  comment: string;
  tag: string;
}

export const CUSTOMER_PHOTOS: CustomerPhoto[] = [
  {
    id: 'foto-1',
    imageUrl: '/tabua-personalizada.png',
    title: 'Tábua Personalizada Usinada em CNC com Brasão Resinado',
    clientName: 'Marcelo Ribeiro',
    city: 'São Paulo - SP',
    wood: 'Pinus & Angelim com Resina Atóxica',
    rating: 5,
    comment:
      'Acabamento absurdo! A canaleta é profunda e retém perfeitamente o suco do churrasco, e o brasão em CNC com resina preta ficou com um brilho e precisão impecáveis.',
    tag: 'Times & Brasões',
  },
  {
    id: 'foto-2',
    imageUrl: '/cliente-churrasco-1.jpg',
    title: 'Tábua Maciça em Ação no Churrasco Gourmet',
    clientName: 'Eduardo Silveira',
    city: 'Curitiba - PR',
    wood: 'Madeira Maciça com Canaleta Contínua',
    rating: 5,
    comment:
      'Uso todo final de semana. A madeira é pesada, muito estável na bancada e a usinagem da canaleta não deixa vazar nada. Todo mundo elogia no churrasco.',
    tag: 'Churrasco & Uso Real',
  },
  {
    id: 'foto-3',
    imageUrl: '/cliente-entrega-2.jpg',
    title: 'Unboxing de Luxo com Brasão de Família e Certificado',
    clientName: 'Dra. Patrícia M.',
    city: 'Belo Horizonte - MG',
    wood: 'Madeira Nobre Maciça com Entalhe CNC',
    rating: 5,
    comment:
      'Encomendei para presentear meu pai no aniversário de 60 anos dele. Veio na caixa com certificado de autenticidade numerado. Emocionante a riqueza dos detalhes.',
    tag: 'Entrega & Presente',
  },
  {
    id: 'foto-4',
    imageUrl: '/tabua-de-time.jpg',
    title: 'Tábua Artesanal Maciça Usinada com Brasão Oficial',
    clientName: 'Thiago Valente',
    city: 'Porto Alegre - RS',
    wood: 'Madeira Maciça Natural com Selagem Mineral',
    rating: 5,
    comment:
      'A definição da fresa CNC na madeira é perfeita. Superfície suave que não estraga o fio da faca e fácil de higienizar.',
    tag: 'Times & Brasões',
  },
  {
    id: 'foto-5',
    imageUrl: '/porta-copos-personalizados.jpg',
    title: 'Porta-Copos Maciços Usinados em CNC para Área Gourmet',
    clientName: 'Rodrigo Alcantara',
    city: 'Campinas - SP',
    wood: 'Madeira Maciça Nobre com Entalhe CNC',
    rating: 5,
    comment:
      'Encomendei o kit de porta-copos com entalhe CNC para o bar da minha varanda. O nível de precisão no relevo e a proteção contra umidade são excepcionais!',
    tag: 'Porta-Copos & Acessórios',
  },
];

interface CustomerPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToCustomizer: () => void;
}

export const CustomerPhotosModal: React.FC<CustomerPhotosModalProps> = ({
  isOpen,
  onClose,
  onGoToCustomizer,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<CustomerPhoto | null>(null);
  const [activeTab, setActiveTab] = useState<string>('todos');

  if (!isOpen) return null;

  const filteredPhotos =
    activeTab === 'todos'
      ? CUSTOMER_PHOTOS
      : CUSTOMER_PHOTOS.filter((p) => p.tag.toLowerCase().includes(activeTab.toLowerCase()));

  const handlePersonalizarClick = () => {
    onClose();
    onGoToCustomizer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-5xl bg-[#FAF8F5] text-[#111111] shadow-2xl border border-[#DFD3C3] my-auto overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-7 border-b border-[#DFD3C3] flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-[#8A5835]/15 text-[#8A5835] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Compras Reais
              </span>
              <span className="text-xs text-[#8A5835] font-semibold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#C29B68] text-[#C29B68]" /> 4.9/5 (120+ avaliações)
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917]">
              Galeria de Clientes • Tábuas &amp; Porta-Copos Personalizados M&amp;A
            </h3>
            <p className="text-xs sm:text-sm text-[#5C4033] mt-0.5">
              Fotos enviadas por clientes reais que encomendaram suas tábuas e porta-copos usinados com precisão CNC e resina.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 text-[#5C4033] hover:text-[#111111] hover:bg-[#F0EAE1] transition-colors cursor-pointer"
            title="Fechar galeria"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-5 sm:px-7 py-3 bg-[#F5EFE6]/60 border-b border-[#DFD3C3]/60 flex items-center gap-2 overflow-x-auto text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('todos')}
            className={`px-3.5 py-1.5 transition-colors cursor-pointer ${
              activeTab === 'todos'
                ? 'bg-[#2A1E17] text-white'
                : 'bg-white text-[#5C4033] hover:bg-[#DFD3C3]/40'
            }`}
          >
            Todas ({CUSTOMER_PHOTOS.length})
          </button>
          <button
            onClick={() => setActiveTab('porta-copos')}
            className={`px-3.5 py-1.5 transition-colors cursor-pointer ${
              activeTab === 'porta-copos'
                ? 'bg-[#2A1E17] text-white'
                : 'bg-white text-[#5C4033] hover:bg-[#DFD3C3]/40'
            }`}
          >
            Porta-Copos
          </button>
          <button
            onClick={() => setActiveTab('churrasco')}
            className={`px-3.5 py-1.5 transition-colors cursor-pointer ${
              activeTab === 'churrasco'
                ? 'bg-[#2A1E17] text-white'
                : 'bg-white text-[#5C4033] hover:bg-[#DFD3C3]/40'
            }`}
          >
            Churrasco &amp; Uso Real
          </button>
          <button
            onClick={() => setActiveTab('times')}
            className={`px-3.5 py-1.5 transition-colors cursor-pointer ${
              activeTab === 'times'
                ? 'bg-[#2A1E17] text-white'
                : 'bg-white text-[#5C4033] hover:bg-[#DFD3C3]/40'
            }`}
          >
            Times &amp; Brasões
          </button>
          <button
            onClick={() => setActiveTab('entrega')}
            className={`px-3.5 py-1.5 transition-colors cursor-pointer ${
              activeTab === 'entrega'
                ? 'bg-[#2A1E17] text-white'
                : 'bg-white text-[#5C4033] hover:bg-[#DFD3C3]/40'
            }`}
          >
            Unboxing &amp; Presentes
          </button>
        </div>

        {/* Photo Grid / Detail */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          {selectedPhoto ? (
            /* Selected Photo Detailed Lightbox View */
            <div className="bg-white border border-[#DFD3C3] p-4 sm:p-6 space-y-4">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-xs text-[#8A5835] hover:text-[#111111] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer mb-2"
              >
                ← Voltar para todas as fotos
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="relative aspect-[4/3] bg-[#111] overflow-hidden border border-[#DFD3C3]">
                  <img
                    src={selectedPhoto.imageUrl}
                    alt={selectedPhoto.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1">
                    {selectedPhoto.tag}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-1 text-[#C29B68] mb-1">
                      {[...Array(selectedPhoto.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917]">
                      {selectedPhoto.title}
                    </h4>
                    <p className="text-xs text-[#8A5835] font-semibold mt-1">
                      {selectedPhoto.clientName} • {selectedPhoto.city}
                    </p>
                    <p className="text-xs text-[#5C4033] mt-0.5">
                      Madeira: <span className="font-semibold text-[#111]">{selectedPhoto.wood}</span>
                    </p>
                  </div>

                  <blockquote className="p-4 bg-[#FAF8F5] border-l-2 border-[#8A5835] text-xs sm:text-sm text-[#3E2D22] italic leading-relaxed">
                    "{selectedPhoto.comment}"
                  </blockquote>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handlePersonalizarClick}
                      className="flex-1 py-3 px-5 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest text-center transition-colors flex items-center justify-center gap-2 cursor-pointer shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Quero Uma Tábua Igual</span>
                    </button>
                    <button
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
            /* Grid of Customer Photos - 2 columns on mobile */
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-6">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="bg-white border border-[#DFD3C3] overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] bg-[#2A1E17] overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#111111]/85 backdrop-blur-md text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2.5 py-0.5 sm:py-1 truncate max-w-[85%]">
                      {photo.tag}
                    </span>

                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 text-white">
                      <div className="flex items-center gap-0.5 sm:gap-1 text-[#C29B68] text-xs mb-0.5 sm:mb-1">
                        {[...Array(photo.rating)].map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                        ))}
                        <span className="text-[9px] sm:text-[10px] text-white/80 ml-0.5 sm:ml-1 font-mono">5.0</span>
                      </div>
                      <p className="font-serif text-xs sm:text-base font-bold text-white line-clamp-1">
                        {photo.title}
                      </p>
                      <p className="text-[9px] sm:text-[11px] text-[#DFD3C3] mt-0.5 truncate">
                        {photo.clientName} • {photo.city}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-4 bg-[#FAF8F5] border-t border-[#DFD3C3]/60 flex items-center justify-between text-xs text-[#5C4033]">
                    <span className="truncate max-w-[260px] italic text-[10px] sm:text-xs">"{photo.comment}"</span>
                    <span className="font-bold text-[#8A5835] group-hover:translate-x-1 transition-transform flex items-center gap-0.5 ml-1.5 sm:ml-2 shrink-0 text-[10px] sm:text-xs">
                      Ver <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Social Proof Bar */}
          <div className="p-4 sm:p-5 bg-[#F5EFE6] border border-[#DFD3C3] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#8A5835] text-white flex items-center justify-center font-bold font-serif">
                M&A
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#1C1917]">
                  Todas as tábuas usinadas com precisão CNC sob medida
                </p>
                <p className="text-[11px] text-[#5C4033]">
                  Canaleta de suco contínua profunda, acabamento culinário atóxico e certificado exclusivo.
                </p>
              </div>
            </div>

            <button
              onClick={handlePersonalizarClick}
              className="py-3 px-6 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalizar a Minha Agora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
