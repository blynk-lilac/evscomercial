-- Update wallets table to ensure all users start with 0 balance
ALTER TABLE public.wallets 
  ALTER COLUMN balance_usd SET DEFAULT 0,
  ALTER COLUMN balance_brl SET DEFAULT 0,
  ALTER COLUMN balance_aoa SET DEFAULT 0;

-- Update existing wallets to have 0 balance if they don't exist yet
UPDATE public.wallets 
SET balance_usd = 0, balance_brl = 0, balance_aoa = 0 
WHERE balance_usd IS NULL OR balance_brl IS NULL OR balance_aoa IS NULL;