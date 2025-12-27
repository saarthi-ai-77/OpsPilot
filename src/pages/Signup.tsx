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
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [teamName, setTeamName] = useState('');
    const [teamId, setTeamId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { user, register } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        if (user) {
            navigate(user.role === 'manager' ? '/dashboard' : '/submit');
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !password.trim()) {
            toast({
                title: 'Information required',
                description: 'Please enter your name, email and password.',
                variant: 'destructive',
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: 'Password too short',
                description: 'Password must be at least 6 characters.',
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
                password,
                name,
                isManager,
                teamName: isManager ? teamName : undefined,
                teamId: !isManager ? teamId : undefined,
            });

            if (result.success) {
                toast({
                    title: 'Account created!',
                    description: isManager ? 'Your team hub is ready.' : 'You have joined the team.',
                });
                // Navigation is handled by useEffect on user state change
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
                        Join your team hub
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Smart daily reporting for high-performance teams.
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
                        <motion.form
                            key="signup-form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                    <Input
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isLoading}
                                        className="h-14 px-5 rounded-2xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Work Email</label>
                                    <Input
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                        className="h-14 px-5 rounded-2xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                                    <Input
                                        type="password"
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
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
                                            <label className="text-sm font-bold text-slate-700 ml-1">Team Name</label>
                                            <Input
                                                placeholder="e.g. Engineering Dept"
                                                value={teamName}
                                                onChange={(e) => setTeamName(e.target.value)}
                                                disabled={isLoading}
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
                                                placeholder="Paste shared verification code"
                                                value={teamId}
                                                onChange={(e) => setTeamId(e.target.value)}
                                                disabled={isLoading}
                                                className="h-14 px-5 rounded-2xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-lg"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-2xl transition-all hover:scale-[1.01] flex items-center justify-center gap-3"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <>
                                        {isManager ? 'Launch My Team' : 'Complete Registration'}
                                        <ArrowRight className="h-6 w-6" />
                                    </>
                                )}
                            </Button>
                        </motion.form>
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
