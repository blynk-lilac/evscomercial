import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado. Faça login para gerar cupom.' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Sessão inválida. Por favor, faça login novamente.' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check recent discount requests (within last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentRequests, error: requestError } = await supabase
      .from('discount_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('was_granted', true)
      .gte('requested_at', oneDayAgo)

    if (requestError) {
      console.error('Error checking recent requests:', requestError)
    }

    if (recentRequests && recentRequests.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Você já solicitou um cupom recentemente. Aguarde 24 horas para solicitar outro.',
          waitTime: '24 horas'
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user already has an active coupon
    const { data: existingCoupons, error: checkError } = await supabase
      .from('coupons')
      .select('*')
      .eq('created_by', user.id)
      .eq('is_active', true)
      .eq('usage_count', 0)

    if (checkError) {
      console.error('Error checking existing coupons:', checkError)
    }

    if (existingCoupons && existingCoupons.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Você já possui um cupom ativo. Use-o antes de solicitar outro.',
          coupon: existingCoupons[0].code
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate new coupon with 6% discount and single use
    const { data: newCoupon, error: insertError } = await supabase
      .from('coupons')
      .insert({
        discount_percentage: 6,
        usage_limit: 1,
        usage_count: 0,
        is_active: true,
        created_by: user.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating coupon:', insertError)
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar cupom. Tente novamente.' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log discount request
    await supabase
      .from('discount_requests')
      .insert({
        user_id: user.id,
        was_granted: true
      })

    return new Response(
      JSON.stringify({ 
        success: true,
        coupon: newCoupon.code,
        discount: 6,
        message: 'Cupom gerado com sucesso! Válido por 30 dias e apenas uma vez por produto.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})