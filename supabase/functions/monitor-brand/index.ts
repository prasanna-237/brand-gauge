import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brandId, brandName } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Simulate Twitter API call and sentiment analysis
    const mockMentions = [
      { text: `Just got the new ${brandName} product and it's amazing!`, sentiment: 'positive', score: 0.8 },
      { text: `${brandName} customer service is terrible`, sentiment: 'negative', score: 0.2 },
      { text: `Saw ${brandName} in the news today`, sentiment: 'neutral', score: 0.5 }
    ];

    // Insert mock mentions
    for (const mention of mockMentions) {
      await supabase.from('brand_mentions').insert({
        brand_id: brandId,
        mention_text: mention.text,
        sentiment_label: mention.sentiment,
        sentiment_score: mention.score,
        confidence: 0.95,
        platform: 'twitter',
        author_username: `user_${Math.random().toString(36).substr(2, 9)}`
      });
    }

    // Check for crisis detection
    const negativeCount = mockMentions.filter(m => m.sentiment === 'negative').length;
    const totalCount = mockMentions.length;
    
    if (negativeCount / totalCount > 0.5) {
      await supabase.from('alerts').insert({
        brand_id: brandId,
        alert_type: 'negative_spike',
        message: `${brandName} experiencing increased negative sentiment`,
        sentiment_threshold: 50
      });
    }

    return new Response(JSON.stringify({ success: true, mentionsAdded: mockMentions.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});