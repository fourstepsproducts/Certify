export const SUPPORTED_FONTS = [
    'Abril Fatface',
    'Alex Brush',
    'Allura',
    'Archivo Black',
    'Arial',
    'Bodoni Moda',
    'Cabin Sketch',
    'Cinzel',
    'Clicker Script',
    'Cookie',
    'Cormorant Garamond',
    'Crimson Text',
    'Dancing Script',
    'Exo 2',
    'Fira Sans',
    'Fredoka One',
    'Georgia',
    'Great Vibes',
    'Herr Von Muellerhoff',
    'Inter',
    'Josefin Sans',
    'Kaushan Script',
    'Lato',
    'Libre Baskerville',
    'Lobster',
    'Lora',
    'Maven Pro',
    'Merriweather',
    'Monsieur La Doulaise',
    'Montserrat',
    'Muli',
    'Nanum Brush Script',
    'Noto Serif',
    'Nunito',
    'Old Standard TT',
    'Open Sans',
    'Oswald',
    'Outfit',
    'Pacifico',
    'Parisienne',
    'Petit Formal Script',
    'Pinyon Script',
    'Playball',
    'Playfair Display',
    'Playfair Display SC',
    'Poppins',
    'Quicksand',
    'Raleway',
    'Righteous',
    'Roboto',
    'Ruthie',
    'Satisfy',
    'Spectral',
    'Staatliches',
    'Times New Roman',
    'Ubuntu',
    'UnifrakturMaguntia',
    'Verdana',
    'Zilla Slab'
].sort();

export interface FontPairing {
    id: string;
    name: string;
    description: string;
    fonts: {
        title: string;
        recipient: string;
        body: string;
    };
}

