import { AppLayout } from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ClientList } from '@/components/dashboard/ClientList';
import { AlertList } from '@/components/dashboard/AlertList';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { OpportunityCards } from '@/components/dashboard/OpportunityCards';
import { TeamUtilizationCard } from '@/components/dashboard/TeamUtilizationCard';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { 
  mockClients, 
  mockAlerts, 
  mockActivities, 
  mockOpportunities,
  mockTeamLeads
} from '@/data/mockData';
import { 
  Users, 
  DollarSign, 
  Star, 
  Clock, 
  TrendingUp,
  Briefcase,
  UserPlus,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const { metrics, hiringMetrics } = useDashboardMetrics();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  // Sort clients by health score for at-risk display
  const atRiskClients = [...mockClients]
    .filter(c => c.healthStatus === 'warning' || c.healthStatus === 'critical')
    .sort((a, b) => a.healthScore - b.healthScore);

  // Get critical and warning alerts only
  const urgentAlerts = mockAlerts.filter(a => a.severity === 'critical' || a.severity === 'warning');

  // Calculate net client change
  const netClientChange = metrics.clientsAddedThisMonth - metrics.clientsLostThisMonth;

  return (
    <AppLayout 
      title="Dashboard" 
      subtitle="Welcome back, John. Here's what's happening with your agency."
    >
      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Clients"
          value={metrics.totalClients}
          change={{ 
            value: `${netClientChange >= 0 ? '+' : ''}${netClientChange} this month`, 
            positive: netClientChange >= 0 
          }}
          icon={Users}
          variant="primary"
        />
        <MetricCard
          title="Monthly Recurring Revenue"
          value={formatCurrency(metrics.totalMRR)}
          change={{ 
            value: `${metrics.mrrChange >= 0 ? '+' : ''}${metrics.mrrChange}% vs last month`, 
            positive: metrics.mrrChange >= 0 
          }}
          icon={DollarSign}
          variant="success"
        />
        <MetricCard
          title="Avg Client Score"
          value={`${metrics.avgClientScore}/10`}
          change={{ value: 'From client feedback', positive: metrics.avgClientScore >= 7 }}
          icon={Star}
          variant={metrics.avgClientScore >= 8 ? 'success' : metrics.avgClientScore >= 6 ? 'warning' : 'danger'}
        />
        <MetricCard
          title="Attendance Score"
          value={`${metrics.attendanceScore}%`}
          change={{ value: 'Yesterday', positive: metrics.attendanceScore >= 90 }}
          icon={Clock}
          variant={metrics.attendanceScore >= 90 ? 'success' : metrics.attendanceScore >= 75 ? 'warning' : 'danger'}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title={`${metrics.currentQuarter} Revenue`}
          value={formatCurrency(metrics.quarterlyRevenue)}
          icon={TrendingUp}
          variant="success"
        />
        <MetricCard
          title="Opportunities Pipeline"
          value={metrics.opportunitiesPipeline}
          change={{ value: formatCurrency(metrics.opportunitiesPotential) + ' potential', positive: true }}
          icon={Briefcase}
        />
        <MetricCard
          title="Team Utilization"
          value={`${metrics.teamUtilization}%`}
          icon={BarChart3}
          variant={metrics.teamUtilization >= 80 ? 'success' : metrics.teamUtilization >= 60 ? 'warning' : 'danger'}
        />
        <MetricCard
          title="Hiring & Interviews"
          value={hiringMetrics.newHiresThisMonth}
          change={{ value: `${hiringMetrics.interviewsScheduled} scheduled, ${hiringMetrics.jobPostsActive} posts`, positive: true }}
          icon={UserPlus}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Clients & Alerts */}
        <div className="xl:col-span-2 space-y-8">
          {/* At-Risk Clients */}
          {atRiskClients.length > 0 && (
            <ClientList 
              clients={atRiskClients} 
              title="⚠️ Clients Needing Attention" 
            />
          )}

          {/* Urgent Alerts */}
          <AlertList 
            alerts={urgentAlerts.slice(0, 5)} 
            title="Urgent Alerts" 
          />

          {/* All Clients */}
          <ClientList 
            clients={mockClients.slice(0, 6)} 
            title="All Clients" 
          />
        </div>

        {/* Right Column - Activity, Team & Opportunities */}
        <div className="space-y-8">
          {/* Team Utilization */}
          <TeamUtilizationCard teamLeads={mockTeamLeads} />

          {/* Activity Feed */}
          <ActivityFeed activities={mockActivities} />

          {/* Growth Opportunities */}
          <OpportunityCards opportunities={mockOpportunities} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
