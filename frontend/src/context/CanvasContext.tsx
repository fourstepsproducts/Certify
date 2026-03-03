import { createContext, useContext } from 'react';
import { UseCanvasReturn } from '@/hooks/useCanvas';

export const CanvasContext = createContext<UseCanvasReturn | null>(null);

export const useCanvasContext = () => {
    const context = useContext(CanvasContext);
    if (!context) {
        throw new Error('useCanvasContext must be used within a CanvasProvider (CanvasContext.Provider)');
    }
    return context;
};
