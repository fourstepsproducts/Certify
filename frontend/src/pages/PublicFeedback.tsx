import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PublicFeedback = () => {
    const { linkId } = useParams();
    const { toast } = useToast();
    const [moduleName, setModuleName] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    // const [error, setError] = useState(''); // Removed in favor of toast

    const [formData, setFormData] = useState({
        email: '',
        feedback: ''
    });

    useEffect(() => {
        fetchLinkDetails();
    }, [linkId]);

    const fetchLinkDetails = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/feedback/link/${linkId}`);

            if (!response.ok) {
                throw new Error('Invalid or inactive feedback link');
            }

            const data = await response.json();
            setModuleName(data.moduleId.name);
        } catch (error: any) {
            console.error('Error fetching link:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to load feedback form',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.feedback) {
            toast({
                title: 'Required Fields',
                description: 'All fields are required',
                variant: 'destructive'
            });
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`http://localhost:5000/api/feedback/submit/${linkId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to submit feedback');
            }

            setSubmitted(true);
            toast({
                title: 'Success',
                description: 'Feedback submitted successfully'
            });
        } catch (error: any) {
            const msg = error.message || 'Failed to submit feedback';
            // Specific check for duplicate
            if (msg.includes('already submitted') || msg.includes('duplicate')) {
                toast({
                    title: 'Already Submitted',
                    description: 'You have already submitted feedback for this module.',
                    variant: 'destructive'
                });
            } else {
                toast({
                    title: 'Error',
                    description: msg,
                    variant: 'destructive'
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Error state removed, handled by toast or simple null return if critical failure loading details
    if (!moduleName && !loading) {
        // Maybe show a generic error card if module load failed
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-red-600">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600">Failed to load feedback form. Please try again later.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-700">Feedback Submitted!</CardTitle>
                        <CardDescription>Thank you for your feedback on {moduleName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600">
                            Your feedback has been recorded. If you're eligible, you'll receive your certificate via email soon.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mb-4">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            CertifyPro
                        </h1>
                    </div>
                    <CardTitle className="text-2xl">Feedback</CardTitle>
                    <CardDescription>{moduleName}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email (same as registration)"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <p className="text-xs text-slate-500">
                                Use the same email you used for registration
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="feedback">Your Feedback *</Label>
                            <Textarea
                                id="feedback"
                                placeholder="Share your thoughts and feedback..."
                                value={formData.feedback}
                                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                                rows={6}
                                required
                                maxLength={2000}
                            />
                            <p className="text-xs text-slate-500 text-right">
                                {formData.feedback.length}/2000 characters
                            </p>
                        </div>

                        {/* Error display removed in favor of toast */}

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PublicFeedback;
