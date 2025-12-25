import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getUpdatesByUserAndDate, saveUpdate, getTodayDate, formatDate } from '@/lib/storage';
import { DailyUpdate } from '@/types';
import { Loader2, CheckCircle2, LogOut, LayoutDashboard, Zap } from 'lucide-react';

export default function Submit() {
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [workDone, setWorkDone] = useState('');
  const [blockers, setBlockers] = useState('');
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [existingUpdate, setExistingUpdate] = useState<DailyUpdate | null>(null);

  const today = getTodayDate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const existing = getUpdatesByUserAndDate(user.id, today);
    if (existing) {
      setHasSubmittedToday(true);
      setExistingUpdate(existing);
    }
  }, [user, navigate, today]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (workDone.trim().length < 10) {
      toast({
        title: 'More detail needed',
        description: 'Please describe your work in at least 10 characters.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const update: DailyUpdate = {
        id: crypto.randomUUID(),
        userId: user!.id,
        userName: user!.name,
        teamId: user!.teamId,
        date: today,
        workDone: workDone.trim(),
        blockers: blockers.trim(),
        confidence,
        submittedAt: new Date().toISOString(),
      };

      saveUpdate(update);

      toast({
        title: 'Update submitted!',
        description: 'Your daily update has been recorded.',
      });

      setHasSubmittedToday(true);
      setExistingUpdate(update);
    } catch {
      toast({
        title: 'Submission failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">OpsPilot AI</span>
          </div>
          
          <div className="flex items-center gap-3">
            {isManager && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            )}
            <div className="text-sm text-muted-foreground hidden sm:block">
              {user.name}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Daily Update
          </h1>
          <p className="text-muted-foreground">
            {formatDate(today)}
          </p>
        </div>

        {hasSubmittedToday && existingUpdate ? (
          <Card className="border-success/50 bg-success/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <CardTitle className="text-lg">Already Submitted</CardTitle>
              </div>
              <CardDescription>
                You've already submitted your update for today.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-sm">What you worked on</Label>
                <p className="mt-1 text-foreground">{existingUpdate.workDone}</p>
              </div>
              
              {existingUpdate.blockers && (
                <div>
                  <Label className="text-muted-foreground text-sm">Blockers</Label>
                  <p className="mt-1 text-foreground">{existingUpdate.blockers}</p>
                </div>
              )}
              
              <div>
                <Label className="text-muted-foreground text-sm">Confidence level</Label>
                <p className="mt-1 text-foreground capitalize">{existingUpdate.confidence}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Update</CardTitle>
              <CardDescription>
                Share what you accomplished today with your team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="workDone">
                    What did you work on today? <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="workDone"
                    placeholder="Describe your accomplishments, tasks completed, progress made..."
                    value={workDone}
                    onChange={(e) => setWorkDone(e.target.value)}
                    disabled={isSubmitting}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 10 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blockers">Any blockers?</Label>
                  <Textarea
                    id="blockers"
                    placeholder="Describe any challenges, dependencies, or obstacles..."
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confidence">Confidence level</Label>
                  <Select 
                    value={confidence} 
                    onValueChange={(v) => setConfidence(v as 'low' | 'medium' | 'high')}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="confidence" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🔴 Low</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="high">🟢 High</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How confident are you about tomorrow's progress?
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Update'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
