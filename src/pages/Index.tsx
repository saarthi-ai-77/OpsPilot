import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, BarChart3, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/submit');
    }
  }, [user, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" as any }
    }
  };

  return (
    <div className="min-h-screen gradient-bg selection:bg-indigo-100 selection:text-indigo-900">
      <header className="sticky top-0 z-50 glass-card border-b border-slate-200/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src="/logo.png" alt="OpsPilot AI Logo" className="h-10 w-auto" />
            <span className="font-bold text-xl tracking-tight text-slate-900 font-outfit hidden">OpsPilot AI</span>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="font-semibold hover:bg-slate-100 text-slate-600 px-6 rounded-full"
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 left-10 w-96 h-96 bg-indigo-100/50 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -5, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-10 right-10 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px]"
            />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="container mx-auto px-4 text-center relative z-10"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold mb-8 mx-auto">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Google Gemini 1.5 Pro</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-tight font-outfit">
              Daily Ops, <br />
              <span className="gradient-text">Masterfully Simple.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
              Ditch the status meetings. OpsPilot collects daily updates from your team and uses AI to generate intelligent summaries that keep everyone in sync.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="h-16 px-10 text-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all rounded-2xl group"
              >
                Get Started for Free
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 font-outfit tracking-tight">Built for modern engineering teams</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <CheckCircle className="h-8 w-8 text-indigo-600" />,
                  title: "Rapid Updates",
                  description: "Custom-tailored forms that take less than 60 seconds to complete. No more status report dread.",
                  color: "bg-indigo-50"
                },
                {
                  icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
                  title: "Gemini Insights",
                  description: "Intelligent summarization that highlights blockers, achievements, and team sentiment automatically.",
                  color: "bg-blue-50"
                },
                {
                  icon: <Shield className="h-8 w-8 text-violet-600" />,
                  title: "Management OS",
                  description: "A bird's-eye view of your entire team's velocity and challenges on a single, clean dashboard.",
                  color: "bg-violet-50"
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group hover:bg-white hover:premium-shadow"
                >
                  <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-8 transition-transform group-hover:scale-110`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 font-outfit uppercase tracking-wide text-sm outline-none">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden bg-slate-900">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/20 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter font-outfit">
                Ready to transform team <br /> alignment forever?
              </h2>
              <p className="text-indigo-100/70 text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                Join high-performing teams who've already ditched status updates for OpsPilot AI.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="h-16 px-12 text-xl font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-2xl transition-all rounded-2xl group"
              >
                Launch OpsPilot Now
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="OpsPilot AI Logo" className="h-10 w-auto" />
            </div>
            <div className="text-slate-400 font-medium text-center">
              © 2025 OpsPilot AI. Built for the future of work.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
