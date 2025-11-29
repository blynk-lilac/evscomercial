-- Criar tabela para rastrear uso de cupons por produto
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  UNIQUE(coupon_id, product_id)
);

-- Habilitar RLS
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own coupon usage"
ON public.coupon_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coupon usage"
ON public.coupon_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all coupon usage"
ON public.coupon_usage
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Criar índices para performance
CREATE INDEX idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user_id ON public.coupon_usage(user_id);
CREATE INDEX idx_coupon_usage_product_id ON public.coupon_usage(product_id);

-- Adicionar coluna para rastrear tentativas de desconto duplicado
CREATE TABLE IF NOT EXISTS public.discount_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  was_granted BOOLEAN DEFAULT false
);

-- Habilitar RLS
ALTER TABLE public.discount_requests ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can insert their own discount requests"
ON public.discount_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service can view and manage discount requests"
ON public.discount_requests
FOR ALL
USING (true)
WITH CHECK (true);

-- Criar índice
CREATE INDEX idx_discount_requests_user_id ON public.discount_requests(user_id);
CREATE INDEX idx_discount_requests_requested_at ON public.discount_requests(requested_at);