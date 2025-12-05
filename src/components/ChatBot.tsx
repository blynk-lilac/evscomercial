import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, X, Send, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import evsLogo from "@/assets/evs-logo-lion.jpg";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  couponCode?: string;
}

const MessageSkeleton = () => (
  <div className="flex justify-start items-start gap-2">
    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
    <div className="space-y-2 max-w-[75%]">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! 👋 Sou o EVS Comercial, seu assistente virtual da EVS Fashion. Como posso ajudar você hoje?'
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log('Sending message to evs-chat...');
      const { data, error } = await supabase.functions.invoke('evs-chat', {
        body: { 
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      console.log('evs-chat response:', { data, error });

      if (error) {
        console.error('evs-chat error:', error);
        throw new Error(error.message || 'Erro ao conectar com o assistente');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      let assistantContent = data?.choices?.[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem. Tente novamente.';
      
      // Check if AI wants to generate coupon
      if (assistantContent.includes('[GENERATE_COUPON]')) {
        assistantContent = assistantContent.replace('[GENERATE_COUPON]', '').trim();
        
        // Try to generate coupon
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '🎁 Para gerar seu cupom de desconto, você precisa estar logado!\n\n👉 Por favor, faça login primeiro e depois volte aqui para pedir seu cupom.'
          }]);
          setIsLoading(false);
          return;
        }

        // Add loading message
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '✨ Gerando seu cupom exclusivo de 6% de desconto...'
        }]);

        // Generate coupon
        try {
          console.log('Generating coupon...');
          
          const { data: couponData, error: couponError } = await supabase.functions.invoke('generate-coupon', {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });

          console.log('Coupon response:', { couponData, couponError });

          // Remove loading message
          setMessages(prev => prev.slice(0, -1));

          if (couponError) {
            console.error('Coupon function error:', couponError);
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: '❌ Erro ao gerar cupom: ' + (couponError.message || 'Tente novamente mais tarde.')
            }]);
          } else if (couponData?.error) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: '⚠️ ' + couponData.error
            }]);
          } else if (couponData?.coupon) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `🎉 ${couponData.message || 'Seu cupom foi gerado com sucesso!'}\n\n💰 Desconto: 6%\n⏰ Válido por 30 dias\n\n📋 Copie o código abaixo e use no carrinho:`,
              couponCode: couponData.coupon
            }]);
          } else {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: '❌ Resposta inesperada. Por favor, tente novamente.'
            }]);
          }
        } catch (err) {
          console.error('Coupon generation error:', err);
          setMessages(prev => prev.slice(0, -1)); // Remove loading
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '❌ Erro de conexão ao gerar cupom. Tente novamente.'
          }]);
        }
        setIsLoading(false);
        return;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Erro no chat:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ ' + (error.message || 'Desculpe, ocorreu um erro. Por favor, tente novamente.')
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Código copiado!",
      description: "O cupom foi copiado para a área de transferência.",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-strong hover:shadow-strong hover:scale-110 transition-all duration-300 bg-accent hover:bg-accent/90 z-50 animate-fade-in"
          size="icon"
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 animate-scale-in ${
            isMobile 
              ? 'inset-0'
              : 'bottom-6 right-6 w-96 h-[600px]'
          }`}
          style={isMobile ? { height: '100dvh' } : undefined}
        >
          <Card className={`flex flex-col shadow-strong overflow-hidden ${
            isMobile ? 'h-full border-0 rounded-none' : 'h-full'
          }`}>
            {/* Fixed Header */}
            <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between space-y-0 pb-4 bg-accent text-accent-foreground rounded-t-lg border-b border-accent-foreground/10">
              <div className="flex items-center gap-3">
                <img 
                  src={evsLogo} 
                  alt="EVS Logo" 
                  className="h-12 w-12 rounded-full bg-background p-1.5 shadow-md"
                />
                <div>
                  <CardTitle className="text-lg font-semibold">EVS Comercial</CardTitle>
                  <p className="text-xs opacity-90 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online - Assistente Virtual
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-accent-foreground/10 transition-smooth rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>

            {/* Scrollable Messages Area */}
            <CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
              <div 
                ref={scrollContainerRef}
                className="h-full overflow-y-auto px-4 py-4 scroll-smooth"
                style={{ overscrollBehavior: 'contain' }}
              >
                <div className="space-y-3">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      } animate-fade-in`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {message.role === 'assistant' && (
                        <img 
                          src={evsLogo} 
                          alt="EVS" 
                          className="h-8 w-8 rounded-full bg-accent p-1 mr-2 flex-shrink-0"
                        />
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                          message.role === 'user'
                            ? 'bg-accent text-accent-foreground rounded-br-sm'
                            : 'bg-secondary text-foreground rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Coupon Code Display */}
                        {message.couponCode && (
                          <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                            <p className="text-xs text-green-600 dark:text-green-400 mb-2 font-medium">
                              Seu código de desconto:
                            </p>
                            <div className="flex gap-2">
                              <Input
                                value={message.couponCode}
                                readOnly
                                className="flex-1 font-mono text-xs bg-background text-center font-bold tracking-wider"
                              />
                              <Button
                                size="icon"
                                variant={copiedCode === message.couponCode ? "default" : "outline"}
                                onClick={() => handleCopyCoupon(message.couponCode!)}
                                className="flex-shrink-0 transition-all"
                              >
                                {copiedCode === message.couponCode ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading Skeleton */}
                  {isLoading && <MessageSkeleton />}
                  
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </CardContent>

            {/* Fixed Footer Input */}
            <CardFooter className="flex-shrink-0 p-4 border-t bg-muted/30">
              <div className="flex w-full gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 rounded-full bg-background border-border/50 focus:border-accent transition-smooth"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="rounded-full transition-smooth hover:scale-105 bg-accent hover:bg-accent/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
};
