import React, { useState, useRef } from 'react';
import { Anchor, AlertCircle, CheckCircle2, Shield, Clock, Building2, Eye, EyeOff, Ship, ArrowLeft, Mail, KeyRound, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const SUPABASE_URL = 'https://mpopgwvdyfvexeakcvvu.supabase.co';

export function AuthPage() {
    const { signIn, signUp } = useAuth();
    const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // OTP Reset State
    const [resetStep, setResetStep] = useState<'email' | 'otp' | 'newpass'>('email');
    const [resetEmail, setResetEmail] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            if (tab === 'signin') {
                await signIn(email, password);
            } else {
                await signUp(email, password);
                setSuccess('Account created! You can now sign in.');
                setTab('signin');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const res = await fetch(`${SUPABASE_URL}/functions/v1/send-reset-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail.toLowerCase() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send code');
            setResetStep('otp');
            setSuccess('A 6-digit code has been sent to your email.');
        } catch (err: any) {
            setError(err.message || 'Failed to send verification code.');
        } finally {
            setLoading(false);
        }
    };

    // OTP input handling
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // only digits
        const newDigits = [...otpDigits];
        newDigits[index] = value.slice(-1); // take last digit only
        setOtpDigits(newDigits);
        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newDigits = [...otpDigits];
        for (let i = 0; i < pasted.length; i++) {
            newDigits[i] = pasted[i];
        }
        setOtpDigits(newDigits);
        const nextEmpty = newDigits.findIndex(d => !d);
        otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    };

    // Step 2: Verify OTP (move to new password step)
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const otp = otpDigits.join('');
        if (otp.length !== 6) {
            setError('Please enter the complete 6-digit code.');
            return;
        }
        setError('');
        setResetStep('newpass');
    };

    // Step 3: Set new password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const otp = otpDigits.join('');
            const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-reset-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: resetEmail.toLowerCase(),
                    otp,
                    newPassword,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to reset password');

            setSuccess('Password updated successfully! You can now sign in.');
            // Reset all forgot password state
            setResetStep('email');
            setResetEmail('');
            setOtpDigits(['', '', '', '', '', '']);
            setNewPassword('');
            setConfirmPassword('');
            setTab('signin');
        } catch (err: any) {
            setError(err.message || 'Failed to reset password.');
            // If OTP was invalid, go back to OTP step
            if (err.message?.includes('Invalid') || err.message?.includes('expired')) {
                setResetStep('otp');
                setOtpDigits(['', '', '', '', '', '']);
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForgotState = () => {
        setTab('signin');
        setError('');
        setSuccess('');
        setResetEmail('');
        setResetStep('email');
        setOtpDigits(['', '', '', '', '', '']);
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="flex h-screen overflow-hidden font-sans">
            {/* Left Panel — Brand */}
            <div className="hidden lg:flex w-1/2 bg-abs-navy flex-col justify-between p-12 relative overflow-hidden">
                {/* Watermark Ship Silhouette */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
                    <Ship className="w-[650px] h-[650px] text-white drop-shadow-2xl" strokeWidth={1} />
                </div>

                {/* Logo */}
                <div className="flex items-center space-x-3 relative z-10">
                    <div className="p-2.5 bg-abs-red rounded-xl">
                        <Anchor className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-widest text-white">DOCTRACK</h1>
                    </div>
                </div>

                {/* Tagline + features */}
                <div className="relative z-10 max-w-lg">
                    <h2 className="text-5xl font-black text-white leading-tight tracking-tight mb-6">
                        Employee{' '}
                        <span style={{ whiteSpace: 'nowrap' }}>Intelligence&nbsp;&amp;</span>
                        <br />
                        <span className="text-abs-red">Document Tracking</span>
                    </h2>
                    <p className="text-blue-100/70 text-lg leading-relaxed mb-10">
                        The enterprise standard for tracking internal office compliance and employee lifecycle documentation.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        {[
                            { icon: <Clock className="w-4 h-4" />, text: 'Real-time expiry alerts & notifications' },
                            { icon: <Shield className="w-4 h-4" />, text: 'Role-based access control' },
                            { icon: <Building2 className="w-4 h-4" />, text: 'Multi-office document management' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center space-x-2 text-white/90 text-sm border border-white/15 rounded-full px-5 py-2.5 bg-white/5 backdrop-blur-lg">
                                <span className="text-abs-red">{f.icon}</span>
                                <span className="font-medium">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10">
                    <p className="text-[10px] text-abs-red uppercase tracking-widest">
                        Authorized Personnel Only • @eagle.org
                    </p>
                    <p className="text-[10px] text-abs-red mt-1">
                        © {new Date().getFullYear()} Mohamed Naguib. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 bg-slate-50 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="flex items-center space-x-3 mb-8 lg:hidden">
                        <div className="p-2 bg-abs-navy rounded-xl">
                            <Anchor className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-widest text-abs-navy">DOCTRACK</span>
                    </div>

                    {/* ===== SIGN IN / SIGN UP ===== */}
                    {tab !== 'forgot' && (
                        <>
                            <h2 className="text-2xl font-black text-slate-800 mb-1">
                                {tab === 'signin' ? 'Welcome back' : 'Create account'}
                            </h2>
                            <p className="text-sm text-slate-500 mb-8">
                                {tab === 'signin' ? 'Sign in to your account to continue.' : 'New accounts require an @eagle.org email.'}
                            </p>

                            {/* Tab switcher */}
                            <div className="flex bg-white border border-slate-200 rounded-xl p-1 mb-6 shadow-sm">
                                <button
                                    onClick={() => { setTab('signin'); setError(''); setSuccess(''); }}
                                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${tab === 'signin'
                                        ? 'bg-abs-navy text-white shadow-md'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => { setTab('signup'); setError(''); setSuccess(''); }}
                                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${tab === 'signup'
                                        ? 'bg-abs-navy text-white shadow-md'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Sign Up
                                </button>
                            </div>

                            {/* Alerts */}
                            {error && (
                                <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-5">
                                    <AlertCircle className="w-4 h-4 text-abs-red shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            )}
                            {success && (
                                <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-100 rounded-xl mb-5">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-green-700 font-medium">{success}</p>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Work Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@eagle.org"
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-abs-navy focus:ring-4 focus:ring-abs-navy/10 transition-all shadow-sm text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder={tab === 'signin' ? '••••••••' : 'Min. 6 characters'}
                                            required
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-11 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-abs-navy focus:ring-4 focus:ring-abs-navy/10 transition-all shadow-sm text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(p => !p)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {tab === 'signin' && (
                                    <div className="flex justify-end -mt-1">
                                        <button
                                            type="button"
                                            onClick={() => { setTab('forgot'); setError(''); setSuccess(''); }}
                                            className="text-xs font-semibold text-abs-navy hover:text-abs-red transition-colors"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-abs-red text-white font-bold rounded-xl hover:bg-abs-red/90 transition-all shadow-lg shadow-abs-red/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm tracking-wide"
                                >
                                    {loading
                                        ? (tab === 'signin' ? 'Signing in...' : 'Creating account...')
                                        : (tab === 'signin' ? 'Sign In' : 'Create Account')
                                    }
                                </button>
                            </form>


                        </>
                    )}

                    {/* ===== FORGOT PASSWORD (OTP FLOW) ===== */}
                    {tab === 'forgot' && (
                        <div>
                            <button
                                onClick={resetForgotState}
                                className="flex items-center space-x-1 text-sm text-abs-navy hover:text-abs-red transition-colors mb-6 font-semibold"
                            >
                                <ArrowLeft size={14} />
                                <span>Back to Sign In</span>
                            </button>

                            {/* Step indicators */}
                            <div className="flex items-center gap-2 mb-6">
                                {['Email', 'Verify', 'New Password'].map((label, i) => {
                                    const stepIndex = i;
                                    const currentIndex = resetStep === 'email' ? 0 : resetStep === 'otp' ? 1 : 2;
                                    const isActive = stepIndex === currentIndex;
                                    const isDone = stepIndex < currentIndex;
                                    return (
                                        <div key={label} className="flex items-center gap-2">
                                            {i > 0 && <div className={`w-6 h-px ${isDone ? 'bg-green-400' : 'bg-slate-200'}`} />}
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isActive ? 'bg-abs-navy text-white' :
                                                isDone ? 'bg-green-50 text-green-700 border border-green-200' :
                                                    'bg-slate-100 text-slate-400'
                                                }`}>
                                                {isDone && <CheckCircle2 size={12} />}
                                                <span>{label}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Alerts */}
                            {error && (
                                <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-5">
                                    <AlertCircle className="w-4 h-4 text-abs-red shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            )}
                            {success && (
                                <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-100 rounded-xl mb-5">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-green-700 font-medium">{success}</p>
                                </div>
                            )}

                            {/* Step 1: Email */}
                            {resetStep === 'email' && (
                                <>
                                    <h2 className="text-2xl font-black text-slate-800 mb-1">Reset Password</h2>
                                    <p className="text-sm text-slate-500 mb-6">
                                        Enter your email and we'll send you a 6-digit verification code.
                                    </p>
                                    <form onSubmit={handleSendOtp} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                Work Email
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={resetEmail}
                                                    onChange={e => setResetEmail(e.target.value)}
                                                    placeholder="you@eagle.org"
                                                    required
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pl-11 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-abs-navy focus:ring-4 focus:ring-abs-navy/10 transition-all shadow-sm text-sm"
                                                />
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 bg-abs-navy text-white font-bold rounded-xl hover:bg-abs-navy/90 transition-all shadow-lg shadow-abs-navy/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide"
                                        >
                                            {loading ? 'Sending code...' : 'Send Verification Code'}
                                        </button>
                                    </form>
                                </>
                            )}

                            {/* Step 2: OTP Entry */}
                            {resetStep === 'otp' && (
                                <>
                                    <h2 className="text-2xl font-black text-slate-800 mb-1">Enter Code</h2>
                                    <p className="text-sm text-slate-500 mb-6">
                                        We sent a 6-digit code to <strong className="text-slate-700">{resetEmail}</strong>
                                    </p>
                                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                                        <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                                            {otpDigits.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    ref={el => { otpRefs.current[i] = el; }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={e => handleOtpChange(i, e.target.value)}
                                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                                    className="w-12 h-14 text-center text-xl font-black bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-abs-navy focus:ring-4 focus:ring-abs-navy/10 transition-all shadow-sm"
                                                />
                                            ))}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={otpDigits.some(d => !d)}
                                            className="w-full py-3 bg-abs-navy text-white font-bold rounded-xl hover:bg-abs-navy/90 transition-all shadow-lg shadow-abs-navy/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide"
                                        >
                                            Verify Code
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setResetStep('email'); setOtpDigits(['', '', '', '', '', '']); setError(''); setSuccess(''); }}
                                            className="w-full text-center text-xs text-slate-500 hover:text-abs-navy transition-colors font-semibold"
                                        >
                                            Didn't receive it? Go back to resend
                                        </button>
                                    </form>
                                </>
                            )}

                            {/* Step 3: New Password */}
                            {resetStep === 'newpass' && (
                                <>
                                    <h2 className="text-2xl font-black text-slate-800 mb-1">Set New Password</h2>
                                    <p className="text-sm text-slate-500 mb-6">
                                        Choose a strong password for your account.
                                    </p>
                                    <form onSubmit={handleResetPassword} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={e => setNewPassword(e.target.value)}
                                                    placeholder="Min. 6 characters"
                                                    required
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pl-11 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-abs-navy focus:ring-4 focus:ring-abs-navy/10 transition-all shadow-sm text-sm"
                                                />
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={e => setConfirmPassword(e.target.value)}
                                                    placeholder="Re-enter password"
                                                    required
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pl-11 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-abs-navy focus:ring-4 focus:ring-abs-navy/10 transition-all shadow-sm text-sm"
                                                />
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 bg-abs-red text-white font-bold rounded-xl hover:bg-abs-red/90 transition-all shadow-lg shadow-abs-red/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide"
                                        >
                                            {loading ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
