import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalMentions: number;
  positiveMentions: number;
  negativeMentions: number;
  neutralMentions: number;
  topBrands: any[];
  recentAlerts: any[];
}

export const Analytics = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalMentions: 0,
    positiveMentions: 0,
    negativeMentions: 0,
    neutralMentions: 0,
    topBrands: [],
    recentAlerts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch total mentions
      const { data: mentions } = await supabase
        .from('brand_mentions')
        .select('sentiment_label');

      // Fetch brands with their sentiment data
      const { data: brands } = await supabase
        .from('brands')
        .select(`
          *,
          brand_mentions(sentiment_label),
          sentiment_data(sentiment_score, total_mentions)
        `)
        .eq('is_active', true)
        .limit(6);

      // Fetch recent alerts
      const { data: alerts } = await supabase
        .from('alerts')
        .select('*, brands(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (mentions) {
        const positive = mentions.filter(m => m.sentiment_label === 'positive').length;
        const negative = mentions.filter(m => m.sentiment_label === 'negative').length;
        const neutral = mentions.filter(m => m.sentiment_label === 'neutral').length;

        setData({
          totalMentions: mentions.length,
          positiveMentions: positive,
          negativeMentions: negative,
          neutralMentions: neutral,
          topBrands: brands || [],
          recentAlerts: alerts || []
        });
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const sentimentPercentage = (count: number) => 
    data.totalMentions > 0 ? ((count / data.totalMentions) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Mentions</p>
              <h3 className="text-2xl font-bold text-foreground">{data.totalMentions.toLocaleString()}</h3>
            </div>
            <Eye className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="bg-gradient-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Positive</p>
              <h3 className="text-2xl font-bold text-positive">{sentimentPercentage(data.positiveMentions)}%</h3>
              <p className="text-xs text-muted-foreground">{data.positiveMentions.toLocaleString()} mentions</p>
            </div>
            <TrendingUp className="w-8 h-8 text-positive" />
          </div>
        </Card>

        <Card className="bg-gradient-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Negative</p>
              <h3 className="text-2xl font-bold text-negative">{sentimentPercentage(data.negativeMentions)}%</h3>
              <p className="text-xs text-muted-foreground">{data.negativeMentions.toLocaleString()} mentions</p>
            </div>
            <TrendingDown className="w-8 h-8 text-negative" />
          </div>
        </Card>

        <Card className="bg-gradient-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Alerts</p>
              <h3 className="text-2xl font-bold text-mixed">{data.recentAlerts.length}</h3>
              <p className="text-xs text-muted-foreground">Recent alerts</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-mixed" />
          </div>
        </Card>
      </div>

      {/* Top Brands */}
      <Card className="bg-gradient-card border-border p-6">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Top Monitored Brands</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.topBrands.map((brand) => {
            const mentionCount = brand.brand_mentions?.length || 0;
            const positiveMentions = brand.brand_mentions?.filter((m: any) => m.sentiment_label === 'positive').length || 0;
            const negativeMentions = brand.brand_mentions?.filter((m: any) => m.sentiment_label === 'negative').length || 0;
            const sentimentRatio = mentionCount > 0 ? (positiveMentions / mentionCount) * 100 : 0;
            
            return (
              <div key={brand.id} className="p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">{brand.name}</h4>
                  <Badge variant={sentimentRatio > 60 ? "default" : sentimentRatio < 40 ? "destructive" : "secondary"}>
                    {sentimentRatio.toFixed(0)}% Positive
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{mentionCount} mentions</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs text-positive">+{positiveMentions}</span>
                  <span className="text-xs text-negative">-{negativeMentions}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Alerts */}
      {data.recentAlerts.length > 0 && (
        <Card className="bg-gradient-card border-border p-6">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Recent Alerts</h3>
          <div className="space-y-3">
            {data.recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <AlertTriangle className="w-5 h-5 text-mixed" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{alert.brands?.name}</p>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
                <Badge variant="outline">{alert.alert_type}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};