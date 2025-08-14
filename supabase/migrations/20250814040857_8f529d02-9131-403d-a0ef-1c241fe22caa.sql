-- Create database schema for SentimentAI Monitor

-- Create brands table (already exists, but let's make sure it has all needed columns)
-- Adding any missing columns to existing brands table
DO $$ 
BEGIN
  -- Check if description column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'brands' AND column_name = 'description') THEN
    ALTER TABLE public.brands ADD COLUMN description TEXT;
  END IF;
  
  -- Check if logo_url column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'brands' AND column_name = 'logo_url') THEN
    ALTER TABLE public.brands ADD COLUMN logo_url TEXT;
  END IF;
  
  -- Check if keywords column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'brands' AND column_name = 'keywords') THEN
    ALTER TABLE public.brands ADD COLUMN keywords TEXT[];
  END IF;
END $$;

-- Create monitoring_sessions table for tracking active monitoring
CREATE TABLE IF NOT EXISTS public.monitoring_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on monitoring_sessions
ALTER TABLE public.monitoring_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for monitoring_sessions
CREATE POLICY IF NOT EXISTS "Public can view monitoring sessions" 
ON public.monitoring_sessions 
FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS "Public can insert monitoring sessions" 
ON public.monitoring_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Public can update monitoring sessions" 
ON public.monitoring_sessions 
FOR UPDATE 
USING (true);

-- Create trigger for monitoring_sessions updated_at
CREATE TRIGGER IF NOT EXISTS update_monitoring_sessions_updated_at
BEFORE UPDATE ON public.monitoring_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample popular brands
INSERT INTO public.brands (name, description, twitter_handle, keywords, is_active) VALUES
('Apple', 'Technology company known for iPhone, Mac, and innovative products', '@apple', ARRAY['apple', 'iphone', 'mac', 'ipad', 'apple watch'], true),
('Tesla', 'Electric vehicle and clean energy company', '@tesla', ARRAY['tesla', 'electric car', 'elon musk', 'model 3', 'model y'], true),
('Netflix', 'Streaming entertainment service', '@netflix', ARRAY['netflix', 'streaming', 'movies', 'tv shows', 'series'], true),
('McDonald''s', 'Global fast food restaurant chain', '@mcdonalds', ARRAY['mcdonalds', 'big mac', 'happy meal', 'fast food'], true),
('Coca-Cola', 'Beverage company', '@cocacola', ARRAY['coca cola', 'coke', 'beverage', 'soft drink'], true),
('Nike', 'Athletic footwear and apparel company', '@nike', ARRAY['nike', 'just do it', 'sneakers', 'athletic wear'], true)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brands_active ON public.brands(is_active);
CREATE INDEX IF NOT EXISTS idx_brand_mentions_brand_id ON public.brand_mentions(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_mentions_date ON public.brand_mentions(mention_date);
CREATE INDEX IF NOT EXISTS idx_brand_mentions_sentiment ON public.brand_mentions(sentiment_label);
CREATE INDEX IF NOT EXISTS idx_sentiment_data_brand_id ON public.sentiment_data(brand_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_data_date ON public.sentiment_data(analysis_date);
CREATE INDEX IF NOT EXISTS idx_alerts_brand_id ON public.alerts(brand_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_sessions_brand_id ON public.monitoring_sessions(brand_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_sessions_status ON public.monitoring_sessions(status);