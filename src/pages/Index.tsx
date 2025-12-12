import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage } from "@/lib/imageMap";
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Award, 
  TrendingUp, 
  Star,
  ArrowRight,
  Instagram,
  User,
  Clock,
  CheckCircle2,
  Globe,
  Package,
  Truck
} from "lucide-react";
import { ChatBot } from "@/components/ChatBot";

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

      {/* Hero Section - Clean Figma Style */}
      <section className="pt-20 pb-16 px-4 relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Early Access Banner */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10">
                <Zap className="h-3 w-3 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Acesso Antecipado</span>
              </div>
              <span className="text-sm text-muted-foreground">Versão Beta v0.1.0</span>
            </div>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight animate-scale-in leading-tight">
              EVS Fashion
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Mais Que Moda, É Identidade.
            </p>
            
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-primary" />
                <span>Tendência 2026</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-primary" />
                <span>Qualidade Premium</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button size="lg" className="gap-2 px-6 h-12 text-base">
                <Package className="h-4 w-4" />
                Ver Coleção
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="gap-2 px-6 h-12 text-base">
                <User className="h-4 w-4" />
                CEO: Hélio Evaristo
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {[
              { icon: Package, label: "Produtos", value: products.length.toString() },
              { icon: Globe, label: "Regiões", value: "2" },
              { icon: Truck, label: "Entregas", value: "Rápidas" },
              { icon: Shield, label: "Garantia", value: "100%" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-soft transition-all duration-300">
                <stat.icon className="h-5 w-5 text-primary mb-2" />
                <span className="text-xl font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary uppercase tracking-wider">Catálogo</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Nossos Produtos</h2>
            </div>
            
            <Tabs value={regionFilter} onValueChange={(v) => setRegionFilter(v as any)}>
              <TabsList className="h-11 p-1 bg-card border border-border">
                <TabsTrigger value="all" className="gap-2 px-4">
                  <Globe className="h-4 w-4" />
                  Todos
                </TabsTrigger>
                <TabsTrigger value="Brasil" className="gap-2 px-4">
                  Brasil
                </TabsTrigger>
                <TabsTrigger value="Angola" className="gap-2 px-4">
                  Angola
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Info Banner */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 mb-8">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Clique em qualquer produto para ver detalhes</p>
              <p className="text-xs text-muted-foreground">Leia avaliações e deixe sua opinião</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-card animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhum produto encontrado</p>
              <p className="text-sm text-muted-foreground">Tente selecionar outra região</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    currency={product.currency}
                    image={getProductImage(product.image_url)}
                    category={product.category}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Por que EVS?</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">Qualidade e Estilo</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Qualidade Garantida",
                description: "Todos os produtos passam por rigoroso controle de qualidade"
              },
              {
                icon: Truck,
                title: "Entrega Rápida",
                description: "Enviamos para Brasil e Angola com rastreamento completo"
              },
              {
                icon: Award,
                title: "Estilo Exclusivo",
                description: "Designs únicos que definem tendências na moda"
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-medium transition-all duration-300"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beta Notice */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Acesso Antecipado Beta</h3>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                    <Sparkles className="h-2.5 w-2.5 mr-1" />
                    BETA
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Você está usando a versão de desenvolvimento do EVS Fashion</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Sistema Ativo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-serif text-2xl font-bold">EVS Fashion</h3>
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                  <Zap className="h-2.5 w-2.5 mr-1" />
                  BETA
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Mais Que Moda, É Identidade.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Versão 0.1.0 Beta</span>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <div className="space-y-2">
                <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Package className="h-4 w-4" />
                  Produtos
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <User className="h-4 w-4" />
                  Minha Conta
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Shield className="h-4 w-4" />
                  Suporte
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-2">
                <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Instagram className="h-4 w-4" />
                  @evs_oficial
                </a>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  CEO: Hélio Evaristo
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>© 2026 EVS Fashion. Todos os direitos reservados.</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Brasil & Angola
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                Acesso Antecipado
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ChatBot */}
      <ChatBot />
    </div>
  );
};

export default Index;