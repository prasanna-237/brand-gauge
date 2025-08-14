import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Calendar, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReportData {
  brand: string;
  totalMentions: number;
  positiveMentions: number;
  negativeMentions: number;
  neutralMentions: number;
  avgSentiment: number;
  period: string;
}

export const Reports = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    generateReports();
  }, [selectedPeriod]);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const generateReports = async () => {
    setLoading(true);
    try {
      const daysAgo = parseInt(selectedPeriod);
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysAgo);

      const reportsData: ReportData[] = [];

      for (const brand of brands) {
        const { data: mentions } = await supabase
          .from('brand_mentions')
          .select('sentiment_label, sentiment_score')
          .eq('brand_id', brand.id)
          .gte('mention_date', fromDate.toISOString());

        if (mentions) {
          const totalMentions = mentions.length;
          const positiveMentions = mentions.filter(m => m.sentiment_label === 'positive').length;
          const negativeMentions = mentions.filter(m => m.sentiment_label === 'negative').length;
          const neutralMentions = mentions.filter(m => m.sentiment_label === 'neutral').length;
          const avgSentiment = mentions.length > 0 
            ? mentions.reduce((sum, m) => sum + (m.sentiment_score || 0), 0) / mentions.length 
            : 0;

          reportsData.push({
            brand: brand.name,
            totalMentions,
            positiveMentions,
            negativeMentions,
            neutralMentions,
            avgSentiment,
            period: `${daysAgo} days`
          });
        }
      }

      setReports(reportsData.sort((a, b) => b.totalMentions - a.totalMentions));
    } catch (error) {
      console.error('Error generating reports:', error);
      toast.error('Failed to generate reports');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'csv' | 'json') => {
    if (reports.length === 0) {
      toast.error('No data to export');
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      const headers = ['Brand', 'Total Mentions', 'Positive', 'Negative', 'Neutral', 'Avg Sentiment', 'Period'];
      const rows = reports.map(r => [
        r.brand,
        r.totalMentions,
        r.positiveMentions,
        r.negativeMentions,
        r.neutralMentions,
        r.avgSentiment.toFixed(2),
        r.period
      ]);
      
      content = [headers, ...rows].map(row => row.join(',')).join('\n');
      filename = `sentiment-report-${selectedPeriod}days-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(reports, null, 2);
      filename = `sentiment-report-${selectedPeriod}days-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Report exported as ${format.toUpperCase()}`);
  };

  const getSentimentTrend = (avgSentiment: number) => {
    if (avgSentiment > 0.6) return { icon: TrendingUp, color: 'text-positive', label: 'Positive' };
    if (avgSentiment < 0.4) return { icon: TrendingDown, color: 'text-negative', label: 'Negative' };
    return { icon: BarChart3, color: 'text-mixed', label: 'Neutral' };
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Card className="p-6">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sentiment Reports</h2>
          <p className="text-muted-foreground">Comprehensive brand sentiment analysis and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Day</SelectItem>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => exportReport('csv')}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportReport('json')}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            JSON
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Mentions</p>
              <h3 className="text-2xl font-bold text-foreground">
                {reports.reduce((sum, r) => sum + r.totalMentions, 0).toLocaleString()}
              </h3>
            </div>
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="bg-gradient-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Positive</p>
              <h3 className="text-2xl font-bold text-positive">
                {reports.reduce((sum, r) => sum + r.positiveMentions, 0).toLocaleString()}
              </h3>
            </div>
            <TrendingUp className="w-8 h-8 text-positive" />
          </div>
        </Card>

        <Card className="bg-gradient-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Negative</p>
              <h3 className="text-2xl font-bold text-negative">
                {reports.reduce((sum, r) => sum + r.negativeMentions, 0).toLocaleString()}
              </h3>
            </div>
            <TrendingDown className="w-8 h-8 text-negative" />
          </div>
        </Card>

        <Card className="bg-gradient-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Brands Monitored</p>
              <h3 className="text-2xl font-bold text-foreground">{reports.length}</h3>
            </div>
            <Calendar className="w-8 h-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Individual Brand Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((report) => {
          const trend = getSentimentTrend(report.avgSentiment);
          const positivePerc = report.totalMentions > 0 ? (report.positiveMentions / report.totalMentions) * 100 : 0;
          const negativePerc = report.totalMentions > 0 ? (report.negativeMentions / report.totalMentions) * 100 : 0;
          
          return (
            <Card key={report.brand} className="bg-gradient-card border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{report.brand}</h3>
                <div className="flex items-center gap-2">
                  <trend.icon className={`w-5 h-5 ${trend.color}`} />
                  <Badge variant="outline">{trend.label}</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Mentions</span>
                  <span className="font-medium text-foreground">{report.totalMentions.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Positive</span>
                  <span className="font-medium text-positive">{positivePerc.toFixed(1)}% ({report.positiveMentions})</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Negative</span>
                  <span className="font-medium text-negative">{negativePerc.toFixed(1)}% ({report.negativeMentions})</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Sentiment</span>
                  <span className={`font-medium ${trend.color}`}>{(report.avgSentiment * 100).toFixed(1)}%</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period</span>
                  <span className="font-medium text-foreground">{report.period}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {reports.length === 0 && (
        <Card className="bg-gradient-card border-border p-12 text-center">
          <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Data Available</h3>
          <p className="text-muted-foreground">No mentions found for the selected period</p>
        </Card>
      )}
    </div>
  );
};