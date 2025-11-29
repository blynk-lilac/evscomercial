import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Exchange rates (update these regularly or use an API)
const EXCHANGE_RATES = {
  USD_TO_BRL: 5.20,
  USD_TO_AOA: 825.50,
  BRL_TO_USD: 1 / 5.20,
  AOA_TO_USD: 1 / 825.50,
};

function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
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
  const response = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, amount, currency, recipient_email } = await req.json();

    const clientId = Deno.env.get('PAYPAL_CLIENT_ID')!;
    const secretKey = Deno.env.get('PAYPAL_SECRET_KEY')!;
    const accessToken = await getPayPalAccessToken(clientId, secretKey);

    let result;

    switch (action) {
      case 'checkout':
        // Process checkout payment - customer pays, money goes to merchant
        const checkoutResponse = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
              amount: {
                currency_code: 'USD',
                value: convertCurrency(amount, currency, 'USD').toFixed(2),
              },
              payee: {
                email_address: 'isaacmuaco582@gmail.com'
              }
            }],
            application_context: {
              return_url: `${Deno.env.get('VITE_SUPABASE_URL')}/payment-success`,
              cancel_url: `${Deno.env.get('VITE_SUPABASE_URL')}/payment-cancel`
            }
          }),
        });
        
        result = await checkoutResponse.json();
        
        // Create transaction record for checkout
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'checkout',
          amount,
          currency,
          status: 'pending',
          paypal_transaction_id: result.id,
          description: 'Pagamento de compra no carrinho',
        });
        break;

      case 'deposit':
        // Create PayPal order for deposit
        const orderResponse = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
              amount: {
                currency_code: 'USD',
                value: convertCurrency(amount, currency, 'USD').toFixed(2),
              },
            }],
          }),
        });
        
        result = await orderResponse.json();
        
        // Create transaction record
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'deposit',
          amount,
          currency,
          status: 'pending',
          paypal_transaction_id: result.id,
          description: 'Depósito via PayPal',
        });
        break;

      case 'withdrawal':
        // Validate withdrawal amount (100-200)
        if (amount < 100 || amount > 200) {
          throw new Error('O valor de levantamento deve ser entre 100 e 200');
        }

        // Check user balance before withdrawal
        const { data: userWallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!userWallet) {
          throw new Error('Carteira não encontrada');
        }

        const balanceKey = `balance_${currency.toLowerCase()}`;
        const currentBalance = userWallet[balanceKey] || 0;

        if (currentBalance < amount) {
          throw new Error('Saldo insuficiente para levantamento');
        }

        // Create PayPal payout for withdrawal
        const amountInUSD = convertCurrency(amount, currency, 'USD');
        
        const payoutResponse = await fetch('https://api-m.paypal.com/v1/payments/payouts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender_batch_header: {
              sender_batch_id: `batch_${Date.now()}`,
              email_subject: 'Levantamento EVS Comercial',
              email_message: 'Seu levantamento foi processado.',
            },
            items: [{
              recipient_type: 'EMAIL',
              amount: {
                value: amountInUSD.toFixed(2),
                currency: 'USD',
              },
              receiver: recipient_email || 'isaacmuaco582@gmail.com',
              note: 'Levantamento da sua carteira EVS',
            }],
          }),
        });

        result = await payoutResponse.json();

        // Update wallet balance
        const { data: wallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (wallet) {
          const balanceKey = `balance_${currency.toLowerCase()}`;
          await supabase
            .from('wallets')
            .update({
              [balanceKey]: (wallet[balanceKey] || 0) - amount,
            })
            .eq('user_id', user.id);
        }

        // Create transaction record
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'withdrawal',
          amount,
          currency,
          status: 'completed',
          paypal_transaction_id: result.batch_header?.payout_batch_id,
          recipient_email: recipient_email || 'isaacmuaco582@gmail.com',
          description: 'Levantamento para PayPal',
        });
        break;

      case 'transfer':
        // Check user balance before transfer
        const { data: senderWallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!senderWallet) {
          throw new Error('Carteira não encontrada');
        }

        const senderBalanceKey = `balance_${currency.toLowerCase()}`;
        const senderBalance = senderWallet[senderBalanceKey] || 0;

        if (senderBalance < amount) {
          throw new Error('Saldo insuficiente para transferência');
        }

        // Bank transfer via PayPal
        const transferAmountUSD = convertCurrency(amount, currency, 'USD');
        
        const transferResponse = await fetch('https://api-m.paypal.com/v1/payments/payouts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender_batch_header: {
              sender_batch_id: `transfer_${Date.now()}`,
              email_subject: 'Transferência EVS Comercial',
            },
            items: [{
              recipient_type: 'EMAIL',
              amount: {
                value: transferAmountUSD.toFixed(2),
                currency: 'USD',
              },
              receiver: recipient_email,
              note: 'Transferência bancária via EVS',
            }],
          }),
        });

        result = await transferResponse.json();

        // Update wallet and create transaction
        const { data: transferWallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (transferWallet) {
          const transferBalanceKey = `balance_${currency.toLowerCase()}`;
          await supabase
            .from('wallets')
            .update({
              [transferBalanceKey]: (transferWallet[transferBalanceKey] || 0) - amount,
            })
            .eq('user_id', user.id);
        }

        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'transfer',
          amount,
          currency,
          status: 'completed',
          paypal_transaction_id: result.batch_header?.payout_batch_id,
          recipient_email,
          description: `Transferência para ${recipient_email}`,
        });
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});