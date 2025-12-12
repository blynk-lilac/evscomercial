import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
      <section className="pt-24 pb-16 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          {/* Beta Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary">Versão Beta • Em Desenvolvimento</span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight animate-scale-in">
            <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
              EVS Fashion
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-foreground/80 mb-3 animate-fade-in font-medium" style={{ animationDelay: '0.1s' }}>
            Mais Que Moda, É Identidade.
          </p>
          
          <p className="text-lg text-muted-foreground mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            ✨ Melhor Tendência 2026 • Melhor Qualidade 2026 ✨
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <span className="px-5 py-2.5 bg-card border border-border rounded-full hover:shadow-medium hover:-translate-y-0.5 transition-all duration-300 text-sm font-medium">
              CEO: Hélio Evaristo
            </span>
            <span className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full hover:shadow-colored hover:-translate-y-0.5 transition-all duration-300 text-sm font-medium">
              @evs_oficial
            </span>
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
      <footer className="border-t border-border py-16 px-4 mt-12 bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-50" />
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <h3 className="font-serif text-3xl font-bold">EVS Fashion</h3>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">BETA</Badge>
          </div>
          <p className="text-muted-foreground mb-6 text-lg">
            Mais Que Moda, É Identidade.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm mb-8">
            <a href="#" className="px-4 py-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
              📸 Instagram: @evs_oficial
            </a>
            <span className="px-4 py-2 rounded-full bg-secondary">
              👔 CEO: Hélio Evaristo
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>© 2026 EVS Fashion</span>
            <span>•</span>
            <span>Todos os direitos reservados</span>
            <span>•</span>
            <span className="text-primary">v0.1.0 Beta</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
