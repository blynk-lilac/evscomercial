import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  category?: string;
}

export const ProductCard = ({
  id,
  name,
  price,
  currency,
  image,
  category,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [isLiked, setIsLiked] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);

  useEffect(() => {
    loadReviews();
  }, [id]);

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', id)
      .eq('is_approved', true);

    if (data && data.length > 0) {
      const avgRating = data.reduce((acc, review) => acc + review.rating, 0) / data.length;
      setRating(avgRating);
      setReviewCount(data.length);
    }
  };

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      currency,
      image,
    });
  };

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-strong bg-card transition-all duration-500 cursor-pointer animate-fade-in hover:-translate-y-2">
      <div 
        className="relative overflow-hidden aspect-[3/4] bg-secondary"
        onClick={() => navigate(`/product/${id}`)}
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {category && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground shadow-medium backdrop-blur-sm">
            {category}
          </Badge>
        )}
        {reviewCount > 0 && (
          <Badge className="absolute bottom-3 left-3 bg-background/95 text-foreground shadow-medium backdrop-blur-md border border-border/50">
            ⭐ {rating.toFixed(1)} ({reviewCount})
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-background/90 hover:bg-accent hover:text-accent-foreground hover:scale-110 hover:rotate-12 transition-all duration-300 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
        >
          <Heart
            className={`h-5 w-5 transition-all duration-300 ${isLiked ? "fill-accent text-accent scale-110" : ""}`}
          />
        </Button>
      </div>

      <CardContent className="p-5 cursor-pointer" onClick={() => navigate(`/product/${id}`)}>
        <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">{name}</h3>
        
        {reviewCount > 0 ? (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 transition-colors ${
                    star <= Math.round(rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({reviewCount})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-muted-foreground italic">
              ✨ Seja o primeiro a avaliar!
            </span>
          </div>
        )}
        
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-sm font-medium text-muted-foreground">{currency}</span>
          <span className="text-2xl font-bold text-foreground">{price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        
        <div className="text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          Ver detalhes →
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full bg-primary hover:bg-primary/90 hover:shadow-colored transition-all duration-300 gap-2 h-11"
        >
          <ShoppingCart className="h-4 w-4" />
          Adicionar ao Carrinho
        </Button>
      </CardFooter>
    </Card>
  );
};
