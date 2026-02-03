import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Building2, Users, Eye, EyeOff, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useClientAuth } from '@/hooks/useClientAuth';
import { isClientAllowedFromPath, isEmployeeAllowedFromPath } from '@/components/ProtectedRoute';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn: employeeSignIn, signOut: employeeSignOut, employee, loading: employeeLoading } = useAuth();
  const { signIn: clientSignIn, client, loading: clientLoading } = useClientAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'employee' | 'client'>('employee');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWakeUpMessage, setShowWakeUpMessage] = useState(false);

  const isEmployee = !!employee;
  const isClient = !!client;
  const isAuthenticated = isEmployee || isClient;
  const locationState = location.state as { from?: { pathname: string }; restricted?: string } | null;
  const isRestrictedCEO = locationState?.restricted === 'CEO only';

  // If sent here because access is CEO-only (for admin features), show message
  useEffect(() => {
    if (isRestrictedCEO && isEmployee) {
      setError('Access restricted to CEO. This feature is only available to administrators.');
    }
  }, [isRestrictedCEO, isEmployee]);

  // Redirect if already authenticated, to the correct home by role (skip when showing CEO restriction)
  useEffect(() => {
    if (isRestrictedCEO) return;
    if (employeeLoading || clientLoading) return;
    if (!isAuthenticated) return;

    const from = locationState?.from?.pathname;

    if (isEmployee) {
      // All employees (CEO and regular) can access employee dashboard
      const target = from && isEmployeeAllowedFromPath(from) ? from : '/';
      navigate(target, { replace: true });
    } else if (isClient) {
      const target = from && isClientAllowedFromPath(from) ? from : '/smart-portal';
      navigate(target, { replace: true });
    }
  }, [isEmployee, isClient, isAuthenticated, employee?.role, employeeLoading, clientLoading, navigate, location, locationState, isRestrictedCEO]);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowWakeUpMessage(false);
    
    if (!validateInputs()) return;
    
    setLoading(true);
    
    // Show wake-up message after 5 seconds
    const wakeUpTimer = setTimeout(() => {
      setShowWakeUpMessage(true);
    }, 5000);

    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Login timeout: Service may be waking up. Please wait and try again.'));
        }, 30000);
      });

      if (userType === 'employee') {
        const signInPromise = employeeSignIn(email, password);
        const result = await Promise.race([signInPromise, timeoutPromise]);
        
        if (timeoutId) clearTimeout(timeoutId);
        
        const { error } = result as any;
        
        if (error) {
          if (error.message?.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(error.message || 'Login failed. Please try again.');
          }
        } else {
          const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
          const target = from && isEmployeeAllowedFromPath(from) ? from : '/';
          navigate(target, { replace: true });
        }
      } else {
        const signInPromise = clientSignIn(email, password);
        const result = await Promise.race([signInPromise, timeoutPromise]);
        
        if (timeoutId) clearTimeout(timeoutId);
        
        const { error } = result as any;
        
        if (error) {
          if (error.message?.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(error.message || 'Login failed. Please try again.');
          }
        } else {
          const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
          const target = from && isClientAllowedFromPath(from) ? from : '/smart-portal';
          navigate(target, { replace: true });
        }
      }
    } catch (err: any) {
      if (timeoutId) clearTimeout(timeoutId);
      if (err.message?.includes('timeout')) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      clearTimeout(wakeUpTimer);
      if (timeoutId) clearTimeout(timeoutId);
      setLoading(false);
      setShowWakeUpMessage(false);
    }
  };

  if (employeeLoading || clientLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <img 
              src={`/logo.png?v=5`}
              alt="amzDUDES Logo" 
              className="h-20 w-auto object-contain"
              onError={(e) => {
                // Fallback to amz-logo.png if logo.png fails
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('amz-logo.png')) {
                  target.src = `/amz-logo.png?v=5`;
                }
              }}
            />
          </div>
          <div>
            <CardDescription className="mt-2 text-base text-muted-foreground">
              Sign in to access your dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* User Type Selection */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">I am a:</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={userType === 'employee' ? 'default' : 'outline'}
                className="h-auto py-3 flex flex-col items-center gap-2"
                onClick={() => {
                  setUserType('employee');
                  setError(null);
                }}
              >
                <Users className="w-5 h-5" />
                <span>Employee</span>
              </Button>
              <Button
                type="button"
                variant={userType === 'client' ? 'default' : 'outline'}
                className="h-auto py-3 flex flex-col items-center gap-2"
                onClick={() => {
                  setUserType('client');
                  setError(null);
                }}
              >
                <Building2 className="w-5 h-5" />
                <span>Client</span>
              </Button>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder={userType === 'employee' ? 'you@amzdudes.com' : 'you@company.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <div className="relative">
                <Input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {showWakeUpMessage && !error && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Service is waking up... Free tier services may take up to 30 seconds to respond after inactivity. Please wait.
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            {userType === 'client' && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                Your login credentials are provided by your account manager.
                <br />
                Contact support if you need access.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

