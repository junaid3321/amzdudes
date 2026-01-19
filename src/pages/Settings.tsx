import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  User, 
  Building, 
  Bell, 
  Link, 
  BarChart3,
  Save
} from 'lucide-react';

const Settings = () => {
  // Dashboard metrics state
  const [metrics, setMetrics] = useState({
    totalClients: 35,
    clientsAddedThisMonth: 5,
    clientsLostThisMonth: 2,
    totalMRR: 56100,
    mrrChange: 12,
    avgClientScore: 8.4,
    attendanceScore: 94,
    quarterlyRevenue: 892000,
    currentQuarter: 'Q1 2026',
    opportunitiesPipeline: 42,
    opportunitiesPotential: 127000,
    teamUtilization: 83,
    jobPostsActive: 4,
    interviewsScheduled: 6,
    newHiresThisMonth: 2
  });

  const handleMetricChange = (field: string, value: string) => {
    setMetrics(prev => ({
      ...prev,
      [field]: field === 'currentQuarter' ? value : parseFloat(value) || 0
    }));
  };

  const handleSaveMetrics = () => {
    // In a real app, this would save to database/API
    toast({
      title: "Metrics Saved",
      description: "Dashboard metrics have been updated successfully.",
    });
  };

  return (
    <AppLayout 
      title="Settings" 
      subtitle="Manage your account and preferences"
    >
      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="metrics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard Metrics
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="agency" className="gap-2">
            <Building className="w-4 h-4" />
            Agency
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Link className="w-4 h-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client & Revenue Metrics</CardTitle>
                <CardDescription>Update client count and revenue data manually</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalClients">Total Clients</Label>
                    <Input 
                      id="totalClients" 
                      type="number" 
                      value={metrics.totalClients}
                      onChange={(e) => handleMetricChange('totalClients', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientsAdded">Clients Added This Month</Label>
                    <Input 
                      id="clientsAdded" 
                      type="number" 
                      value={metrics.clientsAddedThisMonth}
                      onChange={(e) => handleMetricChange('clientsAddedThisMonth', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientsLost">Clients Lost This Month</Label>
                    <Input 
                      id="clientsLost" 
                      type="number" 
                      value={metrics.clientsLostThisMonth}
                      onChange={(e) => handleMetricChange('clientsLostThisMonth', e.target.value)}
                    />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalMRR">Monthly Recurring Revenue ($)</Label>
                    <Input 
                      id="totalMRR" 
                      type="number" 
                      value={metrics.totalMRR}
                      onChange={(e) => handleMetricChange('totalMRR', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mrrChange">MRR Change (%)</Label>
                    <Input 
                      id="mrrChange" 
                      type="number" 
                      value={metrics.mrrChange}
                      onChange={(e) => handleMetricChange('mrrChange', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quarterlyRevenue">Quarterly Revenue ($)</Label>
                    <Input 
                      id="quarterlyRevenue" 
                      type="number" 
                      value={metrics.quarterlyRevenue}
                      onChange={(e) => handleMetricChange('quarterlyRevenue', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentQuarter">Current Quarter</Label>
                    <Input 
                      id="currentQuarter" 
                      value={metrics.currentQuarter}
                      onChange={(e) => handleMetricChange('currentQuarter', e.target.value)}
                      placeholder="e.g., Q1 2026"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Update client score, attendance, and team data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="avgClientScore">Avg Client Score (out of 10)</Label>
                    <Input 
                      id="avgClientScore" 
                      type="number" 
                      step="0.1"
                      min="0"
                      max="10"
                      value={metrics.avgClientScore}
                      onChange={(e) => handleMetricChange('avgClientScore', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attendanceScore">Attendance Score (%)</Label>
                    <Input 
                      id="attendanceScore" 
                      type="number" 
                      min="0"
                      max="100"
                      value={metrics.attendanceScore}
                      onChange={(e) => handleMetricChange('attendanceScore', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamUtilization">Team Utilization (%)</Label>
                    <Input 
                      id="teamUtilization" 
                      type="number" 
                      min="0"
                      max="100"
                      value={metrics.teamUtilization}
                      onChange={(e) => handleMetricChange('teamUtilization', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline & Hiring Metrics</CardTitle>
                <CardDescription>Update opportunities and hiring data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="opportunitiesPipeline">Opportunities in Pipeline</Label>
                    <Input 
                      id="opportunitiesPipeline" 
                      type="number" 
                      value={metrics.opportunitiesPipeline}
                      onChange={(e) => handleMetricChange('opportunitiesPipeline', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opportunitiesPotential">Potential Revenue ($)</Label>
                    <Input 
                      id="opportunitiesPotential" 
                      type="number" 
                      value={metrics.opportunitiesPotential}
                      onChange={(e) => handleMetricChange('opportunitiesPotential', e.target.value)}
                    />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobPostsActive">Active Job Posts</Label>
                    <Input 
                      id="jobPostsActive" 
                      type="number" 
                      value={metrics.jobPostsActive}
                      onChange={(e) => handleMetricChange('jobPostsActive', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interviewsScheduled">Interviews Scheduled</Label>
                    <Input 
                      id="interviewsScheduled" 
                      type="number" 
                      value={metrics.interviewsScheduled}
                      onChange={(e) => handleMetricChange('interviewsScheduled', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newHiresThisMonth">New Hires This Month</Label>
                    <Input 
                      id="newHiresThisMonth" 
                      type="number" 
                      value={metrics.newHiresThisMonth}
                      onChange={(e) => handleMetricChange('newHiresThisMonth', e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveMetrics} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save All Metrics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  JD
                </div>
                <Button variant="outline">Change Avatar</Button>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john@agency.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agency">
          <Card>
            <CardHeader>
              <CardTitle>Agency Settings</CardTitle>
              <CardDescription>Configure your agency details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agencyName">Agency Name</Label>
                  <Input id="agencyName" defaultValue="AMZDUDES" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" defaultValue="https://amzdudes.com" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how you receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Critical Alerts</p>
                  <p className="text-sm text-muted-foreground">Receive immediate notifications for critical issues</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Warning Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified about potential issues</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Opportunity Alerts</p>
                  <p className="text-sm text-muted-foreground">Discover growth opportunities</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Digest</p>
                  <p className="text-sm text-muted-foreground">Daily summary of all alerts</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect your tools and data sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Google Sheets', 'Zoho CRM', 'Amazon SP-API', 'Amazon Advertising API', 'Slack'].map((integration) => (
                <div key={integration} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <span className="font-medium">{integration}</span>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Settings;
