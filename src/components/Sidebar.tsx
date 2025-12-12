import { X, Home, LogIn, UserPlus, LayoutDashboard, Users, Zap, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const menuItems = [
    { to: "/", icon: Home, label: "Página Inicial" },
  ];

  const authItems = [
    { to: "/auth?mode=login", icon: LogIn, label: "Login" },
    { to: "/auth?mode=signup", icon: UserPlus, label: "Cadastro" },
  ];

  const accountItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin", icon: Shield, label: "Admin", badge: "PRO" },
    { to: "/team", icon: Users, label: "Colaboradores" },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-background border-r border-border z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold">Menu</span>
              <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">
                <Zap className="h-2 w-2 mr-0.5" />
                BETA
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            {/* Main */}
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={onClose}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 hover:bg-secondary"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            <Separator className="my-3" />

            {/* Auth */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground px-3 mb-2 block">Conta</span>
              {authItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={onClose}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 hover:bg-secondary"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            <Separator className="my-3" />

            {/* Account */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground px-3 mb-2 block">Área Privada</span>
              {accountItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={onClose}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 hover:bg-secondary"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.badge && (
                      <Badge className="ml-auto text-[9px] bg-primary/10 text-primary border-0">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>EVS Fashion v0.1.0 Beta</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
