import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export type TokenType = 'text' | 'date' | 'year' | 'month' | 'counter' | 'separator' | 'dynamic';

export interface SerialToken {
    type: TokenType;
    value?: string;
    key?: string;
    length?: number;
}

interface CertificateFormatBuilderProps {
    initialFormat: SerialToken[];
    initialCounter: number;
    onSave: (format: SerialToken[], counter: number) => Promise<void>;
}

export const CertificateFormatBuilder: React.FC<CertificateFormatBuilderProps> = ({
    initialFormat,
    initialCounter,
    onSave
}) => {
    const [formatString, setFormatString] = useState('');
    const [counter, setCounter] = useState<number>(initialCounter || 0);
    const [padding, setPadding] = useState<number>(3); // Default padding
    const [preview, setPreview] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    // Convert initial tokens to string format on load
    useEffect(() => {
        if (!initialFormat || initialFormat.length === 0) return;

        let pattern = '';
        let foundPadding = 3;

        initialFormat.forEach(token => {
            if (token.type === 'text' || token.type === 'separator') {
                pattern += token.value || '';
            } else if (token.type === 'year') {
                pattern += token.value === 'YY' ? '{YY}' : '{YYYY}';
            } else if (token.type === 'month') {
                pattern += token.value === 'Name' ? '{MONTH}' : '{MM}';
            } else if (token.type === 'date') {
                pattern += '{DD}';
            } else if (token.type === 'counter') {
                pattern += '{COUNTER}';
                if (token.length) foundPadding = token.length;
            }
        });

        setFormatString(pattern);
        setPadding(foundPadding);
    }, [initialFormat]);

    const parsePatternToTokens = (pattern: string, pad: number): SerialToken[] => {
        const tokens: SerialToken[] = [];
        // Regex to match placeholders
        const parts = pattern.split(/(\{YYYY\}|\{YY\}|\{MONTH\}|\{MM\}|\{DD\}|\{COUNTER\})/g);

        parts.forEach(part => {
            if (!part) return;

            if (part === '{YYYY}') tokens.push({ type: 'year', value: 'YYYY' });
            else if (part === '{YY}') tokens.push({ type: 'year', value: 'YY' });
            else if (part === '{MONTH}') tokens.push({ type: 'month', value: 'Name' });
            else if (part === '{MM}') tokens.push({ type: 'month', value: 'MM' });
            else if (part === '{DD}') tokens.push({ type: 'date', value: 'DD' });
            else if (part === '{COUNTER}') tokens.push({ type: 'counter', length: pad });
            else tokens.push({ type: 'text', value: part });
        });

        return tokens;
    };

    // Parse string to tokens and generate preview
    useEffect(() => {
        const d = new Date();
        const tokens = parsePatternToTokens(formatString, padding);

        let hasCounter = false;
        let generated = tokens.map(token => {
            switch (token.type) {
                case 'text': return token.value || '';
                case 'separator': return token.value || '';
                case 'year':
                    return (token.value === 'YY') ? String(d.getFullYear()).slice(-2) : String(d.getFullYear());
                case 'month':
                    if (token.value === 'Name') return d.toLocaleString('default', { month: 'long' });
                    return String(d.getMonth() + 1).padStart(2, '0');
                case 'date':
                    return String(d.getDate()).padStart(2, '0');
                case 'counter':
                    hasCounter = true; // Mark that a counter token was found
                    return String(counter + 1).padStart(token.length || 3, '0');
                default: return '';
            }
        }).join('');

        // If {COUNTER} was not explicitly included in the format string, append it
        if (!hasCounter) {
            generated += String(counter + 1).padStart(padding, '0');
        }

        setPreview(generated);
    }, [formatString, counter, padding]);

    const insertPlaceholder = (placeholder: string) => {
        setFormatString(prev => prev + placeholder);
    };

    const handleSave = async () => {
        if (!formatString.trim()) {
            toast({
                title: "Pattern Required",
                description: "Please enter a format pattern (e.g., CERT-{YYYY}) to save.",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);
        try {
            let patternToSave = formatString;

            const tokens = parsePatternToTokens(patternToSave, padding);
            await onSave(tokens, counter);

            toast({
                title: "Configuration Saved",
                description: "Certificate number format updated successfully."
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to save configuration.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="w-full card-premium-light">
            <CardHeader className="accent-line-gradient pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                            Certificate Number Format
                            <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-100 text-[10px] uppercase font-bold py-0 h-4">Required</Badge>
                        </CardTitle>
                        <CardDescription>Define the pattern for generated certificate numbers.</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-sm py-1 px-3 font-mono bg-white border-blue-200 text-blue-700 shadow-sm">
                        Preview: {preview || '...'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">

                {/* Format Input */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">Format Pattern <span className="text-red-500">*</span></Label>
                    <div className="flex gap-2">
                        <Input
                            value={formatString}
                            onChange={(e) => setFormatString(e.target.value)}
                            placeholder="CERT-{YYYY}"
                            className="font-mono text-sm h-11 border-slate-300 focus-visible:ring-blue-500"
                        />
                    </div>

                    {/* Helper Chips */}
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                        <Info className="h-3 w-3" /> Available variables: {'{YYYY}'}, {'{YY}'}, {'{MONTH}'}, {'{MM}'}, {'{DD}'}, {'{COUNTER}'}
                    </p>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Counter Management */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Start Counter From</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                className="h-10 border-slate-300"
                                value={counter}
                                min={0}
                                onChange={(e) => setCounter(parseInt(e.target.value) || 0)}
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 shrink-0 text-slate-500 hover:text-red-600 hover:bg-red-50 border-slate-300"
                                onClick={() => setCounter(0)}
                                title="Reset to 0"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[11px] text-slate-500">Next number will be: <strong>{counter + 1}</strong></p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Counter Padding (Digits)</Label>
                        <Input
                            type="number"
                            min="1"
                            max="10"
                            value={padding}
                            onChange={(e) => setPadding(parseInt(e.target.value) || 3)}
                            className="h-10 border-slate-300"
                        />
                        <p className="text-[11px] text-slate-500">e.g. 3 = "001", 4 = "0001"</p>
                    </div>
                </div>


                <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800">Important</AlertTitle>
                    <AlertDescription className="text-amber-700 text-xs">
                        Changing the format will only affect newly generated certificates. Existing certificates will retain their issued numbers.
                    </AlertDescription>
                </Alert>

                <div className="flex justify-end pt-2">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn-premium-indigo min-w-[160px]"
                    >
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
