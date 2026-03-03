import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Canvas as FabricCanvas } from 'fabric';
import { jsPDF } from 'jspdf';
import { formatCellValue } from './dateUtils';

interface BulkGenerateOptions {
    canvas: FabricCanvas;
    bulkData: any[];
    fieldMappings: Record<string, string>;
    format: 'png' | 'pdf';
    fileName?: string;
    onProgress?: (current: number, total: number) => void;
    manualValues?: Record<string, string>;
}

export const generateBulkCertificates = async ({
    canvas,
    bulkData,
    fieldMappings,
    format,
    fileName = 'certificates',
    onProgress,
    manualValues = {},
}: BulkGenerateOptions) => {
    const zip = new JSZip();
    const totalCertificates = bulkData.length;

    // Save original state
    const originalJSON = canvas.toObject(['_id']);

    for (let i = 0; i < totalCertificates; i++) {
        const rowData = bulkData[i];

        // Load original template
        await canvas.loadFromJSON(originalJSON);

        // Update text fields based on mappings
        const objects = canvas.getObjects();
        objects.forEach((obj: any) => {
            if ((obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text')) {
                // Check for 'role' property which is used for field mapping
                const objectId = obj.role || obj._id || obj.id;
                if (objectId) {
                    const columnName = fieldMappings[objectId];

                    // Check if this field has a manual value
                    if (columnName === '__MANUAL__' && manualValues[objectId]) {
                        obj.set('text', manualValues[objectId]);
                    } else if (columnName && rowData[columnName] !== undefined) {
                        // Use formatCellValue to automatically convert Excel dates
                        obj.set('text', formatCellValue(rowData[columnName]));
                    }
                }
            }
        });

        canvas.renderAll();

        // Wait a bit for rendering
        await new Promise(resolve => setTimeout(resolve, 100));

        // Generate certificate
        if (format === 'png') {
            const dataUrl = canvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 2,
            });

            // Convert data URL to blob
            const blob = await fetch(dataUrl).then(r => r.blob());
            zip.file(`certificate_${i + 1}.png`, blob);
        } else {
            // PDF
            const dataUrl = canvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 2,
            });

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width || 800, canvas.height || 560],
            });

            pdf.addImage(dataUrl, 'PNG', 0, 0, canvas.width || 800, canvas.height || 560);
            const pdfBlob = pdf.output('blob');
            zip.file(`certificate_${i + 1}.pdf`, pdfBlob);
        }

        // Report progress
        if (onProgress) {
            onProgress(i + 1, totalCertificates);
        }
    }

    // Restore original state
    await canvas.loadFromJSON(originalJSON);
    canvas.renderAll();

    // Generate and download zip
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${fileName}_${format}.zip`);

    return totalCertificates;
};
