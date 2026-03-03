import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Loader2, AlertCircle, ArrowUpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';

const plans = [
    {
        name: 'Free Demo',
        price: 0,
        priceLabel: '$0',
        period: 'forever',
        description: 'Try CertifyPro with limited features',
        features: [
            '3 certificates per month',
            '3 basic templates',
            'PNG export only',
            'Standard resolution',
            'Manual generation only',
            'No bulk upload',
        ],
        cta: 'Start Free',
        variant: 'outline' as const,
        popular: false,
    },
    {
        name: 'Pro',
        price: 19,
        priceLabel: '$19',
        period: 'per month',
        description: 'Perfect for professionals and small teams',
        features: [
            '500 certificates per month',
            'All templates',
            'PDF + PNG export',
            'High-resolution export',
            'Custom logo upload',
            'Brand colors & fonts',
            'Bulk upload via CSV',
        ],
        cta: 'Get Started',
        variant: 'hero' as const,
        popular: true,
    },
    {
        name: 'Enterprise',
        price: 49,
        priceLabel: '$49',
        period: 'per month',
        description: 'For organizations with advanced needs',
        features: [
            'Unlimited certificates per month',
            'All templates',
            'PDF + PNG export',
            'High-resolution export',
            'Custom logo upload',
            'Brand colors & fonts',
            'Bulk upload via CSV',
        ],
        cta: 'Get Started',
        variant: 'outline' as const,
        popular: false,
    },
];

const PLAN_WEIGHTS: Record<string, number> = {
    'Free Demo': 0,
    'Pro': 1,
    'Enterprise': 2
};

