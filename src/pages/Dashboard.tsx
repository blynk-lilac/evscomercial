import { useState } from "react";
import { User, Settings, CreditCard, LogOut, Shield, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  const handleLogout = () => {
    toast({
      title: "Sessão encerrada",
      description: "Até logo!",
    });
    navigate("/");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Senha alterada",
      description: "Verifique seu email para confirmar a alteração.",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar dimensões e formato
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Aqui você pode adicionar validação de dimensões
          setProfileImage(event.target?.result as string);
          toast({
            title: "Foto atualizada",
            description: "Sua foto de perfil foi alterada.",
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-4xl font-bold">Dashboard</h1>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="settings">Definições</TabsTrigger>
            <TabsTrigger value="bank">Banco</TabsTrigger>
          </TabsList>

          {/* Perfil */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Perfil
                </CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileImage} />
                    <AvatarFallback className="text-2xl">EV</AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md transition-smooth">
                        <Camera className="h-4 w-4" />
                        Trocar Foto
                      </div>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">
                      Formato avatar recomendado (quadrado)
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input placeholder="Seu nome" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="seu@email.com" />
                  </div>
                  <Button>Salvar Alterações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Definições */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações de Segurança
                </CardTitle>
                <CardDescription>
                  Gerencie senha e autenticação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Senha Atual</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nova Senha</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar Nova Senha</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <Button type="submit">Alterar Senha</Button>
                </form>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-accent" />
                      <div>
                        <p className="font-medium">Autenticação de Dois Fatores</p>
                        <p className="text-sm text-muted-foreground">
                          Senha de 4 dígitos para proteção adicional
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                    />
                  </div>

                  {twoFactorEnabled && (
                    <div className="space-y-2 pl-7">
                      <Label>Código de 4 Dígitos</Label>
                      <Input
                        type="text"
                        maxLength={4}
                        placeholder="0000"
                        className="w-32"
                      />
                      <Button size="sm">Configurar</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banco */}
          <TabsContent value="bank" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Carteira PayPal
                </CardTitle>
                <CardDescription>
                  Gerencie saques, depósitos e levantamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-secondary p-6 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Saldo Disponível</p>
                  <p className="text-3xl font-bold">R$ 0,00</p>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <CreditCard className="h-4 w-4" />
                    Depositar via PayPal
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <CreditCard className="h-4 w-4" />
                    Sacar para PayPal
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <CreditCard className="h-4 w-4" />
                    Histórico de Transações
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Conectar PayPal</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Vincule sua conta PayPal para realizar transações
                  </p>
                  <Button size="sm" className="bg-[#0070BA] hover:bg-[#005EA6]">
                    Conectar com PayPal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
