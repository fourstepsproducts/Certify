import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Copy, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Pencil, Lock } from 'lucide-react';
import { generateCertificate } from '@/services/groqService';
import { CertificatePreview } from './CertificatePreview';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export const AIGenerator = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedJSON, setGeneratedJSON] = useState<string | null>(null);
    const [generatedData, setGeneratedData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [showJSON, setShowJSON] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a description for your certificate');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedJSON(null);
        setGeneratedData(null);

        try {
            const certificateData = await generateCertificate(prompt);
            setGeneratedData(certificateData);
            setGeneratedJSON(JSON.stringify(certificateData, null, 2));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate certificate');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEdit = () => {
        if (!generatedData || !generatedData.canvasData) return;

        // Save to localStorage for Editor to pick up
        localStorage.setItem('temp_canvas_state', JSON.stringify(generatedData.canvasData));
        localStorage.setItem('temp_canvas_title', generatedData.name || 'AI Generated Certificate');

        // Navigate to editor
        navigate('/editor');
    };

    const handleCopy = async () => {
        if (generatedJSON) {
            try {
                await navigator.clipboard.writeText(generatedJSON);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    if (!isExpanded) {
        return (
            <div className="w-full flex justify-center mb-12 relative z-20 animate-fade-up" style={{ animationDelay: '0.25s' }}>
                <Button
                    onClick={() => {
                        if (user?.activePlan === 'Free Demo') {
                            toast.error('Pro Feature', {
                                description: 'AI Certificate Generation is available on Pro and Enterprise plans.'
                            });
                            return;
                        }
                        setIsExpanded(true);
                    }}
                    variant="ghost"
                    className="btn-ai-spark group flex items-center gap-2"
                >
                    {user?.activePlan === 'Free Demo' ? (
                        <Lock className="h-5 w-5 text-white/90" />
                    ) : (
                        <Sparkles className="h-5 w-5 text-white" />
                    )}
                    <span className="font-semibold text-lg">Generate Certificate with AI</span>
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto ai-section-container mb-12 relative z-20 animate-fade-up">
            {/* Background Image Decorative Element for Expanded State */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                <img
                    src="/metroid-removebg-preview.png"
                    alt="Asteroids background"
                    className="w-full h-full object-cover mix-blend-screen"
                />
            </div>

            <div className="relative z-10 p-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <h3 className="text-xl font-bold text-foreground font-outfit">AI Certificate Generator</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setIsExpanded(false);
                            setError(null);
                            setGeneratedJSON(null);
                            setGeneratedData(null);
                            setShowJSON(false);
                        }}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        Close
                    </Button>
                </div>

                {/* Prompt Input */}
                <div className="space-y-6">
                    <div className="relative">
                        <label htmlFor="ai-prompt" className="block text-sm font-medium text-foreground mb-3 font-outfit">
                            Describe your certificate
                        </label>
                        <textarea
                            id="ai-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Example: Create a modern certificate for a coding bootcamp graduate with blue and gold colors, including a badge and decorative borders"
                            className="w-full min-h-[140px] p-5 rounded-2xl border-2 border-white/10 bg-black/40 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none transition-all font-outfit"
                            disabled={isGenerating}
                        />
                    </div>

                    <div className="relative group/ai-btn">
                        <Button
                            onClick={() => {
                                if (user?.activePlan === 'Free Demo') {
                                    toast.error('Pro Feature', {
                                        description: 'AI Certificate Generation is available on Pro and Enterprise plans.'
                                    });
                                    return;
                                }
                                handleGenerate();
                            }}
                            variant="ghost"
                            disabled={isGenerating || (!prompt.trim() && user?.activePlan !== 'Free Demo')}
                            className={`btn-ai-spark w-full sm:w-auto ${user?.activePlan === 'Free Demo' ? 'opacity-80' : ''}`}
                            size="lg"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Generating Design...
                                </>
                            ) : (
                                <>
                                    {user?.activePlan === 'Free Demo' ? (
                                        <Lock className="h-4 w-4 mr-2" />
                                    ) : (
                                        <Sparkles className="h-4 w-4 mr-2" />
                                    )}
                                    Generate Certificate
                                </>
                            )}
                        </Button>

                        {user?.activePlan === 'Free Demo' && (
                            <div className="absolute top-full left-0 mt-2 p-2 bg-primary/10 text-primary text-xs font-semibold rounded opacity-0 group-hover/ai-btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                Upgrade to Pro to unlock AI
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 animate-fade-in text-destructive">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold mb-1">Error</h4>
                            <p className="text-sm opacity-90">{error}</p>
                        </div>
                    </div>
                )}

                {/* Certificate Preview */}
                {generatedData && (
                    <div className="mt-8 space-y-6 animate-fade-up">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground flex items-center gap-2 font-outfit">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Design Preview
                            </label>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleEdit}
                                className="gap-2 animate-fade-in btn-cosmic"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit Design
                            </Button>
                        </div>

                        {/* Certificate Canvas Preview */}
                        <div className="flex justify-center p-8 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
                            <div className="shadow-2xl rounded-lg overflow-hidden ring-1 ring-white/10">
                                <CertificatePreview canvasData={generatedData.canvasData} />
                            </div>
                        </div>

                        {/* Collapsible JSON Section */}
                        <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                            <div
                                onClick={() => setShowJSON(!showJSON)}
                                className="w-full px-5 py-4 hover:bg-white/5 transition-colors flex items-center justify-between text-sm font-medium text-foreground cursor-pointer"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setShowJSON(!showJSON);
                                    }
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    {showJSON ? (
                                        <ChevronUp className="h-4 w-4 text-primary" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-primary" />
                                    )}
                                    {showJSON ? 'Hide' : 'View'} Raw Design JSON
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy();
                                    }}
                                    className="gap-2 text-primary hover:text-primary hover:bg-primary/10"
                                >
                                    {isCopied ? (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            Copy JSON
                                        </>
                                    )}
                                </Button>
                            </div>
                            {showJSON && (
                                <div className="p-5 border-t border-white/5">
                                    <pre className="w-full max-h-[400px] rounded-xl bg-black/40 text-cosmic-text-muted overflow-auto text-xs sm:text-sm font-mono p-5 custom-scrollbar">
                                        <code>{generatedJSON}</code>
                                    </pre>
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-muted-cosmic flex items-center gap-2 px-1">
                            <Sparkles className="h-3 w-3" />
                            Tip: You can copy this JSON to preserve the design for later use.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
