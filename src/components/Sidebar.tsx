import { X, Home, LogIn, UserPlus, LayoutDashboard, Users, Sparkles, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-background/95 backdrop-blur-xl border-r border-border/50 z-50 transform transition-all duration-500 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-strong`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border/50 bg-[var(--gradient-hero)]">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold">Menu</h2>
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                <Sparkles className="h-2.5 w-2.5 mr-1" />
                BETA
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-destructive/10 hover:text-destructive hover:rotate-90 transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <Link to="/" onClick={onClose}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-primary/10 hover:text-primary hover:translate-x-2 transition-all duration-300 h-12 animate-fade-in"
                style={{ animationDelay: '0.1s' }}
              >
                <Home className="h-5 w-5" />
                Página Inicial
              </Button>
            </Link>

            <Separator className="my-4 bg-border/50" />

            <Link to="/auth?mode=login" onClick={onClose}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-primary/10 hover:text-primary hover:translate-x-2 transition-all duration-300 h-12 animate-fade-in"
                style={{ animationDelay: '0.2s' }}
              >
                <LogIn className="h-5 w-5" />
                Login
              </Button>
            </Link>

            <Link to="/auth?mode=signup" onClick={onClose}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-primary/10 hover:text-primary hover:translate-x-2 transition-all duration-300 h-12 animate-fade-in"
                style={{ animationDelay: '0.3s' }}
              >
                <UserPlus className="h-5 w-5" />
                Cadastro
              </Button>
            </Link>

            <Separator className="my-4 bg-border/50" />

            <Link to="/dashboard" onClick={onClose}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-primary/10 hover:text-primary hover:translate-x-2 transition-all duration-300 h-12 animate-fade-in"
                style={{ animationDelay: '0.4s' }}
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Button>
            </Link>
            
            <Link to="/admin" onClick={onClose}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-accent/10 hover:text-accent hover:translate-x-2 transition-all duration-300 h-12 animate-fade-in"
                style={{ animationDelay: '0.5s' }}
              >
                <Shield className="h-5 w-5" />
                Admin
                <Badge className="ml-auto text-[10px] bg-accent/20 text-accent border-0">PRO</Badge>
              </Button>
            </Link>

            <Separator className="my-4 bg-border/50" />

            <Link to="/team" onClick={onClose}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-primary/10 hover:text-primary hover:translate-x-2 transition-all duration-300 h-12 animate-fade-in"
                style={{ animationDelay: '0.6s' }}
              >
                <Users className="h-5 w-5" />
                Colaboradores
              </Button>
            </Link>
          </nav>

          {/* Footer */}
          <div className="p-5 border-t border-border/50 bg-secondary/30">
            <p className="text-xs text-muted-foreground text-center">
              EVS Fashion • v0.1.0 Beta
            </p>
            <p className="text-[10px] text-muted-foreground/70 text-center mt-1">
              Mais Que Moda, É Identidade
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
