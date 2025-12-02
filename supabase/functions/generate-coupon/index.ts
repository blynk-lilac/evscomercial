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

  console.log('Generate coupon request received')

  try {
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      console.error('No authorization header')
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
    
    console.log('Supabase URL:', supabaseUrl ? 'configured' : 'missing')
    console.log('Service key:', supabaseServiceKey ? 'configured' : 'missing')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '')
    console.log('Verifying token...')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Sessão inválida. Por favor, faça login novamente.' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    if (!user) {
      console.error('No user found')
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado. Faça login novamente.' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('User verified:', user.id)

    // Check recent discount requests (within last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    console.log('Checking recent requests since:', oneDayAgo)
    
    const { data: recentRequests, error: requestError } = await supabase
      .from('discount_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('was_granted', true)
      .gte('requested_at', oneDayAgo)

    if (requestError) {
      console.error('Error checking recent requests:', requestError)
    }

    console.log('Recent requests found:', recentRequests?.length || 0)

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

    // Check if user already has an active unused coupon
    console.log('Checking existing active coupons...')
    const { data: existingCoupons, error: checkError } = await supabase
      .from('coupons')
      .select('*')
      .eq('created_by', user.id)
      .eq('is_active', true)
      .eq('usage_count', 0)

    if (checkError) {
      console.error('Error checking existing coupons:', checkError)
    }

    console.log('Existing active coupons:', existingCoupons?.length || 0)

    if (existingCoupons && existingCoupons.length > 0) {
      // Return existing coupon instead of error
      console.log('Returning existing coupon:', existingCoupons[0].code)
      return new Response(
        JSON.stringify({ 
          success: true,
          coupon: existingCoupons[0].code,
          discount: 6,
          message: 'Você já possui um cupom ativo! Use o código acima.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate new coupon with 6% discount and single use
    console.log('Creating new coupon...')
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

    console.log('New coupon created:', newCoupon.code)

    // Log discount request
    const { error: logError } = await supabase
      .from('discount_requests')
      .insert({
        user_id: user.id,
        was_granted: true
      })

    if (logError) {
      console.error('Error logging discount request:', logError)
    }

    console.log('Coupon generated successfully!')

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
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
