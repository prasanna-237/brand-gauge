import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BrandCardProps {
  brand: {
    id: string;
    name: string;
    sentiment_label: string;
    mention_count: number;
    logo_url?: string;
  };
  onMonitor: (brandId: string) => void;
}

export const BrandCard = ({ brand, onMonitor }: BrandCardProps) => {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-positive';
      case 'negative':
        return 'text-negative';
      default:
        return 'text-mixed';
    }
  };

  return (
    <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300 cursor-pointer group">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{brand.name}</h3>
          <div className={`flex items-center gap-2 ${getSentimentColor(brand.sentiment_label)}`}>
            {getSentimentIcon(brand.sentiment_label)}
            <span className="text-sm font-medium capitalize">{brand.sentiment_label}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            {brand.mention_count.toLocaleString()} mentions
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onMonitor(brand.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Monitor
          </Button>
        </div>
      </div>
    </Card>
  );
};