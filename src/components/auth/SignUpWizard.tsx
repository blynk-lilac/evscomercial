import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PasswordInput } from "./PasswordInput";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SignUpWizardProps {
  onComplete: (data: SignUpData) => Promise<void>;
  loading: boolean;
}

export interface SignUpData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const SignUpWizard = ({ onComplete, loading }: SignUpWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<SignUpData>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim() || formData.fullName.length < 3) {
          toast({
            title: "Erro",
            description: "Nome deve ter no mínimo 3 caracteres.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      
      case 2:
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!formData.username.trim()) {
          toast({
            title: "Erro",
            description: "Digite um nome de usuário.",
            variant: "destructive",
          });
          return false;
        }
        if (!usernameRegex.test(formData.username)) {
          toast({
            title: "Erro",
            description: "Nome de usuário inválido. Use apenas letras, números e _ (3-20 caracteres).",
            variant: "destructive",
          });
          return false;
        }
        return true;
      
      case 3:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast({
            title: "Erro",
            description: "Digite um e-mail válido.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      
      case 4:
        if (formData.password.length < 6) {
          toast({
            title: "Erro",
            description: "A senha deve ter no mínimo 6 caracteres.",
            variant: "destructive",
          });
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Erro",
            description: "As senhas não coincidem.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (validateStep(4)) {
      await onComplete(formData);
    }
  };

  const updateFormData = (field: keyof SignUpData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3 animate-fade-in">
            <Label htmlFor="fullName" className="text-base font-semibold">Nome Completo</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Digite seu nome completo"
              value={formData.fullName}
              onChange={(e) => updateFormData("fullName", e.target.value)}
              disabled={loading}
              autoFocus
              className="h-12 text-base border-2 focus:border-accent/50 transition-all"
            />
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="text-accent">💡</span>
              Como você gostaria de ser chamado?
            </p>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-3 animate-fade-in">
            <Label htmlFor="username" className="text-base font-semibold">Nome de Usuário</Label>
            <Input
              id="username"
              type="text"
              placeholder="seu_username"
              value={formData.username}
              onChange={(e) => updateFormData("username", e.target.value.toLowerCase())}
              disabled={loading}
              autoFocus
              className="h-12 text-base border-2 focus:border-accent/50 transition-all"
            />
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="text-accent">💡</span>
              Use apenas letras, números e _ (3-20 caracteres)
            </p>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-3 animate-fade-in">
            <Label htmlFor="email" className="text-base font-semibold">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              disabled={loading}
              autoFocus
              className="h-12 text-base border-2 focus:border-accent/50 transition-all"
            />
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="text-accent">📧</span>
              Enviaremos um link de confirmação para este e-mail
            </p>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-semibold">Senha</Label>
              <PasswordInput
                id="password"
                value={formData.password}
                onChange={(value) => updateFormData("password", value)}
                placeholder="Digite sua senha"
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="text-accent">🔒</span>
                Mínimo de 6 caracteres
              </p>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-base font-semibold">Confirmar Senha</Label>
              <PasswordInput
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(value) => updateFormData("confirmPassword", value)}
                placeholder="Digite novamente sua senha"
                disabled={loading}
              />
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-6 border-2 border-accent/20 space-y-4 shadow-medium">
              <h4 className="font-bold text-lg flex items-center gap-2 text-foreground">
                <Check className="h-6 w-6 text-accent" />
                Revise seus dados
              </h4>
              
              <div className="space-y-3 text-base">
                <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
                  <span className="text-muted-foreground font-medium">Nome:</span>
                  <span className="font-semibold text-foreground">{formData.fullName}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
                  <span className="text-muted-foreground font-medium">Usuário:</span>
                  <span className="font-semibold text-accent">@{formData.username}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
                  <span className="text-muted-foreground font-medium">E-mail:</span>
                  <span className="font-semibold text-foreground">{formData.email}</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-2xl bg-accent/10 border-2 border-accent/30 p-5 shadow-medium">
              <div className="flex gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="font-semibold text-accent mb-2">Confirmação por E-mail</p>
                  <p className="text-sm text-accent-foreground/90 leading-relaxed">
                    Após criar sua conta, você receberá um e-mail de confirmação. 
                    Clique no link para ativar sua conta EVS e começar suas compras!
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="relative overflow-hidden shadow-strong hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition-all duration-500 animate-fade-in border-2 border-accent/20">
      {/* Decorative background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
            Criar nova conta
          </CardTitle>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
            Passo {currentStep}/{totalSteps}
          </span>
        </div>
        <Progress value={progress} className="h-3 shadow-sm" />
        <CardDescription className="text-base pt-2">
          {currentStep === 1 && "✨ Primeiro, vamos saber seu nome"}
          {currentStep === 2 && "🎯 Escolha um nome de usuário único"}
          {currentStep === 3 && "📧 Digite seu melhor e-mail"}
          {currentStep === 4 && "🔒 Crie uma senha segura"}
          {currentStep === 5 && "✅ Confirme seus dados e finalize"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative pt-6">{renderStep()}</CardContent>
      
      <CardFooter className="relative flex gap-3 pt-6">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={loading}
            className="flex-1 border-2 hover:bg-accent/10 hover:border-accent/30 transition-all"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        )}
        
        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="flex-1 bg-accent hover:bg-accent/90 shadow-medium hover:shadow-strong transition-all"
          >
            Próximo
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-accent hover:bg-accent/90 shadow-medium hover:shadow-strong transition-all font-semibold"
          >
            {loading ? "✨ Criando conta..." : "🚀 Criar Conta EVS"}
            <Check className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
