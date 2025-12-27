import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getSummary } from '@/lib/api';
import { TeamSummary } from '@/types';
import { CalendarIcon, LogOut, FileText, Zap, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

  if (!user || !isManager) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="border-b border-border bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">OpsPilot AI</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/submit')}
              className="hidden sm:flex border-slate-200"
            >
              <FileText className="h-4 w-4 mr-2" />
              Submit Update
            </Button>
            <div className="text-sm font-medium text-slate-600 hidden sm:block">
              {user.email}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-slate-900">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              Manager Dashboard
            </h1>
            <p className="text-lg text-slate-500 font-medium">
              Daily AI-generated team summaries
            </p>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[260px] h-11 justify-start text-left font-semibold border-slate-200 shadow-sm bg-white">
                <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date > new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-8">
          <Card className="shadow-xl border-none overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                    AI Team Summary
                  </CardTitle>
                  <CardDescription className="text-lg mt-1 font-medium">
                    Analysis for {format(selectedDate, 'MMMM do, yyyy')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                  <p className="text-slate-500 font-medium animate-pulse">Consulting Gemini for team updates...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
                  <p className="text-red-700 font-medium">{error}</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-red-200 text-red-700 hover:bg-red-100"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : summary ? (
                <div className="prose prose-slate max-w-none">
                  <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                    <div className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed text-lg">
                      {summary}
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-sm text-slate-400 font-medium">
                    <Sparkles className="h-4 w-4" />
                    Generated by Google Gemini via n8n
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <CalendarIcon className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No summary found</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">
                    The AI summary for this date hasn't been generated yet or no updates were submitted.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
