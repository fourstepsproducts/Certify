export interface BorderPreset {
    id: string;
    name: string;
    type: 'geometric' | 'floral' | 'modern' | 'institutional';
    stroke: string;
    strokeWidth: number;
    cornerRadius?: number;
    dashArray?: number[];
    padding: number;
}

export const borderPresets: BorderPreset[] = [
    {
        id: 'classic-thin',
        name: 'Professional Thin',
        type: 'institutional',
        stroke: '#475569',
        strokeWidth: 1.5,
        padding: 40
    },
    {
        id: 'gold-thin',
        name: 'Gold Outline',
        type: 'modern',
        stroke: '#EAB308',
        strokeWidth: 2,
        padding: 30
    },
    {
        id: 'modern-subtle',
        name: 'Modern Subtle',
        type: 'modern',
        stroke: '#94a3b8',
        strokeWidth: 1,
        padding: 50,
        cornerRadius: 12
    },
    {
        id: 'dashed-modern',
        name: 'Subtle Dash',
        type: 'modern',
        stroke: '#cbd5e1',
        strokeWidth: 1,
        dashArray: [5, 5],
        padding: 50,
        cornerRadius: 10
    },
    {
        id: 'corporate-refined',
        name: 'Corporate Refined',
        type: 'geometric',
        stroke: '#1e293b',
        strokeWidth: 3,
        padding: 20
    }
];
