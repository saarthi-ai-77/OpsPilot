import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, CheckCircle, BarChart3, Shield } from 'lucide-react';

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/submit');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">OpsPilot AI</span>
          </div>

          <Button onClick={() => navigate('/login')}>
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      <main>
        <section className="py-20 md:py-32 bg-gradient-to-b from-white to-slate-50">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-8 tracking-tighter">
              Daily Operations,{' '}
              <span className="text-blue-600">Simplified</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              Empower your team with AI-driven daily updates.
              Stay aligned, eliminate blockers, and skip the status meetings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/login')} className="h-14 px-8 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white border-y border-slate-100">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center p-8 rounded-3xl bg-slate-50/50 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Quick Updates
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Submit daily updates in under a minute. No lengthy forms or complex workflows to slow you down.
                </p>
              </div>

              <div className="text-center p-8 rounded-3xl bg-slate-50/50 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  AI Summaries
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Get intelligent team summaries analyzed by Google Gemini that highlight blockers and progress automatically.
                </p>
              </div>

              <div className="text-center p-8 rounded-3xl bg-slate-50/50 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Manager Insights
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Managers get high-level visibility into team health while members stay focused on their work.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
              Ready to streamline your team?
            </h2>
            <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-xl mx-auto opacity-80">
              Join teams using OpsPilot AI to stay synchronized and productive without the overhead.
            </p>
            <Button size="lg" onClick={() => navigate('/login')} className="h-14 px-8 text-lg font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-xl transition-all">
              Launch Application
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-slate-900">OpsPilot AI</span>
          </div>
          <p className="text-slate-400 font-medium">© 2025 OpsPilot AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
