import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage } from "@/lib/imageMap";
import { Star, ShoppingCart, Heart, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  image_url: string;
  category: string;
  description: string;
  region: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
  } | null;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
      loadReviews();
    }
  }, [id]);

  const loadProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Produto não encontrado.",
        variant: "destructive",
      });
      navigate('/');
    } else {
      setProduct(data);
    }
    setLoading(false);
  };

  const loadReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (data) {
      // Get profile info for each review
      const reviewsWithProfiles = await Promise.all(
        data.map(async (review) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', review.user_id)
            .single();
          
          return {
            ...review,
            profiles: profile,
          };
        })
      );
      setReviews(reviewsWithProfiles as Review[]);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para avaliar produtos.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, escreva um comentário.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from('reviews')
      .insert({
        product_id: id,
        user_id: user.id,
        rating,
        comment: comment.trim(),
      });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua avaliação.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Avaliação enviada!",
        description: "Sua avaliação será analisada por nossos administradores.",
      });
      setComment("");
      setRating(5);
      // Recarregar reviews aprovadas
      loadReviews();
    }

    setSubmitting(false);
  };

  const handleAddToCart = () => {
    toast({
      title: "Produto adicionado!",
      description: "O item foi adicionado ao seu carrinho.",
    });
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} cartItemCount={0} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 hover:bg-secondary transition-smooth animate-fade-in"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="animate-fade-in">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-secondary shadow-medium">
              <img
                src={getProductImage(product.image_url)}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              {product.category && (
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                  {product.category}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-background/80 hover:bg-background transition-smooth"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart
                  className={`h-5 w-5 ${isLiked ? "fill-accent text-accent" : ""}`}
                />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div>
              <Badge className="mb-4">{product.region}</Badge>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                {product.name}
              </h1>
              <p className="text-muted-foreground mb-6 text-lg">
                {product.description}
              </p>

              {reviews.length > 0 && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(avgRating)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg">
                    {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'})
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-3 mb-8">
                <span className="text-5xl font-bold">{product.currency}</span>
                <span className="text-5xl font-bold">{product.price.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 transition-smooth gap-2 text-lg py-6"
            >
              <ShoppingCart className="h-5 w-5" />
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Write Review */}
          <Card className="animate-fade-in shadow-medium" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle>Deixe sua Avaliação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sua nota
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-smooth hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 cursor-pointer transition-smooth ${
                          star <= rating
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted hover:text-yellow-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Seu comentário
                </label>
                <Textarea
                  placeholder="Compartilhe sua experiência com este produto..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="transition-smooth"
                />
              </div>

              <Button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="w-full transition-smooth"
              >
                {submitting ? "Enviando..." : "Enviar Avaliação"}
              </Button>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h2 className="font-serif text-2xl font-bold mb-4">
              Avaliações dos Clientes
            </h2>
            {reviews.length === 0 ? (
              <Card className="shadow-soft">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Ainda não há avaliações para este produto. Seja o primeiro!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <Card 
                    key={review.id} 
                    className="shadow-soft hover:shadow-medium transition-smooth animate-fade-in"
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="font-medium mb-1">
                        {review.profiles?.full_name || "Cliente EVS"}
                      </p>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
