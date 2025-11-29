import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import evsLogo from "@/assets/evs-logo.png";

const EmailConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-secondary/30 via-background to-accent/5">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="relative mb-6">
            <img 
              src={evsLogo} 
              alt="EVS Logo" 
              className="h-20 w-20 animate-scale-in" 
            />
            <div className="absolute -top-2 -right-2 bg-accent rounded-full p-1 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <CheckCircle2 className="h-6 w-6 text-accent-foreground" />
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold text-center mb-2">
            Cadastro Quase Completo!
          </h1>
          <p className="text-muted-foreground text-center">
            Mais Que Moda, É Identidade
          </p>
        </div>

        <Card className="shadow-strong animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-accent" />
            </div>
            <CardTitle>Verifique seu E-mail</CardTitle>
            <CardDescription>
              Enviamos um link de confirmação para seu e-mail
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">1. Verifique sua caixa de entrada</p>
                  <p className="text-muted-foreground">
                    Procure por um e-mail da EVS Fashion
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">2. Clique no link de confirmação</p>
                  <p className="text-muted-foreground">
                    O link é válido por 24 horas
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">3. Comece a comprar!</p>
                  <p className="text-muted-foreground">
                    Após confirmar, você terá acesso total à plataforma
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Não recebeu o e-mail?</strong>
                <br />
                Verifique sua pasta de spam ou lixo eletrônico. Se ainda não encontrar, 
                tente fazer o cadastro novamente.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => navigate("/auth")}
                className="w-full gap-2"
              >
                Ir para Login
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full"
              >
                Voltar para Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailConfirmation;
