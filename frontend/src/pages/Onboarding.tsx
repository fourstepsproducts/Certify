import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Award, Building2, ArrowRight, Loader2, GraduationCap, ChevronLeft } from 'lucide-react';

const REFERRAL_OPTIONS = [
    "Instagram",
    "YouTube",
    "Friend / Referral",
    "College / Campus",
    "Google Search",
    "Workshop / Event",
    "Other"
];

const Onboarding = () => {
    const { user, updateUser, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<'organizer' | 'participant' | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        referralSource: '',
        referralOther: ''
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/signin');
        } else if (user?.profileCompleted) {
            navigate('/dashboard');
        }
    }, [user, isAuthenticated, navigate]);

    const handleRoleSelect = (selectedRole: 'organizer' | 'participant') => {
        setRole(selectedRole);
        setStep(2);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!role) return;
        setIsLoading(true);

        const finalReferralSource = formData.referralSource === 'Other' ? formData.referralOther : formData.referralSource;

        try {
            const response = await fetch('/api/auth/profile/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    role,
                    referralSource: finalReferralSource
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to complete profile');
            }

            updateUser({
                ...data.user,
                profileCompleted: true
            });

            toast.success('Welcome to CertifyPro!');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const prevStep = () => setStep(prev => prev - 1);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                    <Award className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold tracking-tight">CertifyPro</span>
            </div>

            <Card className="w-full max-w-lg shadow-xl border-border/50 overflow-hidden">
                <div className="h-1 bg-primary/20">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${(step / 2) * 100}%` }}
                    />
                </div>

                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold">
                        {step === 1 ? 'Welcome to CertifyPro' : 'One last question...'}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {step === 1
                            ? 'How do you plan to use the platform?'
                            : 'How did you hear about CertifyPro?'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="py-6">
                    {step === 1 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button
                                onClick={() => handleRoleSelect('organizer')}
                                className="group flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-center"
                            >
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Building2 className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Organizer</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        I want to create modules and issue certificates
                                    </p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleRoleSelect('participant')}
                                className="group flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-center"
                            >
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <GraduationCap className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Participant</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        I want to track my certificates and achievements
                                    </p>
                                </div>
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <RadioGroup
                                onValueChange={(val) => setFormData(prev => ({ ...prev, referralSource: val }))}
                                className="grid grid-cols-1 gap-3"
                            >
                                {REFERRAL_OPTIONS.map((option) => (
                                    <div key={option} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                                        <RadioGroupItem value={option} id={option} />
                                        <Label htmlFor={option} className="flex-1 cursor-pointer font-medium">{option}</Label>
                                    </div>
                                ))}
                            </RadioGroup>

                            {formData.referralSource === 'Other' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Label htmlFor="referralOther">Please specify</Label>
                                    <Input
                                        id="referralOther"
                                        name="referralOther"
                                        placeholder="How did you hear about us?"
                                        value={formData.referralOther}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between border-t p-6 bg-muted/30">
                    {step > 1 && (
                        <Button variant="ghost" onClick={prevStep} disabled={isLoading}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    )}

                    {step === 2 && (
                        <Button
                            className="ml-auto min-w-[120px]"
                            onClick={handleSubmit}
                            disabled={isLoading || !formData.referralSource || (formData.referralSource === 'Other' && !formData.referralOther)}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Finishing...
                                </>
                            ) : (
                                <>
                                    Complete Setup
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    )}
                </CardFooter>
            </Card>

            <p className="mt-8 text-sm text-muted-foreground">
                Step {step} of 2
            </p>
        </div>
    );
};

export default Onboarding;
