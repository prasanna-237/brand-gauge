import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onNavigate: (page: 'dashboard' | 'analytics' | 'alerts' | 'reports') => void;
  currentPage: string;
}

export const Header = ({ onNavigate, currentPage }: HeaderProps) => {
  return (
    <header className="w-full border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SentimentAI Monitor
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time brand sentiment analysis and crisis detection
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {[
              { key: 'dashboard', label: 'Dashboard' },
              { key: 'analytics', label: 'Analytics' },
              { key: 'alerts', label: 'Alerts' },
              { key: 'reports', label: 'Reports' }
            ].map((item) => (
              <Button
                key={item.key}
                variant={currentPage === item.key ? "default" : "ghost"}
                onClick={() => onNavigate(item.key as any)}
                className={currentPage === item.key ? "bg-gradient-primary" : ""}
              >
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Status */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-positive text-positive">
              <div className="w-2 h-2 bg-positive rounded-full mr-2 animate-pulse"></div>
              ONLINE
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};