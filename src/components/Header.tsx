import { useState } from "react";
import { Menu, ShoppingCart, User, Sparkles } from "lucide-react";
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-soft animate-fade-in">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Menu Hambúrguer - Esquerda */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="hover:bg-primary/10 hover:scale-110 hover:rotate-3 transition-all duration-300"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Logo - Centro */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-all duration-300 group">
          <div className="relative">
            <img 
              src={evsLogo} 
              alt="EVS Logo" 
              className="h-10 w-10 object-contain rounded-full ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300" 
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
              EVS
            </span>
            <Badge 
              variant="outline" 
              className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary bg-primary/5 animate-pulse-soft hidden sm:flex items-center gap-1"
            >
              <Sparkles className="h-2.5 w-2.5" />
              BETA
            </Badge>
          </div>
        </Link>

        {/* Ações - Direita */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/cart">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-primary/10 hover:scale-110 transition-all duration-300"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground animate-bounce-slight shadow-colored">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>
          <Link to="/auth">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-primary/10 hover:scale-110 transition-all duration-300"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