export const fontPairingPresets: FontPairing[] = [
    {
        id: 'classic-formal',
        name: 'Classic Formal',
        description: 'Traditional academic style.',
        fonts: { title: 'Playfair Display', recipient: 'Great Vibes', body: 'Montserrat' }
    },
    {
        id: 'modern-sleek',
        name: 'Modern Sleek',
        description: 'Clean minimalist look.',
        fonts: { title: 'Outfit', recipient: 'Outfit', body: 'Outfit' }
    },
    {
        id: 'elegant-award',
        name: 'Elegant Award',
        description: 'Sophisticated premium style.',
        fonts: { title: 'Cinzel', recipient: 'Pinyon Script', body: 'Montserrat' }
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Clear and readable.',
        fonts: { title: 'Montserrat', recipient: 'Outfit', body: 'Open Sans' }
    },
    {
        id: 'bold-impact',
        name: 'Bold Impact',
        description: 'Strong headers.',
        fonts: { title: 'Oswald', recipient: 'Poppins', body: 'Montserrat' }
    },
    {
        id: 'luxury-experience',
        name: 'Luxury Experience',
        description: 'Gilded age aesthetics.',
        fonts: { title: 'Cormorant Garamond', recipient: 'Alex Brush', body: 'Lato' }
    },
    {
        id: 'tech-innovator',
        name: 'Tech Innovator',
        description: 'Geometric typefaces.',
        fonts: { title: 'Righteous', recipient: 'Inter', body: 'Roboto' }
    },
    {
        id: 'vintage-arts',
        name: 'Vintage Arts',
        description: 'Charming retro script.',
        fonts: { title: 'Lobster', recipient: 'Dancing Script', body: 'Montserrat' }
    },
    {
        id: 'royal-heritage',
        name: 'Royal Heritage',
        description: 'Imperial fonts.',
        fonts: { title: 'Cinzel', recipient: 'Kaushan Script', body: 'Merriweather' }
    },
    {
        id: 'playful-creative',
        name: 'Playful Creative',
        description: 'Friendly and approachable.',
        fonts: { title: 'Pacifico', recipient: 'Quicksand', body: 'Nunito' }
    },
    {
        id: 'soft-elegant',
        name: 'Soft Elegant',
        description: 'Gentle script.',
        fonts: { title: 'Satisfy', recipient: 'Libre Baskerville', body: 'Lato' }
    },
    {
        id: 'script-flair',
        name: 'Script Flair',
        description: 'Decorative handwritten.',
        fonts: { title: 'Allura', recipient: 'Parisienne', body: 'Libre Baskerville' }
    },
    {
        id: 'modern-academic',
        name: 'Modern Academic',
        description: 'Updated serif standards.',
        fonts: { title: 'Lora', recipient: 'Outfit', body: 'Inter' }
    },
    {
        id: 'clean-contract',
        name: 'Clean Contract',
        description: 'Trustworthy and sharp.',
        fonts: { title: 'Inter', recipient: 'Raleway', body: 'Roboto' }
    },
    {
        id: 'warm-welcome',
        name: 'Warm Welcome',
        description: 'Friendly serif.',
        fonts: { title: 'Merriweather', recipient: 'Nunito', body: 'Quicksand' }
    },
    {
        id: 'modern-script',
        name: 'Modern Script',
        description: 'Sleek modern scripts.',
        fonts: { title: 'Outfit', recipient: 'Dancing Script', body: 'Montserrat' }
    },
    {
        id: 'minimalist-chic',
        name: 'Minimalist Chic',
        description: 'Stylish simplicity.',
        fonts: { title: 'Lato', recipient: 'Playfair Display', body: 'Inter' }
    },
    {
        id: 'creative-studio',
        name: 'Creative Studio',
        description: 'Unique combinations.',
        fonts: { title: 'Lobster', recipient: 'Quicksand', body: 'Poppins' }
    },
    {
        id: 'soft-script-alt',
        name: 'Soft Script',
        description: 'Delicate cursive.',
        fonts: { title: 'Alex Brush', recipient: 'Lora', body: 'Lato' }
    },
    {
        id: 'digital-native',
        name: 'Digital Native',
        description: 'Screen-first viewing.',
        fonts: { title: 'Inter', recipient: 'Poppins', body: 'Open Sans' }
    },
    {
        id: 'formal-playball',
        name: 'Playball Style',
        description: 'Athletic script elegance.',
        fonts: { title: 'Playball', recipient: 'Roboto', body: 'Open Sans' }
    },
    {
        id: 'monsieur-style',
        name: 'Monsieur Style',
        description: 'Ultra-elegant signature.',
        fonts: { title: 'Cinzel', recipient: 'Monsieur La Doulaise', body: 'Montserrat' }
    },
    {
        id: 'herr-von',
        name: 'Herr Von',
        description: 'Traditional copperplate.',
        fonts: { title: 'Playfair Display', recipient: 'Herr Von Muellerhoff', body: 'Lato' }
    },
    {
        id: 'petit-formal',
        name: 'Petit Formal',
        description: 'Refined cursive headers.',
        fonts: { title: 'Petit Formal Script', recipient: 'Lora', body: 'Inter' }
    },
    {
        id: 'ruthie-style',
        name: 'Ruthie Style',
        description: 'Lightweight handwritten.',
        fonts: { title: 'Ruthie', recipient: 'Montserrat', body: 'Roboto' }
    },
    {
        id: 'clicker-style',
        name: 'Clicker Style',
        description: 'Bubbly artistic script.',
        fonts: { title: 'Clicker Script', recipient: 'Quicksand', body: 'Nunito' }
    },
    {
        id: 'cookie-style',
        name: 'Cookie Style',
        description: 'Friendly retro script.',
        fonts: { title: 'Cookie', recipient: 'Open Sans', body: 'Roboto' }
    },
    {
        id: 'staatliches-bold',
        name: 'Industrial Bold',
        description: 'Strong architectural feel.',
        fonts: { title: 'Staatliches', recipient: 'Inter', body: 'Roboto' }
    },
    {
        id: 'fredoka-creative',
        name: 'Friendly Creative',
        description: 'Rounded and welcoming.',
        fonts: { title: 'Fredoka One', recipient: 'Nunito', body: 'Quicksand' }
    },
    {
        id: 'unifraktur-gothic',
        name: 'Medieval Gothic',
        description: 'Classic blackletter style.',
        fonts: { title: 'UnifrakturMaguntia', recipient: 'Old Standard TT', body: 'Spectral' }
    },
    {
        id: 'bodoni-luxury',
        name: 'Bodoni Luxury',
        description: 'High-fashion modern serif.',
        fonts: { title: 'Bodoni Moda', recipient: 'Satisfy', body: 'Lato' }
    },
    {
        id: 'spectral-academic',
        name: 'Spectral Academic',
        description: 'Scholarly serif fonts.',
        fonts: { title: 'Spectral', recipient: 'Libre Baskerville', body: 'Lora' }
    },
    {
        id: 'josefin-modern',
        name: 'Josefin Modern',
        description: 'Geometric elegance.',
        fonts: { title: 'Josefin Sans', recipient: 'Pacifico', body: 'Inter' }
    },
    {
        id: 'zilla-slab-style',
        name: 'Zilla Slab',
        description: 'Sturdy newspaper slab.',
        fonts: { title: 'Zilla Slab', recipient: 'Roboto', body: 'Open Sans' }
    },
    {
        id: 'playfair-sc-classic',
        name: 'Small Caps',
        description: 'Prestigious classical look.',
        fonts: { title: 'Playfair Display SC', recipient: 'Herr Von Muellerhoff', body: 'Montserrat' }
    },
    {
        id: 'righteous-tech',
        name: 'Righteous',
        description: 'Futuristic geometric style.',
        fonts: { title: 'Righteous', recipient: 'Inter', body: 'Roboto' }
    },
    {
        id: 'fira-clean',
        name: 'Fira Sans',
        description: 'High legibility humanist.',
        fonts: { title: 'Fira Sans', recipient: 'Lato', body: 'Open Sans' }
    },
    {
        id: 'old-standard',
        name: 'Old Standard',
        description: 'Late 19th-century elegance.',
        fonts: { title: 'Old Standard TT', recipient: 'Playfair Display', body: 'Lora' }
    },
    {
        id: 'bodoni-moda-style',
        name: 'Bodoni Moda',
        description: 'Serif with extreme contrast.',
        fonts: { title: 'Bodoni Moda', recipient: 'Montserrat', body: 'Lato' }
    },
    {
        id: 'josefin-slab-style',
        name: 'Josefin Slab',
        description: 'Vintage typewriter vibe.',
        fonts: { title: 'Josefin Sans', recipient: 'Crimson Text', body: 'Muli' }
    },
    {
        id: 'maven-pro-modern',
        name: 'Maven Pro',
        description: 'Curvy and contemporary.',
        fonts: { title: 'Maven Pro', recipient: 'Inter', body: 'Roboto' }
    },
    {
        id: 'exo-2-dynamic',
        name: 'Exo 2',
        description: 'Technological and organic.',
        fonts: { title: 'Exo 2', recipient: 'Raleway', body: 'Montserrat' }
    },
    {
        id: 'archivo-black-bold',
        name: 'Archivo Black',
        description: 'Heavy architectural headers.',
        fonts: { title: 'Archivo Black', recipient: 'Roboto', body: 'Open Sans' }
    },
    {
        id: 'ubuntu-trusted',
        name: 'Ubuntu',
        description: 'Familiar and friendly.',
        fonts: { title: 'Ubuntu', recipient: 'Inter', body: 'Open Sans' }
    },
    {
        id: 'crimson-text-ac',
        name: 'Crimson Text',
        description: 'Garamond-inspired serif.',
        fonts: { title: 'Crimson Text', recipient: 'Lato', body: 'Lora' }
    },
    {
        id: 'nanum-brush-st',
        name: 'Nanum Brush',
        description: 'Organic handwritten brush.',
        fonts: { title: 'Nanum Brush Script', recipient: 'Montserrat', body: 'Roboto' }
    },
    {
        id: 'noto-serif-cl',
        name: 'Noto Serif',
        description: 'Universal academic serif.',
        fonts: { title: 'Noto Serif', recipient: 'Inter', body: 'Open Sans' }
    },
    {
        id: 'cabin-sketch-art',
        name: 'Cabin Sketch',
        description: 'Textured playful fonts.',
        fonts: { title: 'Cabin Sketch', recipient: 'Fredoka One', body: 'Nunito' }
    },
    {
        id: 'abril-fatface-lux',
        name: 'Abril Fatface',
        description: 'High-contrast fashion font.',
        fonts: { title: 'Abril Fatface', recipient: 'Satisfy', body: 'Lato' }
    },
    {
        id: 'arial-std',
        name: 'Arial Basic',
        description: 'Standard sans-serif.',
        fonts: { title: 'Arial', recipient: 'Arial', body: 'Arial' }
    },
    {
        id: 'georgia-classic',
        name: 'Georgia',
        description: 'Elegant transitional serif.',
        fonts: { title: 'Georgia', recipient: 'Georgia', body: 'Georgia' }
    },
    {
        id: 'times-formal',
        name: 'Times New Roman',
        description: 'Traditional academic serif.',
        fonts: { title: 'Times New Roman', recipient: 'Times New Roman', body: 'Times New Roman' }
    },
    {
        id: 'verdana-clean',
        name: 'Verdana',
        description: 'Wide and legible sans.',
        fonts: { title: 'Verdana', recipient: 'Verdana', body: 'Verdana' }
    },
    {
        id: 'dancing-script-alt',
        name: 'Dancing Script',
        description: 'Casual handwritten flair.',
        fonts: { title: 'Dancing Script', recipient: 'Montserrat', body: 'Open Sans' }
    },
    {
        id: 'great-vibes-std',
        name: 'Great Vibes',
        description: 'Smooth elegant script.',
        fonts: { title: 'Great Vibes', recipient: 'Lora', body: 'Montserrat' }
    },
    {
        id: 'pinyon-elegant',
        name: 'Pinyon Script',
        description: 'Sophisticated romantic script.',
        fonts: { title: 'Pinyon Script', recipient: 'Cinzel', body: 'Inter' }
    },
    {
        id: 'libre-baskerville-std',
        name: 'Libre Baskerville',
        description: 'Optimized web serif.',
        fonts: { title: 'Libre Baskerville', recipient: 'Inter', body: 'Open Sans' }
    },
    {
        id: 'open-sans-std',
        name: 'Open Sans',
        description: 'Neutral and friendly sans.',
        fonts: { title: 'Open Sans', recipient: 'Open Sans', body: 'Open Sans' }
    },
    {
        id: 'poppins-std',
        name: 'Poppins',
        description: 'Geometric sans-serif.',
        fonts: { title: 'Poppins', recipient: 'Poppins', body: 'Poppins' }
    },
    {
        id: 'roboto-std',
        name: 'Roboto',
        description: 'Modern neo-grotesque sans.',
        fonts: { title: 'Roboto', recipient: 'Roboto', body: 'Roboto' }
    },
    {
        id: 'quicksand-std',
        name: 'Quicksand',
        description: 'Rounded geometric sans.',
        fonts: { title: 'Quicksand', recipient: 'Quicksand', body: 'Quicksand' }
    },
    {
        id: 'raleway-std',
        name: 'Raleway',
        description: 'Elegant sans-serif family.',
        fonts: { title: 'Raleway', recipient: 'Raleway', body: 'Raleway' }
    },
    {
        id: 'parisienne-std',
        name: 'Parisienne',
        description: 'Bouncy and casual script.',
        fonts: { title: 'Parisienne', recipient: 'Lora', body: 'Inter' }
    },
    {
        id: 'nunito-std',
        name: 'Nunito',
        description: 'Balanced and rounded sans.',
        fonts: { title: 'Nunito', recipient: 'Nunito', body: 'Nunito' }
    },
    {
        id: 'muli-std',
        name: 'Muli',
        description: 'Minimalist geometric sans.',
        fonts: { title: 'Muli', recipient: 'Muli', body: 'Muli' }
    }
];
