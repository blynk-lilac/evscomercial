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
    <Card className="group overflow-hidden border-border hover:border-primary/20 hover:shadow-medium bg-card transition-all duration-300 cursor-pointer">
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
          <Badge className="absolute top-3 left-3 bg-background/95 text-foreground border border-border text-xs">
            {category}
          </Badge>
        )}
        
        {reviewCount > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-md bg-background/95 border border-border text-xs">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviewCount})</span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 bg-background/95 hover:bg-background border border-border"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : ""}`}
          />
        </Button>
      </div>

      <CardContent className="p-4 cursor-pointer" onClick={() => navigate(`/product/${id}`)}>
        <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">{name}</h3>
        
        {reviewCount > 0 ? (
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3 w-3 ${
                  star <= Math.round(rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
            <Star className="h-3 w-3" />
            Seja o primeiro a avaliar
          </p>
        )}
        
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-muted-foreground">{currency}</span>
          <span className="text-lg font-bold">{price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full gap-2 h-10"
        >
          <ShoppingCart className="h-4 w-4" />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
};
