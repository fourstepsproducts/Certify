import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, X, CheckCircle2, Type, Link2 } from 'lucide-react';
import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Separator } from '@/components/ui/separator';

interface BulkSectionProps {
    onDataUpload: (data: any[], columns: string[]) => void;
    uploadedFileName?: string;
    recordCount?: number;
    columns?: string[];
    textElements?: Array<{ id: string; text: string }>;
    fieldMappings?: Record<string, string>;
    onFieldMapping?: (objectId: string, column: string) => void;
    isModuleMode?: boolean;
    loadingModuleData?: boolean;
    columnsMetadata?: Record<string, any>;
    manualValues?: Record<string, string>;
    onManualValueChange?: (objectId: string, value: string) => void;
}

export const BulkSection = ({
    onDataUpload,
    uploadedFileName,
    recordCount,
    columns = [],
    textElements = [],
    fieldMappings = {},
    onFieldMapping,
    isModuleMode = false,
    loadingModuleData = false,
    columnsMetadata = {},
    manualValues = {},
    onManualValueChange,
}: BulkSectionProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Get friendly label for a column
    const getColumnLabel = (column: string) => {
        return columnsMetadata[column]?.label || column;
    };

    // Filter columns to exclude internal/metadata fields and remove duplicates (both keys and labels)
    const uniqueKeys = new Set(columns.filter(col => !['submittedAt'].includes(col)));
    const usedLabels = new Set();

    const cleanColumns = Array.from(uniqueKeys).filter(col => {
        const label = getColumnLabel(col);
        if (usedLabels.has(label)) return false;
        usedLabels.add(label);
        return true;
    });

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);

        try {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();

            if (fileExtension === 'csv') {
                // Parse CSV
                Papa.parse(file, {
                    header: true,
                    complete: (results) => {
                        const columns = results.meta.fields || [];
                        onDataUpload(results.data, columns);
                        setIsProcessing(false);
                    },
                    error: (error) => {
                        console.error('CSV parsing error:', error);
                        setIsProcessing(false);
                    },
                });
            } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
                // Parse Excel
                const reader = new FileReader();
                reader.onload = (event) => {
                    const data = new Uint8Array(event.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                    if (jsonData.length > 0) {
                        const columns = jsonData[0] as string[];
                        const rows = jsonData.slice(1).map((row: any) => {
                            const obj: any = {};
                            columns.forEach((col, index) => {
                                obj[col] = row[index];
                            });
                            return obj;
                        });

                        onDataUpload(rows, columns);
                    }
                    setIsProcessing(false);
                };
                reader.readAsArrayBuffer(file);
            }
        } catch (error) {
            console.error('File processing error:', error);
            setIsProcessing(false);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Label className="text-xs font-semibold text-white/40 mb-3 block uppercase tracking-wider">
                    Bulk Generation
                </Label>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {!uploadedFileName ? (
                    <>
                        {!isModuleMode && (
                            <Button
                                variant="outline"
                                className="w-full h-24 rounded-xl border-dashed border-2 border-white/10 hover:border-violet-500 hover:bg-violet-500/5 transition-all flex flex-col gap-2 bg-transparent group"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm text-white">Processing...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="h-6 w-6 text-white/30 group-hover:text-violet-500 transition-colors" />
                                        <div className="text-sm font-medium text-white/70 group-hover:text-white">Upload Data File</div>
                                        <div className="text-xs text-white/30">CSV, XLSX, XLS</div>
                                    </>
                                )}
                            </Button>
                        )}
                        {isModuleMode && loadingModuleData && (
                            <div className="w-full h-24 rounded-xl border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm text-white/40">Loading module data...</span>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-[#0B0F1A] rounded-xl p-4 border border-violet-500/30">
                        <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate text-white">{uploadedFileName}</div>
                                    <div className="text-xs text-white/40 mt-1 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                        {recordCount} records loaded
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive shrink-0"
                                onClick={() => onDataUpload([], [])}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {!isModuleMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-white"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Replace File
                            </Button>
                        )}
                    </div>
                )}

                <div className="mt-4 p-3 rounded-lg bg-violet-600/10 border border-violet-500/20">
                    <p className="text-xs text-violet-300">
                        💡 <strong className="text-violet-200">Tip:</strong> Map text elements below to your data columns
                    </p>
                </div>
            </div>

            {/* Field Mappings Section */}
            {uploadedFileName && columns.length > 0 && (
                <>
                    <Separator className="mb-4" />

                    {/* Mapped Fields */}
                    {Object.keys(fieldMappings).length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <Label className="text-xs font-semibold text-white/40 flex items-center gap-2 uppercase tracking-wider">
                                    <Link2 className="h-3.5 w-3.5" />
                                    Mapped Fields ({Object.keys(fieldMappings).length})
                                </Label>
                                <button
                                    onClick={() => {
                                        // Clear all mappings
                                        Object.keys(fieldMappings).forEach(id => onFieldMapping?.(id, ''));
                                    }}
                                    className="text-[10px] text-destructive hover:text-destructive/80 font-medium uppercase tracking-wider transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="space-y-3">
                                {textElements
                                    .filter((element) => fieldMappings[element.id])
                                    .map((element) => (
                                        <div key={element.id} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Type className="h-3.5 w-3.5 text-emerald-400" />
                                                <span className="text-xs font-medium truncate flex-1 text-emerald-200">
                                                    {element.text.substring(0, 30)}
                                                    {element.text.length > 30 ? '...' : ''}
                                                </span>
                                            </div>
                                            <select
                                                value={fieldMappings[element.id] === '__MANUAL__' ? '__MANUAL__' : (fieldMappings[element.id] || '')}
                                                onChange={(e) => {
                                                    if (e.target.value === '__MANUAL__') {
                                                        onFieldMapping?.(element.id, '__MANUAL__');
                                                    } else {
                                                        onFieldMapping?.(element.id, e.target.value);
                                                        if (fieldMappings[element.id] === '__MANUAL__') {
                                                            onManualValueChange?.(element.id, '');
                                                        }
                                                    }
                                                }}
                                                className="w-full h-9 px-3 rounded-lg border border-white/10 bg-[#0B0F1A] text-white text-xs font-medium cursor-pointer hover:border-violet-500/50 transition-colors focus:ring-1 focus:ring-violet-500 outline-none"
                                            >
                                                <option value="">-- Unmap --</option>
                                                <option value="__MANUAL__">✏️ Custom Text (Manual)</option>
                                                {cleanColumns.map((column) => (
                                                    <option key={column} value={column}>
                                                        {getColumnLabel(column)}
                                                    </option>
                                                ))}
                                            </select>
                                            {fieldMappings[element.id] === '__MANUAL__' && (
                                                <input
                                                    type="text"
                                                    value={manualValues[element.id] || ''}
                                                    onChange={(e) => onManualValueChange?.(element.id, e.target.value)}
                                                    placeholder="Enter static text..."
                                                    className="mt-2 w-full h-9 px-3 rounded-lg border border-white/10 bg-[#0B0F1A] text-white text-xs placeholder:text-white/20 focus:border-violet-500 transition-colors outline-none"
                                                />
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Unmapped Fields */}
                    {textElements.filter((element) => !fieldMappings[element.id]).length > 0 && (
                        <div className="mb-6">
                            <Label className="text-xs font-semibold text-white/40 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                <Type className="h-3.5 w-3.5" />
                                Available Fields
                            </Label>

                            <div className="space-y-3">
                                {textElements
                                    .filter((element) => !fieldMappings[element.id])
                                    .map((element) => (
                                        <div key={element.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Type className="h-3.5 w-3.5 text-white/30" />
                                                <span className="text-xs font-medium truncate flex-1 text-white">
                                                    {element.text.substring(0, 30)}
                                                    {element.text.length > 30 ? '...' : ''}
                                                </span>
                                            </div>
                                            <select
                                                value=""
                                                onChange={(e) => {
                                                    if (e.target.value === '__MANUAL__') {
                                                        onFieldMapping?.(element.id, '__MANUAL__');
                                                    } else {
                                                        onFieldMapping?.(element.id, e.target.value);
                                                    }
                                                }}
                                                className="w-full h-9 px-3 rounded-lg border border-white/10 bg-[#0B0F1A] text-white text-xs font-medium cursor-pointer hover:border-violet-500/50 transition-colors focus:ring-1 focus:ring-violet-500 outline-none"
                                            >
                                                <option value="">-- Select Column --</option>
                                                <option value="__MANUAL__">✏️ Custom Text (Manual)</option>
                                                {cleanColumns.map((column) => (
                                                    <option key={column} value={column}>
                                                        {getColumnLabel(column)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
};
