import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ExchangeRate = 'USD_TO_BRL' | 'USD_TO_AOA' | 'BRL_TO_USD' | 'BRL_TO_AOA' | 'AOA_TO_USD' | 'AOA_TO_BRL';

// Exchange rates (você pode atualizar isso com uma API real de câmbio)
const EXCHANGE_RATES: Record<ExchangeRate, number> = {
  USD_TO_BRL: 5.20,
  USD_TO_AOA: 825.50,
  BRL_TO_USD: 1 / 5.20,
  BRL_TO_AOA: 825.50 / 5.20,
  AOA_TO_USD: 1 / 825.50,
  AOA_TO_BRL: 5.20 / 825.50,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, from, to } = await req.json();

    if (!amount || !from || !to) {
      throw new Error('Missing required parameters: amount, from, to');
    }

    const validCurrencies = ['USD', 'BRL', 'AOA'];
    if (!validCurrencies.includes(from) || !validCurrencies.includes(to)) {
      throw new Error('Invalid currency. Supported: USD, BRL, AOA');
    }

    let convertedAmount = amount;

    if (from !== to) {
      const rateKey = `${from}_TO_${to}` as ExchangeRate;
      const rate = EXCHANGE_RATES[rateKey];
      
      if (!rate) {
        throw new Error(`Conversion rate not found for ${from} to ${to}`);
      }

      convertedAmount = amount * rate;
    }

    return new Response(
      JSON.stringify({
        success: true,
        original: { amount, currency: from },
        converted: { amount: convertedAmount, currency: to },
        rate: EXCHANGE_RATES[`${from}_TO_${to}` as ExchangeRate] || 1,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});