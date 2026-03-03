import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { X, Cookie, ShieldCheck, PieChart, Landmark } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const CONSENT_KEY = 'cookie-consent-choice';

type ConsentSettings = {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
};

const defaultSettings: ConsentSettings = {
    essential: true,
    analytics: false,
    marketing: false,
};

export const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [settings, setSettings] = useState<ConsentSettings>(defaultSettings);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const savedConsent = localStorage.getItem(CONSENT_KEY);
        if (!savedConsent) {
            // Small delay for better UX
            const timer = setTimeout(() => {
                setShouldRender(true);
                setIsVisible(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        const allAccepted = { essential: true, analytics: true, marketing: true };
        saveConsent(allAccepted);
    };

    const handleRejectAll = () => {
        const allRejected = { essential: true, analytics: false, marketing: false };
        saveConsent(allRejected);
    };

    const handleSaveCustom = () => {
        saveConsent(settings);
        setIsCustomizing(false);
    };

    const saveConsent = (choice: ConsentSettings) => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify(choice));
        setIsVisible(false);
        // Remove from DOM after transition
        setTimeout(() => setShouldRender(false), 500);
    };

    if (!shouldRender) return null;

    return (
        <>
            <div
                className={`fixed bottom-0 left-0 right-0 z-[100] p-4 transition-all duration-700 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                    }`}
            >
                <div className="max-w-4xl mx-auto">
                    <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 shadow-lg shadow-primary/10">
                                <Cookie className="h-6 w-6 text-primary" />
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-2">
                                <h3 className="text-xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
                                    Cookie Preferences
                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-slate-400">Privacy First</span>
                                </h3>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                    We use cookies to enhance your experience, analyze our traffic, and provide personalized features.
                                    Choose what you're comfortable with. You can change these settings anytime.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsCustomizing(true)}
                                    className="w-full sm:w-auto text-slate-300 hover:text-white hover:bg-white/5 font-bold rounded-xl h-11"
                                >
                                    Customize
                                </Button>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        onClick={handleRejectAll}
                                        className="flex-1 sm:flex-none border-white/10 bg-transparent hover:bg-white/5 text-white font-bold rounded-xl h-11"
                                    >
                                        Reject All
                                    </Button>
                                    <Button
                                        onClick={handleAcceptAll}
                                        className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 rounded-xl h-11"
                                    >
                                        Accept All
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
                <DialogContent className="max-w-md bg-slate-900 text-white border-white/10 rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                            Privacy Settings
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium">
                            Tailor your browsing experience by managing your cookie preferences below.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-6 border-y border-white/5 my-2">
                        {/* Essential */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-4">
                                <div className="mt-1 p-2 bg-white/5 rounded-lg border border-white/5 shrink-0">
                                    <Landmark className="h-4 w-4 text-slate-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-sm">Essential Cookies</p>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Necessary for the website to function. Cannot be disabled.</p>
                                </div>
                            </div>
                            <Switch checked={true} disabled className="data-[state=checked]:bg-primary" />
                        </div>

                        {/* Analytics */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-4">
                                <div className="mt-1 p-2 bg-white/5 rounded-lg border border-white/5 shrink-0">
                                    <PieChart className="h-4 w-4 text-slate-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-sm">Analytics</p>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Help us understand how visitors interact with the site.</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.analytics}
                                onCheckedChange={(checked) => setSettings(s => ({ ...s, analytics: checked }))}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>

                        {/* Marketing */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-4">
                                <div className="mt-1 p-2 bg-white/5 rounded-lg border border-white/5 shrink-0">
                                    <Cookie className="h-4 w-4 text-slate-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-sm">Marketing</p>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Used to deliver more relevant advertisements to you.</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.marketing}
                                onCheckedChange={(checked) => setSettings(s => ({ ...s, marketing: checked }))}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsCustomizing(false)}
                            className="font-bold text-slate-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveCustom}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-8 rounded-xl h-11"
                        >
                            Save Preferences
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
