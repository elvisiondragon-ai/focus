import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Eye, EyeOff, Sparkles, Zap, MessageCircle } from "lucide-react";
import { iOSCacheCleaner } from "@/utils/iOSCacheCleaner";

export function Auth() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();

    const redirectPath = new URLSearchParams(window.location.search).get('redirect') || '/';

    // Form states
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ email: '', password: '', confirmPassword: '', displayName: '' });
    const [forgotPasswordData, setForgotPasswordData] = useState({ email: '' });

    const [currentView, setCurrentView] = useState<'auth' | 'forgot-password' | 'reset-sent' | 'signup-success'>('auth');
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [showTroubleshoot, setShowTroubleshoot] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            await iOSCacheCleaner.verifyCleanState();
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                navigate(redirectPath);
            }
        };
        checkUser();
    }, [navigate, redirectPath]);

    const cleanupAuthState = () => {
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
                localStorage.removeItem(key);
            }
        });
    };

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        try {
            cleanupAuthState();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}${redirectPath}`,
                    queryParams: { access_type: 'offline', prompt: 'select_account' }
                }
            });
            if (error) throw error;
            toast({ title: "Redirecting to Google...", description: "Please wait." });
        } catch (error: any) {
            toast({ title: "Google Auth Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const email = forgotPasswordData.email.trim().toLowerCase();
            const { error } = await supabase.functions.invoke('send-reset-password-email', {
                body: { email, redirectTo: `https://app.elvisiongroup.com/reset-password?return=${window.location.origin}` }
            });
            if (error) throw error;
            toast({ title: "Reset Email Sent!", description: "Check your inbox." });
            setCurrentView('reset-sent');
        } catch (error: any) {
            toast({ title: "Reset Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const enhancedHandleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await iOSCacheCleaner.quickLoginCacheClear();
            const email = loginData.email.trim().toLowerCase();
            const { data, error } = await supabase.auth.signInWithPassword({ email, password: loginData.password });

            if (error) {
                if (error.message.includes('Invalid') || error.message.includes('incorrect')) {
                    const result = await iOSCacheCleaner.clearAllCaches();
                    if (result.success && result.isIOS) {
                        toast({ title: "Clearing Cache", description: "Retrying..." });
                        await new Promise(r => setTimeout(r, 1000));
                        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({ email, password: loginData.password });
                        if (retryError) throw retryError;
                        if (retryData.user) Object.assign(data, retryData);
                    } else throw error;
                } else throw error;
            }

            if (data.user) {
                localStorage.setItem('login-success-pending', 'true');
                navigate(redirectPath);
            }
        } catch (error: any) {
            toast({ title: "Login Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const enhancedHandleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (signupData.password !== signupData.confirmPassword) {
            toast({ title: "Password Mismatch", description: "Passwords must be identical.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            cleanupAuthState();
            const email = signupData.email.trim().toLowerCase();
            const { data, error } = await supabase.auth.signUp({
                email,
                password: signupData.password,
                options: { data: { display_name: signupData.displayName } }
            });

            if (error) {
                if (error.message.toLowerCase().includes('already registered')) {
                    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password: signupData.password });
                    if (loginError) {
                        if (loginError.message.toLowerCase().includes('invalid login credentials')) {
                            throw new Error("Akun ini sudah terdaftar. Silakan gunakan password yang benar.");
                        }
                        throw loginError;
                    }
                    if (loginData.user) {
                        localStorage.setItem('login-success-pending', 'true');
                        navigate(redirectPath);
                        return;
                    }
                }
                throw error;
            }

            if (data.user) {
                toast({ title: "Signup Success!", description: "Welcome to Focus!" });
                navigate(redirectPath);
            }
        } catch (error: any) {
            toast({ title: "Signup Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    if (currentView === 'forgot-password') {
        return (
            <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center p-4 text-white">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Zap className="w-12 h-12 mx-auto text-blue-500 mb-2" />
                        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">eL Focus</h1>
                    </div>
                    <Card className="p-6 bg-gradient-secondary border-border">
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="forgot-email">Email</Label>
                                <Input id="forgot-email" type="email" placeholder="your@email.com" value={forgotPasswordData.email} onChange={(e: any) => setForgotPasswordData(p => ({ ...p, email: e.target.value }))} className="cyber-input" required />
                            </div>
                            <Button type="submit" className="w-full bg-gradient-primary text-white" disabled={isLoading}>
                                {isLoading ? "Sending..." : "Reset Email"}
                            </Button>
                        </form>
                        <Button onClick={() => setCurrentView('auth')} variant="ghost" className="w-full mt-4">Back to Login</Button>
                    </Card>
                </div>
            </div>
        );
    }

    if (currentView === 'reset-sent') {
        return (
            <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center p-4 text-white">
                <Card className="w-full max-w-md p-6 bg-gradient-secondary text-center">
                    <Mail className="h-12 w-12 mx-auto text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Check Email</h3>
                    <p className="text-muted-foreground mb-6">Reset instructions sent.</p>
                    <Button onClick={() => setCurrentView('auth')} className="w-full bg-gradient-primary">Back to Login</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center p-4 text-white">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Zap className="w-16 h-16 mx-auto text-blue-500 mb-2 glow-primary rounded-full p-2" />
                    <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">eL Focus</h1>
                    <p className="text-muted-foreground mt-2">The Neuro-Protocol for Deep Focus</p>
                </div>

                <Card className="p-6 bg-gradient-secondary border-border shadow-2xl">
                    <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 p-1 rounded-lg">
                            <TabsTrigger value="login" className={`font-bold transition-all ${activeTab === 'login' ? 'bg-blue-600 shadow-lg' : ''}`}>Login</TabsTrigger>
                            <TabsTrigger value="signup" className={`font-bold transition-all ${activeTab === 'signup' ? 'bg-purple-600 shadow-lg' : ''}`}>Daftar</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login" className="space-y-4">
                            <form onSubmit={enhancedHandleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input type="email" placeholder="email@example.com" value={loginData.email} onChange={(e: any) => setLoginData(p => ({ ...p, email: e.target.value }))} className="pl-10 cyber-input" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={loginData.password} onChange={(e: any) => setLoginData(p => ({ ...p, password: e.target.value }))} className="pl-10 pr-10 cyber-input" required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground">
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-gradient-primary h-11 transform hover:scale-105 transition-all" disabled={isLoading}>
                                    {isLoading ? "Login..." : "Login"} <Zap className="ml-2 h-4 w-4" />
                                </Button>
                            </form>
                            <div className="text-center text-sm">
                                <button onClick={() => setCurrentView('forgot-password')} className="text-blue-400 hover:underline">Lupa Password?</button>
                                <span className="mx-2 text-muted-foreground">•</span>
                                <button onClick={() => setShowTroubleshoot(!showTroubleshoot)} className="text-blue-400 hover:underline">Ada Masalah?</button>
                                {showTroubleshoot && (
                                    <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                                        <Button onClick={() => iOSCacheCleaner.forceCleanReload()} className="w-full text-xs bg-blue-600">🧹 Hapus Cache & Reload</Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="signup" className="space-y-4">
                            <form onSubmit={enhancedHandleSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nama Display</Label>
                                    <Input placeholder="Nama Anda" value={signupData.displayName} onChange={(e: any) => setSignupData(p => ({ ...p, displayName: e.target.value }))} className="cyber-input" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input type="email" placeholder="email@example.com" value={signupData.email} onChange={(e: any) => setSignupData(p => ({ ...p, email: e.target.value }))} className="cyber-input" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <Input type="password" placeholder="••••••••" value={signupData.password} onChange={(e: any) => setSignupData(p => ({ ...p, password: e.target.value }))} className="cyber-input" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Konfirmasi Password</Label>
                                    <Input type="password" placeholder="••••••••" value={signupData.confirmPassword} onChange={(e: any) => setSignupData(p => ({ ...p, confirmPassword: e.target.value }))} className="cyber-input" required />
                                </div>
                                <Button type="submit" className="w-full bg-purple-600 h-11 transform hover:scale-105 transition-all" disabled={isLoading}>
                                    {isLoading ? "Daftar..." : "Buat Akun"} <Sparkles className="ml-2 h-4 w-4" />
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1A1A2E] px-2 text-muted-foreground">Atau Login Dengan</span></div>
                    </div>

                    <Button onClick={handleGoogleAuth} variant="outline" className="w-full border-white/10 hover:bg-white/5" disabled={isLoading}>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Google
                    </Button>
                </Card>

                <div className="text-center mt-6">
                    <Button variant="outline" onClick={() => window.open(`https://wa.me/62895325633487?text=${encodeURIComponent("Halo Help eL Focus..")}`, '_blank')} className="w-full bg-white/5 border-white/10">
                        <MessageCircle className="w-4 h-4 mr-2" /> Tanya CS Focus
                    </Button>
                </div>
            </div>
        </div>
    );
}
