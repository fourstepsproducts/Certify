import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Link2, Mail, ArrowLeft, RefreshCw, Trash2, CheckCircle, ChevronDown, FileText, Settings2, Plus, Layout, Upload, Trophy, Maximize2, ChevronRight, Check, Edit3, Loader2, X, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/landing/Header';
import { FieldMappingDialog } from '@/components/module/FieldMappingDialog';
import { TemplateSelectionDialog } from '@/components/module/TemplateSelectionDialog';
import { EditorDialog } from '@/components/module/EditorDialog';
import { CertificateFormatBuilder, SerialToken } from '@/components/module/CertificateFormatBuilder';

interface Module {
    _id: string;
    name: string;
    isPaid: boolean;
    entryFee: number;
    paymentConfig?: {
        razorpayKeyId?: string;
        paymentMethod?: string;
        status?: string;
    };
    certificateConfig?: {
        templateId?: string;
        fieldMapping?: Record<string, string>;
        certNumberPrefix?: string;
        serialFormat?: SerialToken[];
        serialCounter?: number;
    };
}

interface Registration {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    submittedAt: string;
    customData?: Record<string, any>;
}

interface Feedback {
    _id: string;
    email: string;
    feedback: string;
    submittedAt: string;
}

interface QueueItem {
    _id: string;
    email: string;
    name: string;
    status: 'eligible' | 'pending' | 'ineligible' | 'sent';
    sentAt?: string;
    certificateNumber?: string;
}

interface Template {
    _id: string;
    name: string;
    thumbnail?: string;
    category?: string;
    updatedAt: string;
}

interface CustomField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'dropdown' | 'checkbox' | 'email';
    required: boolean;
    options?: string[];
    placeholder?: string;
}

const ModuleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();

    const [module, setModule] = useState<Module | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const [registrationLink, setRegistrationLink] = useState('');
    const [feedbackLink, setFeedbackLink] = useState('');
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [rowLimit, setRowLimit] = useState(10);
    const [inputLimit, setInputLimit] = useState(10);
    const [visibleCount, setVisibleCount] = useState(10);
    const [certNumberPrefix, setCertNumberPrefix] = useState('');
    const [isSavingCertConfig, setIsSavingCertConfig] = useState(false);


    const filteredRegistrations = useMemo(() => {
        return registrations.filter(reg => {
            const query = searchQuery.toLowerCase();
            const matchesText = !searchQuery || (
                reg.name.toLowerCase().includes(query) ||
                reg.email.toLowerCase().includes(query) ||
                reg.phoneNumber?.includes(searchQuery) ||
                (reg.customData && Object.values(reg.customData).some(val =>
                    String(val).toLowerCase().includes(query)
                ))
            );

            const matchesDate = !searchDate || (
                new Date(reg.submittedAt).toLocaleDateString('en-CA') === searchDate ||
                new Date(reg.submittedAt).toISOString().startsWith(searchDate)
            );

            return matchesText && matchesDate;
        });
    }, [registrations, searchQuery, searchDate]);

    // reset visible count when filter changes? optional. 
    // If user filters, they likely want to see top results first.
    useEffect(() => {
        setVisibleCount(rowLimit);
    }, [filteredRegistrations.length, rowLimit]); // reset if list changes significantly or user changes base limit

    // Field creation/editing state
    const [isEditing, setIsEditing] = useState(false);
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'dropdown' | 'checkbox' | 'email'>('text');
    const [newFieldRequired, setNewFieldRequired] = useState(false);
    const [newFieldOptions, setNewFieldOptions] = useState('');
    const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isModulePaid, setIsModulePaid] = useState(false);
    const [moduleAmount, setModuleAmount] = useState(0);
    const [razorpayKeyId, setRazorpayKeyId] = useState('');
    const [razorpaySecret, setRazorpaySecret] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('checkout');
    const [paymentStatus, setPaymentStatus] = useState('not_configured');
    const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
    const [savedRazorpayKeyId, setSavedRazorpayKeyId] = useState('');
    const [savedEntryFee, setSavedEntryFee] = useState(0);
    const [showGlobalNotification, setShowGlobalNotification] = useState(false);
    const [isUsingSaved, setIsUsingSaved] = useState(false);
    const [savedConfigs, setSavedConfigs] = useState<{ moduleId: string, moduleName: string, razorpayKeyId: string, entryFee: number }[]>([]);
    const [selectedSourceModuleId, setSelectedSourceModuleId] = useState<string | null>(null);
    const [showSavedDropdown, setShowSavedDropdown] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Invalid file',
                description: 'Please upload an image (PNG, JPG, etc.)',
                variant: 'destructive'
            });
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const dataUrl = e.target?.result as string;
            const img = new Image();
            img.onload = async () => {
                // Cap resolution at 2000px width for better performance while maintaining quality
                const maxWidth = 2000;
                const uploadScale = img.width > maxWidth ? maxWidth / img.width : 1;
                const width = img.width * uploadScale;
                const height = img.height * uploadScale;

                try {
                    const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/templates`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            name: `Uploaded Template - ${new Date().toLocaleDateString()}`,
                            category: 'uploaded',
                            thumbnail: dataUrl,
                            canvasData: {
                                version: '5.3.0',
                                objects: [{
                                    type: 'image',
                                    src: dataUrl,
                                    left: 0,
                                    top: 0,
                                    width: width,
                                    height: height,
                                    selectable: false,
                                    evented: false,
                                    role: 'background'
                                }],
                                width: width,
                                height: height,
                                backgroundColor: '#ffffff'
                            }
                        })
                    });

                    if (!response.ok) throw new Error('Failed to create template');
                    const newTemplate = await response.json();

                    // Immediately update module config to use this template
                    await updateCertificateConfig({
                        templateId: newTemplate._id,
                        fieldMapping: {} // Clear mapping for new template
                    });

                    toast({
                        title: 'Success',
                        description: 'Template uploaded and selected successfully'
                    });

                    // Refresh data
                    fetchModuleData();

                    // Optional: Open editor to add text fields
                    setShowEditor(true);

                } catch (error) {
                    console.error('Upload error:', error);
                    toast({
                        title: 'Error',
                        description: 'Failed to upload template',
                        variant: 'destructive'
                    });
                } finally {
                    setUploading(false);
                }
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };
    const [matching, setMatching] = useState(false);
    const [sending, setSending] = useState(false);
    const [loadingEligible, setLoadingEligible] = useState(false);
    const [showMappingDialog, setShowMappingDialog] = useState(false);
    const [showTemplateSelection, setShowTemplateSelection] = useState(false);
    const [showEditor, setShowEditor] = useState(false);

    const fetchOrganizerSettings = useCallback(async () => {
        try {
            const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/organizer-settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.hasSavedCredentials) {
                    setHasSavedCredentials(true);
                    setSavedConfigs(data.savedConfigs || []);

                    if (data.savedConfigs && data.savedConfigs.length > 0) {
                        setSavedRazorpayKeyId(data.savedConfigs[0].razorpayKeyId);
                        setSavedEntryFee(data.savedConfigs[0].entryFee);
                        setShowGlobalNotification(true);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching organizer settings:', error);
        }
    }, [user, paymentStatus]);

    const useSavedCredential = (config: { moduleId: string, moduleName: string, razorpayKeyId: string, entryFee: number }) => {
        setRazorpayKeyId(config.razorpayKeyId);
        setRazorpaySecret('********'); // Masked placeholder
        setModuleAmount(config.entryFee);
        setSelectedSourceModuleId(config.moduleId);
        setIsUsingSaved(true);
        setShowGlobalNotification(false);
        setShowSavedDropdown(false);
        toast({
            title: `Using Credentials from ${config.moduleName}`,
            description: 'Credentials applied successfully.'
        });
    };

    const useSavedCredentials = () => {
        setShowSavedDropdown(!showSavedDropdown);
    };

    const configurePaymentsManually = () => {
        setRazorpayKeyId('');
        setRazorpaySecret('');
        setIsUsingSaved(false);
        setShowGlobalNotification(false);
    };

    const fetchModuleData = useCallback(async () => {
        try {
            const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;

            // Fetch module details
            const moduleRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/modules/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!moduleRes.ok) throw new Error('Failed to fetch module');
            const moduleData = await moduleRes.json();
            setModule(moduleData);
            setIsModulePaid(moduleData.isPaid || false);
            setModuleAmount(moduleData.entryFee || 0);

            if (moduleData.paymentConfig) {
                setRazorpayKeyId(moduleData.paymentConfig.razorpayKeyId || '');
                setPaymentMethod(moduleData.paymentConfig.paymentMethod || 'checkout');
                setPaymentStatus(moduleData.paymentConfig.status || 'not_configured');
            }

            // Set selected template from config if exists
            if (moduleData.certificateConfig?.templateId) {
                setSelectedTemplate(moduleData.certificateConfig.templateId);
            }

            if (moduleData.certificateConfig?.certNumberPrefix !== undefined) {
                setCertNumberPrefix(moduleData.certificateConfig.certNumberPrefix);
            }

            // Fetch registrations
            const regRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/registrations/module/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (regRes.ok) {
                const regData = await regRes.json();
                setRegistrations(regData);
            }

            // Fetch feedback
            const feedbackRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/feedback/module/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (feedbackRes.ok) {
                const feedbackData = await feedbackRes.json();
                setFeedback(feedbackData);
            }

            // Fetch certificate queue
            const queueRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/certificates/queue/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (queueRes.ok) {
                const queueData = await queueRes.json();
                setQueue(queueData);
            }

            // Fetch templates
            const templatesRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/templates`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (templatesRes.ok) {
                const templatesData = await templatesRes.json();
                setTemplates(templatesData);
            }

            // Fetch registration link config
            const linkRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/registrations/link/module/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (linkRes.ok) {
                const linkData = await linkRes.json();
                const link = `${window.location.origin}/register/${linkData.linkId}`;
                setRegistrationLink(link);
                if (linkData.customFields && linkData.customFields.length > 0) {
                    setCustomFields(linkData.customFields);
                } else {
                    // Set default fields if no custom fields exist
                    setCustomFields([
                        {
                            id: crypto.randomUUID(),
                            label: 'Full Name',
                            type: 'text',
                            required: true,
                            placeholder: 'Enter your full name'
                        },
                        {
                            id: crypto.randomUUID(),
                            label: 'Email Address',
                            type: 'email',
                            required: true,
                            placeholder: 'Enter your email'
                        },
                        {
                            id: crypto.randomUUID(),
                            label: 'Phone Number',
                            type: 'number',
                            required: true,
                            placeholder: 'Enter your phone number'
                        }
                    ]);
                }
            } else {
                // Set default fields if no link config exists yet
                setCustomFields([
                    {
                        id: crypto.randomUUID(),
                        label: 'Full Name',
                        type: 'text',
                        required: true,
                        placeholder: 'Enter your full name'
                    },
                    {
                        id: crypto.randomUUID(),
                        label: 'Email Address',
                        type: 'email',
                        required: true,
                        placeholder: 'Enter your email'
                    },
                    {
                        id: crypto.randomUUID(),
                        label: 'Phone Number',
                        type: 'number',
                        required: true,
                        placeholder: 'Enter your phone number'
                    }
                ]);
            }

        } catch (error) {
            console.error('Error fetching module data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load module data',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [id, user, toast]);

    const savePaymentSettings = async () => {
        if (moduleAmount < 0) {
            toast({ title: 'Error', description: 'Entry Fee cannot be negative', variant: 'destructive' });
            return;
        }
        if (!razorpayKeyId) {
            toast({ title: 'Error', description: 'Please enter a Razorpay Key ID', variant: 'destructive' });
            return;
        }
        if (!razorpayKeyId.startsWith('rzp_')) {
            toast({ title: 'Error', description: 'Key ID must start with rzp_', variant: 'destructive' });
            return;
        }
        if (!isUsingSaved && !razorpaySecret) {
            toast({ title: 'Error', description: 'Please enter a Razorpay Secret Key', variant: 'destructive' });
            return;
        }

        setIsUpdatingSettings(true);
        try {
            const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/settings/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    entryFee: moduleAmount,
                    razorpayKeyId,
                    razorpaySecret: isUsingSaved ? '********' : razorpaySecret,
                    paymentMethod,
                    fromModuleId: selectedSourceModuleId
                })
            });

            if (!res.ok) throw new Error('Failed to save payment settings');

            const data = await res.json();
            setPaymentStatus(data.paymentConfig.status);
            if (!isUsingSaved) setRazorpaySecret(''); // Clear secret from state after save

            if (res.ok) {
                setHasSavedCredentials(true);
                setSavedRazorpayKeyId(razorpayKeyId);
                await fetchOrganizerSettings(); // Refresh the list of saved configs
            }

            // Update local module state too
            setModule(prev => prev ? {
                ...prev,
                entryFee: moduleAmount,
                isPaid: true
            } : null);

            toast({
                title: 'Success',
                description: 'Payment settings saved successfully.'
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsUpdatingSettings(false);
        }
    };

    const testPaymentConnection = async () => {
        setIsTestingConnection(true);
        try {
            const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/test-connection/${id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Connection failed');
            }

            toast({
                title: 'Connection Verified ✓',
                description: 'Successfully connected to Razorpay account.'
            });
        } catch (error: any) {
            toast({
                title: 'Connection Failed',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsTestingConnection(false);
        }
    };

    const updateModuleSettings = async (updates: { isPaid?: boolean; entryFee?: number; name?: string }) => {
        setIsUpdatingSettings(true);
        try {
            const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/modules/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (!res.ok) throw new Error('Failed to update module settings');

            const updatedModule = await res.json();
            setModule(updatedModule);
            setIsModulePaid(updatedModule.isPaid || false);
            setModuleAmount(updatedModule.entryFee || 0);

            toast({
                title: 'Settings Saved',
                description: 'Module settings updated successfully.'
            });
        } catch (error: any) {
            toast({
                title: 'Update Failed',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsUpdatingSettings(false);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/signin');
            return;
        }
        fetchModuleData();
        fetchOrganizerSettings();

        const onFocus = () => {
            fetchModuleData();
            fetchOrganizerSettings();
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchModuleData, fetchOrganizerSettings, user, navigate]);

    const handleEditField = (field: CustomField) => {
        setIsEditing(true);
        setEditingFieldId(field.id);
        setNewFieldLabel(field.label);
        setNewFieldType(field.type);
        setNewFieldRequired(field.required);
        setNewFieldOptions(field.options ? field.options.join(', ') : '');
        setNewFieldPlaceholder(field.placeholder || '');
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditingFieldId(null);
        setNewFieldLabel('');
        setNewFieldType('text');
        setNewFieldRequired(false);
        setNewFieldOptions('');
        setNewFieldPlaceholder('');
    };

    const createRegistrationLink = async () => {
        // Validation: Verify if Certificate Number Format has been configured
        const isFormatConfigured = module?.certificateConfig?.serialFormat && module.certificateConfig.serialFormat.length > 0;

        if (!isFormatConfigured) {
            toast({
                title: "Certificate Format Required",
                description: "You must configure and save the Certificate Number Format section below before generating the registration link.",
                variant: "destructive"
            });

            // Auto-scroll to the format section
            const formatSection = document.getElementById('certificate-format-section');
            if (formatSection) {
                formatSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        try {
            // Save certificate config (including prefix) first
            await updateCertificateConfig({ certNumberPrefix });

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/registrations/link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token || JSON.parse(localStorage.getItem('user') || '{}').token}`
                },
                body: JSON.stringify({ moduleId: id, customFields })
            });

            if (!response.ok) throw new Error('Failed to create link');

            const data = await response.json();
            const link = `${window.location.origin}/register/${data.linkId}`;
            setRegistrationLink(link);

            toast({
                title: 'Success',
                description: 'Registration link created'
            });
        } catch (error) {
            console.error('Error creating registration link:', error);
            toast({
                title: 'Error',
                description: 'Failed to create registration link',
                variant: 'destructive'
            });
        }
    };

    const createFeedbackLink = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/feedback/link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token || JSON.parse(localStorage.getItem('user') || '{}').token}`
                },
                body: JSON.stringify({ moduleId: id })
            });

            if (!response.ok) throw new Error('Failed to create link');

            const data = await response.json();
            const link = `${window.location.origin}/feedback/${data.linkId}`;
            setFeedbackLink(link);

            toast({
                title: 'Success',
                description: 'Feedback link created'
            });
        } catch (error) {
            console.error('Error creating feedback link:', error);
            toast({
                title: 'Error',
                description: 'Failed to create feedback link',
                variant: 'destructive'
            });
        }
    };

    const matchEmails = async () => {
        setMatching(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/certificates/match/${id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token || JSON.parse(localStorage.getItem('user') || '{}').token}`
                }
            });

            if (!response.ok) throw new Error('Failed to match emails');

            const data = await response.json();

            toast({
                title: 'Success',
                description: `Matched ${data.eligibleCount} eligible users, ${data.pendingCount} pending, and ${data.ineligibleCount} ineligible`
            });

            // Refresh queue
            const queueRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/certificates/queue/${id}`, {
                headers: { 'Authorization': `Bearer ${user?.token || JSON.parse(localStorage.getItem('user') || '{}').token}` }
            });
            if (queueRes.ok) {
                const queueData = await queueRes.json();
                setQueue(queueData);
            }
        } catch (error) {
            console.error('Error matching emails:', error);
            toast({
                title: 'Error',
                description: 'Failed to match emails',
                variant: 'destructive'
            });
        } finally {
            setMatching(false);
        }
    };

    const updateCertificateConfig = async (config: { templateId?: string; fieldMapping?: Record<string, string>; certNumberPrefix?: string; serialFormat?: SerialToken[]; serialCounter?: number }) => {
        try {
            const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;
            // Merge nested config carefully
            const currentConfig = module?.certificateConfig || {};

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/modules/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    certificateConfig: {
                        templateId: config.templateId || currentConfig.templateId,
                        fieldMapping: config.fieldMapping || currentConfig.fieldMapping || {},
                        certNumberPrefix: config.certNumberPrefix !== undefined ? config.certNumberPrefix : currentConfig.certNumberPrefix,
                        serialFormat: config.serialFormat || currentConfig.serialFormat || [],
                        serialCounter: config.serialCounter !== undefined ? config.serialCounter : (currentConfig.serialCounter || 0)
                    }
                })
            });

            if (!res.ok) throw new Error('Failed to update certificate configuration');

            const updatedModule = await res.json();
            setModule(updatedModule);

            if (updatedModule.certificateConfig?.certNumberPrefix) {
                setCertNumberPrefix(updatedModule.certificateConfig.certNumberPrefix);
            }

            if (config.templateId) {
                setSelectedTemplate(config.templateId);
            }

            toast({
                title: 'Success',
                description: 'Certificate configuration updated'
            });

            return updatedModule;
        } catch (error) {
            console.error('Error updating certificate config:', error);
            toast({
                title: 'Error',
                description: 'Failed to update certificate configuration',
                variant: 'destructive'
            });
            return null;
        }
    };

    const sendCertificates = async () => {
        if (!selectedTemplate) {
            toast({
                title: 'Error',
                description: 'Please select a certificate template',
                variant: 'destructive'
            });
            return;
        }

        setSending(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/certificates/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token || JSON.parse(localStorage.getItem('user') || '{}').token}`
                },
                body: JSON.stringify({ moduleId: id, templateId: selectedTemplate })
            });

            if (!response.ok) throw new Error('Failed to send certificates');

            const data = await response.json();

            toast({
                title: 'Success',
                description: `Sent ${data.successCount} certificates successfully`
            });

            // Refresh queue
            fetchModuleData();
        } catch (error) {
            console.error('Error sending certificates:', error);
            toast({
                title: 'Error',
                description: 'Failed to send certificates',
                variant: 'destructive'
            });
        } finally {
            setSending(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied',
            description: 'Link copied to clipboard'
        });
    };

    const proceedToGenerate = async () => {
        setLoadingEligible(true);
        try {
            const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;

            // Fetch eligible students data
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/certificates/eligible/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch eligible students');

            const eligibleData = await response.json();

            if (eligibleData.count === 0) {
                toast({
                    title: 'No Eligible Students',
                    description: 'There are currently no eligible students for certificate generation.',
                    variant: 'destructive'
                });
                return;
            }

            // Navigate to editor with pre-loaded bulk data
            navigate('/editor', {
                state: {
                    moduleId: id,
                    moduleName: module?.name,
                    bulkData: eligibleData.data,
                    bulkColumns: eligibleData.columns,
                    autoLoadBulk: true
                }
            });
        } catch (error) {
            console.error('Error fetching eligible students:', error);
            toast({
                title: 'Error',
                description: 'Failed to load eligible students',
                variant: 'destructive'
            });
        } finally {
            setLoadingEligible(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading module...</p>
                </div>
            </div>
        );
    }

    const eligibleItems = queue.filter(item => item.status === 'eligible' || item.status === 'sent');
    const pendingItems = queue.filter(item => item.status === 'pending');
    const ineligibleItems = queue.filter(item => item.status === 'ineligible');

    const getFieldLabel = (sourceKey: string) => {
        if (sourceKey === 'name') return 'Full Name';
        if (sourceKey === 'email') return 'Email Address';
        if (sourceKey === 'phoneNumber') return 'Phone Number';
        if (sourceKey === 'date') return 'Current Date';
        if (sourceKey === 'submittedAt') return 'Registration Date';
        if (sourceKey === 'feedback.feedback') return 'Feedback Content';
        if (sourceKey.startsWith('custom.')) {
            const label = sourceKey.replace('custom.', '');
            return label;
        }
        return sourceKey;
    };

    const getSerialPreview = (index: number) => {
        const config = module?.certificateConfig;

        if (!config?.serialFormat || config.serialFormat.length === 0) {
            return (config?.certNumberPrefix || '') + (index + 1).toString().padStart(3, '0');
        }

        const d = new Date();
        const baseCounter = config.serialCounter || 0;
        const currentVal = baseCounter + (index + 1);

        let hasCounter = false;
        const result = config.serialFormat.map(token => {
            switch (token.type) {
                case 'text': return token.value || '';
                case 'separator': return token.value || '';
                case 'year':
                    return (token.value === 'YY') ? String(d.getFullYear()).slice(-2) : String(d.getFullYear());
                case 'month':
                    if (token.value === 'Name') return d.toLocaleString('default', { month: 'long' });
                    return String(d.getMonth() + 1).padStart(2, '0');
                case 'date':
                    return String(d.getDate()).padStart(2, '0');
                case 'counter':
                    hasCounter = true;
                    return String(currentVal).padStart(token.length || 3, '0');
                default: return '';
            }
        }).join('');

        if (!hasCounter) {
            return result + String(currentVal).padStart(3, '0');
        }
        return result;
    };

    return (
        <div className="min-h-screen flex flex-col text-slate-900 relative overflow-hidden dashboard-mixed-bg">
            {/* Dark Marketing Header Wrapper to create separation */}
            <div className="relative z-20 w-full bg-[#0A0F1E] shadow-xl border-b-[1px] border-indigo-500/10">
                <Header />
            </div>

            <div className="container mx-auto px-4 py-8 flex-1 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => navigate('/modules')} className="mb-4 text-slate-500 hover:text-[#4F46E5] hover:bg-[#4F46E5]/10 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Modules
                    </Button>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">{module?.name}</h1>
                    <p className="text-slate-600">Manage registrations, feedback, and certificates</p>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="registrations" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 p-1 bg-white/60 backdrop-blur-md border border-white/20 shadow-sm rounded-xl">
                        <TabsTrigger
                            value="registrations"
                            className="transition-all rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A78BFA] data-[state=active]:to-[#60A5FA] data-[state=active]:text-white shadow-none"
                        >
                            Registrations ({registrations.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="feedback"
                            className="transition-all rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A78BFA] data-[state=active]:to-[#60A5FA] data-[state=active]:text-white shadow-none"
                        >
                            Feedback ({feedback.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="certificates"
                            className="transition-all rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A78BFA] data-[state=active]:to-[#60A5FA] data-[state=active]:text-white shadow-none"
                        >
                            Certificates ({eligibleItems.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Registrations Tab */}
                    <TabsContent value="registrations" className="space-y-6">
                        {/* Payment Settings Card */}
                        {isModulePaid && (
                            <Card className="card-premium-light border-blue-200">
                                <CardHeader className="accent-line-gradient">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex flex-col">
                                            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <CreditCard className="h-4 w-4" />
                                                </div>
                                                Payment Configuration
                                            </CardTitle>
                                            <CardDescription>Setup your Razorpay credentials for this paid module</CardDescription>
                                        </div>
                                        {paymentStatus === 'connected' && (
                                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 px-3 py-1 gap-1">
                                                <CheckCircle className="h-3 w-3" /> Connected ✓
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {showGlobalNotification && (
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 mb-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600">
                                                        <CreditCard className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">Saved Credentials Library</p>
                                                        <p className="text-xs text-slate-500">View and reuse settings across your modules.</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={useSavedCredentials}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 flex items-center gap-2"
                                                >
                                                    Use Saved Credential
                                                    <ChevronDown className={`h-4 w-4 transition-transform ${showSavedDropdown ? 'rotate-180' : ''}`} />
                                                </Button>
                                            </div>

                                            {showSavedDropdown && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-1 animate-in zoom-in-95 fade-in duration-200">
                                                    {savedConfigs?.map(config => (
                                                        <Button
                                                            key={config.moduleId}
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => useSavedCredential(config)}
                                                            className={`group justify-start border-blue-100 hover:border-blue-500 hover:bg-blue-50 bg-white/60 text-slate-700 h-auto py-2.5 px-3 text-left transition-all hover:shadow-md ${config.moduleId === id ? 'ring-2 ring-blue-400 border-blue-400 bg-blue-50/50' : ''}`}
                                                        >
                                                            <div className="flex flex-col items-start overflow-hidden w-full">
                                                                <div className="flex items-center justify-between w-full">
                                                                    <span className="font-bold text-slate-900 group-hover:text-blue-700 truncate">{config.moduleName}</span>
                                                                    {config.moduleId === id && <Badge className="text-[9px] h-4 bg-blue-100 text-blue-700 border-none ml-1">Current</Badge>}
                                                                </div>
                                                                <div className="flex items-center justify-between w-full mt-0.5">
                                                                    <span className="text-[10px] text-slate-500 truncate">{config.razorpayKeyId}</span>
                                                                    <span className="text-[10px] font-semibold text-emerald-600 ml-2">₹{config.entryFee}</span>
                                                                </div>
                                                            </div>
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {isUsingSaved && (
                                        <div className="flex items-center gap-2 mb-4 bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs font-semibold w-fit">
                                            <CheckCircle className="h-3.5 w-3.5" />
                                            Using Saved Credentials
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="entry-fee" className="text-sm font-semibold text-slate-700">Entry Fee (INR)</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                <Input
                                                    id="entry-fee"
                                                    type="number"
                                                    placeholder="0"
                                                    className="pl-8 bg-white border-slate-200"
                                                    value={moduleAmount !== undefined && moduleAmount !== null ? moduleAmount : ''}
                                                    onChange={(e) => setModuleAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-slate-700">Payment Collection Method</Label>
                                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                                <SelectTrigger className="bg-white border-slate-200">
                                                    <SelectValue placeholder="Select Method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="checkout">Razorpay Checkout (Recommended)</SelectItem>
                                                    <SelectItem value="link">Generate Payment Link</SelectItem>
                                                    <SelectItem value="upi_qr">Show QR Code (UPI Manual)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="razorpay-key" className="text-sm font-semibold text-slate-700">Razorpay Key ID</Label>
                                            <Input
                                                id="razorpay-key"
                                                placeholder="rzp_live_..."
                                                className="bg-white border-slate-200"
                                                value={razorpayKeyId}
                                                onChange={(e) => {
                                                    setRazorpayKeyId(e.target.value);
                                                    if (isUsingSaved) {
                                                        setIsUsingSaved(false);
                                                        setSelectedSourceModuleId(null);
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="razorpay-secret" className="text-sm font-semibold text-slate-700">Razorpay Secret Key</Label>
                                            <Input
                                                id="razorpay-secret"
                                                type="password"
                                                placeholder={paymentStatus === 'connected' ? "••••••••••••••••" : "Enter Secret Key"}
                                                className="bg-white border-slate-200"
                                                value={razorpaySecret}
                                                onChange={(e) => {
                                                    setRazorpaySecret(e.target.value);
                                                    if (isUsingSaved) {
                                                        setIsUsingSaved(false);
                                                        setSelectedSourceModuleId(null);
                                                    }
                                                }}
                                            />
                                            <p className="text-[10px] text-slate-400">Secret key is encrypted and never shown again.</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                                        <Button
                                            disabled={isUpdatingSettings}
                                            onClick={savePaymentSettings}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all active:scale-[0.98]"
                                        >
                                            {isUpdatingSettings ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Settings2 className="mr-2 h-4 w-4" />
                                            )}
                                            Save Credentials
                                        </Button>

                                        {paymentStatus === 'connected' && (
                                            <Button
                                                variant="outline"
                                                disabled={isTestingConnection}
                                                onClick={testPaymentConnection}
                                                className="border-slate-200 hover:bg-slate-50 text-slate-700"
                                            >
                                                {isTestingConnection ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                )}
                                                Test Connection
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="card-premium-light">
                            <CardHeader className="accent-line-gradient">
                                <CardTitle className="text-xl font-bold text-slate-900">Customize Registration Form</CardTitle>
                                <CardDescription>Add custom fields to your registration form</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-5 border rounded-xl bg-slate-50/50 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-sm text-slate-900">
                                            {isEditing ? 'Edit Field' : 'Add Custom Field'}
                                        </h4>
                                        {isEditing && (
                                            <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-8 text-slate-500">
                                                Cancel
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 items-start">
                                        <div className="flex-1 w-full">
                                            <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Field Label</Label>
                                            <Input
                                                value={newFieldLabel}
                                                onChange={(e) => setNewFieldLabel(e.target.value)}
                                                placeholder="e.g., Organization, Job Title"
                                                className="bg-white focus-visible:ring-blue-500"
                                            />
                                        </div>
                                        <div className="w-full md:w-[200px]">
                                            <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Field Type</Label>
                                            <Select value={newFieldType} onValueChange={(val: any) => setNewFieldType(val)}>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Text</SelectItem>
                                                    <SelectItem value="email">Email</SelectItem>
                                                    <SelectItem value="number">Number</SelectItem>
                                                    <SelectItem value="dropdown">Dropdown</SelectItem>
                                                    <SelectItem value="checkbox">Checkbox (Yes/No)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {newFieldType !== 'checkbox' && (
                                        <div>
                                            <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Placeholder Text</Label>
                                            <Input
                                                value={newFieldPlaceholder}
                                                onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                                                placeholder="e.g., Enter your job title"
                                                className="bg-white"
                                            />
                                        </div>
                                    )}

                                    {newFieldType === 'dropdown' && (
                                        <div>
                                            <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Options (comma separated)</Label>
                                            <Input
                                                value={newFieldOptions}
                                                onChange={(e) => setNewFieldOptions(e.target.value)}
                                                placeholder="Option 1, Option 2, Option 3"
                                                className="bg-white"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="required"
                                                checked={newFieldRequired}
                                                onCheckedChange={(checked) => setNewFieldRequired(checked as boolean)}
                                            />
                                            <Label htmlFor="required" className="text-sm font-normal cursor-pointer">Required field</Label>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                if (!newFieldLabel.trim()) {
                                                    toast({
                                                        title: "Label Required",
                                                        description: "Please enter a label for the custom field.",
                                                        variant: "destructive"
                                                    });
                                                    return;
                                                }

                                                if (isEditing && editingFieldId) {
                                                    // Update existing field
                                                    setCustomFields(customFields.map(f => {
                                                        if (f.id === editingFieldId) {
                                                            return {
                                                                ...f,
                                                                label: newFieldLabel,
                                                                type: newFieldType,
                                                                required: newFieldRequired,
                                                                placeholder: newFieldPlaceholder,
                                                                options: newFieldType === 'dropdown' ? newFieldOptions.split(',').map(s => s.trim()) : undefined
                                                            };
                                                        }
                                                        return f;
                                                    }));
                                                    toast({
                                                        title: "Field Updated",
                                                        description: `Field "${newFieldLabel}" has been updated.`
                                                    });
                                                    cancelEdit();
                                                } else {
                                                    // Add new field
                                                    const field: CustomField = {
                                                        id: crypto.randomUUID(),
                                                        label: newFieldLabel,
                                                        type: newFieldType,
                                                        required: newFieldRequired,
                                                        placeholder: newFieldPlaceholder,
                                                        options: newFieldType === 'dropdown' ? newFieldOptions.split(',').map(s => s.trim()) : undefined
                                                    };
                                                    setCustomFields([...customFields, field]);
                                                    toast({
                                                        title: "Field Added",
                                                        description: `Field "${newFieldLabel}" has been added to the form.`
                                                    });
                                                    setNewFieldLabel('');
                                                    setNewFieldOptions('');
                                                    setNewFieldPlaceholder('');
                                                    setNewFieldRequired(false);
                                                }
                                            }}
                                            size="sm"
                                            className="px-6 btn-premium-indigo transition-all font-semibold"
                                        >
                                            {isEditing ? 'Update Field' : 'Add Field'}
                                        </Button>
                                    </div>
                                </div>

                                {customFields.length > 0 && (
                                    <div className="space-y-3 mt-6">
                                        <h4 className="font-medium text-sm text-slate-900">Active Fields</h4>
                                        <div className="grid gap-2">
                                            {customFields.map((field, index) => (
                                                <div key={field.id} className="group flex items-center justify-between p-3 field-card-interactive rounded-lg transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-sm text-slate-900">{field.label}</p>
                                                                {field.required && <span className="badge-required-soft">Required</span>}
                                                            </div>
                                                            <p className="text-xs text-slate-500 capitalize">
                                                                {field.type} • {field.placeholder || 'No placeholder'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-slate-400 hover:text-[#4F46E5] hover:bg-[#4F46E5]/5 transition-colors"
                                                            onClick={() => handleEditField(field)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                            onClick={() => setCustomFields(customFields.filter((_, i) => i !== index))}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-4 border-t mt-6">
                                    <Button
                                        onClick={createRegistrationLink}
                                        className="w-full md:w-auto btn-premium-indigo font-bold transition-all px-8 shadow-md hover:shadow-lg active:scale-95"
                                    >
                                        Save Configuration & Update Link
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div id="certificate-format-section" className="scroll-mt-24">
                            <CertificateFormatBuilder
                                initialFormat={module?.certificateConfig?.serialFormat || []}
                                initialCounter={module?.certificateConfig?.serialCounter || 0}
                                onSave={async (format, counter) => {
                                    await updateCertificateConfig({
                                        serialFormat: format,
                                        serialCounter: counter
                                    });
                                }}
                            />
                        </div>

                        <Card className="card-premium-light mt-6">
                            <CardHeader className="accent-line-gradient">
                                <CardTitle className="text-xl font-bold text-slate-900">Registration Link</CardTitle>
                                <CardDescription>Share this link to collect registrations</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!registrationLink ? (
                                    <p className="text-slate-500 text-sm">
                                        Configure your form fields and <strong>Certificate Number Format</strong> above, then click "Save Configuration & Update Link" to generate your link.
                                    </p>
                                ) : (
                                    <div className="flex gap-2">
                                        <Input value={registrationLink} readOnly />
                                        <Button onClick={() => copyToClipboard(registrationLink)} className="btn-premium-indigo font-bold">
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <CardTitle>Registrations</CardTitle>
                                <div className="flex flex-col md:flex-row gap-2 w-full md:w-2/3 lg:w-3/4 justify-end">
                                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-2 py-1 h-8 shrink-0">
                                        <Input
                                            type="number"
                                            value={inputLimit}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '') {
                                                    setInputLimit('' as any);
                                                } else {
                                                    const num = parseInt(val);
                                                    if (!isNaN(num) && num > 0) setInputLimit(num);
                                                }
                                            }}
                                            className="h-6 w-12 text-center text-xs px-1 border-none bg-transparent focus-visible:ring-0 shadow-none text-slate-900"
                                            min={1}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-xs hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                                            onClick={() => setRowLimit(inputLimit)}
                                        >
                                            Show
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder="Filter by name, email, phone, or custom data..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-8 flex-1 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
                                    />
                                    <Input
                                        type="date"
                                        value={searchDate}
                                        onChange={(e) => setSearchDate(e.target.value)}
                                        className="h-8 w-full md:w-[150px] bg-white border-slate-200 text-slate-900 focus-visible:ring-blue-500"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSearchDate('');
                                        }}
                                        disabled={!searchQuery && !searchDate}
                                        className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 shrink-0"
                                        title="Clear filters"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {filteredRegistrations.length === 0 ? (
                                    <p className="text-center text-slate-500 py-8">
                                        {(searchQuery || searchDate) ? 'No matching registrations found' : 'No registrations yet'}
                                    </p>
                                ) : (
                                    <>
                                        <div className="h-[600px] overflow-auto border rounded-md relative bg-white">
                                            <Table>
                                                <TableHeader className="sticky top-0 bg-blue-50/50 z-10 shadow-sm border-b border-blue-200">
                                                    <TableRow>
                                                        {(module?.certificateConfig?.certNumberPrefix !== undefined || (module?.certificateConfig?.serialFormat && module.certificateConfig.serialFormat.length > 0)) && (
                                                            <TableHead className="text-slate-700 font-semibold text-xs whitespace-nowrap min-w-[180px]">Cert # Preview</TableHead>
                                                        )}
                                                        {customFields.map((field) => (
                                                            <TableHead key={field.id} className="text-slate-700 font-semibold text-xs">{field.label}</TableHead>
                                                        ))}
                                                        <TableHead className="text-slate-700 font-semibold text-xs">Submitted</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredRegistrations
                                                        .slice(0, visibleCount)
                                                        .map((reg, index) => (
                                                            <TableRow key={reg._id} className="hover:bg-slate-50">
                                                                {(module?.certificateConfig?.certNumberPrefix !== undefined || (module?.certificateConfig?.serialFormat && module.certificateConfig.serialFormat.length > 0)) && (
                                                                    <TableCell className="font-mono text-xs font-bold text-indigo-600 whitespace-nowrap">
                                                                        {getSerialPreview(index)}
                                                                    </TableCell>
                                                                )}
                                                                {customFields.map((field) => {
                                                                    // Try to get exact match from customData first
                                                                    let val = reg.customData?.[field.label];

                                                                    // Fallback to top-level fields for standard types/labels if direct match missing
                                                                    if (!val) {
                                                                        const label = field.label.toLowerCase();
                                                                        if (field.type === 'email' || label.includes('email')) {
                                                                            val = reg.email;
                                                                        } else if (label.includes('name') && !label.includes('user')) {
                                                                            val = reg.name;
                                                                        } else if (label.includes('phone') || label.includes('mobile')) {
                                                                            val = reg.phoneNumber;
                                                                        }
                                                                    }

                                                                    return (
                                                                        <TableCell key={field.id}>
                                                                            {val || '-'}
                                                                        </TableCell>
                                                                    );
                                                                })}
                                                                <TableCell>{new Date(reg.submittedAt).toLocaleString()}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {filteredRegistrations.length > visibleCount && (
                                            <div className="flex justify-center mt-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setVisibleCount(prev => prev + rowLimit)}
                                                    className="w-full md:w-auto"
                                                >
                                                    Show More ({filteredRegistrations.length - visibleCount} remaining)
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Feedback Tab */}
                    <TabsContent value="feedback" className="space-y-4">
                        <Card>
                            <CardHeader className="border-l-4 border-blue-600">
                                <CardTitle className="text-xl font-bold">Feedback Link</CardTitle>
                                <CardDescription>Share this link to collect feedback</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!feedbackLink ? (
                                    <Button className="btn-premium-indigo" onClick={createFeedbackLink}>
                                        <Link2 className="mr-2 h-4 w-4" />
                                        Create Feedback Link
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Input value={feedbackLink} readOnly />
                                        <Button onClick={() => copyToClipboard(feedbackLink)} className="btn-premium-indigo">
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle>Feedback Submissions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {feedback.length === 0 ? (
                                    <p className="text-center text-slate-500 py-8">No feedback yet</p>
                                ) : (
                                    <div className="h-[400px] overflow-auto border rounded-md relative bg-white">
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm border-b border-slate-200">
                                                <TableRow>
                                                    <TableHead className="text-slate-700 font-semibold text-xs">Email</TableHead>
                                                    <TableHead className="text-slate-700 font-semibold text-xs">Feedback</TableHead>
                                                    <TableHead className="text-slate-700 font-semibold text-xs">Submitted</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {feedback.map((fb) => (
                                                    <TableRow key={fb._id} className="hover:bg-slate-50">
                                                        <TableCell className="text-slate-700">{fb.email}</TableCell>
                                                        <TableCell className="max-w-md truncate text-slate-700">{fb.feedback}</TableCell>
                                                        <TableCell className="text-slate-500">{new Date(fb.submittedAt).toLocaleString()}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>



                    <TemplateSelectionDialog
                        open={showTemplateSelection}
                        onClose={() => setShowTemplateSelection(false)}
                        templates={templates}
                        selectedId={selectedTemplate}
                        onSelect={async (id) => {
                            const success = await updateCertificateConfig({ templateId: id });
                            setShowTemplateSelection(false);
                            if (success) {
                                setShowMappingDialog(true);
                            }
                        }}
                        onCreateNew={() => {
                            setSelectedTemplate(null);
                            setShowTemplateSelection(false);
                            setShowEditor(true);
                        }}
                    />

                    <EditorDialog
                        open={showEditor}
                        onClose={() => setShowEditor(false)}
                        templateId={selectedTemplate}
                        fields={customFields.map(f => f.label || f.id)} // Pass field labels for mapping
                        onSave={async (canvasData, thumbnail) => {
                            try {
                                const token = user?.token || JSON.parse(localStorage.getItem('user') || '{}').token;
                                let templateId = selectedTemplate;

                                if (!templateId) {
                                    // 1. Create NEW Template
                                    const createRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/templates`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({
                                            name: `Template ${new Date().toLocaleDateString()}`,
                                            canvasData,
                                            thumbnail,
                                            category: 'custom'
                                        })
                                    });

                                    if (!createRes.ok) throw new Error('Failed to create new template');
                                    const newTemplate = await createRes.json();
                                    templateId = newTemplate._id;

                                    // Update module config to point to this new template
                                    await updateCertificateConfig({ templateId });
                                } else {
                                    // 2. Update EXISTING Template
                                    const updateRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/templates/${templateId}`, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({
                                            canvasData,
                                            thumbnail
                                        })
                                    });

                                    if (!updateRes.ok) throw new Error('Failed to update template design');
                                }

                                toast({
                                    title: "Success",
                                    description: "Certificate design saved successfully"
                                });

                                // 3. Refresh module data
                                await fetchModuleData();

                                // 4. Close editor and open mapping dialog
                                setShowEditor(false);
                                setShowMappingDialog(true);
                            } catch (error) {
                                console.error('Save failed:', error);
                                toast({
                                    title: "Error",
                                    description: "Failed to save design. Please try again.",
                                    variant: "destructive"
                                });
                            }
                        }}
                    />

                    <FieldMappingDialog
                        open={showMappingDialog}
                        onClose={() => setShowMappingDialog(false)}
                        templateId={selectedTemplate}
                        moduleId={id || ''}
                        existingMapping={module?.certificateConfig?.fieldMapping}
                        customFields={customFields}
                        onSave={fetchModuleData}
                    />

                    {/* Certificates Tab */}
                    <TabsContent value="certificates" className="space-y-4">
                        <Card>
                            <CardHeader className="border-l-4 border-blue-600">
                                <CardTitle className="text-xl font-bold">Certificate Queue</CardTitle>
                                <CardDescription>Match emails and send certificates</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Dependency Check */}
                                <div className="flex items-center justify-between p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Email Matching System</p>
                                            <p className="text-xs opacity-80">Click match to refresh status of all users</p>
                                        </div>
                                    </div>
                                    <Button onClick={matchEmails} disabled={matching} size="sm">
                                        <RefreshCw className={`mr-2 h-4 w-4 ${matching ? 'animate-spin' : ''}`} />
                                        {matching ? 'Matching...' : 'Match Emails'}
                                    </Button>
                                </div>

                                {(!module?.certificateConfig?.templateId || !module?.certificateConfig?.fieldMapping || Object.keys(module.certificateConfig.fieldMapping).length === 0) ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-xl bg-slate-50 mb-6">
                                        <div className="h-12 w-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mb-4">
                                            <Settings2 className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900 mb-2">Configuration Required to Send</h3>
                                        <p className="text-sm text-slate-500 max-w-sm mb-6">
                                            Matching is complete, but you must configure a template before you can actually <strong>send</strong> certificates.
                                        </p>
                                        <Button onClick={() => navigate(`/editor?moduleId=${id}&mode=module`)} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                                            Go to Template Configuration
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="mb-6 space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                            <div>
                                                <p className="text-sm font-bold text-blue-900">Eligible Students Ready</p>
                                                <p className="text-xs text-blue-600 mt-0.5">{eligibleItems.length} students ready for certificate generation</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={proceedToGenerate}
                                                    disabled={loadingEligible || eligibleItems.length === 0}
                                                    className="btn-premium-indigo shadow-lg gap-2"
                                                >
                                                    {loadingEligible ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trophy className="h-4 w-4" />
                                                    )}
                                                    {loadingEligible ? 'Loading...' : 'Proceed to Generate'}
                                                </Button>
                                            </div>
                                        </div>
                                        {queue.length > 0 && (
                                            <Button
                                                onClick={sendCertificates}
                                                disabled={sending}
                                                variant="outline"
                                                className="w-full sm:w-auto border-blue-200 hover:bg-blue-50 text-blue-600"
                                            >
                                                <Mail className="mr-2 h-4 w-4" />
                                                {sending ? 'Sending...' : `Send Certificates to Eligible (${eligibleItems.length})`}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-3 gap-4">
                            {/* Eligible */}
                            <Card className="border-green-200">
                                <CardHeader>
                                    <CardTitle className="text-green-700">Eligible ({eligibleItems.length})</CardTitle>
                                    <CardDescription>Users who submitted both registration and feedback</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {eligibleItems.length === 0 ? (
                                        <p className="text-center text-slate-500 py-4">No eligible users</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {eligibleItems.map((item) => (
                                                <div key={item._id} className="p-3 bg-green-50 rounded-lg">
                                                    <p className="font-semibold text-sm">{item.name}</p>
                                                    <p className="text-xs text-slate-600">{item.email}</p>
                                                    {item.certificateNumber && (
                                                        <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                                                            #{item.certificateNumber}
                                                        </p>
                                                    )}
                                                    {item.status === 'sent' && (
                                                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" /> Sent
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Pending */}
                            <Card className="border-yellow-200">
                                <CardHeader>
                                    <CardTitle className="text-yellow-700">Pending ({pendingItems.length})</CardTitle>
                                    <CardDescription>Registered but not filled feedback form</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {pendingItems.length === 0 ? (
                                        <p className="text-center text-slate-500 py-4">No pending users</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {pendingItems.map((item) => (
                                                <div key={item._id} className="p-3 bg-yellow-50 rounded-lg">
                                                    <p className="font-semibold text-sm">{item.name}</p>
                                                    <p className="text-xs text-slate-600">{item.email}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Ineligible */}
                            <Card className="border-red-200">
                                <CardHeader>
                                    <CardTitle className="text-red-700">Ineligible ({ineligibleItems.length})</CardTitle>
                                    <CardDescription>Missing Registration (Feedback submitted but no matching registration)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {ineligibleItems.length === 0 ? (
                                        <p className="text-center text-slate-500 py-4">No ineligible users</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {ineligibleItems.map((item) => (
                                                <div key={item._id} className="p-3 bg-red-50 rounded-lg">
                                                    <p className="font-semibold text-sm">{item.name}</p>
                                                    <p className="text-xs text-slate-600">{item.email}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                />
            </div>
        </div >

    );
};

export default ModuleDetail;
