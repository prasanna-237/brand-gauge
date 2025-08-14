import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { BrandCard } from "@/components/BrandCard";
import { Header } from "@/components/Header";
import { Analytics } from "@/components/Analytics";
import { Alerts } from "@/components/Alerts";
import { Reports } from "@/components/Reports";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Brand {
  id: string;
  name: string;
  description: string;
  twitter_handle: string;
  keywords: string[];
  sentiment_label: string;
  mention_count: number;
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'analytics' | 'alerts' | 'reports'>('dashboard');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select(`
          *,
          brand_mentions!inner(sentiment_label)
        `)
        .eq('is_active', true);

      if (error) throw error;

      // Process brands with sentiment data
      const processedBrands = (data || []).map(brand => {
        const mentions = brand.brand_mentions || [];
        const positiveMentions = mentions.filter((m: any) => m.sentiment_label === 'positive').length;
        const negativeMentions = mentions.filter((m: any) => m.sentiment_label === 'negative').length;
        const totalMentions = mentions.length;
        
        let sentiment_label = 'mixed';
        if (totalMentions > 0) {
          const positiveRatio = positiveMentions / totalMentions;
          if (positiveRatio > 0.6) sentiment_label = 'positive';
          else if (positiveRatio < 0.4) sentiment_label = 'negative';
        }

        return {
          ...brand,
          sentiment_label,
          mention_count: totalMentions
        };
      });

      setBrands(processedBrands);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    toast.success(`Starting monitoring for: ${query}`);
    
    // First, check if brand exists or create it
    try {
      const { data: existingBrand } = await supabase
        .from('brands')
        .select('*')
        .ilike('name', query)
        .single();

      let brandId = existingBrand?.id;

      if (!existingBrand) {
        // Create new brand
        const { data: newBrand, error } = await supabase
          .from('brands')
          .insert({
            name: query,
            description: `Brand monitoring for ${query}`,
            keywords: [query.toLowerCase()],
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;
        brandId = newBrand.id;
        
        // Refresh brands list
        fetchBrands();
      }

      // Start monitoring session
      const { error: sessionError } = await supabase
        .from('monitoring_sessions')
        .insert({
          brand_id: brandId,
          status: 'active'
        });

      if (sessionError) throw sessionError;

      // Call the Twitter monitoring edge function
      const { data, error } = await supabase.functions.invoke('monitor-brand', {
        body: { brandId, brandName: query }
      });

      if (error) throw error;

      toast.success(`Successfully started monitoring ${query}`);
    } catch (error) {
      console.error('Error starting monitoring:', error);
      toast.error('Failed to start monitoring');
    }
  };

  const handleMonitor = async (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    if (brand) {
      await handleSearch(brand.name);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'analytics':
        return <Analytics />;
      case 'alerts':
        return <Alerts />;
      case 'reports':
        return <Reports />;
      default:
        return (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-12">
              <div className="w-20 h-20 bg-gradient-search rounded-full mx-auto flex items-center justify-center shadow-search">
                <Search className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">Start Monitoring</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Search for a brand to begin real-time sentiment analysis and monitoring
              </p>
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Popular Brands */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">Popular Brands</h2>
                <Button variant="outline" onClick={fetchBrands}>
                  Refresh
                </Button>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {brands.map((brand) => (
                    <BrandCard
                      key={brand.id}
                      brand={brand}
                      onMonitor={handleMonitor}
                    />
                  ))}
                </div>
              )}

              {!loading && brands.length === 0 && (
                <Card className="bg-gradient-card border-border p-12 text-center">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No brands monitored yet</h3>
                  <p className="text-muted-foreground">Use the search bar above to start monitoring your first brand</p>
                </Card>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={setCurrentPage} currentPage={currentPage} />
      <main className="container mx-auto px-6 py-8">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default Index;