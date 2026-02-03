import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClientAuth } from '@/hooks/useClientAuth';
import Dashboard from '@/pages/Dashboard';
import { Loader2, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription } from '@/components/ui/card';

/**
 * Root route handler: shows dashboard for authenticated employees (CEO),
 * redirects clients to their portal, and unauthenticated users to login.
 */
export const RootRedirect = () => {
  const { employee, loading: employeeLoading } = useAuth();
  const { client, loading: clientLoading } = useClientAuth();
  const [showWakeUpMessage, setShowWakeUpMessage] = useState(false);

  const loading = employeeLoading || clientLoading;
  const isEmployee = !!employee;
  const isClient = !!client;

  // Show wake-up message if loading takes more than 5 seconds
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowWakeUpMessage(true);
      }, 5000); // Show message after 5 seconds
      return () => clearTimeout(timer);
    } else {
      setShowWakeUpMessage(false);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 max-w-md">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          {showWakeUpMessage && (
            <Card className="w-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <CardDescription className="font-medium">
                      Service is waking up...
                    </CardDescription>
                    <CardDescription className="text-sm mt-1">
                      Free tier services may take up to 30 seconds to respond after inactivity. Please wait.
                    </CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // If authenticated as employee (CEO), show dashboard
  if (isEmployee && employee?.role === 'CEO') {
    return <Dashboard />;
  }

  // If authenticated as client, redirect to client portal
  if (isClient) {
    return <Navigate to="/smart-portal" replace />;
  }

  // Not authenticated, redirect to login
  return <Navigate to="/login" replace />;
};
