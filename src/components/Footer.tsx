import React from 'react';
import { Instagram, MessageSquare, Pin, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onOpenCareGuide: () => void;
  logoUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCareGuide,
  logoUrl = '/logo.png',
}) => {
  return (
    <footer className="bg-[#111111] text-[#DFD3C3] border-t border-[#2A1E17]">
      <div className="max-w-[1560px] mx-auto px-6 sm:px-8 lg:px-14 xl:px-16 2xl:px-20 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand & Mission */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt="M&A"
                className="h-10 w-10 object-contain rounded-sm border border-[#DFD3C3]/30 bg-white"
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

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da M&A"
                className="w-9 h-9 bg-[#2A1E17] hover:bg-[#8A5835] text-white flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/5511994821200"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp do Atelier"
                className="w-9 h-9 bg-[#2A1E17] hover:bg-[#8A5835] text-white flex items-center justify-center transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest da M&A"
                className="w-9 h-9 bg-[#2A1E17] hover:bg-[#8A5835] text-white flex items-center justify-center transition-colors"
              >
                <Pin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Coleções & Produtos */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest text-[#C29B68] font-bold">
              Coleções &amp; Produtos
            </span>
            <a href="#tabuas" className="text-xs text-[#DFD3C3] hover:text-white transition-colors">
              Tábuas Butcher Block End-Grain
            </a>
            <a href="#tabuas" className="text-xs text-[#DFD3C3] hover:text-white transition-colors">
              Sets de Degustação &amp; Charcutaria
            </a>
            <a href="#moveis" className="text-xs text-[#DFD3C3] hover:text-white transition-colors">
              Mesas de Centro Live Edge
            </a>
            <a href="#moveis" className="text-xs text-[#DFD3C3] hover:text-white transition-colors">
              Bancos &amp; Mesas Laterais Japonesas
            </a>
            <a href="#encomenda" className="text-xs text-[#DFD3C3] hover:text-white transition-colors">
              Gravação a Laser &amp; Brindes de Luxo
            </a>
          </div>

          {/* Atelier & Produção */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest text-[#C29B68] font-bold">
              Atelier &amp; Produção
            </span>
            <p className="text-xs text-[#DFD3C3] leading-relaxed flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#8A5835] shrink-0 mt-0.5" />
              <span>
                Galpão dos Jacarandás, 140<br />
                Vila Madalena — São Paulo, SP<br />
                CEP 05435-000
              </span>
            </p>
            <span className="text-[11px] text-[#DFD3C3]/70 mt-1">
              Visitas ao atelier com horário marcado para seleção de pranchas.
            </span>
          </div>

          {/* Atendimento Direto */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest text-[#C29B68] font-bold">
              Atendimento Direto
            </span>
            <a
              href="tel:+5511994821200"
              className="text-xs text-[#DFD3C3] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-[#8A5835]" />
              <span>+55 11 99482-1200</span>
            </a>
            <a
              href="mailto:atelier@cerne.design"
              className="text-xs text-[#DFD3C3] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-[#8A5835]" />
              <span>atelier@cerne.design</span>
            </a>
            <span className="text-[11px] text-[#DFD3C3]/60 mt-2">
              Segunda a Sábado<br />
              09h às 19h
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#2A1E17]/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#DFD3C3]/60 gap-4">
          <span>© 2025 M&amp;A Atelier &amp; Marcenaria Autoral. Todos os direitos reservados.</span>
          <div className="flex flex-wrap gap-4 sm:gap-6 items-center">
            <button
              onClick={onOpenCareGuide}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Garantia Vitalícia de Fibras
            </button>
            <button
              onClick={onOpenCareGuide}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Guia de Cuidados com Cera
            </button>
            <span className="text-[#C29B68]">Certidão FSC</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
