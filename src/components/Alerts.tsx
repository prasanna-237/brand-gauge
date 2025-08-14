import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Alert {
  id: string;
  brand_id: string;
  alert_type: string;
  message: string;
  sentiment_threshold: number;
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
  brands: {
    name: string;
  };
}

export const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    
    // Set up real-time subscription for new alerts
    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          fetchAlerts(); // Refetch to get brand names
          toast.error(`New alert: ${payload.new.message}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          brands (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const markAsSent = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          is_sent: true, 
          sent_at: new Date().toISOString() 
        })
        .eq('id', alertId);

      if (error) throw error;
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_sent: true, sent_at: new Date().toISOString() }
          : alert
      ));
      
      toast.success('Alert marked as sent');
    } catch (error) {
      console.error('Error updating alert:', error);
      toast.error('Failed to update alert');
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'crisis':
        return <AlertTriangle className="w-5 h-5 text-negative" />;
      case 'negative_spike':
        return <AlertTriangle className="w-5 h-5 text-mixed" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const getAlertBadge = (alertType: string, isSent: boolean) => {
    if (isSent) {
      return <Badge variant="outline" className="text-positive border-positive">Sent</Badge>;
    }
    
    switch (alertType) {
      case 'crisis':
        return <Badge variant="destructive">Crisis</Badge>;
      case 'negative_spike':
        return <Badge variant="secondary">Negative Spike</Badge>;
      default:
        return <Badge variant="outline">Alert</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Alert Center</h2>
          <p className="text-muted-foreground">Monitor and manage brand sentiment alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-negative text-negative">
            {alerts.filter(a => !a.is_sent).length} Pending
          </Badge>
          <Badge variant="outline" className="border-positive text-positive">
            {alerts.filter(a => a.is_sent).length} Sent
          </Badge>
        </div>
      </div>

      {alerts.length === 0 ? (
        <Card className="bg-gradient-card border-border p-12 text-center">
          <CheckCircle className="w-16 h-16 text-positive mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Alerts</h3>
          <p className="text-muted-foreground">All brands are performing within normal parameters</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className="bg-gradient-card border-border p-6">
              <div className="flex items-start gap-4">
                {getAlertIcon(alert.alert_type)}
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{alert.brands.name}</h3>
                    {getAlertBadge(alert.alert_type, alert.is_sent)}
                  </div>
                  
                  <p className="text-muted-foreground mb-3">{alert.message}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                    {alert.sentiment_threshold && (
                      <span>Threshold: {alert.sentiment_threshold}%</span>
                    )}
                    {alert.sent_at && (
                      <span className="text-positive">
                        Sent: {new Date(alert.sent_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {!alert.is_sent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsSent(alert.id)}
                    className="shrink-0"
                  >
                    Mark as Sent
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};