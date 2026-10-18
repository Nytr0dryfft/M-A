import React from 'react';
import { ATELIER_CONTACT } from '../config/contact';

interface WhatsAppButtonProps {
  customMessage?: string;
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  customMessage,
  className = '',
}) => {
  const whatsappUrl = ATELIER_CONTACT.getWhatsAppUrl(customMessage);

  return (
    <aside
      aria-label="WhatsApp"
      className={`fixed right-4 sm:right-6 z-40 print:hidden ${className}`}
      style={{
        bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp (+55 24 99961-9770)"
        title="WhatsApp (+55 24 99961-9770)"
        className="flex items-center group cursor-pointer focus:outline-none select-none"
      >
        {/* Botão circular com o símbolo do WhatsApp */}
        <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#5C3A21] hover:bg-[#432814] active:bg-[#321D0E] text-[#FAF8F5] flex items-center justify-center border-2 border-[#C29B68] shadow-xl shadow-black/40 hover:shadow-2xl transition-all duration-300 group-hover:scale-106 focus:ring-4 focus:ring-[#8A5835]/50">
          {/* Pulso sutil no botão em tom marrom quente */}
          <span
            className="absolute inset-0 rounded-full border border-[#C29B68]/60 animate-ping opacity-40 pointer-events-none"
            aria-hidden="true"
          />

          {/* Símbolo Oficial do WhatsApp em tons de marrom e dourado atelier */}
          <svg
            viewBox="0 0 32 32"
            className="w-7 h-7 sm:w-7.5 sm:h-7.5 fill-[#FAF8F5] transition-transform duration-300 group-hover:scale-110 drop-shadow"
            aria-hidden="true"
          >
            <path d="M16 2C8.268 2 2 8.268 2 16c0 2.72.772 5.258 2.106 7.412L2.5 30l6.768-1.576A13.918 13.918 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.568c-2.316 0-4.48-.65-6.326-1.78l-.454-.278-4.226.984.996-4.122-.3-.466A11.512 11.512 0 0 1 4.432 16c0-6.378 5.19-11.568 11.568-11.568 6.378 0 11.568 5.19 11.568 11.568 0 6.378-5.19 11.568-11.568 11.568zm6.548-8.672c-.358-.18-2.122-1.046-2.45-1.166-.33-.12-.57-.18-.81.18-.24.358-.93 1.166-1.14 1.406-.21.24-.42.27-.778.09-.358-.18-1.512-.558-2.88-1.778-1.064-.95-1.784-2.122-1.994-2.48-.21-.358-.022-.552.158-.73.162-.16.358-.42.538-.63.18-.21.24-.358.358-.598.12-.24.06-.45-.03-.63-.09-.18-.81-1.952-1.11-2.674-.292-.702-.59-.608-.81-.62-.21-.01-.45-.012-.69-.012-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3 0 1.77 1.29 3.48 1.47 3.72.18.24 2.54 3.878 6.152 5.438.86.37 1.53.592 2.054.758.862.274 1.646.236 2.266.143.69-.103 2.122-.868 2.42-1.708.298-.84.298-1.56.21-1.708-.09-.15-.33-.24-.688-.42z" />
          </svg>
        </div>
      </a>
    </aside>
  );
};
