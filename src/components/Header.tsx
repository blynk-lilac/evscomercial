import { Menu, ShoppingCart, User, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import evsLogo from "@/assets/evs-logo-lion.jpg";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { totalItems } = useCart();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-9 w-9 hover:bg-secondary transition-colors"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img 
            src={evsLogo} 
            alt="EVS Logo" 
            className="h-8 w-8 object-contain rounded-full ring-1 ring-border" 
          />
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-lg font-bold tracking-tight">EVS</span>
            <Badge 
              variant="outline" 
              className="text-[9px] px-1.5 py-0 h-4 border-primary/30 text-primary bg-primary/5 hidden sm:flex items-center gap-0.5"
            >
              <Zap className="h-2 w-2" />
              BETA
            </Badge>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link to="/cart">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 relative hover:bg-secondary transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/auth">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 hover:bg-secondary transition-colors"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
