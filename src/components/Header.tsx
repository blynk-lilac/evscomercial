import { useState } from "react";
import { Menu, ShoppingCart, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import evsLogo from "@/assets/evs-logo.png";

interface HeaderProps {
  onMenuClick: () => void;
  cartItemCount?: number;
}

export const Header = ({ onMenuClick, cartItemCount = 0 }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-soft">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Menu Hambúrguer - Esquerda */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="hover:bg-secondary transition-smooth"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Logo - Direita */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-smooth">
          <img src={evsLogo} alt="EVS Logo" className="h-10 w-10 object-contain" />
          <span className="font-serif text-2xl font-bold tracking-tight">EVS</span>
        </Link>

        {/* Ações - Direita */}
        <div className="flex items-center gap-2">
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative hover:bg-secondary transition-smooth">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="ghost" size="icon" className="hover:bg-secondary transition-smooth">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
