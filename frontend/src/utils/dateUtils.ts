/**
 * Check if a value is likely an Excel date serial number
 */
export const isExcelDateSerial = (value: any): boolean => {
    if (typeof value !== 'number') return false;
    // Excel dates are typically between 1 (1900-01-01) and 60000 (2064-05-18)
    return value > 0 && value < 60000 && Number.isInteger(value);
};

/**
 * Convert Excel date serial number to formatted date string
 */
export const convertExcelDate = (serial: number, format: 'short' | 'long' = 'short'): string => {
    // Excel's epoch is January 1, 1900
    // But Excel has a bug: it thinks 1900 was a leap year
    const excelEpoch = new Date(1900, 0, 1);
    const daysOffset = serial > 59 ? serial - 2 : serial - 1; // Account for Excel's leap year bug

    const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);

    if (format === 'long') {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Short format: MM/DD/YYYY or DD/MM/YYYY based on locale
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

/**
 * Smart value formatter - automatically detects and formats Excel dates
 */
export const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return '';

    // Check if it's an Excel date serial number
    if (isExcelDateSerial(value)) {
        return convertExcelDate(value);
    }

    // Convert to string
    return String(value);
};
