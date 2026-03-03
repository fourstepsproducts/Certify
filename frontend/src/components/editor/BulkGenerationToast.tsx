import { Loader2 } from 'lucide-react';

interface BulkGenerationToastProps {
    current: number;
    total: number;
    format: 'PDF' | 'PNG';
}

export const BulkGenerationToast = ({ current, total, format }: BulkGenerationToastProps) => {
    const percentage = Math.round((current / total) * 100);

    return (
        <div className="flex items-center gap-3">
            <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="font-medium">Generating certificates... {current}/{total}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className="text-xs text-muted-foreground">{percentage}% complete</span>
            </div>
        </div>
    );
};

export const BulkGenerationSuccessToast = ({ format }: { format: 'PDF' | 'PNG' }) => {
    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Download completed as {format}</span>
        </div>
    );
};
