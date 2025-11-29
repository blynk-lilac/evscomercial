import { useState } from "react";
import { Menu, ShoppingCart, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import evsLogo from "@/assets/evs-logo.png";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { totalItems } = useCart();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft animate-fade-in">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Menu Hambúrguer - Esquerda */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="hover:bg-secondary hover:scale-110 transition-all duration-200"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Logo - Centro em mobile, Direita em desktop */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-smooth">
          <img src={evsLogo} alt="EVS Logo" className="h-10 w-10 object-contain" />
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight">EVS</span>
        </Link>

        {/* Ações - Direita */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative hover:bg-secondary hover:scale-110 transition-all duration-200">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground animate-scale-in">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="ghost" size="icon" className="hover:bg-secondary hover:scale-110 transition-all duration-200">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
