import { useState, useEffect } from "react";
import { User as UserIcon, Settings, Wallet, LogOut, Shield, Camera, ArrowUpCircle, ArrowDownCircle, Send, History, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "bank">("profile");
  
  // Wallet states
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "BRL" | "AOA">("BRL");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");

  // Handle deposit success callback from PayPal
  useEffect(() => {
    const depositSuccess = searchParams.get('deposit_success');
    const depositCancelled = searchParams.get('deposit_cancelled');
    
    if (depositSuccess === 'true') {
      const amount = searchParams.get('amount');
      const currency = searchParams.get('currency');
      
      toast({
        title: "Depósito pendente",
        description: `Seu depósito de ${currency} ${amount} foi iniciado. Por favor, aguarde a confirmação.`,
      });
      
      // Clear URL params
      setSearchParams({});
      setActiveTab("bank");
    }
    
    if (depositCancelled === 'true') {
      toast({
        title: "Depósito cancelado",
        description: "O depósito foi cancelado.",
        variant: "destructive",
      });
      setSearchParams({});
      setActiveTab("bank");
    }
  }, [searchParams, setSearchParams, toast]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setFullName(data.full_name || '');
        setUsername(data.username || '');
        setProfileImage(data.avatar_url || '');
      }
      setLoading(false);
    };

    const loadWallet = async () => {
      let { data: walletData, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newWallet } = await supabase
          .from('wallets')
          .insert({
            user_id: user.id,
            balance_usd: 0,
            balance_brl: 0,
            balance_aoa: 0,
          })
          .select()
          .single();
        walletData = newWallet;
      }

      setWallet(walletData);
    };

    const loadTransactions = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setTransactions(data || []);
    };

    loadProfile();
    loadWallet();
    loadTransactions();
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Senha alterada",
      description: "Verifique seu email para confirmar a alteração.",
    });
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: fullName, 
        username: username,
        avatar_url: profileImage 
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas.",
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setProfileImage(event.target?.result as string);
          toast({
            title: "Foto selecionada",
            description: "Clique em 'Salvar Alterações' para confirmar.",
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || !user) return;

    try {
      const { data, error } = await supabase.functions.invoke('paypal-payment', {
        body: {
          action: 'deposit',
          amount: parseFloat(depositAmount),
          currency: selectedCurrency,
        },
      });

      if (error) throw error;

      if (data?.success && data?.data?.approval_url) {
        toast({
          title: "Redirecionando para PayPal",
          description: "Você será redirecionado para concluir o pagamento.",
        });
        window.location.href = data.data.approval_url;
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Resposta inválida do servidor');
      }

      setDepositAmount("");
    } catch (error: any) {
      toast({
        title: "Erro no Depósito",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawAmount || !user) return;

    const amount = parseFloat(withdrawAmount);
    if (amount < 100 || amount > 200) {
      toast({
        title: "Erro",
        description: "O valor de levantamento deve ser entre 100 e 200.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('paypal-payment', {
        body: {
          action: 'withdrawal',
          amount,
          currency: selectedCurrency,
          recipient_email: wallet?.paypal_email || user.email,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Levantamento processado",
          description: `O valor será enviado para ${wallet?.paypal_email || user.email}.`,
        });
        
        // Update local wallet state with new balance
        if (data.data?.new_balance !== undefined) {
          setWallet((prev: any) => ({
            ...prev,
            [`balance_${selectedCurrency.toLowerCase()}`]: data.data.new_balance,
          }));
        }
      } else if (data?.error) {
        throw new Error(data.error);
      }

      setWithdrawAmount("");
      
      // Reload transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setTransactions(txData || []);
    } catch (error: any) {
      toast({
        title: "Erro no Levantamento",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || !recipientEmail || !user) return;

    try {
      const { data, error } = await supabase.functions.invoke('paypal-payment', {
        body: {
          action: 'transfer',
          amount: parseFloat(transferAmount),
          currency: selectedCurrency,
          recipient_email: recipientEmail,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Transferência realizada",
          description: `Valor enviado para ${recipientEmail}`,
        });
        
        // Update local wallet state
        if (data.data?.new_balance !== undefined) {
          setWallet((prev: any) => ({
            ...prev,
            [`balance_${selectedCurrency.toLowerCase()}`]: data.data.new_balance,
          }));
        }
      } else if (data?.error) {
        throw new Error(data.error);
      }

      setTransferAmount("");
      setRecipientEmail("");

      // Reload transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setTransactions(txData || []);
    } catch (error: any) {
      toast({
        title: "Erro na Transferência",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
    }
  };

  const getBalance = () => {
    if (!wallet) return "0,00";
    const balanceKey = `balance_${selectedCurrency.toLowerCase()}`;
    return (wallet[balanceKey] || 0).toFixed(2);
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      BRL: "R$",
      AOA: "Kz",
    };
    return `${symbols[currency]} ${amount.toFixed(2)}`;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="pt-20 pb-32 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-serif text-4xl font-bold">Dashboard</h1>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <Card className="animate-in fade-in-50 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Informações do Perfil
                </CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-32 w-32 border-4 border-primary">
                    <AvatarImage src={profileImage} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-background">
                      {fullName?.substring(0, 2).toUpperCase() || 'EV'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-3">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-lg transition-smooth text-background">
                        <Camera className="h-5 w-5" />
                        <span className="font-medium">Trocar Foto</span>
                      </div>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Formato avatar recomendado (quadrado)
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Nome Completo</Label>
                    <Input
                      placeholder="Seu nome"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Nome de Usuário</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-lg">@</span>
                      <Input
                        placeholder="seu_username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        className="h-12 text-lg"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use apenas letras, números e _
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Email</Label>
                    <Input type="email" value={user?.email || ''} disabled className="h-12 text-lg" />
                  </div>
                  <Button onClick={handleProfileUpdate} className="w-full h-12 text-lg">
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bank Tab */}
          {activeTab === "bank" && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              {/* Balance Card */}
              <Card className="bg-gradient-to-br from-primary via-primary/80 to-accent">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-background/80 mb-1">Saldo Disponível</p>
                      <p className="text-4xl font-bold text-background">
                        {formatCurrency(parseFloat(getBalance()), selectedCurrency)}
                      </p>
                    </div>
                    <Wallet className="h-12 w-12 text-background/80" />
                  </div>
                  <Select value={selectedCurrency} onValueChange={(val: any) => setSelectedCurrency(val)}>
                    <SelectTrigger className="w-40 bg-background/20 border-background/30 text-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">R$ (BRL)</SelectItem>
                      <SelectItem value="USD">$ (USD)</SelectItem>
                      <SelectItem value="AOA">Kz (AOA)</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Actions Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Deposit */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-lg transition-smooth">
                      <CardContent className="p-6 text-center">
                        <ArrowDownCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                        <h3 className="font-semibold text-lg">Depositar</h3>
                        <p className="text-sm text-muted-foreground">Adicionar fundos</p>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Depositar via PayPal</DialogTitle>
                      <DialogDescription>
                        Adicione fundos à sua carteira EVS
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Valor</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="h-12 text-lg"
                        />
                      </div>
                      <Button onClick={handleDeposit} className="w-full h-12 bg-[#0070BA] hover:bg-[#005EA6]">
                        <DollarSign className="mr-2" />
                        Continuar para PayPal
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Withdrawal */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-lg transition-smooth">
                      <CardContent className="p-6 text-center">
                        <ArrowUpCircle className="h-12 w-12 mx-auto mb-3 text-red-600" />
                        <h3 className="font-semibold text-lg">Levantar</h3>
                        <p className="text-sm text-muted-foreground">Sacar (Mín: 100, Máx: 200)</p>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Levantamento para PayPal</DialogTitle>
                      <DialogDescription>
                        Transfira fundos para sua conta PayPal
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Valor (Mínimo: 100, Máximo: 200)</Label>
                        <Input
                          type="number"
                          placeholder="100.00"
                          min="100"
                          max="200"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="h-12 text-lg"
                        />
                      </div>
                      <Button onClick={handleWithdrawal} className="w-full h-12">
                        Confirmar Levantamento
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Transfer */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-lg transition-smooth">
                      <CardContent className="p-6 text-center">
                        <Send className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                        <h3 className="font-semibold text-lg">Transferir</h3>
                        <p className="text-sm text-muted-foreground">Enviar para email PayPal</p>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Transferência via PayPal</DialogTitle>
                      <DialogDescription>
                        Transfira fundos para outro email PayPal
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Email do destinatário (PayPal)</Label>
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          className="h-12 text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Valor</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="h-12 text-lg"
                        />
                      </div>
                      <Button onClick={handleTransfer} className="w-full h-12 bg-blue-600 hover:bg-blue-700">
                        <Send className="mr-2 h-4 w-4" />
                        Confirmar Transferência
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

              </div>

              {/* Transactions History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Movimentos da Conta
                  </CardTitle>
                  <CardDescription>Histórico de transações recentes</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma transação ainda
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {transaction.type === 'deposit' && <ArrowDownCircle className="h-5 w-5 text-green-600" />}
                            {transaction.type === 'withdrawal' && <ArrowUpCircle className="h-5 w-5 text-red-600" />}
                            {transaction.type === 'transfer' && <Send className="h-5 w-5 text-blue-600" />}
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(transaction.created_at).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <p className="font-bold">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-2 p-2">
            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              onClick={() => setActiveTab("profile")}
              className="flex flex-col h-16 gap-1"
            >
              <UserIcon className="h-5 w-5" />
              <span className="text-xs">Perfil</span>
            </Button>
            <Button
              variant={activeTab === "bank" ? "default" : "ghost"}
              onClick={() => setActiveTab("bank")}
              className="flex flex-col h-16 gap-1"
            >
              <Wallet className="h-5 w-5" />
              <span className="text-xs">Banco</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;