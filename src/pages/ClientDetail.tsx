import { useParams, Navigate, Link } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ClientHeader } from '@/components/client/ClientHeader';
import { ClientMetricsGrid } from '@/components/client/ClientMetricsGrid';
import { ClientPerformanceChart } from '@/components/client/ClientPerformanceChart';
import { ClientActivityTimeline } from '@/components/client/ClientActivityTimeline';
import { ClientAlertsList } from '@/components/client/ClientAlertsList';
import { OpportunityCards } from '@/components/dashboard/OpportunityCards';
import { mockClients, mockAlerts, mockActivities, mockOpportunities } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Users, ExternalLink } from 'lucide-react';

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const client = mockClients.find(c => c.id === id);
  
  if (!client) {
    return <Navigate to="/clients" replace />;
  }
  
  // Filter data for this client
  const clientAlerts = mockAlerts.filter(a => a.clientId === id);
  const clientActivities = mockActivities.filter(a => a.clientId === id);
  const clientOpportunities = mockOpportunities.filter(o => o.clientId === id);
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <ClientHeader client={client} />
          
          <div className="p-6 space-y-6">
            {/* Quick Portal Access */}
            <div className="flex gap-3">
              <Link to={`/wholesaler-portal?clientId=${id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Users className="w-4 h-4" />
                  Employee Portal
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </Link>
              <Link to={`/smart-portal?clientId=${id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Client Portal
                </Button>
              </Link>
            </div>

            {/* Metrics Grid */}
            <ClientMetricsGrid client={client} />
            
            {/* Charts and Activity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ClientPerformanceChart clientId={client.id} />
              </div>
              <div className="lg:col-span-1">
                <ClientActivityTimeline activities={clientActivities} />
              </div>
            </div>
            
            {/* Alerts and Opportunities Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ClientAlertsList alerts={clientAlerts} />
              {clientOpportunities.length > 0 && (
                <OpportunityCards 
                  opportunities={clientOpportunities} 
                  title="Opportunities"
                />
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ClientDetail;
