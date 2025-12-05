import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { SignUpWizard, SignUpData } from "@/components/auth/SignUpWizard";
import { PasswordInput } from "@/components/auth/PasswordInput";
import evsLogo from "@/assets/evs-logo-lion.jpg";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signUp, signIn } = useAuth();
  const defaultMode = searchParams.get("mode") || "login";

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoading(false);

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message === "Invalid login credentials" 
          ? "E-mail ou senha incorretos." 
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta à EVS Fashion.",
      });
      navigate("/dashboard");
    }
  };

  const handleSignupComplete = async (data: SignUpData) => {
    setLoading(true);
    const { error } = await signUp(data.email, data.password, data.fullName);
    setLoading(false);

    if (error) {
      if (error.message.includes("User already registered")) {
        toast({
          title: "Erro no cadastro",
          description: "Este e-mail já está cadastrado. Tente fazer login.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Conta criada!",
        description: "Você já pode fazer login.",
      });
      // Redirect to login tab
      window.location.href = "/auth?mode=login";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-secondary/30 via-background to-accent/5">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <img 
            src={evsLogo} 
            alt="EVS Logo" 
            className="h-20 w-20 mb-4 animate-scale-in" 
          />
          <h1 className="font-serif text-3xl font-bold">EVS Fashion</h1>
          <p className="text-muted-foreground">Mais Que Moda, É Identidade</p>
        </div>

        <Tabs defaultValue={defaultMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login" className="transition-smooth">Login</TabsTrigger>
            <TabsTrigger value="signup" className="transition-smooth">Cadastro</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="shadow-strong animate-fade-in">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>Entrar na sua conta</CardTitle>
                  <CardDescription>
                    Digite seu email e senha para acessar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <PasswordInput
                      id="login-password"
                      value={loginPassword}
                      onChange={setLoginPassword}
                      placeholder="••••••••"
                      disabled={loading}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full transition-smooth" 
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <SignUpWizard 
              onComplete={handleSignupComplete} 
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
