import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Success = () => {
    const [searchParams] = useSearchParams();
    const moduleName = searchParams.get('moduleName') || 'the session';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center shadow-xl border-t-4 border-t-green-500">
                <CardHeader>
                    <div className="mx-auto mb-6 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-slate-800">Payment Successful!</CardTitle>
                    <CardDescription className="text-lg text-slate-600 mt-2">
                        You have successfully registered for <strong>{moduleName}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-slate-500">
                        A confirmation email has been sent to your registered address. You can now close this window or return home.
                    </p>

                    <div className="pt-4 border-t border-slate-100">
                        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 transition-colors">
                            <Link to="/" className="flex items-center justify-center gap-2">
                                Back to Homepage <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Success;
