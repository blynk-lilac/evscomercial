import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PayPal Sandbox base URL
const PAYPAL_BASE_URL = 'https://api-m.sandbox.paypal.com';

// Exchange rates
const EXCHANGE_RATES = {
  USD_TO_BRL: 5.20,
  USD_TO_AOA: 825.50,
  BRL_TO_USD: 1 / 5.20,
  AOA_TO_USD: 1 / 825.50,
};

function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;
  
  let usdAmount = amount;
  if (fromCurrency === 'BRL') usdAmount = amount * EXCHANGE_RATES.BRL_TO_USD;
  if (fromCurrency === 'AOA') usdAmount = amount * EXCHANGE_RATES.AOA_TO_USD;
  
  if (toCurrency === 'USD') return usdAmount;
  if (toCurrency === 'BRL') return usdAmount * EXCHANGE_RATES.USD_TO_BRL;
  if (toCurrency === 'AOA') return usdAmount * EXCHANGE_RATES.USD_TO_AOA;
  
  return amount;
}

async function getPayPalAccessToken(clientId: string, secretKey: string): Promise<string> {
  const auth = btoa(`${clientId}:${secretKey}`);
  
  console.log('Requesting PayPal access token...');
  console.log('Client ID starts with:', clientId.substring(0, 10));
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('PayPal auth error:', JSON.stringify(data));
    throw new Error(`Falha na autenticação PayPal: ${data.error_description || data.error || 'Erro desconhecido'}`);
  }
  
  console.log('PayPal access token obtained successfully');
  return data.access_token;
}

async function createPayPalOrder(accessToken: string, amount: string, returnUrl: string, cancelUrl: string, description: string): Promise<any> {
  console.log(`Creating PayPal order for ${amount} USD`);
  
  const orderPayload = {
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: amount,
      },
      description: description,
    }],
    application_context: {
      return_url: returnUrl,
      cancel_url: cancelUrl,
      brand_name: 'EVS Comercial',
      user_action: 'PAY_NOW',
      shipping_preference: 'NO_SHIPPING',
    }
  };

  console.log('Order payload:', JSON.stringify(orderPayload));

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderPayload),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    console.error('PayPal order creation error:', JSON.stringify(result));
    throw new Error(`Falha ao criar pedido PayPal: ${result.message || result.error || JSON.stringify(result.details) || 'Erro desconhecido'}`);
  }
  
  console.log('PayPal order created successfully:', result.id);
  return result;
}

