import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { submitUpdate } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { DailyUpdate } from '@/types';
import {
  Loader2,
  CheckCircle2,
  LogOut,
  LayoutDashboard,
  Calendar,
  AlertCircle,
  Quote,
  ArrowRight
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Variants, motion, AnimatePresence } from 'framer-motion';

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
        title: 'Success!',
        description: 'Your daily check-in is complete.',
      });

      setExistingUpdate({
        id: 'new',
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
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" as any }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <img src="/logo.png" alt="Loading Logo" className="h-16 w-auto" />
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen gradient-bg font-sans">
      <header className="sticky top-0 z-50 glass-card border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
              onClick={() => navigate('/')}
            >
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            </motion.div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {isManager && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="font-bold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-full px-4"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Management Hub</span>
                <span className="md:hidden">Hub</span>
              </Button>
            )}
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900 leading-none">{user.email.split('@')[0]}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{user.role}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hover:bg-red-50 hover:text-red-600 transition-colors">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 text-indigo-600 mb-4">
            <Calendar className="w-5 h-5" />
            <span className="font-bold uppercase tracking-widest text-xs">{format(new Date(), 'EEEE, MMMM do')}</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight font-outfit">
            Daily Check-in
          </h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {existingUpdate ? (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="glass-card rounded-[2.5rem] p-10 md:p-12 premium-shadow border-indigo-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 text-indigo-500/10">
                  <CheckCircle2 className="w-24 h-24" rotate={15} />
                </div>

                <div className="flex items-start gap-6 mb-10">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 font-outfit mb-2">Done for the day!</h3>
                    <p className="text-slate-500 font-medium text-lg">Your update has been logged and synced with Gemini.</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="relative pl-8 border-l-2 border-indigo-100">
                    <Quote className="absolute -left-3 -top-1 w-6 h-6 text-indigo-200 fill-indigo-50" />
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Accomplishments</Label>
                    <p className="text-slate-700 text-xl font-medium leading-relaxed">{existingUpdate.work_done}</p>
                  </div>

                  {existingUpdate.blockers && (
                    <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100/50">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2 block flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" /> Blockers & Hurdles
                      </Label>
                      <p className="text-slate-700 font-medium">{existingUpdate.blockers}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Internal Confidence:</span>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${existingUpdate.confidence === 'High' ? 'bg-emerald-100 text-emerald-700' :
                      existingUpdate.confidence === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                      {existingUpdate.confidence}
                    </span>
                  </div>
                </div>
              </div>

              {isManager && (
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="w-full h-16 rounded-3xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg transition-transform hover:scale-[1.01]"
                >
                  Go to Management Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-[2.5rem] p-8 md:p-12 premium-shadow"
            >
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-4">
                  <Label htmlFor="workDone" className="text-xl font-black text-slate-900 font-outfit flex items-center gap-2">
                    What did you achieve today?
                    <span className="text-indigo-400 text-sm font-medium ml-auto">Required</span>
                  </Label>
                  <Textarea
                    id="workDone"
                    placeholder="Describe your progress... be as specific as possible for the AI summary."
                    value={workDone}
                    onChange={(e) => setWorkDone(e.target.value)}
                    disabled={isSubmitting}
                    className="min-h-[160px] text-lg rounded-2xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all placeholder:text-slate-300 resize-none px-6 py-5 font-medium leading-relaxed"
                  />
                  <div className="flex items-center justify-between px-2">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${workDone.length < 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {workDone.length < 10 ? `Need ${10 - workDone.length} more characters` : "Character goal met"}
                    </p>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`w-6 h-1.5 rounded-full transition-colors ${workDone.length >= (i + 1) * 10 ? 'bg-indigo-500' : 'bg-slate-100'
                          }`} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="blockers" className="text-xl font-black text-slate-900 font-outfit">Any roadblocks?</Label>
                  <Textarea
                    id="blockers"
                    placeholder="Any challenges or blockers we should know about?"
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    disabled={isSubmitting}
                    className="min-h-[100px] text-lg rounded-2xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all placeholder:text-slate-300 resize-none px-6 py-5 font-medium"
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="confidence" className="text-xl font-black text-slate-900 font-outfit">Team Health Check</Label>
                  <Select
                    value={confidence}
                    onValueChange={(v) => setConfidence(v as 'Low' | 'Medium' | 'High')}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="confidence" className="h-16 px-6 text-lg rounded-2xl border-slate-200 bg-white/50 font-bold focus:ring-4 focus:ring-indigo-100 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 p-2">
                      <SelectItem value="Low" className="rounded-xl h-12 focus:bg-red-50 focus:text-red-700">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="font-bold">Struggling</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Medium" className="rounded-xl h-12 focus:bg-amber-50 focus:text-amber-700">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-amber-500" />
                          <span className="font-bold">On Track</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="High" className="rounded-xl h-12 focus:bg-emerald-50 focus:text-emerald-700">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span className="font-bold">Excelling</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-2xl shadow-indigo-100 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3"
                      >
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Syncing...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="ready"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3"
                      >
                        Submit for Review
                        <ArrowRight className="h-6 w-6" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
