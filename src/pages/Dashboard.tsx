import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getSummary } from '@/lib/api';
import { CalendarIcon, LogOut, FileText, Zap, Loader2, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export default function Dashboard() {
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isManager) {
      navigate('/submit');
      return;
    }
  }, [user, isManager, navigate]);

  useEffect(() => {
    if (!user || !isManager) return;

    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getSummary(user.team_id, dateString);
        if (result.success && result.summary) {
          setSummary(result.summary);
        } else {
          setSummary(null);
        }
      } catch (err) {
        console.error('Error fetching summary:', err);
        setError('Failed to fetch summary. Please try again later.');
        setSummary(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [dateString, user, isManager]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  if (!user || !isManager) return null;

  return (
    <div className="min-h-screen gradient-bg selection:bg-indigo-100">
      <header className="sticky top-0 z-50 glass-card border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="p-2 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-100 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <Zap className="h-5 w-5 text-white" />
            </motion.div>
            <span className="font-bold text-xl tracking-tight text-slate-900 font-outfit hidden sm:block">OpsPilot AI</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/submit')}
              className="font-bold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-full px-4"
            >
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Submit Update</span>
              <span className="md:hidden">Submit</span>
            </Button>
            <div className="h-8 w-[1px] bg-slate-200" />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hover:bg-red-50 hover:text-red-600">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">
              <TrendingUp className="w-4 h-4" />
              <span>Manager Insights</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight font-outfit">
              Command Center
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[280px] h-14 justify-start text-lg font-bold border-white glass-card shadow-lg hover:bg-white rounded-2xl">
                  <CalendarIcon className="mr-3 h-5 w-5 text-indigo-600" />
                  {format(selectedDate, 'MMMM do, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-none shadow-2xl" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className="p-4"
                />
              </PopoverContent>
            </Popover>
          </motion.div>
        </div>

        <div className="grid gap-10">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card rounded-[3rem] p-24 flex flex-col items-center justify-center space-y-6 premium-shadow border-white"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="p-4 rounded-3xl bg-indigo-50"
                >
                  <Sparkles className="h-12 w-12 text-indigo-600" />
                </motion.div>
                <div className="text-center">
                  <h3 className="text-2xl font-black text-slate-900 font-outfit mb-2">Analyzing Team Heartbeat</h3>
                  <p className="text-slate-500 font-medium">Gemini is synthesizing daily updates into actionable insights...</p>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-12 text-center"
              >
                <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-600">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-rose-900 font-outfit mb-3">Sync Failed</h3>
                <p className="text-rose-700 font-medium mb-8 max-w-sm mx-auto">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl px-8"
                >
                  Retry Connection
                </Button>
              </motion.div>
            ) : summary ? (
              <motion.div
                key="summary"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="glass-card rounded-[3rem] p-10 md:p-14 premium-shadow border-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-12 text-indigo-500/5 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-32 h-32" />
                </div>

                <div className="flex items-center gap-4 mb-12 relative z-10">
                  <div className="p-3 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-100">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 font-outfit uppercase tracking-tight">Intelligence Report</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Google Gemini 1.5 Pro Analysis</p>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none relative z-10">
                  <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-10 border border-white/50 text-slate-800 shadow-inner">
                    <div className="whitespace-pre-wrap font-sans leading-relaxed text-xl space-y-6">
                      {summary}
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100 pt-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 text-emerald-600 p-2 rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-500">Summary verified and up-to-date</span>
                  </div>
                  <Button variant="ghost" className="text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl px-6">
                    Export Report
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="text-center py-32 glass-card rounded-[3rem] border-2 border-dashed border-slate-200"
              >
                <div className="mx-auto w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-8 text-slate-300">
                  <CalendarIcon className="h-10 w-10" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 font-outfit mb-4">Radio Silence</h3>
                <p className="text-slate-400 font-medium text-lg max-w-md mx-auto">
                  No updates found for this date. Check another calendar day or remind your team to check in.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="mt-20 py-12 border-t border-slate-100 text-center">
        <p className="text-slate-400 font-medium">OpsPilot AI Management Hub © 2025</p>
      </footer>
    </div>
  );
}
