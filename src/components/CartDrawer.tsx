import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageSquare, ArrowRight, Check } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [notes, setNotes] = useState('');
  const [orderSent, setOrderSent] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const generateWhatsAppMessage = () => {
    let msg = `*PEDIDO ATELIER M&A*\n\n`;
    items.forEach((item, i) => {
      msg += `${i + 1}. *${item.product.name}* (${item.quantity}x)\n`;
      msg += `   Valor: R$ ${(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}\n`;
      if (item.customEngraving) {
        msg += `   Personalização por CNC: "${item.customEngraving}"\n`;
      }
      msg += `   Madeiras: ${item.product.woods}\n\n`;
    });
    msg += `*Total da Sacola:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n\n`;
    if (customerName) msg += `Cliente: ${customerName}\n`;
    if (customerCity) msg += `Cidade/UF: ${customerCity}\n`;
    if (notes) msg += `Observações: ${notes}\n`;

    return `https://wa.me/5511994821200?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col justify-between border-l border-[#DFD3C3]">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[#DFD3C3] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#8A5835]" />
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#111111] inline-flex items-baseline gap-1">
                <span>Sacola de Peças do Atelier</span>
                <span className="inline-flex items-baseline font-serif">
                  <span>M</span>
                  <span className="text-[0.62em] font-medium text-[#8A5835] mx-[1px] -translate-y-[1px]">&amp;</span>
                  <span>A</span>
                </span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#5C4033] hover:text-[#111111] transition-colors"
              aria-label="Fechar sacola"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items Container */}
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-3 sm:space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <ShoppingBag className="w-12 h-12 text-[#DFD3C3] mx-auto" />
                <p className="font-serif text-lg text-[#5C4033]">
                  Sua sacola está vazia.
                </p>
                <p className="text-xs text-[#5C4033] max-w-xs mx-auto">
                  Explore nossas tábuas gourmet e pequenos móveis esculturais para adicionar ao pedido.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white border border-[#DFD3C3] shadow-xs flex gap-3.5 items-start justify-between"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className={`w-16 h-16 ${item.product.imageFit === 'contain' ? 'object-contain p-1' : 'object-cover'} bg-[#2A1E17] border border-[#DFD3C3]/50 shrink-0`}
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-sm font-bold text-[#111111] truncate">
                          {item.product.name}
                        </h4>
                        <span className="text-[11px] text-[#8A5835] font-semibold block">
                          R$ {item.unitPrice.toFixed(2).replace('.', ',')} unid.
                        </span>
                        {item.customEngraving && (
                          <span className="text-[10px] text-[#5C4033] italic block mt-0.5 truncate">
                            Gravação: "{item.customEngraving}"
                          </span>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                            className="p-1 border border-[#DFD3C3] hover:bg-[#FAF8F5] text-[#111111]"
                            title="Diminuir"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                            className="p-1 border border-[#DFD3C3] hover:bg-[#FAF8F5] text-[#111111]"
                            title="Aumentar"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Remove item */}
                      <button
                        onClick={() => onRemoveItem(idx)}
                        className="text-[#5C4033] hover:text-red-700 p-1"
                        title="Remover peça"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Additional Customer Information */}
                <div className="pt-4 border-t border-[#DFD3C3] space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3E2D22] block">
                    Dados para Envio &amp; Nota
                  </span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full p-2.5 bg-white border border-[#DFD3C3] text-xs text-[#111111] focus:outline-[#8A5835]"
                  />
                  <input
                    type="text"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    placeholder="Cidade / Estado (ex: São Paulo - SP)"
                    className="w-full p-2.5 bg-white border border-[#DFD3C3] text-xs text-[#111111] focus:outline-[#8A5835]"
                  />
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observações especiais de entrega ou personalização..."
                    className="w-full p-2.5 bg-white border border-[#DFD3C3] text-xs text-[#111111] focus:outline-[#8A5835]"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer & Actions */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 bg-white border-t border-[#DFD3C3] space-y-2.5 sm:space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-wider text-[#5C4033] font-semibold">
                  Subtotal Estimado:
                </span>
                <span className="font-serif text-2xl font-bold text-[#111111] tabular-nums">
                  R$ {subtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-[10px] text-[#5C4033] leading-relaxed">
                Frete calculado com transportadora especializada para segurança de pranchas vivas e peças maciças.
              </p>

              <a
                href={generateWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#C29B68]" />
                <span>Enviar Pedido pelo WhatsApp</span>
              </a>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={onClearCart}
                  className="text-[11px] text-[#5C4033] hover:text-red-700 underline"
                >
                  Esvaziar Sacola
                </button>
                <button
                  onClick={onClose}
                  className="text-[11px] font-semibold text-[#111111] hover:text-[#8A5835]"
                >
                  Continuar Escolhendo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
