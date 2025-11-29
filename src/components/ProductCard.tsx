import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

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
  const [isLiked, setIsLiked] = useState(false);

  const handleAddToCart = () => {
    onAddToCart?.(id);
  };

  return (
    <Card className="group overflow-hidden border-border hover:shadow-medium transition-all duration-300">
      <div className="relative overflow-hidden aspect-[3/4] bg-secondary">
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

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{name}</h3>
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
