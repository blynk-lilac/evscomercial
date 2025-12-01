import { useState } from "react";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

const Cart = () => {
  const { toast } = useToast();
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const applyDiscount = async () => {
    if (!discountCode.trim()) {
      toast({
        title: "Erro",
        description: "Digite um código de cupom válido.",
        variant: "destructive",
      });
      return;
    }

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para usar cupons.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Validate coupon from database
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', discountCode)
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        toast({
          title: "Cupom inválido",
          description: "Este cupom não existe ou já foi usado.",
          variant: "destructive",
        });
        return;
      }

      // Check if coupon is expired
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast({
          title: "Cupom expirado",
          description: "Este cupom já expirou.",
          variant: "destructive",
        });
        return;
      }

      // Check if coupon reached usage limit
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        toast({
          title: "Cupom já utilizado",
          description: "Este cupom já atingiu o limite de uso.",
          variant: "destructive",
        });
        return;
      }

      // Check if coupon was already used on any product in cart
      const productIds = items.map(item => item.id);
      const { data: usedOnProducts, error: usageError } = await supabase
        .from('coupon_usage')
        .select('product_id')
        .eq('coupon_id', coupon.id)
        .in('product_id', productIds);

      if (usageError) {
        console.error('Error checking coupon usage:', usageError);
      }

      if (usedOnProducts && usedOnProducts.length > 0) {
        const usedProductNames = items
          .filter(item => usedOnProducts.some(u => u.product_id === item.id))
          .map(item => item.name)
          .join(', ');
        
        toast({
          title: "Cupom já utilizado",
          description: `Este cupom já foi usado em: ${usedProductNames}`,
          variant: "destructive",
        });
        return;
      }

      // Apply discount
      setAppliedDiscount(coupon.discount_percentage);
      
      // Record coupon usage for each product in cart
      const couponUsageRecords = items.map(item => ({
        coupon_id: coupon.id,
        user_id: session.user.id,
        product_id: item.id
      }));

      await supabase
        .from('coupon_usage')
        .insert(couponUsageRecords);
      
      // Update usage count and deactivate coupon
      await supabase
        .from('coupons')
        .update({ 
          usage_count: (coupon.usage_count || 0) + 1,
          is_active: false // Desativar após uso
        })
        .eq('id', coupon.id);

      toast({
        title: "Cupom aplicado!",
        description: `Você ganhou ${coupon.discount_percentage}% de desconto. O cupom foi utilizado e expirou.`,
      });
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      toast({
        title: "Erro",
        description: "Erro ao validar cupom. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const discount = (subtotal * appliedDiscount) / 100;
  const total = subtotal - discount;
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para finalizar a compra.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      console.log('Iniciando checkout com PayPal...', { total, currency: 'BRL' });

      // Call PayPal edge function to create checkout order
      const { data, error } = await supabase.functions.invoke('paypal-payment', {
        body: {
          action: 'checkout',
          amount: total,
          currency: 'BRL'
        }
      });

      console.log('Resposta do PayPal:', { data, error });

      if (error) {
        console.error('Erro no edge function:', error);
        throw error;
      }

      // Handle new response structure
      if (data?.success && data?.data?.approval_url) {
        console.log('URL de aprovação:', data.data.approval_url);
        toast({
          title: "Redirecionando para PayPal",
          description: "Você será redirecionado para concluir o pagamento.",
        });
        window.location.href = data.data.approval_url;
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error('URL de aprovação PayPal não encontrada na resposta');
      }
      
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="font-serif text-4xl font-bold mb-8 animate-fade-in">
            Carrinho de Compras
          </h1>

          {items.length === 0 ? (
            <Card className="shadow-medium animate-fade-in">
              <CardContent className="p-12 text-center">
                <div className="mb-6">
                  <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground" />
                </div>
                <h2 className="font-serif text-2xl font-bold mb-2">
                  Seu carrinho está vazio
                </h2>
                <p className="text-muted-foreground mb-6">
                  Explore nossos produtos e adicione itens ao carrinho
                </p>
                <Link to="/">
                  <Button size="lg" className="gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Continuar Comprando
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, index) => (
                  <Card 
                    key={item.id} 
                    className="shadow-soft hover:shadow-medium transition-smooth animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-4 flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded shadow-soft"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{item.name}</h3>
                        <p className="font-bold text-lg">
                          {item.currency} {item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="hover:bg-destructive/10 hover:text-destructive transition-smooth"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="transition-smooth"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="transition-smooth"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Summary */}
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Card className="shadow-medium sticky top-24">
                  <CardHeader>
                    <CardTitle>Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">
                          R$ {subtotal.toFixed(2)}
                        </span>
                      </div>
                      {appliedDiscount > 0 && (
                        <div className="flex justify-between text-accent">
                          <span>Desconto ({appliedDiscount}%)</span>
                          <span>-R$ {discount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Código de Desconto
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite o código UUID"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                        />
                        <Button 
                          variant="outline" 
                          onClick={applyDiscount}
                          className="transition-smooth"
                        >
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-accent hover:bg-accent/90 transition-smooth" 
                      size="lg"
                      onClick={handleCheckout}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processando...' : 'Finalizar com PayPal'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
