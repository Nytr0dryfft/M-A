import React from 'react';
import { X, ShieldCheck, Droplet, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';

interface CareGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CareGuideModal: React.FC<CareGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF8F5] max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#DFD3C3] shadow-2xl p-6 sm:p-10 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#5C4033] hover:text-[#111111] transition-colors"
          aria-label="Fechar guia de cuidados"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="space-y-6">
          <div className="border-b border-[#DFD3C3] pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8A5835]">
              <ShieldCheck className="w-4 h-4" />
              <span>Compromisso Atelier M&amp;A</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#111111] mt-1">
              Guia de Cuidados &amp; Garantia Vitalícia das Fibras
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#5C4033] leading-relaxed">
            <p>
              Toda peça esculpida em nosso atelier é tratada como uma herança atemporal. Para preservar o
              toque aveludado e a barreira antibacteriana natural da madeira maciça, siga as recomendações
              abaixo:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white border border-[#DFD3C3] shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-[#111111] font-bold">
                  <Droplet className="w-4 h-4 text-[#8A5835]" />
                  <span>Higienização Diária</span>
                </div>
                <p className="text-xs text-[#5C4033]">
                  Limpe com esponja macia, sabão neutro e água morna. Nunca submerja a peça inteira na pia
                  e seque imediatamente na vertical com pano de algodão.
                </p>
              </div>

              <div className="p-4 bg-white border border-[#DFD3C3] shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-[#111111] font-bold">
                  <RefreshCw className="w-4 h-4 text-[#8A5835]" />
                  <span>Hidratação Periódica</span>
                </div>
                <p className="text-xs text-[#5C4033]">
                  A cada 30 ou 45 dias, aplique uma fina camada da nossa cera virgem de abelha ou óleo
                  mineral USP. Deixe agir por 4 horas e lustre com uma flanela seca.
                </p>
              </div>

              <div className="p-4 bg-white border border-[#DFD3C3] shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-red-800 font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-700" />
                  <span>O Que Jamais Fazer</span>
                </div>
                <p className="text-xs text-[#5C4033]">
                  Nunca leve a tábua ou móvel à máquina lava-louças, micro-ondas ou estufas quentes. Evite
                  óleos vegetais comuns (óleo de soja ou azeite de oliva oxidam e rançam).
                </p>
              </div>

              <div className="p-4 bg-white border border-[#DFD3C3] shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-[#111111] font-bold">
                  <Sparkles className="w-4 h-4 text-[#C29B68]" />
                  <span>Certificado &amp; Retífica</span>
                </div>
                <p className="text-xs text-[#5C4033]">
                  Oferecemos serviço vitalício de plainamento e retífica estética em nosso atelier caso sua
                  tábua acumule marcas profundas após anos de churrasco pesado.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#2A1E17] text-[#FAF8F5] mt-4">
              <h4 className="font-serif text-lg font-bold text-[#C29B68] mb-1">
                Termo de Garantia Vitalícia de Fibras
              </h4>
              <p className="text-xs text-[#DFD3C3] leading-relaxed">
                A M&amp;A garante que as peças em grão de topo e móveis esculturais não sofrerão
                descolamento estrutural de blocos ou empenamento irreversível quando mantidas segundo este
                protocolo. Cada peça acompanha número de série registrado no atelier.
              </p>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#2A1E17] hover:bg-[#8A5835] text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
            >
              Entendido e Salvo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
