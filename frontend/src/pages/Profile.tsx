import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Mail, Shield, Calendar, CreditCard, ArrowUpCircle, ArrowDownCircle, Info, CheckCircle2, LayoutGrid, FileText, Download, Database, Sparkles, Building2, Globe, Phone, Briefcase } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const Profile = () => {
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/signin');
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </main>
                <Footer />
            </div>
        );
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const PLAN_PRICES: Record<string, number> = {
        'Free Demo': 0,
        'Pro': 19,
        'Enterprise': 49
    };

    const isDowngradeScheduled = !!user.scheduledPlan;
    const currentPlan = user.activePlan || 'Free Demo';
    const nextPlan = user.scheduledPlan || currentPlan;
    const nextBillingAmount = PLAN_PRICES[nextPlan] || 0;

    return (
        <div className="min-h-screen flex flex-col cosmic-site-unified relative">
            {/* Background elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="bright-star" style={{ top: '15%', left: '10%', animationDelay: '0s' }}></div>
                <div className="bright-star" style={{ top: '40%', left: '85%', animationDelay: '1.5s' }}></div>
                <div className="bright-star" style={{ top: '70%', left: '20%', animationDelay: '2.5s' }}></div>
            </div>

            <Header />
            <main className="flex-1 py-16 lg:py-24 relative z-10">
                <div className="container max-w-[1300px] mx-auto space-y-12">
                    {/* Page Header */}
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight text-white/90">My Profile</h1>
                        <p className="text-lg text-slate-400 font-medium">Manage your subscription and billing preferences.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-stretch">
                        {/* Box 1: Account & Profile Card */}
                        <div className="group bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col h-full min-h-[420px]">
                            <div className="h-16 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 shrink-0"></div>
                            <div className="p-10 space-y-8 flex-1 flex flex-col">
                                <div className="flex items-center gap-5">
                                    <div className="h-16 w-16 bg-slate-950 rounded-lg flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-slate-200 shrink-0 ring-4 ring-white -mt-20">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="text-left -mt-10">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{user.name}</h2>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-bold">
                                            <Mail className="h-3.5 w-3.5" />
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 px-5 py-2 rounded text-[10px] font-black uppercase tracking-widest shadow-sm mb-4">
                                        {user.role ? user.role.toUpperCase() : 'Standard Account'}
                                    </Badge>

                                    <div className="space-y-3 pt-2">
                                        {user.role === 'organizer' ? (
                                            <>
                                                <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                                                    <Building2 className="h-4 w-4" />
                                                    {user.organizationName || 'No Organization'}
                                                </div>
                                                {user.organizationType && (
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-6">
                                                        {user.organizationType}
                                                    </div>
                                                )}
                                                {user.website && (
                                                    <div className="flex items-center gap-2 text-sm text-primary font-bold ml-6">
                                                        <Globe className="h-3.5 w-3.5" />
                                                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[150px]">
                                                            {user.website.replace(/^https?:\/\//, '')}
                                                        </a>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                                                    <Briefcase className="h-4 w-4" />
                                                    {user.profession || 'Participant'}
                                                </div>
                                                {user.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                                                        <Phone className="h-4 w-4" />
                                                        {user.phone}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-auto pt-8 space-y-4 text-left border-t border-slate-50">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3 px-1">Usage Statistics</p>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 px-2 py-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                                <Database className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Saved Templates</p>
                                                <p className="text-xl font-black text-slate-900 leading-none mt-0.5">{(user as any).usageStats?.certificatesCreated || 0}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 px-2 py-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                                <Download className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Monthly Downloads</p>
                                                <p className="text-xl font-black text-slate-900 leading-none mt-0.5">
                                                    {(user as any).usageStats?.downloadsUsed || 0}<span className="text-sm text-slate-400 font-bold"> / {(user as any).usageStats?.downloadLimit === Infinity ? '∞' : (user as any).usageStats?.downloadLimit || 0}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 px-2 py-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                                <Sparkles className="h-5 w-5 text-amber-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Suggestion</p>
                                                <Link to="/pricing" className="text-xs font-bold text-slate-700 hover:text-primary transition-colors leading-relaxed block mt-1">
                                                    {currentPlan === 'Free Demo'
                                                        ? '✨ Upgrade to Pro for more downloads'
                                                        : currentPlan === 'Pro'
                                                            ? '🚀 Try Enterprise for unlimited certificates'
                                                            : '🎉 You have unlimited access!'}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Box 2: Subscription Details Card */}
                        <div className="group bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden h-full min-h-[420px]">
                            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white overflow-hidden relative">
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="p-2.5 bg-primary/10 rounded shadow-inner">
                                        <CreditCard className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Plan</h3>
                                </div>
                                <Badge className={`relative z-10 px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest border-none shadow-md ${currentPlan === 'Free Demo' ? 'bg-slate-500 text-white' : 'bg-green-600 text-white'}`}>
                                    {currentPlan === 'Free Demo' ? 'Free' : 'Active'}
                                </Badge>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            </div>
                            <div className="p-10 space-y-10 flex-1 flex flex-col">
                                <div className="space-y-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Premium Tier</p>
                                        <p className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">{currentPlan}</p>
                                        <p className="text-sm font-bold text-primary">${PLAN_PRICES[currentPlan]}/month</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Health Status</p>
                                        <div className="flex items-center gap-2">
                                            {isDowngradeScheduled ? (
                                                <div className="flex flex-col">
                                                    <span className="text-base font-black text-orange-600 flex items-center gap-1.5 leading-none">
                                                        <ArrowDownCircle className="h-5 w-5" /> Pending Change
                                                    </span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">To {user.scheduledPlan} on {formatDate(user.billingCycleEnd)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-lg font-black text-green-600 flex items-center gap-2">
                                                    <CheckCircle2 className="h-5 w-5" /> All Good
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-8">
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Renewal</p>
                                            <p className="text-sm font-black text-slate-800">{currentPlan === 'Free Demo' ? 'N/A' : formatDate(user.billingCycleEnd)}</p>
                                        </div>
                                        {currentPlan !== 'Free Demo' && (
                                            <div className="space-y-1 border-l border-slate-100 pl-4">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Next Due</p>
                                                <p className="text-sm font-black text-slate-900">${nextBillingAmount}</p>
                                            </div>
                                        )}
                                    </div>
                                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded h-14 font-black tracking-tight shadow-lg shadow-slate-200 transition-all hover:shadow-xl active:scale-[0.98]" asChild>
                                        <Link to="/pricing">Change My Plan</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Box 3: Billing Policy Card */}
                        <div className="group bg-slate-950 rounded-lg p-10 text-white shadow-2xl relative overflow-hidden flex flex-col border border-white/5 h-full min-h-[420px]">
                            <div className="absolute -top-10 -right-10 opacity-[0.08] transition-transform duration-700 group-hover:scale-110">
                                <Info className="h-72 w-72 text-white" />
                            </div>
                            <div className="relative z-10 space-y-10 flex-1">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-primary/20 rounded border border-primary/30 shadow-lg">
                                        <Shield className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight text-white uppercase">Transparency</h3>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex gap-6">
                                        <div className="mt-1 h-10 w-10 rounded bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-lg group-hover:bg-primary/20 transition-colors">
                                            <ArrowUpCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className="font-black text-[10px] uppercase tracking-widest text-blue-400">Instant Upgrades</span>
                                            <p className="text-sm text-slate-300 leading-relaxed font-bold">
                                                Pay only for the remaining days. Benefits apply instantly.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="mt-1 h-10 w-10 rounded bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-lg group-hover:bg-primary/20 transition-colors">
                                            <ArrowDownCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className="font-black text-[10px] uppercase tracking-widest text-blue-400">Fair Downgrades</span>
                                            <p className="text-sm text-slate-300 leading-relaxed font-bold">
                                                Stay on your plan until month-end. No lost progress.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="mt-1 h-10 w-10 rounded bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-lg group-hover:bg-primary/20 transition-colors">
                                            <Info className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className="font-black text-[10px] uppercase tracking-widest text-blue-400">Refund Guarantee</span>
                                            <p className="text-sm text-slate-300 leading-relaxed font-bold">
                                                Available for <span className="text-white">Pro Only</span> (within 7 days & ≤ 5 exports).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 pt-8 mt-auto border-t border-white/10">
                                <p className="text-[11px] text-slate-200 font-bold leading-relaxed px-2">
                                    * Pro-rated adjustments ensure you only pay for what you actually use.
                                </p>
                            </div>
                        </div>

                        {/* Recent Activity Feed (Full Width) */}
                        <div className="lg:col-span-3 space-y-12 mt-10">
                            {isDowngradeScheduled && (
                                <div className="bg-orange-50/50 border border-orange-200 rounded-lg p-10 flex gap-8 transition-all hover:bg-orange-50 animate-in slide-in-from-top-4 shadow-sm">
                                    <div className="h-14 w-14 bg-orange-100 rounded flex items-center justify-center text-orange-600 shrink-0 shadow-sm">
                                        <ArrowDownCircle className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-lg font-black text-orange-900 uppercase tracking-tight">Scheduled Plan Change</p>
                                        <p className="text-base text-orange-800/80 leading-relaxed font-bold">
                                            Current: <strong>{currentPlan}</strong>. Will switch to <strong>{user.scheduledPlan}</strong> on {formatDate(user.billingCycleEnd)}.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-lg">
                                <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white relative overflow-hidden">
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="p-2.5 bg-slate-50 rounded shadow-inner">
                                            <Calendar className="h-6 w-6 text-slate-600" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Purchase History</h3>
                                    </div>
                                    <div className="absolute right-0 top-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
                                </div>
                                <div className="p-4">
                                    {(user as any).purchases && (user as any).purchases.length > 0 ? (
                                        <div className="space-y-2">
                                            {(user as any).purchases.map((item: any, idx: number) => (
                                                <div key={item._id || idx} className="flex items-center gap-10 p-10 transition-all hover:bg-slate-50/80 group rounded-lg">
                                                    <div className={`h-16 w-16 rounded flex items-center justify-center shrink-0 shadow-sm border transition-all group-hover:scale-110 ${item.amount > 0 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                                        }`}>
                                                        {item.amount > 0 ? <CheckCircle2 className="h-8 w-8" /> : <Info className="h-8 w-8 opacity-60" />}
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <p className="text-lg font-black text-slate-900 tracking-tight">
                                                            {item.description || (item.amount > 0 ? 'Monthly Subscription' : 'Plan Limit Adjustment')}
                                                        </p>
                                                        <div className="flex items-center gap-3 text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                                                            <span className="bg-slate-100 px-2 py-0.5 rounded-sm">{formatDate(item.createdAt || item.date)}</span>
                                                            <span className="opacity-20">•</span>
                                                            <span>Transaction: {item._id?.slice(-8).toUpperCase() || 'TX-DEMO-99'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-2xl font-black tracking-tighter ${item.amount > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                                                            {item.amount > 0 ? `$${item.amount.toFixed(2)}` : '--'}
                                                        </p>
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40">Total Charged</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-20 text-center space-y-4">
                                            <div className="h-20 w-20 bg-slate-50 rounded flex items-center justify-center mx-auto shadow-inner text-slate-200">
                                                <Info className="h-10 w-10" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-lg font-black text-slate-400 uppercase tracking-tight">No Transactions</p>
                                                <p className="text-sm font-bold text-muted-foreground/60">Your recent activity will appear here.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pricing Summary Table Section (Full Width) */}
                        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-lg">
                            <div className="p-10 border-b border-slate-50 flex items-center gap-4 bg-white relative">
                                <div className="p-2.5 bg-primary/5 rounded shadow-inner">
                                    <LayoutGrid className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tier Comparison</h3>
                            </div>
                            <div className="overflow-x-auto p-4">
                                <Table className="border-separate border-spacing-y-2">
                                    <TableHeader>
                                        <TableRow className="bg-transparent hover:bg-transparent border-none">
                                            <TableHead className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Select Tier</TableHead>
                                            <TableHead className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Monthly Investment</TableHead>
                                            <TableHead className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Download Access</TableHead>
                                            <TableHead className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground text-right">Guarantee</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow className="bg-slate-50/30 hover:bg-slate-50/60 border-none transition-all rounded group">
                                            <TableCell className="px-10 py-10 font-black text-primary text-xl">Pro</TableCell>
                                            <TableCell className="px-10 py-10 font-bold text-slate-700 text-lg">$19.00 USD</TableCell>
                                            <TableCell className="px-10 py-10 font-bold text-slate-600 text-lg">50 Premium Certs</TableCell>
                                            <TableCell className="px-10 py-10 text-right font-black text-slate-500 text-sm uppercase tracking-tighter">7-Day Guarantee</TableCell>
                                        </TableRow>
                                        <TableRow className="bg-slate-900 hover:bg-slate-800 border-none transition-all rounded group shadow-xl">
                                            <TableCell className="px-10 py-10 font-black text-white text-xl">Enterprise</TableCell>
                                            <TableCell className="px-10 py-10 font-bold text-slate-200 text-lg">$49.00 USD</TableCell>
                                            <TableCell className="px-10 py-10 font-bold text-white text-lg">
                                                <span className="bg-primary/20 text-primary-foreground px-3 py-1 rounded border border-primary/30">Unlimited Exports</span>
                                            </TableCell>
                                            <TableCell className="px-10 py-10 text-right font-black text-orange-400 text-sm uppercase tracking-tighter">Final Sale</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Profile;
