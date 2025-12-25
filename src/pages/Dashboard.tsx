import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  getUpdatesByDate, 
  getSummaryByTeamAndDate, 
  saveSummary,
  getTodayDate, 
  formatDate 
} from '@/lib/storage';
import { DailyUpdate, TeamSummary } from '@/types';
import { CalendarIcon, LogOut, FileText, Zap, Users, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

function generateMockSummary(updates: DailyUpdate[]): string {
  if (updates.length === 0) {
    return "📭 No updates submitted for this date yet.";
  }

  const highConfidence = updates.filter(u => u.confidence === 'high').length;
  const hasBlockers = updates.filter(u => u.blockers).length;
  
  let summary = `📊 **Team Status Report**\n\n`;
  summary += `✅ **${updates.length} team member(s)** submitted updates today.\n\n`;
  
  if (highConfidence > 0) {
    summary += `🟢 **${highConfidence}** reporting high confidence for tomorrow.\n`;
  }
  
  if (hasBlockers > 0) {
    summary += `⚠️ **${hasBlockers}** reported blockers that may need attention.\n`;
  }
  
  summary += `\n---\n\n**Individual Updates:**\n\n`;
  
  updates.forEach((update, index) => {
    const confidenceEmoji = update.confidence === 'high' ? '🟢' : update.confidence === 'medium' ? '🟡' : '🔴';
    summary += `**${index + 1}. ${update.userName}** ${confidenceEmoji}\n`;
    summary += `> ${update.workDone.substring(0, 100)}${update.workDone.length > 100 ? '...' : ''}\n`;
    if (update.blockers) {
      summary += `> ⚠️ Blocker: ${update.blockers.substring(0, 50)}${update.blockers.length > 50 ? '...' : ''}\n`;
    }
    summary += '\n';
  });

  return summary;
}

export default function Dashboard() {
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [summary, setSummary] = useState<TeamSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
    if (!user) return;

    const dateUpdates = getUpdatesByDate(dateString).filter(
      u => u.teamId === user.teamId
    );
    setUpdates(dateUpdates);

    const existingSummary = getSummaryByTeamAndDate(user.teamId, dateString);
    setSummary(existingSummary || null);
  }, [dateString, user]);

  const handleGenerateSummary = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const generatedSummary = generateMockSummary(updates);
    
    const newSummary: TeamSummary = {
      id: crypto.randomUUID(),
      teamId: user.teamId,
      teamName: user.teamName,
      date: dateString,
      summary: generatedSummary,
      generatedAt: new Date().toISOString(),
    };
    
    saveSummary(newSummary);
    setSummary(newSummary);
    setIsGenerating(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || !isManager) return null;

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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/submit')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Submit Update
            </Button>
            <div className="text-sm text-muted-foreground hidden sm:block">
              {user.name}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Team Dashboard
            </h1>
            <p className="text-muted-foreground">
              {user.teamName}
            </p>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
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

        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Updates
                </CardTitle>
                <CardDescription>
                  {formatDate(dateString)}
                </CardDescription>
              </div>
              <div className="text-2xl font-bold text-primary">
                {updates.length}
              </div>
            </CardHeader>
            <CardContent>
              {updates.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No updates submitted for this date.
                </p>
              ) : (
                <div className="space-y-3">
                  {updates.map((update) => (
                    <div 
                      key={update.id}
                      className="p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">
                          {update.userName}
                        </span>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          update.confidence === 'high' && "bg-success/20 text-success",
                          update.confidence === 'medium' && "bg-warning/20 text-warning",
                          update.confidence === 'low' && "bg-destructive/20 text-destructive"
                        )}>
                          {update.confidence} confidence
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {update.workDone}
                      </p>
                      {update.blockers && (
                        <p className="text-sm text-warning mt-2">
                          ⚠️ {update.blockers}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>AI Summary</CardTitle>
                <CardDescription>
                  Auto-generated team summary
                </CardDescription>
              </div>
              <Button 
                onClick={handleGenerateSummary}
                disabled={isGenerating || updates.length === 0}
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : summary ? (
                  'Regenerate'
                ) : (
                  'Generate Summary'
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {summary ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-foreground bg-transparent p-0 m-0">
                    {summary.summary}
                  </pre>
                  <p className="text-xs text-muted-foreground mt-4">
                    Generated at {new Date(summary.generatedAt).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {updates.length === 0 
                    ? "No updates available to summarize."
                    : "Click 'Generate Summary' to create an AI summary of today's updates."
                  }
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
