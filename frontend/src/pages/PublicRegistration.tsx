import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LinkDetails {
    moduleId: {
        _id: string;
        name: string;
        isPaid: boolean;
        entryFee: number;
        paymentConfig?: {
            razorpayKeyId?: string;
            paymentMethod?: string;
        };
    };
    customFields?: {
        id: string;
        label: string;
        type: 'text' | 'number' | 'dropdown' | 'checkbox' | 'email';
        required: boolean;
        options?: string[];
        placeholder?: string;
    }[];
}

const PublicRegistration = () => {
    const navigate = useNavigate();
    const { linkId } = useParams();
    const [moduleName, setModuleName] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [link, setLink] = useState<LinkDetails | null>(null);
    const { toast } = useToast();

    // Payment States
    const [isPaymentVerified, setIsPaymentVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        customData: {} as Record<string, any>
    });

    // UPI QR State
    const [showUPIQR, setShowUPIQR] = useState(false);
    const [upiPayload, setUpiPayload] = useState('');

    useEffect(() => {
        // Load Razorpay Script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        fetchLinkDetails();
    }, [linkId]);

    const fetchLinkDetails = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/registrations/link/${linkId}`);

            if (!response.ok) {
                throw new Error('Invalid or inactive registration link');
            }

            const data = await response.json();
            setModuleName(data.moduleId.name);
            setLink(data); // Store the entire link data
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load registration form',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent, skipPaymentCheck = false) => {
        if (e) e.preventDefault();

        // Initialize derived core fields
        let derivedName = '';
        let derivedEmail = '';
        let derivedPhone = '';

        // Validate custom fields and extract core data
        if (link?.customFields) {
            for (const field of link.customFields) {
                const value = formData.customData[field.label];

                // Heuristic mapping
                const labelLower = field.label.toLowerCase();
                if (!derivedEmail && field.type === 'email') derivedEmail = value;
                else if (!derivedPhone && (labelLower.includes('phone') || labelLower.includes('mobile'))) derivedPhone = value;
                else if (!derivedName && (labelLower.includes('name'))) derivedName = value;

                if (field.required) {
                    if (!value || (typeof value === 'string' && value.trim() === '')) {
                        toast({
                            title: 'Required Field',
                            description: `"${field.label}" is required`,
                            variant: 'destructive'
                        });
                        return;
                    }
                }
            }
        }

        setSubmitting(true);

        try {
            // Final check for payment if required
            // Skip payment check if it's already verified OR if we just verified it
            if (link?.moduleId.isPaid && !isPaymentVerified && !skipPaymentCheck) {
                toast({
                    title: 'Payment Required',
                    description: 'Please complete and verify your payment before registering.',
                    variant: 'destructive'
                });
                setSubmitting(false);
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/registrations/submit/${linkId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: derivedName || formData.name, // Fallback to state if somehow populated
                    email: derivedEmail || formData.email,
                    phoneNumber: derivedPhone || formData.phoneNumber,
                    customData: formData.customData
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Check if it's the duplicate registration error
                if (response.status === 400 && data.message === 'You have already registered with this email address') {
                    toast({
                        title: 'Already Registered',
                        description: 'This email address is already registered for this module.',
                        variant: 'destructive'
                    });
                } else {
                    throw new Error(data.message || 'Failed to submit registration');
                }
                return;
            }

            setSubmitted(true);
            toast({
                title: 'Success!',
                description: 'Registration submitted successfully.',
                className: 'bg-green-600 text-white border-none'
            });
            return true;
        } catch (error: any) {
            toast({
                title: 'Registration Failed',
                description: error.message || 'Failed to submit registration',
                variant: 'destructive'
            });
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const handlePay = async () => {
        // Find email from customData or main form
        let email = formData.email;
        let name = formData.name;
        let phone = formData.phoneNumber;

        if (link?.customFields) {
            for (const field of link.customFields) {
                const value = formData.customData[field.label];
                if (field.type === 'email') email = value;
                const labelLower = field.label.toLowerCase();
                if (labelLower.includes('name')) name = value;
                if (labelLower.includes('phone') || labelLower.includes('mobile')) phone = value;
            }
        }

        console.log("💳 Initiating payment...");
        console.log("📧 Email:", email);
        console.log("👤 Name:", name);
        console.log("📱 Phone:", phone);

        if (!email) {
            toast({
                title: 'Email Required',
                description: 'Please enter your email address before proceeding to payment.',
                variant: 'destructive'
            });
            return;
        }

        const paymentMethod = link?.moduleId.paymentConfig?.paymentMethod || 'checkout';

        if (paymentMethod === 'upi_qr') {
            const upiId = "your-upi@id"; // This should ideally come from backend settings
            const amount = link?.moduleId.entryFee;
            const upiUrl = `upi://pay?pa=${upiId}&pn=CertifyPro&am=${amount}&cu=INR`;
            setUpiPayload(upiUrl);
            setShowUPIQR(true);
            return;
        }

        setIsInitiatingPayment(true);
        try {
            // 1. Create Order on Backend
            const orderRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moduleId: link?.moduleId._id,
                    email,
                    name,
                    amount: link?.moduleId.entryFee
                })
            });

            if (!orderRes.ok) throw new Error('Failed to create payment order');
            const orderData = await orderRes.json();

            // 2. Open Razorpay Checkout
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: "INR",
                name: "CertifyPro",
                description: `Payment for ${link?.moduleId.name}`,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    console.log("✅ Razorpay success handler triggered", response);
                    try {
                        const verified = await verifyRazorpayPayment(response, name, email);
                        console.log("🔍 Verification result:", verified);

                        if (verified) {
                            const registered = await handleSubmit(undefined, true);
                            console.log("📝 Registration result:", registered);

                            console.log("➡️ Redirecting to success page");
                            window.location.href = `/success?moduleName=${encodeURIComponent(moduleName)}`;
                        } else {
                            toast({
                                title: 'Verification Failed',
                                description: 'Payment verification failed. Please contact support.',
                                variant: 'destructive'
                            });
                        }
                    } catch (error) {
                        console.error("❌ Error inside Razorpay handler:", error);
                    }
                },
                callback_url: `${import.meta.env.VITE_API_BASE_URL}/api/payments/verify`,
                prefill: {
                    name,
                    email,
                    contact: phone
                },
                theme: {
                    color: "#4F46E5"
                },
                modal: {
                    ondismiss: function () {
                        console.log("⚠️ Payment popup closed by user");
                    }
                }
            };

            if (!(window as any).Razorpay) {
                console.error("❌ Razorpay SDK not loaded");
                toast({
                    title: "Payment Error",
                    description: "Razorpay failed to load. Please refresh and try again.",
                    variant: "destructive"
                });
                return;
            }

            console.log("🚀 Starting Razorpay payment...");
            const rzp = new (window as any).Razorpay(options);

            rzp.on('payment.failed', function (response: any) {
                console.error("❌ Payment failed:", response.error);
                toast({
                    title: 'Payment Failed',
                    description: response.error.description || 'Reason unknown',
                    variant: 'destructive'
                });
            });

            rzp.open();

        } catch (error: any) {
            toast({
                title: 'Payment Error',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsInitiatingPayment(false);
        }
    };

    const verifyRazorpayPayment = async (paymentResponse: any, name: string, email: string) => {
        setIsVerifying(true);
        console.log("🔍 Starting payment verification...");
        console.log("📦 Payment response:", paymentResponse);
        try {
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/payments/verify`;
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ...paymentResponse,
                    moduleId: link?.moduleId._id,
                    email,
                    name
                })
            });

            console.log("📡 Verify API status:", res.status);
            const data = await res.json();
            console.log("📡 Verify API response:", data);

            if (!res.ok) throw new Error(data.message || 'Verification failed');

            setIsPaymentVerified(true);
            return true;

        } catch (error: any) {
            console.error("❌ Payment verification error:", error);
            toast({
                title: 'Verification Failed',
                description: error.message,
                variant: 'destructive'
            });
            return false;
        } finally {
            setIsVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!link && !loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-red-600">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600">Registration link not found or inactive.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-700">Registration Successful!</CardTitle>
                        <CardDescription>Thank you for registering for {moduleName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600">
                            We've received your registration. You'll receive further updates via email.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mb-4">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            CertifyPro
                        </h1>
                    </div>
                    <CardTitle className="text-2xl">Registration</CardTitle>
                    <CardDescription>{moduleName}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Custom Fields */}
                        {link?.customFields?.map((field) => (
                            <div key={field.id} className="space-y-2">
                                <Label htmlFor={field.id}>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </Label>

                                {field.type === 'text' && (
                                    <Input
                                        id={field.id}
                                        value={formData.customData[field.label] || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            customData: {
                                                ...formData.customData,
                                                [field.label]: e.target.value
                                            }
                                        })}
                                        required={field.required}
                                        placeholder={field.placeholder}
                                    />
                                )}

                                {field.type === 'email' && (
                                    <Input
                                        id={field.id}
                                        type="email"
                                        value={formData.customData[field.label] || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            customData: {
                                                ...formData.customData,
                                                [field.label]: e.target.value
                                            }
                                        })}
                                        required={field.required}
                                        placeholder={field.placeholder}
                                    />
                                )}

                                {field.type === 'number' && (
                                    <Input
                                        type="number"
                                        id={field.id}
                                        value={formData.customData[field.label] || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            customData: {
                                                ...formData.customData,
                                                [field.label]: e.target.value
                                            }
                                        })}
                                        required={field.required}
                                        placeholder={field.placeholder}
                                    />
                                )}

                                {field.type === 'dropdown' && (
                                    <select
                                        id={field.id}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.customData[field.label] || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            customData: {
                                                ...formData.customData,
                                                [field.label]: e.target.value
                                            }
                                        })}
                                        required={field.required}
                                    >
                                        <option value="">Select an option</option>
                                        {field.options?.map((opt, i) => (
                                            <option key={i} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {field.type === 'checkbox' && (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={field.id}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={formData.customData[field.label] === 'Yes'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                customData: {
                                                    ...formData.customData,
                                                    [field.label]: e.target.checked ? 'Yes' : 'No'
                                                }
                                            })}
                                            required={field.required}
                                        />
                                        <span className="text-sm text-gray-700">Yes</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Payment Section */}
                        {link?.moduleId?.isPaid && (
                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Registration Fee</Label>
                                    <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">₹</div>
                                        <div>
                                            <p className="text-lg font-bold text-slate-900">₹{link.moduleId.entryFee}</p>
                                            <p className="text-xs text-slate-500">Secure Payment via Razorpay</p>
                                        </div>
                                    </div>
                                </div>

                                {!isPaymentVerified ? (
                                    <>
                                        {showUPIQR ? (
                                            <div className="space-y-4 p-4 border rounded-xl bg-slate-50 text-center animate-in zoom-in-95">
                                                <p className="text-sm font-semibold text-slate-700">Scan to Pay via UPI</p>
                                                <div className="mx-auto w-48 h-48 bg-white border flex items-center justify-center rounded-lg">
                                                    <img
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPayload)}`}
                                                        alt="UPI QR Code"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-slate-400 px-4">After payment, registration will be verified manually by the organizer.</p>
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    className="text-xs text-blue-600"
                                                    onClick={() => setShowUPIQR(false)}
                                                >
                                                    Back to Checkout
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={handlePay}
                                                disabled={isInitiatingPayment}
                                                className="w-full btn-premium-indigo text-white font-bold h-12 shadow-md"
                                            >
                                                {isInitiatingPayment ? 'Initializing...' : `Proceed to Payment (₹${link.moduleId.entryFee})`}
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 text-green-700 animate-in zoom-in-95 duration-300">
                                        <CheckCircle className="h-5 w-5" />
                                        <span className="font-semibold text-sm">Payment Verified Successfully</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className={`w-full h-12 font-bold text-lg shadow-lg transition-all ${isPaymentVerified || !link?.moduleId?.isPaid ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            disabled={submitting || (link?.moduleId?.isPaid && !isPaymentVerified)}
                        >
                            {submitting ? 'Submitting...' : 'Register Now'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PublicRegistration;
