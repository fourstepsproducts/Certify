import { Label } from '@/components/ui/label';
import { Link2, Info } from 'lucide-react';

interface FieldMappingProps {
    columns: string[];
    selectedMapping?: string;
    onMappingChange: (column: string) => void;
}

export const FieldMapping = ({ columns, selectedMapping, onMappingChange }: FieldMappingProps) => {
    if (columns.length === 0) {
        return (
            <div className="mb-6 p-4 rounded-xl bg-muted/50 border">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <p className="text-xs">Upload a data file to enable field mapping</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <Label className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Link2 className="h-3.5 w-3.5" />
                Map to Data Column
            </Label>

            <select
                value={selectedMapping || ''}
                onChange={(e) => onMappingChange(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm font-medium cursor-pointer hover:border-primary/50 transition-colors"
            >
                <option value="">-- Select Column --</option>
                {columns.map((column) => (
                    <option key={column} value={column}>
                        {column}
                    </option>
                ))}
            </select>

            {selectedMapping && (
                <div className="mt-3 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Mapped to <strong>"{selectedMapping}"</strong>
                    </p>
                </div>
            )}
        </div>
    );
};