export const PricingSection = () => {
    const { isAuthenticated, user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'upgrade' | 'downgrade' | 'switch' | null;
        plan: any | null;
        amount?: number;
    }>({
        isOpen: false,
        type: null,
        plan: null,
        amount: 0
    });

    const getPlanType = (targetPlanName: string) => {
        const currentWeight = PLAN_WEIGHTS[user?.activePlan || 'Free Demo'] || 0;
        const targetWeight = PLAN_WEIGHTS[targetPlanName] || 0;

        if (targetWeight > currentWeight) return 'upgrade';
        if (targetWeight < currentWeight) return 'downgrade';
        return 'switch';
    };

    const calculateProratedAmount = (targetPlan: any) => {
        if (!user || user.activePlan === 'Free Demo' || !user.billingCycleEnd) {
            return targetPlan.price;
        }

        const PLAN_PRICES: Record<string, number> = {
            'Free Demo': 0,
            'Pro': 19,
            'Enterprise': 49
        };

        const now = new Date();
        const cycleEnd = new Date(user.billingCycleEnd);
        const remaining_ms = cycleEnd.getTime() - now.getTime();
        const remaining_days = Math.max(0, Math.ceil(remaining_ms / (1000 * 60 * 60 * 24)));

        const old_price = PLAN_PRICES[user.activePlan] || 0;
        const new_price = targetPlan.price;

        if (new_price <= old_price) return 0;

        const amount = ((new_price - old_price) / 30) * remaining_days;
        return Math.max(0, parseFloat(amount.toFixed(2)));
    };

    const handlePlanClick = (plan: typeof plans[0]) => {
        if (!isAuthenticated) {
            navigate('/signup');
            return;
        }

        if (plan.name === 'Free Demo' && !user?.activePlan) {
            navigate('/editor');
            return;
        }

        const type = getPlanType(plan.name);
        const prorated = type === 'upgrade' ? calculateProratedAmount(plan) : 0;

        setConfirmModal({
            isOpen: true,
            plan,
            type,
            amount: prorated
        });
    };

    const proceedWithPurchase = async () => {
        const { plan, type } = confirmModal;
        if (!plan) return;

        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setLoadingPlan(plan.name);

        try {
            const response = await fetch('/api/admin/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    amount: plan.price,
                    planName: plan.name,
                    userId: user?._id
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (type === 'upgrade') {
                    toast.success(`Successfully upgraded to ${plan.name}!`);
                    updateUser({
                        activePlan: plan.name,
                        scheduledPlan: undefined,
                        billingCycleEnd: data.user.billingCycleEnd
                    });
                } else {
                    toast.success(`Downgrade to ${plan.name} scheduled.`);
                    updateUser({
                        scheduledPlan: plan.name
                    });
                }
            } else {
                toast.error(data.message || 'Failed to update plan');
            }
        } catch (error) {
            console.error('Purchase error:', error);
            toast.error('Connection error. Please try again.');
        } finally {
            setLoadingPlan(null);
        }
    };

    const handleCancelDowngrade = async () => {
        try {
            const response = await fetch('/api/admin/cancel-scheduled-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    userId: user?._id
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Scheduled downgrade cancelled.');
                updateUser({
                    scheduledPlan: undefined
                });
            } else {
                toast.error(data.message || 'Failed to cancel downgrade');
            }
        } catch (error) {
            console.error('Cancel error:', error);
            toast.error('Connection error. Please try again.');
        }
    };

    const currentPlan = user?.activePlan || 'Free Demo';
    const scheduledPlan = user?.scheduledPlan;

    return (
        <section className="py-20 lg:py-28" id="pricing">
            <div className="container">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="cosmic-chip mb-4 animate-fade-up">
                        <Zap className="h-4 w-4 text-cosmic-cyan" />
                        <span className="text-white/80">Simple Pricing</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white/90">
                        Select Your <span className="text-cosmic-gradient">Cosmic Plan</span>
                    </h2>
                    <p className="text-lg text-muted-cosmic max-w-2xl mx-auto font-medium">
                        Choose the plan that fits your needs. Start free and upgrade as you grow.
                    </p>
                </div>

                {scheduledPlan && (
                    <div className="max-w-2xl mx-auto mb-10">
                        <Alert variant="default" className="border-cosmic-purple/30 bg-cosmic-purple/10 flex justify-between items-center backdrop-blur-md rounded-2xl">
                            <div className="flex gap-3">
                                <AlertCircle className="h-4 w-4 text-cosmic-purple mt-0.5" />
                                <div>
                                    <AlertTitle className="text-white/90">Plan Change Scheduled</AlertTitle>
                                    <AlertDescription className="text-muted-cosmic text-sm">
                                        Downgrade to <strong>{scheduledPlan}</strong> scheduled for {user?.billingCycleEnd ? new Date(user?.billingCycleEnd).toLocaleDateString() : 'next cycle'}.
                                    </AlertDescription>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="btn-cosmic-secondary"
                                onClick={handleCancelDowngrade}
                            >
                                Cancel Downgrade
                            </Button>
                        </Alert>
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto max-w-6xl">
                    {plans
                        .map((plan, index) => {
                            const isCurrent = currentPlan === plan.name;
                            const isScheduled = scheduledPlan === plan.name;
                            const type = getPlanType(plan.name);

                            return (
                                <div
                                    key={plan.name}
                                    className={`relative p-8 animate-fade-up flex flex-col ${isCurrent
                                        ? 'pricing-card-active rounded-3xl'
                                        : 'cosmic-card h-full'
                                        }`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    {isCurrent ? (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                            <Badge className="cosmic-badge-active px-4 py-1 flex items-center gap-1">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                Active Now
                                            </Badge>
                                        </div>
                                    ) : plan.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge className="btn-cosmic px-4 py-1">
                                                <Sparkles className="h-3 w-3 mr-1" />
                                                Propulsion
                                            </Badge>
                                        </div>
                                    )}

                                    <div className="text-center mb-8">
                                        <h3 className={`text-xl font-bold mb-2 ${isCurrent ? 'text-cosmic-bg-dark' : 'text-white/90'}`}>{plan.name}</h3>
                                        <div className="mb-2">
                                            <span className={`text-4xl font-black ${isCurrent ? 'text-cosmic-bg-dark' : 'text-white/95'}`}>{plan.priceLabel}</span>
                                            <span className={`${isCurrent ? 'text-cosmic-bg-dark/60' : 'text-muted-cosmic'}`}>/{plan.period}</span>
                                        </div>
                                        <p className={`text-sm ${isCurrent ? 'text-cosmic-bg-dark/70' : 'text-muted-cosmic'}`}>{plan.description}</p>
                                    </div>

                                    <ul className="space-y-4 mb-8 grow">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3 text-sm">
                                                <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${isCurrent ? 'bg-cosmic-bg-dark/10' : 'bg-cosmic-purple/10'}`}>
                                                    <Check className={`h-3 w-3 ${isCurrent ? 'text-cosmic-bg-dark' : 'text-cosmic-purple'}`} />
                                                </div>
                                                <span className={`${isCurrent ? 'text-cosmic-bg-dark/80 font-medium' : 'text-muted-cosmic'}`}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto">
                                        <Button
                                            variant="ghost"
                                            className="w-full rounded-xl py-6 font-bold h-14 bg-black hover:bg-black/90 text-white border-none shadow-xl transition-all duration-300"
                                            size="lg"
                                            onClick={() => handlePlanClick(plan)}
                                            disabled={loadingPlan === plan.name || isCurrent || !!scheduledPlan}
                                        >
                                            {loadingPlan === plan.name ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : null}
                                            {isCurrent ? 'Currently Active' :
                                                isScheduled ? 'Scheduled' :
                                                    type === 'upgrade' ? 'Ignite Plan' :
                                                        type === 'downgrade' ? 'Downgrade' : plan.cta}
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                </div>

                <div className="mt-12 text-center">
                    <div className="inline-flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/30 border border-border/50">
                        <p className="text-sm font-bold text-foreground flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-primary" />
                            Billing Notes
                        </p>
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">• Upgrades take effect immediately (prorated)</span>
                            <span className="flex items-center gap-1.5">• Downgrades apply at the next billing cycle</span>
                            <span className="flex items-center gap-1.5">• Plans cannot be cancelled mid-cycle</span>
                        </div>
                    </div>
                </div>
            </div>

            <AlertDialog open={confirmModal.isOpen} onOpenChange={(isOpen) => setConfirmModal(prev => ({ ...prev, isOpen }))}>
                <AlertDialogContent className="max-w-md rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">
                            {confirmModal.type === 'upgrade' ? 'Confirm Prorated Upgrade' : 'Confirm Plan Downgrade'}
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="text-base py-4 py-2 text-muted-foreground">
                                {confirmModal.type === 'upgrade' ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/10">
                                            <div className="flex flex-col">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Current Plan</p>
                                                <p className="font-black text-slate-800">{user?.activePlan}</p>
                                            </div>
                                            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm border">
                                                <ArrowUpCircle className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex flex-col text-right">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Upgrading To</p>
                                                <p className="font-black text-primary">{confirmModal.plan?.name}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-baseline">
                                                <h4 className="font-bold text-slate-900">Prorated Charge</h4>
                                                <p className="text-2xl font-black text-primary">${confirmModal.amount}</p>
                                            </div>

                                            <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
                                                <p className="text-sm leading-relaxed text-slate-600">
                                                    Since you're upgrading mid-month, you're only paying for the <strong>{
                                                        user?.billingCycleEnd ? Math.max(0, Math.ceil((new Date(user.billingCycleEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0
                                                    } days</strong> remaining in your current cycle.
                                                </p>
                                                <div className="pt-2 border-t border-slate-200">
                                                    <p className="text-sm text-slate-500">
                                                        Your billing cycle hasn't changed. Your next full monthly payment of <strong>${confirmModal.plan?.price}</strong> will be on <strong>{user?.billingCycleEnd ? new Date(user.billingCycleEnd).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'your usual date'}</strong>.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <Alert className="bg-green-50/50 border-green-200">
                                            <Check className="h-4 w-4 text-green-600" />
                                            <AlertDescription className="text-green-800 text-xs font-medium">
                                                Plan features activate immediately after confirmation.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                ) : (
                                    <div className="space-y-4 text-muted-foreground">
                                        <p>
                                            You’ve already paid for the <strong>{currentPlan}</strong> plan for this billing period.
                                        </p>
                                        <div className="p-4 bg-muted rounded-lg border border-border space-y-4">
                                            <p className="text-foreground font-bold">
                                                Your {currentPlan} plan will remain active until <strong>{user?.billingCycleEnd ? new Date(user.billingCycleEnd).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'the end of this cycle'}</strong>.
                                            </p>
                                            <p className="text-sm">
                                                Starting on <strong>{user?.billingCycleEnd ? new Date(user.billingCycleEnd).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'the next billing cycle'}</strong>, your subscription will switch to the <strong>{confirmModal.plan?.name}</strong> plan, and you’ll be billed for {confirmModal.plan?.name} at that time.
                                            </p>
                                        </div>
                                        <p>You’ll continue to have full access to your current plan features until then.</p>
                                        <p className="text-sm font-bold text-foreground">No charges will be made today.</p>
                                    </div>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-2">
                        <AlertDialogCancel className="font-medium rounded-xl">
                            {confirmModal.type === 'upgrade' ? 'Cancel' : 'Keep Current Plan'}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={proceedWithPurchase} className={`rounded-xl ${confirmModal.type === 'upgrade' ? '' : 'bg-red-600 hover:bg-red-700'}`}>
                            {confirmModal.type === 'upgrade' ? 'Confirm & Pay' : 'Confirm Downgrade'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section >
    );
};