async function createPayPalPayout(accessToken: string, amount: string, recipientEmail: string, note: string): Promise<any> {
  console.log(`Creating PayPal payout of ${amount} USD to ${recipientEmail}`);
  
  const payoutPayload = {
    sender_batch_header: {
      sender_batch_id: `EVS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email_subject: 'EVS Comercial - Pagamento',
      email_message: note,
    },
    items: [{
      recipient_type: 'EMAIL',
      amount: {
        value: amount,
        currency: 'USD',
      },
      receiver: recipientEmail,
      note: note,
    }],
  };

  console.log('Payout payload:', JSON.stringify(payoutPayload));

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/payments/payouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payoutPayload),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('PayPal payout error:', JSON.stringify(result));
    throw new Error(`Falha no payout PayPal: ${result.message || result.error || JSON.stringify(result.details) || 'Erro desconhecido'}`);
  }

  console.log('PayPal payout created successfully:', result.batch_header?.payout_batch_id);
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização não fornecido');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Usuário não autenticado');
    }

    console.log('User authenticated:', user.id);

    const body = await req.json();
    const { action, amount, currency, recipient_email, order_id } = body;

    console.log('Request body:', JSON.stringify({ action, amount, currency, recipient_email }));

    const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const secretKey = Deno.env.get('PAYPAL_SECRET_KEY');
    
    if (!clientId || !secretKey) {
      console.error('PayPal credentials not configured');
      throw new Error('Credenciais PayPal não configuradas');
    }

    const accessToken = await getPayPalAccessToken(clientId, secretKey);
    
    // Get origin for redirect URLs
    const origin = req.headers.get('origin') || 'https://evs-comercial.lovable.app';
    console.log('Origin for redirects:', origin);

    let result: any = {};

    switch (action) {
      case 'checkout': {
        const usdAmount = convertCurrency(amount, currency, 'USD').toFixed(2);
        console.log(`Checkout: ${amount} ${currency} = ${usdAmount} USD`);
        
        const order = await createPayPalOrder(
          accessToken,
          usdAmount,
          `${origin}/payment-success`,
          `${origin}/cart`,
          'Compra EVS Comercial'
        );
        
        const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;
        if (!approvalUrl) {
          console.error('No approval URL in response:', JSON.stringify(order));
          throw new Error('URL de aprovação não encontrada na resposta do PayPal');
        }
        
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'checkout',
          amount,
          currency,
          status: 'pending',
          paypal_transaction_id: order.id,
          description: 'Pagamento de compra',
        });
        
        result = {
          order_id: order.id,
          approval_url: approvalUrl,
          status: order.status,
        };
        break;
      }

      case 'deposit': {
        const usdAmount = convertCurrency(amount, currency, 'USD').toFixed(2);
        console.log(`Deposit: ${amount} ${currency} = ${usdAmount} USD`);
        
        const order = await createPayPalOrder(
          accessToken,
          usdAmount,
          `${origin}/dashboard?deposit_success=true&amount=${amount}&currency=${currency}`,
          `${origin}/dashboard?deposit_cancelled=true`,
          'Depósito na Carteira EVS'
        );
        
        const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;
        if (!approvalUrl) {
          console.error('No approval URL in response:', JSON.stringify(order));
          throw new Error('URL de aprovação não encontrada na resposta do PayPal');
        }
        
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'deposit',
          amount,
          currency,
          status: 'pending',
          paypal_transaction_id: order.id,
          description: 'Depósito via PayPal',
        });
        
        result = {
          order_id: order.id,
          approval_url: approvalUrl,
          status: order.status,
        };
        break;
      }

      case 'withdrawal': {
        if (amount < 100 || amount > 200) {
          throw new Error('O valor de levantamento deve ser entre 100 e 200');
        }

        const { data: userWallet, error: walletError } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (walletError || !userWallet) {
          console.error('Wallet error:', walletError);
          throw new Error('Carteira não encontrada');
        }

        const balanceKey = `balance_${currency.toLowerCase()}`;
        const currentBalance = userWallet[balanceKey] || 0;

        if (currentBalance < amount) {
          throw new Error(`Saldo insuficiente. Saldo atual: ${currentBalance} ${currency}`);
        }

        const usdAmount = convertCurrency(amount, currency, 'USD').toFixed(2);
        console.log(`Withdrawal: ${amount} ${currency} = ${usdAmount} USD`);

        const payout = await createPayPalPayout(
          accessToken,
          usdAmount,
          recipient_email || user.email || 'isaacmuaco582@gmail.com',
          'Levantamento da carteira EVS'
        );

        const newBalance = currentBalance - amount;
        await supabase
          .from('wallets')
          .update({ [balanceKey]: newBalance })
          .eq('user_id', user.id);

        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'withdrawal',
          amount,
          currency,
          status: 'completed',
          paypal_transaction_id: payout.batch_header?.payout_batch_id,
          recipient_email: recipient_email || user.email,
          description: 'Levantamento para PayPal',
        });

        result = {
          payout_batch_id: payout.batch_header?.payout_batch_id,
          status: 'completed',
          new_balance: newBalance,
        };
        break;
      }

      case 'transfer': {
        if (!recipient_email) {
          throw new Error('Email do destinatário é obrigatório');
        }

        const { data: senderWallet, error: walletError } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (walletError || !senderWallet) {
          console.error('Wallet error:', walletError);
          throw new Error('Carteira não encontrada');
        }

        const balanceKey = `balance_${currency.toLowerCase()}`;
        const currentBalance = senderWallet[balanceKey] || 0;

        if (currentBalance < amount) {
          throw new Error(`Saldo insuficiente. Saldo atual: ${currentBalance} ${currency}`);
        }

        const usdAmount = convertCurrency(amount, currency, 'USD').toFixed(2);
        console.log(`Transfer: ${amount} ${currency} = ${usdAmount} USD to ${recipient_email}`);

        const payout = await createPayPalPayout(
          accessToken,
          usdAmount,
          recipient_email,
          `Transferência de ${user.email} via EVS`
        );

        const newBalance = currentBalance - amount;
        await supabase
          .from('wallets')
          .update({ [balanceKey]: newBalance })
          .eq('user_id', user.id);

        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'transfer',
          amount,
          currency,
          status: 'completed',
          paypal_transaction_id: payout.batch_header?.payout_batch_id,
          recipient_email,
          description: `Transferência para ${recipient_email}`,
        });

        result = {
          payout_batch_id: payout.batch_header?.payout_batch_id,
          status: 'completed',
          new_balance: newBalance,
        };
        break;
      }

      case 'capture': {
        if (!order_id) {
          throw new Error('Order ID é obrigatório para captura');
        }

        console.log(`Capturing order: ${order_id}`);

        const captureResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${order_id}/capture`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const captureResult = await captureResponse.json();

        if (!captureResponse.ok) {
          console.error('Capture error:', JSON.stringify(captureResult));
          throw new Error(`Falha na captura: ${captureResult.message || 'Erro desconhecido'}`);
        }

        await supabase
          .from('transactions')
          .update({ status: 'completed' })
          .eq('paypal_transaction_id', order_id);

        const { data: transaction } = await supabase
          .from('transactions')
          .select('*')
          .eq('paypal_transaction_id', order_id)
          .single();

        if (transaction && transaction.type === 'deposit') {
          const balanceKey = `balance_${transaction.currency.toLowerCase()}`;
          
          const { data: currentWallet } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (currentWallet) {
            const newBalance = (currentWallet[balanceKey] || 0) + transaction.amount;
            await supabase
              .from('wallets')
              .update({ [balanceKey]: newBalance })
              .eq('user_id', user.id);
          }
        }

        result = {
          status: 'captured',
          capture_id: captureResult.id,
        };
        break;
      }

      default:
        throw new Error(`Ação inválida: ${action}`);
    }

    console.log('Success result:', JSON.stringify(result));

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Edge function error:', errorMessage);
    
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});