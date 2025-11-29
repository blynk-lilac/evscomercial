import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage } from "@/lib/imageMap";

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  image_url: string;
  category: string;
  region: string;
}

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [regionFilter, setRegionFilter] = useState<"all" | "Brasil" | "Angola">("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const filteredProducts =
    regionFilter === "all"
      ? products
      : products.filter((p) => p.region === regionFilter);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-b from-secondary/30 to-background animate-fade-in">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4 tracking-tight animate-scale-in">
            EVS Fashion
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Mais Que Moda, É Identidade.
          </p>
          <p className="text-lg text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Melhor Tendência 2026 • Melhor Qualidade 2026
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <span className="px-4 py-2 bg-secondary rounded-full hover:bg-secondary/80 transition-smooth">CEO: Hélio Evaristo</span>
            <span className="px-4 py-2 bg-secondary rounded-full hover:bg-secondary/80 transition-smooth">@evs_oficial</span>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 animate-fade-in">
            <h2 className="font-serif text-3xl font-bold">Catálogo</h2>
            <Tabs value={regionFilter} onValueChange={(v) => setRegionFilter(v as any)}>
              <TabsList className="transition-smooth">
                <TabsTrigger value="all" className="transition-smooth">Todos</TabsTrigger>
                <TabsTrigger value="Brasil" className="transition-smooth">Brasil</TabsTrigger>
                <TabsTrigger value="Angola" className="transition-smooth">Angola</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <p className="text-muted-foreground mb-8 text-center sm:text-left animate-fade-in">
            💡 Clique em qualquer produto para ver detalhes completos, ler avaliações e deixar sua opinião!
          </p>

          {loading ? (
            <div className="text-center py-12">Carregando produtos...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  currency={product.currency}
                  image={getProductImage(product.image_url)}
                  category={product.category}
                />
              ))}
            </div>
          )}
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
