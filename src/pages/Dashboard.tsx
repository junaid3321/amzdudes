import { AppLayout } from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ClientList } from '@/components/dashboard/ClientList';
import { AlertList } from '@/components/dashboard/AlertList';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { OpportunityCards } from '@/components/dashboard/OpportunityCards';
import { TeamUtilizationCard } from '@/components/dashboard/TeamUtilizationCard';
import { 
  mockClients, 
  mockAlerts, 
  mockActivities, 
  mockOpportunities,
  mockDashboardMetrics,
  mockTeamLeads,
  mockHiringMetrics
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
  const netClientChange = mockDashboardMetrics.clientsAddedThisMonth - mockDashboardMetrics.clientsLostThisMonth;

  return (
    <AppLayout 
      title="Dashboard" 
      subtitle="Welcome back, John. Here's what's happening with your agency."
    >
      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Clients"
          value={mockDashboardMetrics.totalClients}
          change={{ 
            value: `${netClientChange >= 0 ? '+' : ''}${netClientChange} this month`, 
            positive: netClientChange >= 0 
          }}
          icon={Users}
          variant="primary"
        />
        <MetricCard
          title="Monthly Recurring Revenue"
          value={formatCurrency(mockDashboardMetrics.totalMRR)}
          change={{ 
            value: `${mockDashboardMetrics.mrrChange >= 0 ? '+' : ''}${mockDashboardMetrics.mrrChange}% vs last month`, 
            positive: mockDashboardMetrics.mrrChange >= 0 
          }}
          icon={DollarSign}
          variant="success"
        />
        <MetricCard
          title="Avg Client Score"
          value={`${mockDashboardMetrics.avgClientScore}/10`}
          change={{ value: 'From client feedback', positive: mockDashboardMetrics.avgClientScore >= 7 }}
          icon={Star}
          variant={mockDashboardMetrics.avgClientScore >= 8 ? 'success' : mockDashboardMetrics.avgClientScore >= 6 ? 'warning' : 'danger'}
        />
        <MetricCard
          title="Attendance Score"
          value={`${mockDashboardMetrics.attendanceScore}%`}
          change={{ value: 'Yesterday', positive: mockDashboardMetrics.attendanceScore >= 90 }}
          icon={Clock}
          variant={mockDashboardMetrics.attendanceScore >= 90 ? 'success' : mockDashboardMetrics.attendanceScore >= 75 ? 'warning' : 'danger'}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title={`${mockDashboardMetrics.currentQuarter} Revenue`}
          value={formatCurrency(mockDashboardMetrics.quarterlyRevenue)}
          icon={TrendingUp}
          variant="success"
        />
        <MetricCard
          title="Opportunities Pipeline"
          value={mockDashboardMetrics.opportunitiesPipeline}
          change={{ value: formatCurrency(mockDashboardMetrics.opportunitiesPotential) + ' potential', positive: true }}
          icon={Briefcase}
        />
        <MetricCard
          title="Team Utilization"
          value={`${mockDashboardMetrics.teamUtilization}%`}
          icon={BarChart3}
          variant={mockDashboardMetrics.teamUtilization >= 80 ? 'success' : mockDashboardMetrics.teamUtilization >= 60 ? 'warning' : 'danger'}
        />
        <MetricCard
          title="Hiring & Interviews"
          value={mockHiringMetrics.newHiresThisMonth}
          change={{ value: `${mockHiringMetrics.interviewsScheduled} scheduled, ${mockHiringMetrics.jobPostsActive} posts`, positive: true }}
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
