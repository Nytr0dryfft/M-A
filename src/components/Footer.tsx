import React from 'react';
import { Instagram, MessageSquare, Pin, Phone, Mail, MapPin } from 'lucide-react';
import logoImg from '../assets/images/logo.png';
import { ATELIER_CONTACT } from '../config/contact';

interface FooterProps {
  onOpenCareGuide: () => void;
  logoUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCareGuide,
  logoUrl = logoImg,
}) => {
  return (
    <footer className="bg-[#111111] text-[#DFD3C3] border-t border-[#2A1E17]">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 2xl:px-20 py-10 sm:py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-10">
          {/* Brand & Mission */}
          <div className="col-span-2 lg:col-span-4 flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt="M&A"
                className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-sm border border-[#DFD3C3]/30 bg-white"
              />
              <span className="font-serif text-2xl font-bold tracking-tight text-white inline-flex items-baseline">
                <span>M</span>
                <span className="text-[0.62em] font-medium text-[#C29B68] mx-[1.5px] -translate-y-[1px]">&amp;</span>
                <span>A</span>
              </span>
            </div>

            <p className="text-xs text-[#DFD3C3]/80 leading-relaxed max-w-sm">
              Atelier de marcenaria fina especializada em pequenos móveis esculturais e tábuas
              gastronômicas de precisão em grão de topo. Valorizamos o tempo e a fibra natural de
              árvores nobres brasileiras.
            </p>

            <div className="flex items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da M&A"
                className="w-8 h-8 sm:w-9 sm:h-9 bg-[#2A1E17] hover:bg-[#8A5835] text-white flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={ATELIER_CONTACT.getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp do Atelier"
                className="w-8 h-8 sm:w-9 sm:h-9 bg-[#2A1E17] hover:bg-[#8A5835] text-white flex items-center justify-center transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest da M&A"
                className="w-8 h-8 sm:w-9 sm:h-9 bg-[#2A1E17] hover:bg-[#8A5835] text-white flex items-center justify-center transition-colors"
              >
                <Pin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Coleções & Produtos (col-span-1 on mobile) */}
          <div className="col-span-1 lg:col-span-3 flex flex-col gap-2.5 sm:gap-3">
            <span className="text-[11px] sm:text-xs uppercase tracking-widest text-[#C29B68] font-bold">
              Coleções &amp; Produtos
            </span>
            <a href="#tabuas" className="text-[11px] sm:text-xs text-[#DFD3C3] hover:text-white transition-colors">
              Tábuas Butcher Block
            </a>
            <a href="#tabuas" className="text-[11px] sm:text-xs text-[#DFD3C3] hover:text-white transition-colors">
              Porta-Copos &amp; Sets
            </a>
            <a href="#moveis" className="text-[11px] sm:text-xs text-[#DFD3C3] hover:text-white transition-colors">
              Mesas Live Edge
            </a>
            <a href="#moveis" className="text-[11px] sm:text-xs text-[#DFD3C3] hover:text-white transition-colors">
              Bancos Japoneses
            </a>
            <a href="#encomenda" className="text-[11px] sm:text-xs text-[#DFD3C3] hover:text-white transition-colors">
              Personalização CNC
            </a>
          </div>

          {/* Atendimento Direto (col-span-1 on mobile) */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-2.5 sm:gap-3">
            <span className="text-[11px] sm:text-xs uppercase tracking-widest text-[#C29B68] font-bold">
              Atendimento Direto
            </span>
            <a
              href={`tel:+${ATELIER_CONTACT.whatsappNumber}`}
              className="text-[11px] sm:text-xs text-[#DFD3C3] hover:text-white transition-colors flex items-center gap-1.5 truncate"
            >
              <Phone className="w-3.5 h-3.5 text-[#8A5835] shrink-0" />
              <span className="truncate">{ATELIER_CONTACT.displayPhone}</span>
            </a>
            <a
              href={`mailto:${ATELIER_CONTACT.email}`}
              className="text-[11px] sm:text-xs text-[#DFD3C3] hover:text-white transition-colors flex items-center gap-1.5 truncate"
            >
              <Mail className="w-3.5 h-3.5 text-[#8A5835] shrink-0" />
              <span className="truncate">{ATELIER_CONTACT.email}</span>
            </a>
            <span className="text-[10px] sm:text-[11px] text-[#DFD3C3]/60 mt-1">
              Seg. a Sábado<br />
              09h às 19h
            </span>
          </div>

          {/* Atelier & Produção (col-span-2 on mobile) */}
          <div className="col-span-2 lg:col-span-3 flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-0 border-t border-[#2A1E17] lg:border-t-0">
            <span className="text-[11px] sm:text-xs uppercase tracking-widest text-[#C29B68] font-bold">
              Atelier &amp; Produção
            </span>
            <p className="text-[11px] sm:text-xs text-[#DFD3C3] leading-relaxed flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#8A5835] shrink-0 mt-0.5" />
              <span>
                {ATELIER_CONTACT.address.street}<br />
                {ATELIER_CONTACT.address.neighborhood} — {ATELIER_CONTACT.address.city}, {ATELIER_CONTACT.address.state}<br />
                CEP {ATELIER_CONTACT.address.cep}
              </span>
            </p>
            <span className="text-[10px] sm:text-[11px] text-[#DFD3C3]/70">
              Visitas ao atelier com horário marcado para seleção de pranchas.
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-[#2A1E17]/80 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] text-[#DFD3C3]/60 gap-3 sm:gap-4">
          <span className="text-center sm:text-left">© 2025 M&amp;A Atelier &amp; Marcenaria Autoral. Todos os direitos reservados.</span>
          <div className="flex flex-wrap gap-3 sm:gap-6 items-center justify-center">
            <button
              onClick={onOpenCareGuide}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Garantia Vitalícia
            </button>
            <button
              onClick={onOpenCareGuide}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Guia de Cuidados
            </button>
            <span className="text-[#C29B68]">Certidão FSC</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
