import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  category?: string;
  onAddToCart?: (id: string) => void;
}

export const ProductCard = ({
  id,
  name,
  price,
  currency,
  image,
  category,
  onAddToCart,
}: ProductCardProps) => {
  const navigate = useNavigate();
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
    onAddToCart?.(id);
  };

  return (
    <Card className="group overflow-hidden border-border hover:shadow-medium transition-all duration-300 cursor-pointer animate-fade-in">
      <div 
        className="relative overflow-hidden aspect-[3/4] bg-secondary"
        onClick={() => navigate(`/product/${id}`)}
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {category && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
            {category}
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-background/80 hover:bg-background transition-smooth"
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart
            className={`h-5 w-5 ${isLiked ? "fill-accent text-accent" : ""}`}
          />
        </Button>
      </div>

      <CardContent className="p-4" onClick={() => navigate(`/product/${id}`)}>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{name}</h3>
        
        {reviewCount > 0 && (
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
        )}
        
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{currency}</span>
          <span className="text-2xl font-bold">{price.toFixed(2)}</span>
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
