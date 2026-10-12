import React from 'react';
import { TESTIMONIALS } from '../data/catalog';
import { Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-10 sm:py-20 lg:py-28 2xl:py-36 max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 2xl:px-20 bg-[#FCF9F3]">
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-14 lg:mb-16">
        <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#8A5835] font-bold">
          Reconhecimento
        </span>
        <h2 className="font-serif text-2xl sm:text-4xl 2xl:text-5xl text-[#111111] font-bold tracking-tight mt-1.5 sm:mt-2">
          Aprovado por Quem Vive a Madeira &amp; a Gastronomia
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-8 xl:gap-10">
        {TESTIMONIALS.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#FAF8F5] p-4 sm:p-8 border border-[#DFD3C3] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
          >
            <div>
              <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-[#C29B68]/60 mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm text-[#5C4033] italic leading-relaxed mb-3 sm:mb-6">
                "{item.quote}"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-[#DFD3C3]/50">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${item.avatarBg} text-white font-serif font-bold flex items-center justify-center text-xs sm:text-sm shadow-sm shrink-0`}
              >
                {item.initials}
              </div>
              <div>
                <span className="text-xs font-bold text-[#111111] block">
                  {item.author}
                </span>
                <span className="text-[10px] text-[#B88658] uppercase tracking-wider font-semibold">
                  {item.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
