import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [regionFilter, setRegionFilter] = useState<"all" | "Brasil" | "Angola">("all");
  const { toast } = useToast();

  const handleAddToCart = (productId: string) => {
    setCartCount((prev) => prev + 1);
    toast({
      title: "Produto adicionado!",
      description: "O item foi adicionado ao seu carrinho.",
    });
  };

  const filteredProducts =
    regionFilter === "all"
      ? products
      : products.filter((p) => p.region === regionFilter);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} cartItemCount={cartCount} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            EVS Fashion
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-2">
            Mais Que Moda, É Identidade.
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            Melhor Tendência 2026 • Melhor Qualidade 2026
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="px-4 py-2 bg-secondary rounded-full">CEO: Hélio Evaristo</span>
            <span className="px-4 py-2 bg-secondary rounded-full">@evs_oficial</span>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl font-bold">Catálogo</h2>
            <Tabs value={regionFilter} onValueChange={(v) => setRegionFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="Brasil">Brasil</TabsTrigger>
                <TabsTrigger value="Angola">Angola</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                currency={product.currency}
                image={product.image}
                category={product.category}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 mt-12">
        <div className="container mx-auto text-center">
          <h3 className="font-serif text-2xl font-bold mb-4">EVS Fashion</h3>
          <p className="text-muted-foreground mb-4">
            Mais Que Moda, É Identidade.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <a href="#" className="hover:text-accent transition-smooth">
              Instagram: @evs_oficial
            </a>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">CEO: Hélio Evaristo</span>
          </div>
          <p className="text-xs text-muted-foreground mt-8">
            © 2026 EVS Fashion. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
