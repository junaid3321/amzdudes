import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Send, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle, 
  Package, 
  AlertCircle,
  TrendingUp,
  Clock,
  Loader2,
  Sparkles,
  Plus,
  ArrowLeft,
  DollarSign
} from 'lucide-react';
import { useDailyUpdates, useClientTasks, useWeeklySummaries } from '@/hooks/useClientPortalData';
import { formatDistanceToNow, format, startOfWeek, endOfWeek } from 'date-fns';

interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  client_type: string;
  health_score: number;
  mrr: number;
  health_status: string;
}

const WholesalerEmployeePortal = () => {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId') || '';
  const employeeId = searchParams.get('employeeId') || 'demo-employee';
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { updates, addUpdate } = useDailyUpdates(clientId);
  const { tasks, addTask, updateTask } = useClientTasks(clientId);
  const { summaries, addSummary } = useWeeklySummaries(clientId);
  
  const [updateText, setUpdateText] = useState('');
  const [updateType, setUpdateType] = useState<'routine' | 'important' | 'growth'>('routine');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [aiSuggestionText, setAiSuggestionText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (!error && data) {
        setClient(data as Client);
      }
      setLoading(false);
    };
    
    fetchClient();
  }, [clientId]);

  const handleUpdateSubmit = async () => {
    if (!updateText.trim()) return;

    setIsSubmitting(true);
    
    // Check for AI suggestion triggers
    const triggerWords = ['shipped', 'approved', 'shipment', 'confirmed', 'new brand', 'ungated'];
    const shouldShowAi = triggerWords.some(word => 
      updateText.toLowerCase().includes(word)
    );

    if (shouldShowAi && !showAiSuggestion) {
      setIsAnalyzing(true);
      try {
        const { data, error } = await supabase.functions.invoke('ai-assistant', {
          body: {
            type: 'suggest_update',
            content: updateText,
            clientType: 'wholesaler',
          }
        });

        if (!error && data) {
          setShowAiSuggestion(true);
          setAiSuggestionText(data.opportunityReason || 
            "This looks like a growth opportunity! Consider marking it to highlight value to the client."
          );
        }
      } catch (err) {
        console.error('AI analysis error:', err);
      }
      setIsAnalyzing(false);
      setIsSubmitting(false);
      return;
    }

    try {
      await addUpdate({
        client_id: clientId,
        employee_id: employeeId,
        update_text: updateText,
        category: updateType === 'growth' ? 'strategy' : 'general',
        ai_suggestion: aiSuggestionText || null,
        is_growth_opportunity: updateType === 'growth',
        feedback_requested: false,
        approved_for_client: true, // Auto-approve for client visibility
      });

      toast({
        title: 'Update Posted',
        description: client?.email ? 'Client will be notified via email.' : 'Update saved successfully.',
      });
      
      setUpdateText('');
      setShowAiSuggestion(false);
      setAiSuggestionText('');
      setUpdateType('routine');
    } catch (err) {
      console.error('Submit error:', err);
      toast({
        title: 'Failed to Submit',
        description: 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsGrowth = () => {
    setUpdateType('growth');
    setShowAiSuggestion(false);
    handleUpdateSubmit();
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    await addTask({
      client_id: clientId,
      title: newTaskTitle,
      description: null,
      assigned_to: null,
      created_by: 'employee',
      priority: 'medium',
      status: 'pending',
      due_date: null,
    });
    
    setNewTaskTitle('');
    toast({ title: 'Task Added' });
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await updateTask(taskId, { status: newStatus });
  };

  const handleGenerateWeeklySummary = async () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    const weekUpdates = updates.filter(u => {
      const updateDate = new Date(u.created_at);
      return updateDate >= weekStart && updateDate <= weekEnd;
    });

    if (weekUpdates.length === 0) {
      toast({
        title: 'No Updates',
        description: 'There are no updates this week to summarize.',
        variant: 'destructive'
      });
      return;
    }

    setIsGeneratingWeekly(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'generate_weekly',
          content: weekUpdates.map(u => u.update_text).join('\n'),
          clientType: 'wholesaler',
        }
      });

      if (error) throw error;

      await addSummary({
        client_id: clientId,
        week_start: format(weekStart, 'yyyy-MM-dd'),
        week_end: format(weekEnd, 'yyyy-MM-dd'),
        summary_text: data.summary,
        highlights: data.highlights,
        growth_opportunities: data.growthOpportunities,
      });

      toast({
        title: 'Weekly Summary Generated',
        description: 'AI has compiled this week\'s updates.',
      });
    } catch (err) {
      console.error('Weekly generation error:', err);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate weekly summary.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingWeekly(false);
    }
  };

  // Calculate stats
  const todayTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const growthUpdates = updates.filter(u => u.is_growth_opportunity).length;
  const approvedUpdates = updates.filter(u => u.approved_for_client);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!clientId || !client) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            No client selected. Please access this portal through the client list.
          </p>
          <Link 
            to="/clients" 
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/clients" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {client.contact_name} - {client.company_name}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Wholesaler • Active Client
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Monthly Revenue</p>
              <p className="text-xl font-bold text-emerald-600">${client.mrr.toLocaleString()}</p>
            </div>
            <div 
              className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-card ${
                client.health_score >= 80 ? 'bg-emerald-500' :
                client.health_score >= 60 ? 'bg-amber-500' : 'bg-destructive'
              }`}
            >
              {client.health_score}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-card border-b border-border px-6 py-3">
        <div className="max-w-7xl mx-auto flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
            <Phone className="w-4 h-4" />
            <span className="text-sm font-medium">Call Client</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors">
            <Mail className="w-4 h-4" />
            <span className="text-sm font-medium">Send Email</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">View Sheets</span>
          </button>
          <div className="flex-1" />
          <button
            onClick={handleGenerateWeeklySummary}
            disabled={isGeneratingWeekly}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isGeneratingWeekly ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">Generate Weekly Summary</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Today's Work */}
          <div className="col-span-2 space-y-6">
            {/* Daily Update Form */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Add Today's Update</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    What did you do?
                  </label>
                  <textarea
                    value={updateText}
                    onChange={(e) => setUpdateText(e.target.value)}
                    placeholder="E.g., 'Contacted Primal Spirit about shipping delay. They confirmed shipment will arrive tomorrow. Updated tracking sheet.'"
                    className="w-full h-24 px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>

                {/* AI Suggestion */}
                {showAiSuggestion && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary rounded-full p-1.5 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-primary font-medium mb-2">AI Suggestion</p>
                        <p className="text-sm text-foreground/80">{aiSuggestionText}</p>
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={handleMarkAsGrowth}
                            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90"
                          >
                            Mark as Growth Opportunity
                          </button>
                          <button 
                            onClick={() => {
                              setShowAiSuggestion(false);
                              handleUpdateSubmit();
                            }}
                            className="px-3 py-1.5 bg-card text-foreground text-xs rounded-md border border-border hover:bg-muted"
                          >
                            Keep as Routine
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUpdateType('routine')}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        updateType === 'routine' 
                          ? 'bg-muted text-foreground' 
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Routine Update
                    </button>
                    <button
                      onClick={() => setUpdateType('important')}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        updateType === 'important' 
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300' 
                          : 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/10 dark:text-amber-400 dark:hover:bg-amber-900/20'
                      }`}
                    >
                      Important
                    </button>
                    <button
                      onClick={() => setUpdateType('growth')}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        updateType === 'growth' 
                          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300' 
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                      }`}
                    >
                      Growth Opportunity
                    </button>
                  </div>
                  <button
                    onClick={handleUpdateSubmit}
                    disabled={!updateText.trim() || isSubmitting || isAnalyzing}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || isAnalyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Submit Update
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Client will be notified via email. They can turn off notifications in settings.</span>
                </div>
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Today's Tasks</h2>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="New task..."
                    className="px-3 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  />
                  <button 
                    onClick={handleAddTask}
                    className="text-primary text-sm hover:text-primary/80 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {todayTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No pending tasks. Add a task above.
                  </p>
                ) : (
                  todayTasks.slice(0, 5).map(task => (
                    <div 
                      key={task.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        task.priority === 'urgent' || task.priority === 'high'
                          ? 'bg-destructive/5 border-destructive/20' 
                          : task.priority === 'medium'
                          ? 'bg-amber-50/50 border-amber-200/50 dark:bg-amber-900/10 dark:border-amber-700/30'
                          : 'bg-muted/50 border-border'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="mt-1 rounded border-border"
                        checked={task.status === 'completed'}
                        onChange={() => handleToggleTask(task.id, task.status)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          {task.due_date && ` • Due: ${format(new Date(task.due_date), 'MMM d')}`}
                        </p>
                      </div>
                      {(task.priority === 'urgent' || task.priority === 'high') && (
                        <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded font-medium">
                          URGENT
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity (What client sees) */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Updates (Client View)</h2>
              
              <div className="space-y-4">
                {approvedUpdates.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No updates visible to client yet. Submit an update above.
                  </p>
                ) : (
                  approvedUpdates.slice(0, 5).map(update => (
                    <div key={update.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                      <div className={`rounded-full p-2 ${
                        update.is_growth_opportunity 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                          : 'bg-primary/10'
                      }`}>
                        {update.is_growth_opportunity ? (
                          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{update.update_text}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            {/* Active Orders / Outreach */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">This Week's Outreach</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Updates Posted</span>
                  <span className="text-sm font-bold text-foreground">{updates.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Growth Opportunities</span>
                  <span className="text-sm font-bold text-emerald-600">{growthUpdates}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tasks Completed</span>
                  <span className="text-sm font-bold text-foreground">{completedTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Tasks</span>
                  <span className="text-sm font-bold text-foreground">{todayTasks.length}</span>
                </div>
              </div>
            </div>

            {/* Weekly Summaries */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Weekly Summaries</h3>
              
              {summaries.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No summaries yet. Generate one using the button above.
                </p>
              ) : (
                <div className="space-y-3">
                  {summaries.slice(0, 3).map(summary => (
                    <div key={summary.id} className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs font-medium text-foreground mb-1">
                        Week of {format(new Date(summary.week_start), 'MMM d')}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {summary.summary_text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-4 text-primary-foreground">
              <h3 className="text-sm font-semibold mb-3">Your Impact This Month</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Tasks Completed</span>
                  <span className="text-lg font-bold">{completedTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Updates Posted</span>
                  <span className="text-lg font-bold">{updates.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Growth Identified</span>
                  <span className="text-lg font-bold">{growthUpdates}</span>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Client Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact</span>
                  <span className="text-foreground">{client.contact_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-foreground text-xs">{client.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Health</span>
                  <span className={`font-medium ${
                    client.health_status === 'healthy' ? 'text-emerald-600' :
                    client.health_status === 'at_risk' ? 'text-amber-600' : 'text-destructive'
                  }`}>
                    {client.health_status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WholesalerEmployeePortal;
