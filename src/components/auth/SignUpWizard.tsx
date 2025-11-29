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
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Digite seu nome completo"
              value={formData.fullName}
              onChange={(e) => updateFormData("fullName", e.target.value)}
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Como você gostaria de ser chamado?
            </p>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="username">Nome de Usuário</Label>
            <Input
              id="username"
              type="text"
              placeholder="seu_username"
              value={formData.username}
              onChange={(e) => updateFormData("username", e.target.value.toLowerCase())}
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Use apenas letras, números e _ (3-20 caracteres)
            </p>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Enviaremos um link de confirmação para este e-mail
            </p>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <PasswordInput
                id="password"
                value={formData.password}
                onChange={(value) => updateFormData("password", value)}
                placeholder="Digite sua senha"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo de 6 caracteres
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
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
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg bg-secondary/50 p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Check className="h-5 w-5 text-accent" />
                Revise seus dados
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome:</span>
                  <span className="font-medium">{formData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Usuário:</span>
                  <span className="font-medium">@{formData.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">E-mail:</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
              <p className="text-sm text-accent-foreground">
                📧 Após criar sua conta, você receberá um e-mail de confirmação. 
                Clique no link para ativar sua conta EVS.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-strong animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Criar nova conta</CardTitle>
          <span className="text-sm text-muted-foreground">
            Passo {currentStep} de {totalSteps}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <CardDescription>
          {currentStep === 1 && "Primeiro, vamos saber seu nome"}
          {currentStep === 2 && "Escolha um nome de usuário único"}
          {currentStep === 3 && "Digite seu melhor e-mail"}
          {currentStep === 4 && "Crie uma senha segura"}
          {currentStep === 5 && "Confirme seus dados e finalize"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>{renderStep()}</CardContent>
      
      <CardFooter className="flex gap-2">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={loading}
            className="flex-1"
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
            className="flex-1"
          >
            Próximo
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Criando conta..." : "Criar Conta EVS"}
            <Check className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
