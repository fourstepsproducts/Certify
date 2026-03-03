export interface StylePreset {
    id: string;
    name: string;
    description: string;
    colors: {
        primary: string;   // For borders, key shapes
        secondary: string; // For accents, secondary shapes
        title: string;     // For the main title text
        recipient: string; // For recipient name
        body: string;      // For general text
        background: string;
    };
}

export const stylePresets: StylePreset[] = [
    {
        id: 'midnight-gold',
        name: 'Midnight Gold',
        description: 'Premium dark theme with gold accents.',
        colors: {
            primary: '#EAB308',
            secondary: '#FACC15',
            title: '#FFFFFF',
            recipient: '#EAB308',
            body: '#CBD5E1',
            background: '#0F172A'
        }
    },
    {
        id: 'corporate-silver',
        name: 'Corporate Silver',
        description: 'Clean, professional slate and silver look.',
        colors: {
            primary: '#1E293B',
            secondary: '#64748B',
            title: '#0F172A',
            recipient: '#1E293B',
            body: '#475569',
            background: '#F8FAFC'
        }
    },
    {
        id: 'royal-emerald',
        name: 'Royal Emerald',
        description: 'Deep green with white and gold highlights.',
        colors: {
            primary: '#064E3B',
            secondary: '#059669',
            title: '#064E3B',
            recipient: '#059669',
            body: '#374151',
            background: '#FFFFFF'
        }
    },
    {
        id: 'modern-vibrant',
        name: 'Modern Vibrant',
        description: 'Energetic purple and indigo theme.',
        colors: {
            primary: '#4338CA',
            secondary: '#6366F1',
            title: '#1E1B4B',
            recipient: '#4338CA',
            body: '#4B5563',
            background: '#F5F3FF'
        }
    },
    {
        id: 'minimal-cream',
        name: 'Minimal Cream',
        description: 'Warm, academic feel with soft tones.',
        colors: {
            primary: '#78350F',
            secondary: '#B45309',
            title: '#451A03',
            recipient: '#78350F',
            body: '#71717A',
            background: '#FFFBEB'
        }
    },
    {
        id: 'classic-parchment',
        name: 'Classic Parchment',
        description: 'Traditional ivory with deep burgundy and brown.',
        colors: {
            primary: '#7F1D1D',
            secondary: '#92400E',
            title: '#450A0A',
            recipient: '#7F1D1D',
            body: '#4B5563',
            background: '#FEFCE8'
        }
    },
    {
        id: 'ocean-carbon',
        name: 'Ocean Carbon',
        description: 'High-contrast dark theme with cyan highlights.',
        colors: {
            primary: '#0891B2',
            secondary: '#22D3EE',
            title: '#F8FAFC',
            recipient: '#22D3EE',
            body: '#94A3B8',
            background: '#020617'
        }
    },
    {
        id: 'professional-onyx',
        name: 'Professional Onyx',
        description: 'Sophisticated black and white with silver accents.',
        colors: {
            primary: '#000000',
            secondary: '#94A3B8',
            title: '#000000',
            recipient: '#475569',
            body: '#64748B',
            background: '#FFFFFF'
        }
    },
    {
        id: 'elegant-navy',
        name: 'Elegant Navy',
        description: 'Deep blue with crisp white and gold touches.',
        colors: {
            primary: '#1E3A8A',
            secondary: '#D4AF37',
            title: '#1E3A8A',
            recipient: '#1E40AF',
            body: '#334155',
            background: '#F1F5F9'
        }
    },
    {
        id: 'rose-gold-light',
        name: 'Rose Gold Light',
        description: 'Soft, modern aesthetic with rose-tinted metals.',
        colors: {
            primary: '#BE185D',
            secondary: '#F472B6',
            title: '#831843',
            recipient: '#BE185D',
            body: '#71717A',
            background: '#FFF1F2'
        }
    },
    {
        id: 'serene-mint',
        name: 'Serene Mint',
        description: 'Fresh and modern with mint green and soft grey.',
        colors: {
            primary: '#059669',
            secondary: '#A7F3D0',
            title: '#064E3B',
            recipient: '#059669',
            body: '#4B5563',
            background: '#F0FDFA'
        }
    },
    {
        id: 'classic-academic',
        name: 'Classic Academic',
        description: 'Formal navy and burgundy with ivory background.',
        colors: {
            primary: '#1E3A8A',
            secondary: '#991B1B',
            title: '#1E3A8A',
            recipient: '#991B1B',
            body: '#374151',
            background: '#FEFCE8'
        }
    }
];
