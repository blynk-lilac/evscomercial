import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import evsLogo from "@/assets/evs-logo.png";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('evs-chat', {
        body: { 
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      let assistantContent = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
      
      // Check if AI wants to generate coupon
      if (assistantContent.includes('[GENERATE_COUPON]')) {
        assistantContent = assistantContent.replace('[GENERATE_COUPON]', '');
        
        // Try to generate coupon
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: assistantContent + '\n\n❌ Você precisa estar logado para gerar um cupom. Por favor, faça login primeiro!'
          }]);
          setIsLoading(false);
          return;
        }

        // Generate coupon
        const { data: couponData, error: couponError } = await supabase.functions.invoke('generate-coupon', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (couponError || couponData.error) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: assistantContent + '\n\n❌ ' + (couponData?.error || 'Erro ao gerar cupom. Tente novamente mais tarde.')
          }]);
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: assistantContent + '\n\n🎉 Seu cupom foi gerado com sucesso!\n\n🎫 Código: ' + couponData.coupon + '\n💰 Desconto: 6%\n⏰ Válido por 30 dias\n\n📋 Copie este código e use no carrinho de compras!'
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
    } catch (error) {
      console.error('Erro no chat:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Por favor, tente novamente.'
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

      {/* Chat Window - Fullscreen on Mobile, Card on Desktop */}
      {isOpen && (
        <div 
          className={`fixed z-50 animate-scale-in ${
            isMobile 
              ? 'inset-0 flex flex-col bg-background'
              : 'bottom-6 right-6 w-96 h-[600px]'
          }`}
        >
          <Card className={`flex flex-col shadow-strong ${isMobile ? 'h-full border-0 rounded-none' : 'h-full'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-accent text-accent-foreground rounded-t-lg border-b border-accent-foreground/10">
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

            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full px-4 py-4" ref={scrollRef}>
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
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start items-center gap-2">
                      <img 
                        src={evsLogo} 
                        alt="EVS" 
                        className="h-8 w-8 rounded-full bg-accent p-1 flex-shrink-0"
                      />
                      <div className="bg-secondary text-foreground rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Digitando...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            <CardFooter className="p-4 border-t bg-muted/30">
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
