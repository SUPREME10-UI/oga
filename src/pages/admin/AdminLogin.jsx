import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle, Hammer, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' or 'reset'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (mode === 'reset') {
            try {
                await sendPasswordResetEmail(auth, email);
                setSuccess('Reset link sent! Please check your email inbox.');
                setLoading(false);
            } catch (err) {
                console.error('Reset error:', err);
                setError('Failed to send reset link. Please check the email address.');
                setLoading(false);
            }
            return;
        }

        try {
            // Sign in with Firebase
            const credential = await signInWithEmailAndPassword(auth, email, password);

            // Fetch the user doc from Firestore to check their role
            const userDoc = await getDoc(doc(db, 'users', credential.user.uid));

            if (!userDoc.exists() || userDoc.data().type !== 'admin') {
                // Not an admin — sign them back out and show error
                await auth.signOut();
                setError('Access denied. This portal is for authorized administrators only.');
                setLoading(false);
                return;
            }

            // Admin confirmed — redirect to admin dashboard
            navigate('/dashboard/admin', { replace: true });

        } catch (err) {
            console.error('Admin login error:', err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Invalid credentials. Please check your email and password.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please try again later.');
            } else {
                setError('An error occurred. Please try again.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background glow effects - matching client theme */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-secondary/30 blur-[100px]" />
            </div>

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="relative w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl border border-border mb-5 mx-auto">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Hammer className="w-5 h-5 text-primary" />
                        <span className="font-serif font-bold text-xl text-foreground">OgaHub</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        {mode === 'login' ? 'Administration Portal' : 'Reset Admin Password'}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-2">
                        {mode === 'login' ? 'Authorized personnel only' : 'Enter your email to receive a reset link'}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white border border-border rounded-2xl p-8 shadow-2xl relative z-10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Feedback messages */}
                        {error && (
                            <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-destructive text-sm">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-600 text-sm">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{success}</span>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Admin Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="admin@ogahub.com"
                                    className="w-full bg-secondary/20 border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary/60 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {/* Password (only in login mode) */}
                        {mode === 'login' && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Admin Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••••••"
                                        className="w-full bg-secondary/20 border border-border rounded-xl pl-10 pr-12 py-3 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary/60 focus:bg-white transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="flex justify-end px-1">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setMode('reset');
                                            setError('');
                                            setSuccess('');
                                        }}
                                        className="text-xs font-semibold text-primary hover:underline"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 craft-gradient hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/25"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {mode === 'login' ? 'Verifying...' : 'Sending link...'}
                                </>
                            ) : (
                                <>
                                    {mode === 'login' ? <Shield className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                                    {mode === 'login' ? 'Access Dashboard' : 'Send Reset Link'}
                                </>
                            )}
                        </button>

                        {/* Back to Login */}
                        {mode === 'reset' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('login');
                                    setError('');
                                    setSuccess('');
                                }}
                                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </button>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-muted-foreground text-xs mt-6">
                    OgaHub &copy; {new Date().getFullYear()} — Admin Portal
                </p>
            </div>
        </div>
    );
}
