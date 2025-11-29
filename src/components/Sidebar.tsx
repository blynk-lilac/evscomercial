import { X, Home, LogIn, UserPlus, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-strong`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-serif text-xl font-bold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-secondary transition-smooth"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Link to="/" onClick={onClose}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-secondary transition-smooth"
              >
                <Home className="h-5 w-5" />
                Página Inicial
              </Button>
            </Link>

            <Separator className="my-4" />

            <Link to="/auth?mode=login" onClick={onClose}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-secondary transition-smooth"
              >
                <LogIn className="h-5 w-5" />
                Login
              </Button>
            </Link>

            <Link to="/auth?mode=signup" onClick={onClose}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-secondary transition-smooth"
              >
                <UserPlus className="h-5 w-5" />
                Cadastro
              </Button>
            </Link>

            <Separator className="my-4" />

            <Link to="/dashboard" onClick={onClose}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-secondary transition-smooth"
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Button>
            </Link>
            
            <Link to="/admin" onClick={onClose}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 hover:bg-secondary transition-smooth"
              >
                <LayoutDashboard className="h-5 w-5" />
                Admin
              </Button>
            </Link>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              EVS - Mais Que Moda, É Identidade
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
