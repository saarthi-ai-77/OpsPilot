import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { submitUpdate } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { DailyUpdate } from '@/types';
import { Loader2, CheckCircle2, LogOut, LayoutDashboard, Zap } from 'lucide-react';
import { format } from 'date-fns';

export default function Submit() {
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [workDone, setWorkDone] = useState('');
  const [blockers, setBlockers] = useState('');
  const [confidence, setConfidence] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingUpdate, setExistingUpdate] = useState<DailyUpdate | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const checkExisting = async () => {
      try {
        const { data, error } = await supabase
          .from('daily_updates')
          .select('*')
          .eq('member_id', user.id)
          .eq('date', today)
          .single();

        if (data) {
          setExistingUpdate(data as DailyUpdate);
        }
      } catch (err) {
        console.error('Error checking existing update:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkExisting();
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
      await submitUpdate({
        member_id: user!.id,
        team_id: user!.team_id,
        work_done: workDone.trim(),
        blockers: blockers.trim(),
        confidence,
      });

      toast({
        title: 'Update submitted!',
        description: 'Your daily update has been recorded.',
      });

      // Refresh existing update state
      setExistingUpdate({
        id: 'new', // Placeholder since it's just for display
        member_id: user!.id,
        team_id: user!.team_id,
        work_done: workDone.trim(),
        blockers: blockers.trim(),
        confidence,
        date: today,
      });
    } catch (error: any) {
      toast({
        title: 'Submission failed',
        description: error.message || 'Something went wrong. Please try again.',
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between font-sans">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">OpsPilot AI</span>
          </div>

          <div className="flex items-center gap-3">
            {isManager && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="hidden sm:flex"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            )}
            <div className="text-sm font-medium text-muted-foreground hidden sm:block">
              {user.email}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">
            Daily Update
          </h1>
          <p className="text-lg text-muted-foreground">
            {format(new Date(), 'PPPP')}
          </p>
        </div>

        {existingUpdate ? (
          <Card className="border-green-200 bg-green-50/50 shadow-sm overflow-hidden">
            <div className="h-1 bg-green-500" />
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <CardTitle className="text-xl text-green-900">Successfully Submitted</CardTitle>
              </div>
              <CardDescription className="text-green-700">
                You've already completed your standup for today. Great job!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="bg-white p-4 rounded-lg border border-green-100">
                <Label className="text-green-800 font-bold text-xs uppercase tracking-wider">What you worked on</Label>
                <p className="mt-2 text-foreground leading-relaxed">{existingUpdate.work_done}</p>
              </div>

              {existingUpdate.blockers && (
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <Label className="text-amber-800 font-bold text-xs uppercase tracking-wider">Blockers</Label>
                  <p className="mt-2 text-foreground leading-relaxed">{existingUpdate.blockers}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Label className="text-muted-foreground font-medium text-sm">Confidence Level:</Label>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${existingUpdate.confidence === 'High' ? 'bg-green-100 text-green-700' :
                    existingUpdate.confidence === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                  }`}>
                  {existingUpdate.confidence}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Team Check-in</CardTitle>
              <CardDescription>
                Briefly share your progress and any hurdles you're facing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="workDone" className="text-base font-semibold">
                    What did you work on today? <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="workDone"
                    placeholder="Describe your accomplishments, tasks completed..."
                    value={workDone}
                    onChange={(e) => setWorkDone(e.target.value)}
                    disabled={isSubmitting}
                    rows={5}
                    className="resize-none text-base border-muted-foreground/20 focus-visible:ring-blue-500"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {workDone.length < 10 ? (
                      <span className="text-amber-600">Minimum 10 characters ({workDone.length}/10)</span>
                    ) : (
                      <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Ready to submit</span>
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="blockers" className="text-base font-semibold">Any blockers?</Label>
                  <Textarea
                    id="blockers"
                    placeholder="Describe any challenges or obstacles..."
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                    className="resize-none border-muted-foreground/20 focus-visible:ring-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confidence" className="text-base font-semibold">Confidence Level</Label>
                  <Select
                    value={confidence}
                    onValueChange={(v) => setConfidence(v as 'Low' | 'Medium' | 'High')}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="confidence" className="w-full h-11 border-muted-foreground/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">🔴 Low - I might need help</SelectItem>
                      <SelectItem value="Medium">🟡 Medium - Doing okay</SelectItem>
                      <SelectItem value="High">🟢 High - Everything is on track</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting update...
                    </>
                  ) : (
                    'Submit Daily Update'
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
