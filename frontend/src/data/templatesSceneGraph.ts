import type { CertificateTemplate } from '@/types/certificate';

export const certificateTemplates: CertificateTemplate[] = [
    {
        id: '1',
        name: 'Classic Elegant',
        category: 'participation',
        preview: '/showcase-filled/1.png',
        sceneGraph: {
            version: '1.0.0',
            root: {
                id: 'root',
                type: 'root',
                width: 2000,
                height: 1500,
                backgroundColor: '#ffffff',
                transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                visible: true,
                opacity: 1,
                locked: false,
                selectable: false,
                children: [
                    { id: 'bg-image-1', type: 'image', src: '/uploads/certificates/1.png', width: 2000, height: 1500, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }, visible: true, opacity: 1, locked: true, selectable: false, role: 'decoration' }
                ]
            }
        }
    },
    {
        id: '2',
        name: 'Professional Blue',
        category: 'achievement',
        preview: '/showcase-filled/2.png',
        sceneGraph: {
            version: '1.0.0',
            root: {
                id: 'root',
                type: 'root',
                width: 2000,
                height: 1500,
                backgroundColor: '#ffffff',
                transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                visible: true,
                opacity: 1,
                locked: false,
                selectable: false,
                children: [
                    { id: 'bg-image-2', type: 'image', src: '/uploads/certificates/2.png', width: 2000, height: 1500, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }, visible: true, opacity: 1, locked: true, selectable: false, role: 'decoration' }
                ]
            }
        }
    },
    {
        id: '3',
        name: 'Modern Gold',
        category: 'award',
        preview: '/showcase-filled/3.png',
        sceneGraph: {
            version: '1.0.0',
            root: {
                id: 'root',
                type: 'root',
                width: 2000,
                height: 1500,
                backgroundColor: '#ffffff',
                transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                visible: true,
                opacity: 1,
                locked: false,
                selectable: false,
                children: [
                    { id: 'bg-image-3', type: 'image', src: '/uploads/certificates/3.png', width: 2000, height: 1500, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }, visible: true, opacity: 1, locked: true, selectable: false, role: 'decoration' }
                ]
            }
        }
    },
    {
        id: '4',
        name: 'Corporate Grey',
        category: 'completion',
        preview: '/showcase-filled/4.png',
        sceneGraph: {
            version: '1.0.0',
            root: {
                id: 'root',
                type: 'root',
                width: 2000,
                height: 1500,
                backgroundColor: '#ffffff',
                transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                visible: true,
                opacity: 1,
                locked: false,
                selectable: false,
                children: [
                    { id: 'bg-image-4', type: 'image', src: '/uploads/certificates/4.png', width: 2000, height: 1500, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }, visible: true, opacity: 1, locked: true, selectable: false, role: 'decoration' }
                ]
            }
        }
    },
    {
        id: '5',
        name: 'Simple Border',
        category: 'participation',
        preview: '/showcase-filled/5.png',
        sceneGraph: {
            version: '1.0.0',
            root: {
                id: 'root',
                type: 'root',
                width: 2000,
                height: 1500,
                backgroundColor: '#ffffff',
                transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                visible: true,
                opacity: 1,
                locked: false,
                selectable: false,
                children: [
                    { id: 'bg-image-5', type: 'image', src: '/uploads/certificates/5.png', width: 2000, height: 1500, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }, visible: true, opacity: 1, locked: true, selectable: false, role: 'decoration' }
                ]
            }
        }
    },
    {
        id: '6',
        name: 'Vibrant Colors',
        category: 'achievement',
        preview: '/showcase-filled/6.png',
        sceneGraph: {
            version: '1.0.0',
            root: {
                id: 'root',
                type: 'root',
                width: 2000,
                height: 1500,
                backgroundColor: '#ffffff',
                transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                visible: true,
                opacity: 1,
                locked: false,
                selectable: false,
                children: [
                    { id: 'bg-image-6', type: 'image', src: '/uploads/certificates/6.png', width: 2000, height: 1500, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }, visible: true, opacity: 1, locked: true, selectable: false, role: 'decoration' }
                ]
            }
        }
    },
    {
        id: '7',
        name: 'Executive Award',
        category: 'award',
        preview: '/showcase-filled/7.png',
        sceneGraph: {
            version: '1.0.0',
            root: {
                id: 'root',
                type: 'root',
                width: 2000,
                height: 1500,
                backgroundColor: '#ffffff',
                transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
                visible: true,
                opacity: 1,
                locked: false,
                selectable: false,
                children: [
                    { id: 'bg-image-7', type: 'image', src: '/uploads/certificates/7.png', width: 2000, height: 1500, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 }, visible: true, opacity: 1, locked: true, selectable: false, role: 'decoration' }
                ]
            }
        }
    }
];

export const templateCategories = [
    { id: 'all', name: 'All' },
    { id: 'participation', name: 'Participation' },
    { id: 'achievement', name: 'Achievement' },
    { id: 'completion', name: 'Completion' },
    { id: 'award', name: 'Award' },
];
