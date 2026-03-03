
export interface FontItem {
    id: string;
    name: string;
    category: 'Serif' | 'Sans-Serif' | 'Humanist' | 'Modern Corporate' | 'Elegant' | 'UI-Variable' | 'Script / Decorative';
    premium: boolean;
}

export const FREE_FONTS: FontItem[] = [
    // Branding & Default
    { id: 'Outfit', name: 'Outfit (Default)', category: 'Sans-Serif', premium: false },

    // Script & Decorative - Essential for Certificates
    { id: 'Alex Brush', name: 'Alex Brush', category: 'Script / Decorative', premium: false },
    { id: 'Great Vibes', name: 'Great Vibes', category: 'Script / Decorative', premium: false },
    { id: 'Pinyon Script', name: 'Pinyon Script', category: 'Script / Decorative', premium: false },
    { id: 'Dancing Script', name: 'Dancing Script', category: 'Script / Decorative', premium: false },
    { id: 'Pacifico', name: 'Pacifico', category: 'Script / Decorative', premium: false },
    { id: 'Satisfy', name: 'Satisfy', category: 'Script / Decorative', premium: false },
    { id: 'Kaushan Script', name: 'Kaushan Script', category: 'Script / Decorative', premium: false },
    { id: 'Playball', name: 'Playball', category: 'Script / Decorative', premium: false },
    { id: 'Monsieur La Doulaise', name: 'Monsieur La Doulaise', category: 'Script / Decorative', premium: false },
    { id: 'Lobster', name: 'Lobster', category: 'Script / Decorative', premium: false },

    // Serif – Document & Publishing
    { id: 'Playfair Display', name: 'Playfair Display', category: 'Serif', premium: false },
    { id: 'Bodoni Moda', name: 'Bodoni Moda', category: 'Serif', premium: false },
    { id: 'Cinzel', name: 'Cinzel', category: 'Serif', premium: false },
    { id: 'Times New Roman', name: 'Times New Roman', category: 'Serif', premium: false },
    { id: 'Georgia', name: 'Georgia', category: 'Serif', premium: false },
    { id: 'EB Garamond', name: 'EB Garamond', category: 'Serif', premium: false },
    { id: 'Crimson Text', name: 'Crimson Text', category: 'Serif', premium: false },
    { id: 'Merriweather', name: 'Merriweather', category: 'Serif', premium: false },
    { id: 'Spectral', name: 'Spectral', category: 'Serif', premium: false },
    { id: 'Libre Baskerville', name: 'Libre Baskerville', category: 'Serif', premium: false },

    // Sans-Serif – UI / Web / Branding
    { id: 'Montserrat', name: 'Montserrat', category: 'Sans-Serif', premium: false },
    { id: 'Roboto', name: 'Roboto', category: 'Sans-Serif', premium: false },
    { id: 'Open Sans', name: 'Open Sans', category: 'Sans-Serif', premium: false },
    { id: 'Poppins', name: 'Poppins', category: 'Sans-Serif', premium: false },
    { id: 'Inter', name: 'Inter', category: 'Sans-Serif', premium: false },
    { id: 'Lato', name: 'Lato', category: 'Sans-Serif', premium: false },
    { id: 'Ubuntu', name: 'Ubuntu', category: 'Sans-Serif', premium: false },

    // Humanist / Alternative
    { id: 'Quicksand', name: 'Quicksand', category: 'Humanist', premium: false },
    { id: 'Lora', name: 'Lora', category: 'Humanist', premium: false },
    { id: 'Noto Sans', name: 'Noto Sans', category: 'Humanist', premium: false },
    { id: 'Noto Serif', name: 'Noto Serif', category: 'Humanist', premium: false },
];

export const PREMIUM_FONTS: FontItem[] = [
    // Sans-Serif – Modern Corporate
    { id: 'Helvetica Neue', name: 'Helvetica Neue', category: 'Modern Corporate', premium: true },
    { id: 'Gotham', name: 'Gotham', category: 'Modern Corporate', premium: true },
    { id: 'Avenir Next', name: 'Avenir Next', category: 'Modern Corporate', premium: true },
    { id: 'Proxima Nova', name: 'Proxima Nova', category: 'Modern Corporate', premium: true },
    { id: 'Circular', name: 'Circular', category: 'Modern Corporate', premium: true },
    { id: 'FF DIN', name: 'FF DIN', category: 'Modern Corporate', premium: true },
    { id: 'Univers', name: 'Univers', category: 'Modern Corporate', premium: true },
    { id: 'Neue Haas Grotesk', name: 'Neue Haas Grotesk', category: 'Modern Corporate', premium: true },
    { id: 'GT Walsheim', name: 'GT Walsheim', category: 'Modern Corporate', premium: true },
    { id: 'Söhne', name: 'Söhne', category: 'Modern Corporate', premium: true },

    // Serif – Elegant & Editorial
    { id: 'Adobe Garamond Pro', name: 'Adobe Garamond Pro', category: 'Elegant', premium: true },
    { id: 'Minion Pro', name: 'Minion Pro', category: 'Elegant', premium: true },
    { id: 'Baskerville', name: 'Baskerville', category: 'Elegant', premium: true },
    { id: 'Sabon', name: 'Sabon', category: 'Elegant', premium: true },
    { id: 'Miller', name: 'Miller', category: 'Elegant', premium: true },
    { id: 'Tiempos Text', name: 'Tiempos Text', category: 'Elegant', premium: true },
    { id: 'Mercury Text', name: 'Mercury Text', category: 'Elegant', premium: true },
    { id: 'Bodoni', name: 'Bodoni', category: 'Elegant', premium: true },
    { id: 'Caslon', name: 'Caslon', category: 'Elegant', premium: true },
    { id: 'FF Meta Serif', name: 'FF Meta Serif', category: 'Elegant', premium: true },

    // UI / Variable / Web-Optimized
    { id: 'Graphik', name: 'Graphik', category: 'UI-Variable', premium: true },
    { id: 'Maison Neue', name: 'Maison Neue', category: 'UI-Variable', premium: true },
    { id: 'Neue Montreal', name: 'Neue Montreal', category: 'UI-Variable', premium: true },
    { id: 'Aperçu', name: 'Aperçu', category: 'UI-Variable', premium: true },
    { id: 'Suisse Int’l', name: 'Suisse Int’l', category: 'UI-Variable', premium: true },
    { id: 'Akkurat', name: 'Akkurat', category: 'UI-Variable', premium: true },
    { id: 'FF Mark', name: 'FF Mark', category: 'UI-Variable', premium: true },
    { id: 'GT America', name: 'GT America', category: 'UI-Variable', premium: true },
    { id: 'Acumin Pro', name: 'Acumin Pro', category: 'UI-Variable', premium: true },
    { id: 'Effra Pro', name: 'Effra Pro', category: 'UI-Variable', premium: true },
];

export const ALL_FONTS = [...FREE_FONTS, ...PREMIUM_FONTS];
