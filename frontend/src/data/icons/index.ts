
export interface IconItem {
    id: string;
    name: string;
    category: 'Simple' | 'Professional';
    tags: string[];
    style: 'outline' | 'solid' | 'duotone';
    premium: boolean;
    fabricObject: any;
}

const createIconObject = (src: string) => ({
    type: "group", // Use group now as we import it as a vector group
    version: "6.0.0",
    originX: "center",
    originY: "center",
    left: 0,
    top: 0,
    width: 24,
    height: 24,
    fill: "currentColor",
    scaleX: 2,
    scaleY: 2,
    opacity: 1,
    visible: true,
    src: src,
    crossOrigin: "anonymous",
});

// Normalized 24x24 SVG Helpers
// Stroke weight 1.75 for outlines
const iconSVG = (content: string, isSolid = false) => `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" ${isSolid ? 'fill="currentColor"' : 'fill="transparent" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"'}>${content}</svg>`)}`;

export const icons: IconItem[] = [
    // --- RECOGNITION & AWARDS ---
    { id: 'cert-1', name: 'Certificate', category: 'Simple', tags: ['award', 'verified', 'education', 'legal'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>')) },
    { id: 'cert-2', name: 'Seal', category: 'Simple', tags: ['stamp', 'official', 'verified'], premium: false, style: 'solid', fabricObject: createIconObject(iconSVG('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4" stroke="white" stroke-width="2"/>', true)) },
    { id: 'award-1', name: 'Trophy', category: 'Simple', tags: ['winner', 'prize', 'first'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>')) },
    { id: 'award-2', name: 'Medal', category: 'Simple', tags: ['gold', 'winner', 'rank'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>')) },
    { id: 'star-1', name: 'Star Outline', category: 'Simple', tags: ['rating', 'favorite', 'premium'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>')) },
    { id: 'star-2', name: 'Star Solid', category: 'Simple', tags: ['rating', 'favorite', 'premium'], premium: false, style: 'solid', fabricObject: createIconObject(iconSVG('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', true)) },
    { id: 'shield-1', name: 'Shield Security', category: 'Simple', tags: ['safe', 'verified', 'protection'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>')) },
    { id: 'shield-2', name: 'Shield Check', category: 'Simple', tags: ['safe', 'verified', 'protection'], premium: false, style: 'solid', fabricObject: createIconObject(iconSVG('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4" stroke="white" stroke-width="2"/>', true)) },
    { id: 'ribbon-1', name: 'Ribbon', category: 'Simple', tags: ['decoration', 'gift', 'award'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="8 12 12 16 16 12"/>')) },
    { id: 'badge-1', name: 'Badge', category: 'Simple', tags: ['rank', 'member', 'verified'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>')) },

    // --- EDUCATION ---
    { id: 'edu-1', name: 'Graduation Cap', category: 'Simple', tags: ['school', 'university', 'student', 'degree'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2.7 3 6 3s6-1 6-3v-5"/>')) },
    { id: 'edu-2', name: 'Book', category: 'Simple', tags: ['read', 'study', 'education'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>')) },
    { id: 'edu-3', name: 'Scholarship', category: 'Simple', tags: ['money', 'award', 'education'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M7 10v4s0 4 5 4 5-4 5-4v-4"/><path d="M12 18v4"/><path d="M8 22h8"/>')) },
    { id: 'edu-4', name: 'Certificate Roll', category: 'Simple', tags: ['diploma', 'scroll', 'graduate'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><polyline points="13 2 13 9 20 9"/>')) },

    // --- BUSINESS & USERS ---
    { id: 'user-1', name: 'User Single', category: 'Simple', tags: ['profile', 'account', 'person'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>')) },
    { id: 'user-2', name: 'Users Group', category: 'Simple', tags: ['team', 'community', 'social'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>')) },
    { id: 'biz-1', name: 'Rocket', category: 'Simple', tags: ['launch', 'startup', 'growth'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.71-2.13.09-2.91a2.18 2.18 0 0 0-3.09-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>')) },
    { id: 'biz-2', name: 'Globe', category: 'Simple', tags: ['world', 'international', 'network'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>')) },
    { id: 'biz-3', name: 'Building', category: 'Simple', tags: ['company', 'office', 'enterprise'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/>')) },
    { id: 'biz-4', name: 'Diamond', category: 'Simple', tags: ['premium', 'gem', 'luxury'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/>')) },

    // --- INTERFACE & UI ---
    { id: 'ui-1', name: 'Check Circle', category: 'Simple', tags: ['done', 'complete', 'success'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>')) },
    { id: 'ui-2', name: 'Info', category: 'Simple', tags: ['help', 'about', 'details'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>')) },
    { id: 'ui-3', name: 'Calendar', category: 'Simple', tags: ['date', 'time', 'schedule'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>')) },
    { id: 'ui-4', name: 'Mail', category: 'Simple', tags: ['email', 'contact', 'message'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>')) },
    { id: 'ui-5', name: 'Settings', category: 'Simple', tags: ['gear', 'tools', 'configure'], premium: false, style: 'outline', fabricObject: createIconObject(iconSVG('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>')) },

    // --- PROFESSIONAL (ENTERPRISE) - SOLID/PREMIUM ---
    { id: 'pro-1', name: 'Elite Certificate', category: 'Professional', tags: ['premium', 'formal', 'graduate'], premium: true, style: 'solid', fabricObject: createIconObject(iconSVG('<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2.7 3 6 3s6-1 6-3v-5" fill="currentColor" opacity="0.3"/><path d="m11 17.5-3.5-3.5 1.4-1.4 2.1 2.1 4.6-4.6 1.4 1.4-6 6z"/>', true)) },
    { id: 'pro-2', name: 'Golden Trophy', category: 'Professional', tags: ['winner', 'gold', 'success'], premium: true, style: 'solid', fabricObject: createIconObject(iconSVG('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>', true)) },
    { id: 'pro-3', name: 'Verified Badge Pro', category: 'Professional', tags: ['verified', 'check', 'official'], premium: true, style: 'solid', fabricObject: createIconObject(iconSVG('<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/><path d="m9 12 2 2 4-4" stroke="white" stroke-width="2"/>', true)) },
    { id: 'pro-4', name: 'Secure Shield', category: 'Professional', tags: ['security', 'lock', 'safe'], premium: true, style: 'solid', fabricObject: createIconObject(iconSVG('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="12" r="3" fill="white"/>', true)) },
    { id: 'pro-5', name: 'Elite Crown', category: 'Professional', tags: ['vip', 'king', 'best'], premium: true, style: 'solid', fabricObject: createIconObject(iconSVG('<path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>', true)) },
    { id: 'pro-6', name: 'Honor Medal', category: 'Professional', tags: ['achievement', 'rank', 'military'], premium: true, style: 'solid', fabricObject: createIconObject(iconSVG('<circle cx="12" cy="8" r="7"/><path d="M8.21 13.89 7 23l5-3 5 3 1.21-9.11" fill="currentColor" opacity="0.4"/>', true)) },
    { id: 'pro-7', name: 'Sparkles', category: 'Professional', tags: ['ai', 'magic', 'new'], premium: true, style: 'solid', fabricObject: createIconObject(iconSVG('<path d="m12 3-1.912 5.813L4.275 10.725 10.088 12.637 12 18.45l1.912-5.813 5.813-1.912-5.813-1.912L12 3Z"/>', true)) },
    { id: 'pro-8', name: 'Global Network', category: 'Professional', premium: true, tags: ['world', 'data', 'connection'], style: 'solid', fabricObject: createIconObject(iconSVG('<circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="currentColor" opacity="0.3"/><path d="M2 12h20"/>', true)) },
    { id: 'pro-9', name: 'Growth Analytics', category: 'Professional', premium: true, tags: ['chart', 'success', 'data'], style: 'solid', fabricObject: createIconObject(iconSVG('<path d="M3 3v18h18"/><path d="m3 15 6-6 6 6 6-11"/>', false)) },
    { id: 'pro-10', name: 'Signature', category: 'Professional', premium: true, tags: ['handwriting', 'official', 'signed'], style: 'outline', fabricObject: createIconObject(iconSVG('<path d="m16 2-4 4-4-4"/><path d="M12 18v-9"/><path d="M12 18c-3 0-5 2-5 4"/><path d="M12 18c3 0 5 2 5 4"/><path d="M17 12c.5-2 2-3 4-3"/><path d="M7 12c-.5-2-2-3-4-3"/>')) },
    { id: 'pro-11', name: 'Fingerprint', category: 'Professional', premium: true, tags: ['biometric', 'security', 'identity'], style: 'outline', fabricObject: createIconObject(iconSVG('<path d="M12 10a2 2 0 0 0-2 2M7 12a5 5 0 0 1 5-5M12 13v.01M17 12a5 5 0 0 0-5-5"/><path d="M2 12a10 10 0 0 1 20 0"/><path d="M12 12a1 1 0 0 0 0 0"/><path d="M12 15a3 3 0 0 1-3-3"/><path d="m15 12-.01.01"/><path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4"/><path d="M12 20a8 8 0 0 1-8-8"/>')) },
    { id: 'pro-12', name: 'Diamond Pro', category: 'Professional', premium: true, tags: ['rich', 'vip', 'premium'], style: 'solid', fabricObject: createIconObject(iconSVG('<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/>', true)) },

    // --- LINEAL COLOR PREMIUM (MATCHING REFERENCE) ---
    { id: 'lin-1', name: 'Golden Badge', category: 'Professional', premium: true, tags: ['award', 'ribbon', 'gold'], style: 'solid', fabricObject: createIconObject(`data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7 14l-2 8 3-2 4 2 4-2 3 2-2-8" fill="#F44336"/><circle cx="12" cy="9" r="7" fill="#FFD700" stroke="#B8860B" stroke-width="1"/><circle cx="12" cy="9" r="5" fill="#FFECB3" opacity="0.5"/><path d="M12 2C8.13 2 5 5.13 5 9c0 3.87 3.13 7 7 7s7-3.13 7-7c0-3.87-3.13-7-7-7z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>')}`) },
    { id: 'lin-2', name: 'Premium Award', category: 'Professional', premium: true, tags: ['star', 'elite', 'success'], style: 'solid', fabricObject: createIconObject(`data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8 15l-3 7 7-3 7 3-3-7" fill="#FF5722"/><circle cx="12" cy="9" r="7" fill="#FFC107"/><path d="M12 5l1.2 2.4 2.8.4-2 2 .5 2.7-2.5-1.3-2.5 1.3.5-2.7-2-2 2.8-.4L12 5z" fill="#FFF"/><path d="M12 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" fill="none" stroke="currentColor" stroke-width="2"/></svg>')}`) },
    { id: 'lin-3', name: 'Royal Seal', category: 'Professional', premium: true, tags: ['luxury', 'verified', 'gold'], style: 'solid', fabricObject: createIconObject(`data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8 15l-2 7 6-3 6 3-2-7" fill="#FFD700"/><path d="M12 2L9.5 3.5 7 2.5 5.5 5 3 6l1 2.5L2.5 11 4 13.5l-1 2.5 2.5 1.5 1.5 2.5 2.5-1 2.5 1.5 2.5-1.5 2.5 1 1.5-2.5L20 16.5l-1-2.5 1.5-2.5-1.5-2.5 1-2.5L17.5 5 16 2.5l-2.5 1L12 2z" fill="#FFC107" stroke="#B8860B" stroke-width="0.5"/><path d="M12 6l1.2 1.8 2.3.2-1.7 1.5.5 2.2-2.3-1.1-2.3 1.1.5-2.2-1.7-1.5 2.3-.2L12 6z" fill="#FFF"/><path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.2"/></svg>')}`) },
    { id: 'lin-4', name: 'Blue Diploma', category: 'Professional', premium: true, tags: ['education', 'degree', 'blue'], style: 'solid', fabricObject: createIconObject(`data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="1" fill="#E3F2FD" stroke="#2196F3" stroke-width="1.5"/><path d="M6 7h8M6 10h10M6 13h5" stroke="#90CAF9" stroke-width="1.5" stroke-linecap="round"/><circle cx="17" cy="15" r="4" fill="#BBDEFB" stroke="#1976D2" stroke-width="1"/><path d="M17 15l1 3-1-1-1 1 1-3z" fill="#1976D2"/></svg>')}`) },
    { id: 'lin-5', name: 'Classic Scroll', category: 'Professional', premium: true, tags: ['old', 'legal', 'history'], style: 'solid', fabricObject: createIconObject(`data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3z" fill="#F5F5F5" stroke="#9E9E9E" stroke-width="1.5"/><path d="M18 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="#FF5252" stroke="#D32F2F" stroke-width="1"/><path d="M18 14l1 3-1-1-1 1 1-3z" fill="#FFF"/><path d="M7 8h8M7 11h6" stroke="#BDBDBD" stroke-width="1.5" stroke-linecap="round"/></svg>')}`) },
    { id: 'lin-6', name: 'Seal Check', category: 'Professional', premium: true, tags: ['verified', 'correct', 'clean'], style: 'outline', fabricObject: createIconObject(`data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 21l-2 2 3-1 3 1-2-2M18 21l-2 2 3-1 3 1-2-2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>')}`) },
    { id: 'lin-7', name: 'Star Shield Solid', category: 'Professional', premium: true, tags: ['rank', 'member', 'elite'], style: 'solid', fabricObject: createIconObject(`data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2L4 5v7c0 6 8 10 8 10s8-4 8-10V5l-8-3z" fill="currentColor"/><path d="M12 7l1.2 2.4 2.8.4-2 2 .5 2.7-2.5-1.3-2.5 1.3.5-2.7-2-2 2.8-.4L12 7z" fill="white"/></svg>')}`) },
];
