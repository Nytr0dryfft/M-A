import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { getOrderFromStore, dataUrlToBlob } from '../services/orderStorage';
import { OrderQuoteData } from '../types/configurator';
import { ATELIER_CONTACT } from '../config/contact';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = '',
}) => {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [contactInput, setContactInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [foundOrder, setFoundOrder] = useState<OrderQuoteData | null>(null);
  const [isFromCloud, setIsFromCloud] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      setOrderIdInput(initialOrderId);
    }
  }, [initialOrderId]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderIdInput.trim().toUpperCase();
    if (!cleanId) {
      setErrorMsg('Por favor, informe o código do pedido (ex: MA-XXXXXX).');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setFoundOrder(null);

    try {
      const res = await getOrderFromStore(cleanId, contactInput.trim() || undefined);
      if (!res) {
        setErrorMsg(
          'Pedido não localizado. Verifique se o código está correto ou se o telefone confere com o cadastrado.'
        );
      } else {
        setFoundOrder(res.order);
        setIsFromCloud(res.isFromCloud);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha na consulta do pedido.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOriginalSvg = (elIndex: number) => {
    if (!foundOrder) return;
    const images = foundOrder.elements.filter((el) => el.type === 'image');
    const targetEl = images[elIndex] || images[0];
    if (!targetEl) return;

    try {
      let blob: Blob;
      let ext = 'svg';

      if (targetEl.isSvg) {
        if (targetEl.rawSvgText) {
          blob = new Blob([targetEl.rawSvgText], { type: 'image/svg+xml;charset=utf-8' });
        } else if (targetEl.imageSrc) {
          blob = dataUrlToBlob(targetEl.imageSrc);
        } else {
          throw new Error('Arquivo original não encontrado no registro.');
        }
      } else if (targetEl.imageSrc) {
        ext = targetEl.imageFileType?.includes('png') ? 'png' : 'jpg';
        blob = dataUrlToBlob(targetEl.imageSrc);
      } else {
        throw new Error('Arquivo não disponível.');
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (targetEl.imageFileName || 'arte-original')
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `${safeName}-${foundOrder.orderId.toLowerCase()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message || 'Erro ao realizar download.');
    }
  };

  const handleDownloadPreview = () => {
    if (!foundOrder) return;
    if (!foundOrder.previewDataUrl && !(foundOrder as any)?.previewUrl) return;

    if (foundOrder.previewDataUrl) {
      try {
        const blob = dataUrlToBlob(foundOrder.previewDataUrl);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `previa-tabua-${foundOrder.orderId.toLowerCase()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    if ((foundOrder as any).previewUrl) {
      window.open((foundOrder as any).previewUrl, '_blank');
    }
  };

  const openWhatsAppFollowup = () => {
    if (!foundOrder) return;
    const msg = `Olá Atelier M&A! Gostaria de acompanhar o andamento do meu pedido *${foundOrder.orderId}* (${foundOrder.pieceLabel} em ${foundOrder.woodName}).`;
    window.open(ATELIER_CONTACT.getWhatsAppUrl(msg), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-[#FAF8F5] max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-[#DFD3C3] shadow-2xl relative text-[#111111]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#2A1E17] text-white flex items-center justify-between border-b border-[#DFD3C3]/20">
          <div className="flex items-center gap-2.5">
            <Search className="w-5 h-5 text-[#C29B68]" />
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight">
                Consultar Pedido &amp; Baixar Artes
              </h3>
              <span className="text-[11px] text-[#DFD3C3]/80">
                Acesso Seguro aos Arquivos e Ficha Técnica do Projeto
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-7 space-y-6">
          {/* Formulário de Busca Protegida */}
          <form onSubmit={handleSearch} className="space-y-4 bg-white p-4 border border-[#DFD3C3]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A5835] block">
              Localização Protegida do Pedido
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3E2D22] mb-1">
                  Código do Pedido *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: MA-XXXXXX"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD3C3] text-xs font-mono font-bold text-[#111] focus:outline-[#8A5835]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3E2D22] mb-1">
                  WhatsApp Cadastrado (Verificação)
                </label>
                <input
                  type="text"
                  placeholder="Número ou últimos 4 dígitos"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DFD3C3] text-xs text-[#111] focus:outline-[#8A5835]"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-100 border border-red-300 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#2A1E17] hover:bg-[#8A5835] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C29B68]" />
                  <span>Consultando Registros...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-[#C29B68]" />
                  <span>Consultar Orçamento</span>
                </>
              )}
            </button>
          </form>

          {/* Resultado do Pedido Encontrado */}
          {foundOrder && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-[#FCF9F3] border border-[#DFD3C3] space-y-3">
                <div className="flex items-center justify-between border-b border-[#DFD3C3]/70 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#8A5835]" />
                    <span className="font-mono text-sm font-bold text-[#1C1917]">
                      {foundOrder.orderId}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#FAF3EA] border border-[#C29B68]/60 text-[#8A5835]">
                    {isFromCloud ? 'Registro em Nuvem (Cloud)' : 'Registro Local do Atelier'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#3E2D22]">
                  <div>
                    <span className="text-[10px] text-[#8A5835] block uppercase font-semibold">Peça</span>
                    <strong className="text-[#111]">{foundOrder.pieceLabel}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A5835] block uppercase font-semibold">Madeira</span>
                    <strong className="text-[#111]">{foundOrder.woodName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A5835] block uppercase font-semibold">Dimensões</span>
                    <span className="font-mono text-[#111]">
                      {foundOrder.dimensions.lengthCm}x{foundOrder.dimensions.widthCm}x{foundOrder.dimensions.thicknessCm.toFixed(1)} cm
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A5835] block uppercase font-semibold">Cliente</span>
                    <span className="text-[#111]">{foundOrder.clientName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A5835] block uppercase font-semibold">Total Estimado</span>
                    <strong className="text-[#111] font-mono">
                      R$ {foundOrder.budget.totalEstimated.toFixed(2).replace('.', ',')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A5835] block uppercase font-semibold">Usinagem</span>
                    <span className="text-[#111]">{foundOrder.technique.name}</span>
                  </div>
                </div>
              </div>

              {/* Prévia Visual da Tábua Renderizada */}
              {(foundOrder.previewDataUrl || (foundOrder as any).previewUrl) && (
                <div className="p-4 bg-white border border-[#DFD3C3] space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8A5835] flex items-center justify-between">
                    <span>Prévia Real da Tábua Personalizada</span>
                    <button
                      type="button"
                      onClick={handleDownloadPreview}
                      className="text-[11px] text-[#8A5835] hover:text-[#111] font-bold flex items-center gap-1 cursor-pointer underline"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar Imagem (.png)</span>
                    </button>
                  </span>

                  <div className="bg-[#15100D] p-3 border border-[#DFD3C3]/30 flex items-center justify-center">
                    <img
                      src={foundOrder.previewDataUrl || (foundOrder as any).previewUrl}
                      alt={`Prévia da Tábua ${foundOrder.orderId}`}
                      className="max-h-56 max-w-full object-contain shadow-md"
                    />
                  </div>
                </div>
              )}

              {/* Arquivos de Arte / SVG Original para Download */}
              <div className="p-4 bg-white border border-[#DFD3C3] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8A5835] block">
                  Arquivos Originais para Usinagem CNC
                </span>

                {foundOrder.elements.filter((el) => el.type === 'image').length === 0 ? (
                  <p className="text-xs text-[#5C4033] italic">
                    Nenhum arquivo externo carregado (personalização textual / geométrica padrão).
                  </p>
                ) : (
                  <div className="space-y-2">
                    {foundOrder.elements
                      .filter((el) => el.type === 'image')
                      .map((el, i) => (
                        <div
                          key={i}
                          className="p-3 bg-[#FAF8F5] border border-[#DFD3C3] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate pr-3">
                            <FileText className="w-4 h-4 text-[#8A5835] shrink-0" />
                            <div className="truncate">
                              <strong className="block truncate text-[#111]">
                                {el.imageFileName || `Arte ${i + 1}`}
                              </strong>
                              <span className="text-[10px] text-[#5C4033]">
                                {el.isSvg ? 'Vetor SVG Original Íntegro' : 'Imagem Rasterizada'} · {el.widthCm}x{el.heightCm} cm
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDownloadOriginalSvg(i)}
                            className="py-1.5 px-3 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-[#C29B68]" />
                            <span>Baixar {el.isSvg ? 'SVG' : 'Imagem'}</span>
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Botão de Contato WhatsApp */}
              <button
                type="button"
                onClick={openWhatsAppFollowup}
                className="w-full py-3.5 bg-[#8A5835] hover:bg-[#6F4226] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer border border-[#C29B68]/60"
              >
                <MessageSquare className="w-4 h-4 text-[#FAF8F5]" />
                <span>Conversar sobre este Orçamento no WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
