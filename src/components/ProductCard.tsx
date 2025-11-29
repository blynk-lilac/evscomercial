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
    <Card className="group overflow-hidden border-border hover:shadow-strong transition-all duration-300 cursor-pointer animate-fade-in hover:-translate-y-1">
      <div 
        className="relative overflow-hidden aspect-[3/4] bg-secondary"
        onClick={() => navigate(`/product/${id}`)}
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {category && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground shadow-medium">
            {category}
          </Badge>
        )}
        {reviewCount > 0 && (
          <Badge className="absolute bottom-3 left-3 bg-background/90 text-foreground shadow-medium backdrop-blur-sm">
            ⭐ {rating.toFixed(1)} ({reviewCount})
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-background/80 hover:bg-background hover:scale-110 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
        >
          <Heart
            className={`h-5 w-5 transition-smooth ${isLiked ? "fill-accent text-accent" : ""}`}
          />
        </Button>
      </div>

      <CardContent className="p-4 cursor-pointer" onClick={() => navigate(`/product/${id}`)}>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-accent transition-smooth">{name}</h3>
        
        {reviewCount > 0 ? (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(rating)
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">
              Seja o primeiro a avaliar!
            </span>
          </div>
        )}
        
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold">{currency}</span>
          <span className="text-2xl font-bold">{price.toFixed(2)}</span>
        </div>
        
        <div className="text-sm text-accent font-medium opacity-0 group-hover:opacity-100 transition-smooth">
          Clique para ver detalhes e avaliar →
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full bg-primary hover:bg-primary/90 transition-smooth gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Adicionar ao Carrinho
        </Button>
      </CardFooter>
    </Card>
  );
};
