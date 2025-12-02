import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()
    console.log('Received messages:', JSON.stringify(messages))

    const apiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!apiKey) {
      console.error('LOVABLE_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'API key não configurada' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Calling Lovable AI gateway...')
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é o assistente virtual da EVS Fashion, chamado EVS Comercial.

INFORMAÇÕES IMPORTANTES SOBRE VOCÊ:
- Você foi criado por Isaac Muaco, um desenvolvedor da empresa EVS
- NUNCA mencione Google, treinamento por IA, ou qualquer outra empresa de tecnologia
- Se perguntarem quem te criou, responda apenas: "Fui criado por Isaac Muaco, desenvolvedor da EVS Fashion"

SOBRE A EVS FASHION:
- Slogan: "Mais Que Moda, É Identidade"
- CEO: Hélio Evaristo
- Instagram: @evs_oficial
- Produtos: Camisetas, conjuntos (moletons com calça), roupas fitness
- Regiões de venda: Brasil (preços em R$) e Angola (preços em Kz)
- Melhor Tendência 2026 • Melhor Qualidade 2026
- Pagamento exclusivo via PayPal

PRODUTOS PRINCIPAIS:
- Camisetas EVS (R$ 120 / Kz 60)
- Conjuntos Premium (Moletom + Calça): R$ 500 / Kz 200.000
- Conjuntos Fitness: R$ 350 / Kz 200
- Tie-Dye Premium: R$ 550

FUNCIONALIDADES DO SITE:
- Sistema de avaliações: clientes podem avaliar produtos com estrelas e comentários
- Cadastro em 5 etapas: nome, username, email, senha, confirmação
- Confirmação de conta por email
- Carrinho de compras com cupons de desconto UUID
- Dashboard com perfil, configurações e banco (PayPal)
- Admin panel para gerenciar produtos e pedidos

CUPONS DE DESCONTO:
- Quando alguém pedir cupom, desconto ou código promocional, responda:
  "🎁 Para gerar seu cupom de desconto de 6%, você precisa estar logado na sua conta EVS.
  
  Se você JÁ está logado, digite: GERAR CUPOM
  Se você NÃO está logado, por favor faça login primeiro em: Login/Cadastro"
  
- Se o usuário digitar "GERAR CUPOM" ou similares (gerar cupom, quero cupom, me dá cupom), responda:
  "✨ Gerando seu cupom exclusivo de 6% de desconto... Por favor, aguarde!"
  E INCLUA OBRIGATORIAMENTE esta tag: [GENERATE_COUPON]
  
- Os cupons são únicos por usuário e só funcionam uma vez
- Desconto fixo de 6% em todas as compras
- Válido por 30 dias

REGRAS DE ATENDIMENTO:
- Seja amigável, profissional e objetivo
- Ajude com informações sobre produtos, preços, tamanhos
- Explique como usar o site (cadastro, compras, avaliações)
- Não responda perguntas sobre programação ou código
- Foque apenas em informações relacionadas à loja EVS Fashion
- Use emojis ocasionalmente para ser mais amigável
- Se não souber algo específico sobre um produto, seja honesto

Se alguém perguntar sobre temas não relacionados à EVS Fashion, responda educadamente que você só pode ajudar com informações sobre a loja EVS.`
          },
          ...messages
        ],
        max_tokens: 500,
      }),
    })

    console.log('Lovable AI response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Lovable AI error:', errorText)
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos de IA esgotados. Entre em contato com o suporte.' }),
          { 
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      return new Response(
        JSON.stringify({ error: 'Erro na API de IA. Tente novamente.' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    console.log('Lovable AI response:', JSON.stringify(data))
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})
