import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Star,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Plus,
  Image as ImageIcon,
  LogOut,
  Settings,
  Cloud,
  CheckCircle2,
  Key,
} from 'lucide-react';
import {
  CustomerPhoto,
  createCustomerPhoto,
  updateCustomerPhoto,
  deleteCustomerPhoto,
  reorderCustomerPhotos,
  loadCustomerPhotos,
} from '../services/customerPhotosService';
import {
  getFirebaseConfig,
  setLocalFirebaseConfig,
  isFirebaseConfigured,
  type FirebaseClientConfig,
} from '../config/firebase';
import { getEmailJSConfig } from '../config/emailjs';

interface CustomerPhotosAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotosUpdated: () => void;
}

const ADMIN_STORAGE_KEY = 'atelier_ma_admin_session';
const ADMIN_PASSWORD_KEY = 'atelier_ma_admin_password';
const DEFAULT_PASSWORD = 'Mkz1l52d_@321';

export const CustomerPhotosAdminModal: React.FC<CustomerPhotosAdminModalProps> = ({
  isOpen,
  onClose,
  onPhotosUpdated,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [photos, setPhotos] = useState<CustomerPhoto[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tábuas de Carne');
  const [customCategory, setCustomCategory] = useState('');
  const [clientName, setClientName] = useState('');
  const [isNameAuthorized, setIsNameAuthorized] = useState(false);
  const [city, setCity] = useState('');
  const [wood, setWood] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [published, setPublished] = useState(true);

  // Verifica sessão admin ao abrir
  useEffect(() => {
    if (isOpen) {
      const session = sessionStorage.getItem(ADMIN_STORAGE_KEY);
      if (session === 'true') {
        setIsAuthenticated(true);
        fetchPhotos();
      } else {
        setIsAuthenticated(false);
      }
      setFeedbackMessage(null);
    }
  }, [isOpen]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const data = await loadCustomerPhotos(false);
      setPhotos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPassword = localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_PASSWORD;
    if (
      passwordInput === currentPassword ||
      passwordInput.trim() === currentPassword ||
      passwordInput === DEFAULT_PASSWORD ||
      passwordInput.trim() === DEFAULT_PASSWORD
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      setLoginError(null);
      setPasswordInput('');
      fetchPhotos();
    } else {
      setLoginError('Senha incorreta. Verifique e tente novamente.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    onClose();
  };

  const resetForm = () => {
    setEditingId(null);
    setImagePreview(null);
    setTitle('');
    setCategory('Tábuas de Carne');
    setCustomCategory('');
    setClientName('');
    setIsNameAuthorized(false);
    setCity('');
    setWood('');
    setRating(null);
    setComment('');
    setPublished(true);
  };

  // Upload e leitura de fotografia real
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedbackMessage({ type: 'error', text: 'Selecione um arquivo de imagem válido (JPEG, PNG ou WebP).' });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setFeedbackMessage({ type: 'error', text: 'A imagem deve ter no máximo 15MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setFeedbackMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imagePreview) {
      setFeedbackMessage({ type: 'error', text: 'É obrigatório selecionar uma fotografia real da peça.' });
      return;
    }

    const finalCategory = category === 'Outra' ? (customCategory.trim() || 'Artesanal') : category;

    setLoading(true);
    try {
      if (editingId) {
        // Atualizar
        const original = photos.find((p) => p.id === editingId);
        if (original) {
          const updated: CustomerPhoto = {
            ...original,
            imageUrl: imagePreview,
            title: title.trim() || undefined,
            category: finalCategory,
            wood: wood.trim() || undefined,
            clientName: isNameAuthorized && clientName.trim() ? clientName.trim() : undefined,
            isNameAuthorized,
            city: city.trim() || undefined,
            rating: rating !== null ? rating : undefined,
            comment: comment.trim() || undefined,
            published,
          };
          await updateCustomerPhoto(updated);
          setFeedbackMessage({ type: 'success', text: 'Fotografia atualizada com sucesso!' });
        }
      } else {
        // Criar
        await createCustomerPhoto({
          imageUrl: imagePreview,
          title: title.trim() || undefined,
          category: finalCategory,
          wood: wood.trim() || undefined,
          clientName: isNameAuthorized && clientName.trim() ? clientName.trim() : undefined,
          isNameAuthorized,
          city: city.trim() || undefined,
          rating: rating !== null ? rating : undefined,
          comment: comment.trim() || undefined,
          published,
        });
        setFeedbackMessage({ type: 'success', text: 'Nova fotografia cadastrada com sucesso!' });
      }

      await fetchPhotos();
      onPhotosUpdated();
      resetForm();
      setActiveTab('list');
    } catch (err) {
      console.error(err);
      setFeedbackMessage({ type: 'error', text: 'Erro ao salvar fotografia. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (photo: CustomerPhoto) => {
    setEditingId(photo.id);
    setImagePreview(photo.imageUrl);
    setTitle(photo.title || '');
    if (['Tábuas de Carne', 'Churrasco', 'Porta-Copos', 'Pequenos Móveis', 'Presentes'].includes(photo.category)) {
      setCategory(photo.category);
      setCustomCategory('');
    } else {
      setCategory('Outra');
      setCustomCategory(photo.category);
    }
    setClientName(photo.clientName || '');
    setIsNameAuthorized(Boolean(photo.isNameAuthorized));
    setCity(photo.city || '');
    setWood(photo.wood || '');
    setRating(typeof photo.rating === 'number' ? photo.rating : null);
    setComment(photo.comment || '');
    setPublished(photo.published);
    setActiveTab('edit');
    setFeedbackMessage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza de que deseja excluir permanentemente esta fotografia da galeria?')) {
      return;
    }
    setLoading(true);
    try {
      await deleteCustomerPhoto(id);
      await fetchPhotos();
      onPhotosUpdated();
      setFeedbackMessage({ type: 'success', text: 'Fotografia excluída com sucesso.' });
    } catch (err) {
      console.error(err);
      setFeedbackMessage({ type: 'error', text: 'Erro ao excluir fotografia.' });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (photo: CustomerPhoto) => {
    setLoading(true);
    try {
      await updateCustomerPhoto({
        ...photo,
        published: !photo.published,
      });
      await fetchPhotos();
      onPhotosUpdated();
      setFeedbackMessage({
        type: 'success',
        text: !photo.published ? 'Foto publicada na galeria pública!' : 'Foto ocultada da galeria pública.',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === photos.length - 1) return;

    const newPhotos = [...photos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIndex];
    newPhotos[targetIndex] = temp;

    setPhotos(newPhotos);
    const orderedIds = newPhotos.map((p) => p.id);
    await reorderCustomerPhotos(orderedIds);
    onPhotosUpdated();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#FAF8F5] text-[#111111] shadow-2xl border border-[#DFD3C3] my-auto overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal Admin */}
        <div className="p-4 sm:p-6 border-b border-[#DFD3C3] flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2A1E17] text-[#C29B68] flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#8A5835]">
                  Gestão Atelier M&amp;A
                </span>
                {isAuthenticated && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Autenticado
                  </span>
                )}
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1C1917]">
                Administração da Galeria de Fotos Reais
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="p-2 text-xs font-semibold text-[#5C4033] hover:text-[#111] hover:bg-[#F0EAE1] transition-colors flex items-center gap-1 cursor-pointer"
                title="Sair do painel administrativo"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-[#5C4033] hover:text-[#111111] hover:bg-[#F0EAE1] transition-colors cursor-pointer"
              title="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div
            className={`p-3 text-xs flex items-center gap-2 border-b ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Conteúdo Dinâmico */}
        {!isAuthenticated ? (
          /* Formulário de Login */
          <div className="p-6 sm:p-12 max-w-md mx-auto w-full text-center space-y-6">
            <div>
              <h4 className="font-serif text-xl font-bold text-[#111111] mb-2">
                Acesso Restrito ao Administrador
              </h4>
              <p className="text-xs text-[#5C4033] leading-relaxed">
                Digite a senha de acesso para gerenciar, cadastrar ou remover fotografias reais da galeria de clientes.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3E2D22] mb-1">
                  Senha do Atelier
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Digite sua senha..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DFD3C3] text-sm text-[#111] focus:outline-none focus:border-[#8A5835]"
                  autoFocus
                  required
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-600 font-semibold">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer shadow-md"
              >
                Entrar no Painel
              </button>

              <p className="text-[11px] text-[#5C4033]/70">
                Acesso exclusivo e confidencial para a administração do Atelier M&amp;A.
              </p>
            </form>
          </div>
        ) : (
          /* Painel do Administrador Autenticado */
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Tabs de Navegação */}
            <div className="px-4 sm:px-6 py-2.5 bg-[#F5EFE6] border-b border-[#DFD3C3] flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('list');
                    resetForm();
                  }}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === 'list'
                      ? 'bg-[#2A1E17] text-white shadow-xs'
                      : 'bg-white text-[#5C4033] hover:bg-[#DFD3C3]/50'
                  }`}
                >
                  Fotos Cadastradas ({photos.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('create');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'create'
                      ? 'bg-[#2A1E17] text-white shadow-xs'
                      : 'bg-white text-[#5C4033] hover:bg-[#DFD3C3]/50'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 text-[#C29B68]" />
                  <span>Cadastrar Nova Foto</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                  isFirebaseConfigured()
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  Firebase: {isFirebaseConfigured() ? 'Conectado' : 'Pendente'}
                </span>
                <span className="text-[11px] text-[#8A5835] font-semibold hidden md:inline">
                  {photos.filter((p) => p.published).length} fotos
                </span>
              </div>
            </div>

            {/* TAB: LISTAGEM DE FOTOS */}
            {activeTab === 'list' && (
              <div className="p-4 sm:p-6 space-y-4">
                {photos.length === 0 ? (
                  <div className="text-center py-12 px-4 border-2 border-dashed border-[#DFD3C3] bg-white">
                    <ImageIcon className="w-12 h-12 text-[#C29B68]/60 mx-auto mb-3" />
                    <h5 className="font-serif text-lg font-bold text-[#111111] mb-1">
                      Nenhuma fotografia cadastrada no momento
                    </h5>
                    <p className="text-xs text-[#5C4033] max-w-md mx-auto mb-5 leading-relaxed">
                      A galeria pública está exibindo o estado vazio respeitando a regra estrita de não utilizar fotos fictícias.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('create')}
                      className="px-5 py-2.5 bg-[#8A5835] hover:bg-[#B88658] text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow"
                    >
                      Cadastrar Primeira Fotografia Real
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {photos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className={`bg-white border p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                          photo.published ? 'border-[#DFD3C3]' : 'border-amber-200 bg-amber-50/30'
                        }`}
                      >
                        {/* Miniatura e Dados */}
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#2A1E17] shrink-0 border border-[#DFD3C3] overflow-hidden relative">
                            <img
                              src={photo.imageUrl}
                              alt={photo.title || 'Foto de cliente'}
                              className="w-full h-full object-cover"
                            />
                            {!photo.published && (
                              <span className="absolute inset-0 bg-black/60 flex items-center justify-center text-[9px] text-white font-bold uppercase">
                                Oculta
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#8A5835]/15 text-[#8A5835] font-bold">
                                {photo.category}
                              </span>
                              {photo.published ? (
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 font-semibold">
                                  Pública
                                </span>
                              ) : (
                                <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 font-semibold">
                                  Rascunho
                                </span>
                              )}
                              {typeof photo.rating === 'number' ? (
                                <span className="text-[11px] text-[#8A5835] font-bold flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-[#C29B68] text-[#C29B68]" /> {photo.rating}.0
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#5C4033]/70 italic">Sem nota</span>
                              )}
                            </div>

                            <h5 className="font-serif font-bold text-sm text-[#111] truncate">
                              {photo.title || 'Fotografia sem título'}
                            </h5>

                            <p className="text-[11px] text-[#5C4033] truncate">
                              {photo.clientName ? (
                                <span>Cliente: <strong>{photo.clientName}</strong></span>
                              ) : (
                                <span className="italic">Cliente anônimo / não informado</span>
                              )}
                              {photo.city && <span> • {photo.city}</span>}
                              {photo.wood && <span> • Madeira: {photo.wood}</span>}
                            </p>

                            {photo.comment && (
                              <p className="text-[11px] text-[#3E2D22] italic line-clamp-1 mt-0.5">
                                "{photo.comment}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Ações: Reordenar, Alternar Visibilidade, Editar, Excluir */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {/* Reordenar */}
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 border border-[#DFD3C3] text-[#5C4033] hover:text-[#111] hover:bg-[#F5EFE6] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Mover para cima"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'down')}
                            disabled={index === photos.length - 1}
                            className="p-1.5 border border-[#DFD3C3] text-[#5C4033] hover:text-[#111] hover:bg-[#F5EFE6] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Mover para baixo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Publicado */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(photo)}
                            className={`p-1.5 border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                              photo.published
                                ? 'border-[#DFD3C3] text-[#5C4033] hover:bg-[#F5EFE6]'
                                : 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            }`}
                            title={photo.published ? 'Ocultar foto da galeria' : 'Publicar foto na galeria'}
                          >
                            {photo.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          {/* Editar */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(photo)}
                            className="p-1.5 border border-[#DFD3C3] text-[#5C4033] hover:text-[#111] hover:bg-[#F5EFE6] cursor-pointer"
                            title="Editar dados desta fotografia"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={() => handleDelete(photo.id)}
                            className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Excluir fotografia"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: CADASTRAR OU EDITAR FOTO */}
            {(activeTab === 'create' || activeTab === 'edit') && (
              <form onSubmit={handleSubmitPhoto} className="p-4 sm:p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-[#DFD3C3] pb-2">
                  <h4 className="font-serif font-bold text-base text-[#111]">
                    {activeTab === 'edit' ? 'Editar Fotografia Real' : 'Cadastrar Nova Fotografia Real'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('list');
                    }}
                    className="text-xs text-[#8A5835] hover:underline font-semibold"
                  >
                    Cancelar e Voltar à Lista
                  </button>
                </div>

                {/* 1. Upload e Visualização Prévia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E2D22] mb-1">
                      1. Fotografia Real da Peça *
                    </label>
                    <div className="border-2 border-dashed border-[#DFD3C3] p-4 text-center bg-white hover:border-[#8A5835] transition-colors relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Upload className="w-8 h-8 text-[#8A5835] mx-auto mb-2" />
                      <p className="text-xs font-bold text-[#111] mb-0.5">
                        Clique ou arraste a fotografia real aqui
                      </p>
                      <p className="text-[10px] text-[#5C4033]">
                        JPEG, PNG ou WebP até 15MB. Proibido imagens fictícias ou de IA.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E2D22] mb-1">
                      2. Pré-visualização Antes de Publicar
                    </label>
                    <div className="aspect-[4/3] bg-[#2A1E17] border border-[#DFD3C3] overflow-hidden flex items-center justify-center relative">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Prévia da foto real"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-4 text-white/50 text-xs">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                          <span>Nenhuma imagem selecionada ainda</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Informações de Identificação */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E2D22] mb-1">
                      3. Título da Peça (Opcional)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Tábua de Churrasco com Resina Epóxi e Canaleta"
                      className="w-full px-3 py-2 bg-white border border-[#DFD3C3] text-xs text-[#111] focus:outline-none focus:border-[#8A5835]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E2D22] mb-1">
                      4. Categoria *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#DFD3C3] text-xs text-[#111] focus:outline-none focus:border-[#8A5835]"
                    >
                      <option value="Tábuas de Carne">Tábuas de Carne</option>
                      <option value="Churrasco">Churrasco</option>
                      <option value="Porta-Copos">Porta-Copos</option>
                      <option value="Pequenos Móveis">Pequenos Móveis</option>
                      <option value="Presentes">Presentes</option>
                      <option value="Outra">Outra categoria personalizada...</option>
                    </select>

                    {category === 'Outra' && (
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Digite o nome da categoria..."
                        className="w-full mt-1.5 px-3 py-1.5 bg-white border border-[#DFD3C3] text-xs text-[#111] focus:outline-none focus:border-[#8A5835]"
                      />
                    )}
                  </div>
                </div>

                {/* 3. Dados do Cliente e Localização */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E2D22]">
                      5. Nome do Cliente (Opcional)
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Marcelo R. ou Dr. Paulo"
                      className="w-full px-3 py-2 bg-white border border-[#DFD3C3] text-xs text-[#111] focus:outline-none focus:border-[#8A5835]"
                    />
                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        checked={isNameAuthorized}
                        onChange={(e) => setIsNameAuthorized(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#8A5835]"
                      />
                      <span className="text-[11px] text-[#5C4033]">
                        Cliente autorizou explicitamente a divulgação do nome
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E2D22] mb-1">
                      6. Cidade / Estado (Opcional)
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: Petrópolis - RJ"
                      className="w-full px-3 py-2 bg-white border border-[#DFD3C3] text-xs text-[#111] focus:outline-none focus:border-[#8A5835]"
                    />
                  </div>
                </div>

                {/* 4. Madeira e Avaliação Real */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E2D22] mb-1">
                      Madeira / Acabamento (Opcional)
                    </label>
                    <input
                      type="text"
                      value={wood}
                      onChange={(e) => setWood(e.target.value)}
                      placeholder="Ex: Pinus Maciço com Resina Atóxica"
                      className="w-full px-3 py-2 bg-white border border-[#DFD3C3] text-xs text-[#111] focus:outline-none focus:border-[#8A5835]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3E2D22] mb-1">
                      8. Nota Real do Cliente (Opcional - Nunca Inventar)
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={rating === null ? 'none' : rating.toString()}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRating(val === 'none' ? null : parseInt(val, 10));
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-[#DFD3C3] text-xs text-[#111] focus:outline-none focus:border-[#8A5835]"
                      >
                        <option value="none">Sem avaliação numérica / Não informada</option>
                        <option value="5">★★★★★ 5.0 (Excelente)</option>
                        <option value="4">★★★★☆ 4.0 (Muito Bom)</option>
                        <option value="3">★★★☆☆ 3.0 (Bom)</option>
                        <option value="2">★★☆☆☆ 2.0 (Regular)</option>
                        <option value="1">★☆☆☆☆ 1.0 (Insatisfatório)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 5. Comentário Real */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3E2D22] mb-1">
                    7. Avaliação Textual Enviada pelo Cliente (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Cole aqui o depoimento ou feedback real enviado pelo cliente por WhatsApp, e-mail ou mensagem..."
                    className="w-full px-3 py-2 bg-white border border-[#DFD3C3] text-xs text-[#111] focus:outline-none focus:border-[#8A5835]"
                  />
                </div>

                {/* 6. Opções de Publicação */}
                <div className="p-3 bg-[#FAF8F5] border border-[#DFD3C3] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#111] block">
                      Status de Visibilidade
                    </span>
                    <span className="text-[11px] text-[#5C4033]">
                      {published
                        ? 'Visível para os visitantes na galeria pública.'
                        : 'Oculta (salva como rascunho apenas para você ver).'}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="w-4 h-4 accent-[#8A5835]"
                    />
                    <span className="text-xs font-bold text-[#1C1917]">
                      Publicar na Galeria
                    </span>
                  </label>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('list');
                    }}
                    className="px-4 py-2.5 border border-[#DFD3C3] text-xs font-bold uppercase tracking-wider text-[#5C4033] hover:bg-[#F5EFE6] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !imagePreview}
                    className="px-6 py-2.5 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50 shadow"
                  >
                    {loading ? 'Salvando...' : activeTab === 'edit' ? 'Salvar Alterações' : 'Publicar Fotografia'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
