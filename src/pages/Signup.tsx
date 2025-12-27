import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, ShieldCheck, Users, Briefcase, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Signup() {
    const [isManager, setIsManager] = useState(true);
    const [email, setEmail] = useState('');
    const [teamName, setTeamName] = useState('');
    const [teamId, setTeamId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, isMagicLinkSent } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast({
                title: 'Email required',
                description: 'Please enter your email to get started.',
                variant: 'destructive',
            });
            return;
        }

        if (isManager && !teamName.trim()) {
            toast({
                title: 'Team name required',
                description: 'Please give your team a name.',
                variant: 'destructive',
            });
            return;
        }

        if (!isManager && !teamId.trim()) {
            toast({
                title: 'Team ID required',
                description: 'Ask your manager for the team verification code.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const result = await register({
                email,
                isManager,
                teamName: isManager ? teamName : undefined,
                teamId: !isManager ? teamId : undefined,
            });

            if (result.success) {
                toast({
                    title: isManager ? 'Team Successfully Created!' : 'Successfully Joined Team!',
                    description: 'Welcome to OpsPilot AI.',
                });
                navigate(isManager ? '/dashboard' : '/submit');
            } else {
                toast({
                    title: 'Registration failed',
                    description: result.error || 'Something went wrong.',
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
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[140px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[140px] -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[500px]"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-8 flex justify-center cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <img src="/logo.png" alt="OpsPilot AI Logo" className="h-16 w-auto" />
                    </motion.div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-outfit mb-3">
                        {isMagicLinkSent ? "Link is on the way" : "Build your team hub"}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {isMagicLinkSent
                            ? "Check your email to finish setting up your account"
                            : "Collective intelligence for high-performing teams"}
                    </p>
                </div>

                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setIsManager(true)}
                        className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${isManager ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white/50 border-slate-100 text-slate-500 hover:bg-white hover:border-slate-200'
                            }`}
                    >
                        <Briefcase className={`w-6 h-6 ${isManager ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                        <span className="font-bold text-sm">Create Team</span>
                    </button>
                    <button
                        onClick={() => setIsManager(false)}
                        className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${!isManager ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white/50 border-slate-100 text-slate-500 hover:bg-white hover:border-slate-200'
                            }`}
                    >
                        <Users className={`w-6 h-6 ${!isManager ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                        <span className="font-bold text-sm">Join Team</span>
                    </button>
                </div>

                <motion.div
                    layout
                    className="glass-card rounded-[2.5rem] p-8 md:p-10 premium-shadow relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-1 bg-indigo-600/5 rounded-bl-2xl">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    </div>

                    <AnimatePresence mode="wait">
                        {!isMagicLinkSent ? (
                            <motion.form
                                key="signup-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Team Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-14 px-5 rounded-2xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-lg"
                                    />
                                </div>

                                <AnimatePresence mode="wait">
                                    {isManager ? (
                                        <motion.div
                                            key="manager"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="space-y-2"
                                        >
                                            <label className="text-sm font-bold text-slate-700 ml-1">Company/Team Name</label>
                                            <Input
                                                placeholder="Engineering Dept"
                                                value={teamName}
                                                onChange={(e) => setTeamName(e.target.value)}
                                                className="h-14 px-5 rounded-2xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-lg"
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="member"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="space-y-2"
                                        >
                                            <label className="text-sm font-bold text-slate-700 ml-1">Unique Team ID</label>
                                            <Input
                                                placeholder="Ask your manager for this"
                                                value={teamId}
                                                onChange={(e) => setTeamId(e.target.value)}
                                                className="h-14 px-5 rounded-2xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-lg"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Button
                                    type="submit"
                                    className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-2xl transition-all hover:scale-[1.01] flex items-center justify-center gap-3"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <>
                                            {isManager ? 'Launch My Team' : 'Request Access'}
                                            <ArrowRight className="h-6 w-6" />
                                        </>
                                    )}
                                </Button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="signup-sent"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-6"
                            >
                                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4 font-outfit">Confirm your email</h3>
                                <p className="text-slate-600 font-medium mb-8 leading-relaxed">
                                    We sent a link to <span className="text-indigo-600 font-bold">{email}</span>.
                                    Click it to verify your account and join your team.
                                </p>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-8">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-sm font-bold text-slate-700">Waiting for verification...</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => window.location.reload()}
                                    className="text-indigo-600 hover:bg-indigo-50 font-bold px-6 h-12 rounded-xl"
                                >
                                    Used the wrong email? Start over
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mt-10"
                >
                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Already registered? Back to Sign In
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
