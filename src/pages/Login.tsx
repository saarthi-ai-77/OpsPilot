import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Variants, motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, login, isMagicLinkSent } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'manager' ? '/dashboard' : '/submit');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email);

      if (result.success) {
        toast({
          title: 'Welcome back!',
          description: 'Access granted to OpsPilot dashboard.',
        });
        navigate('/submit');
      } else {
        toast({
          title: 'Access Denied',
          description: result.error || 'User not found in team database.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[440px]"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6 flex justify-center"
            onClick={() => navigate('/')}
          >
            <img src="/logo.png" alt="OpsPilot AI Logo" className="h-20 w-auto cursor-pointer" />
          </motion.div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-outfit mb-2">
            {isMagicLinkSent ? "Check your inbox" : "Welcome back"}
          </h1>
          <p className="text-slate-500 font-medium">
            {isMagicLinkSent
              ? `We sent a magic link to ${email}`
              : "Sign in to manage your daily operations"}
          </p>
        </div>

        <motion.div
          layout
          className="glass-card rounded-[2rem] p-8 md:p-10 premium-shadow relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-1 bg-indigo-600/5 rounded-bl-2xl">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>

          <AnimatePresence mode="wait">
            {!isMagicLinkSent ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-2.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2"
                  >
                    Team Email Address
                  </label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-14 px-5 rounded-2xl border-slate-200 bg-white/50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 rounded-2xl border-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Verifying...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="submit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        Send Magic Link
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="email-sent"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <ShieldCheck className="w-8 h-8" />
                  </motion.div>
                </div>
                <p className="text-slate-600 font-medium mb-6">
                  Click the link in the email to sign in instantly. You can close this tab now.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="rounded-xl border-slate-200"
                >
                  Didn't get the email? Try again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 space-y-4"
        >
          <p className="text-slate-500 font-bold flex items-center justify-center gap-2">
            First time here?
            <Link to="/signup" className="text-indigo-600 hover:underline decoration-2 underline-offset-4">
              Create an account
            </Link>
          </p>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
            Secured by OpsPilot Auth Systems
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
