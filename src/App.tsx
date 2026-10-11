import React, { useState } from 'react';
import { PRODUCTS as DEFAULT_PRODUCTS, WOOD_SPECIMENS } from './data/catalog';
import { Product, CartItem } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CatalogSection } from './components/CatalogSection';
import { AnatomySection } from './components/AnatomySection';
import { WoodCurator } from './components/WoodCurator';
import { CustomOrderStudio } from './components/CustomOrderStudio';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CareGuideModal } from './components/CareGuideModal';
import { Footer } from './components/Footer';
import { CheckCircle2 } from 'lucide-react';

const DEFAULT_HERO_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAicI1LGddhH5Xv4o6T-GFiYMh_gZgvnkM7T_djJroxlG0Js626gPUQQZEaf1NZGhRtEnayzHqv872KMsEIE7MGj6-o_o1dLMIijOY-VnVwA5v2wNpBf_zFk2N68QTkgDp-pGjGPRbRYUlg_co93yuggdyrOUCiQT9QOp4Fet0zggGVGb8w6YNxvHxc1uQplYeWebs4-eIh0ZQnVQ96hth6xs6So7nfn-yKVklC8_vtoDHU--gSYOlwLg';
const DEFAULT_LOGO = '/logo.png';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCareGuideOpen, setIsCareGuideOpen] = useState(false);
  const [customWoodChoice, setCustomWoodChoice] = useState('Mix Teca & Nogueira Americana');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const heroBgUrl = DEFAULT_HERO_BG;
  const logoUrl = DEFAULT_LOGO;
  const products = DEFAULT_PRODUCTS;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleAddToCart = (product: Product, customEngraving?: string) => {
    const unitPrice = product.price + (customEngraving ? 50 : 0);
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.customEngraving === customEngraving
      );
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        return next;
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          customEngraving,
          unitPrice,
        },
      ];
    });

    showToast(
      `"${product.name}" foi adicionado à sacola de pedidos${
        customEngraving ? ` com gravação "${customEngraving}"` : ''
      }.`
    );
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCart((prev) => {
      const next = [...prev];
      next[index].quantity = newQty;
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleSelectWoodForCustom = (woodName: string) => {
    setCustomWoodChoice(woodName);
    const element = document.getElementById('encomenda');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(`Madeira ${woodName} selecionada para o seu projeto sob medida.`);
  };

  const handleOpenCustomStudio = () => {
    const element = document.getElementById('encomenda');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FCF9F3] text-[#111111] font-sans antialiased selection:bg-[#8A5835] selection:text-white">
      {/* 1. Header Navigation */}
      <Header
        cartCount={totalCartCount}
        logoUrl={logoUrl}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCareGuide={() => setIsCareGuideOpen(true)}
        onOpenCustomStudio={handleOpenCustomStudio}
      />

      {/* 2. Main Content Flow */}
      <main className="w-full">
        {/* 2.1 Hero with Deep Parallax Background & Drift */}
        <Hero
          heroBgUrl={heroBgUrl}
          onOpenCustomStudio={handleOpenCustomStudio}
        />

        {/* 2.2 Featured Catalog with Parallax Card Depth */}
        <CatalogSection
          products={products}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onAddToCart={(p) => handleAddToCart(p)}
          onCustomizeLaser={(p) => setSelectedProduct(p)}
        />

        {/* 2.3 Anatomy of M&A Craftsmanship (4 Pilares) */}
        <AnatomySection />

        {/* 2.4 Wood Species Curator (Origem & Dureza Janka) */}
        <WoodCurator
          woodSpecimens={WOOD_SPECIMENS}
          onSelectWoodForCustom={handleSelectWoodForCustom}
        />

        {/* 2.5 Custom Order Studio & 3D/Isometric Sketch Generator */}
        <CustomOrderStudio
          initialWood={customWoodChoice}
          onSuccessOrder={(summary) => showToast('Orçamento registrado com sucesso!')}
        />

        {/* 2.6 Testimonials & Recognition */}
        <TestimonialsSection />
      </main>

      {/* 3. Footer */}
      <Footer
        onOpenCareGuide={() => setIsCareGuideOpen(true)}
        logoUrl={logoUrl}
      />

      {/* 4. Product Detail & Laser Customizer Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* 5. Cart / Order Inquiries Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* 6. Lifetime Care & Warranty Modal */}
      <CareGuideModal
        isOpen={isCareGuideOpen}
        onClose={() => setIsCareGuideOpen(false)}
      />

      {/* 7. Toast Feedback Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2A1E17] text-[#FAF8F5] border border-[#C29B68]/60 px-5 py-3.5 shadow-2xl flex items-center gap-3 animate-fadeIn max-w-md">
          <CheckCircle2 className="w-5 h-5 text-[#C29B68] shrink-0" />
          <span className="text-xs font-medium leading-relaxed">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
