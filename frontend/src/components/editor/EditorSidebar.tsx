import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useRef, useState, useEffect } from 'react';

import { cn } from '@/lib/utils';

import { useCanvasContext } from '@/context/CanvasContext';
import {
  Image,
  LayoutTemplate,
  Minus,

  Type,
  Upload,
  Users,

  Plus,
  Link2,
  Database,

  Check,
  Bold,
  Italic,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Trash2,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  Unlock as UnlockIcon,
  Lock as LockIcon,
  Layout,
} from 'lucide-react';
import { certificateTemplates } from '@/data/templatesSceneGraph';
import { BulkSection } from './BulkSection';
import { useAuth } from '@/context/AuthContext';

import { ALL_FONTS } from '@/data/fonts';

import { Square as SquareIcon, X, ChevronLeft, ChevronRight, Eye, Search, Lock } from 'lucide-react';
import { toast } from 'sonner';

type ToolType = 'templates' | 'text' | 'uploads' | 'bulk' | 'mapping';

interface EditorSidebarProps {
  onAddText: (text?: string) => void;
  onAddShape: (shape: string) => void;
  onAddImage: (file: File) => void;
  onSetBackground: (color: string) => void;
  // Separate callbacks for cleaner state management
  onLoadTemplate: (templateData: any) => void;
  onSelectTemplate: (templateId: string) => void;
  onLoadFromJSON?: (json: any) => Promise<void>;
  onBulkDataUpload?: (data: any[], columns: string[]) => void;
  bulkFileName?: string;
  bulkRecordCount?: number;
  bulkColumns?: string[];
  textElements?: Array<{ id: string; text: string }>;
  fieldMappings?: Record<string, string>;
  onFieldMapping?: (objectId: string, column: string) => void;
  onApplyFontPairing?: (fonts: { title: string; recipient: string; body: string }) => void;
  onApplyBorder?: (preset: any) => void;
  onApplyStyle?: (preset: any) => void;
  bulkData?: any[];
  previewRecordIndex?: number;
  onPreviewRecordChange?: (index: number) => void;
  panelWidth?: number;
  mappingFields?: string[];
  simplified?: boolean;
  // Properties Panel Integration Props
  selectedObject?: any;
  onDelete?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onToggleLock?: () => void;
  layers?: any[];
  onSelectLayer?: (obj: any) => void;
  isModuleMode?: boolean;
  loadingModuleData?: boolean;
  columnsMetadata?: Record<string, any>;
  manualValues?: Record<string, string>;
  onManualValueChange?: (objectId: string, value: string) => void;
  activeTemplateId?: string | null;
}







const RealisticMeteoroid = ({ id }: { id: number }) => {
  const [key, setKey] = useState(0);
  const [pos, setPos] = useState({
    top: Math.random() * 70,
    left: 40 + Math.random() * 60,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPos({
        top: Math.random() * 70,
        left: 40 + Math.random() * 60,
      });
      setKey((prev) => prev + 1);
    }, 5000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      key={key}
      className="absolute z-0 pointer-events-none animate-[meteor_linear_infinite]"
      style={{
        top: `${pos.top}%`,
        left: `${pos.left}%`,
        animationDuration: '5s',
      }}
    >
      <div className="meteor-head" />
      <div className="meteor-tail" style={{ width: '150px' }} />
    </div>
  );
};

const DynamicStar = ({ id }: { id: number }) => {
  const [key, setKey] = useState(0);
  const [style, setStyle] = useState<any>({});

  useEffect(() => {
    const randomize = () => {
      const size = (Math.random() * 2 + 0.5) * 1.1;
      const duration = 2 + Math.random() * 4;
      setStyle({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: `${duration}s`,
        boxShadow: size > 1.5 ? '0 0 6px rgba(255, 255, 255, 1)' : '0 0 2px rgba(255, 255, 255, 0.5)',
      });
    };
    randomize();

    const interval = setInterval(() => {
      setKey(prev => prev + 1);
      randomize();
    }, 6000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, [id]);

  return (
    <div
      key={key}
      className="star absolute animate-[star-lifecycle_ease-in-out_infinite] pointer-events-none"
      style={style}
    />
  );
};

const FlareStar = ({ id }: { id: number }) => {
  const [key, setKey] = useState(0);
  const [style, setStyle] = useState<any>({});

  useEffect(() => {
    const randomize = () => {
      setStyle({
        top: `${Math.random() * 80 + 10}%`,
        left: `${Math.random() * 90 + 5}%`,
        transform: `scale(${Math.random() * 0.4 + 0.3})`,
        animationDelay: `${Math.random() * 3}s`,
      });
    };
    randomize();

    const interval = setInterval(() => {
      setKey(prev => prev + 1);
      randomize();
    }, 10000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [id]);

  return (
    <div
      key={key}
      className="bright-star absolute pointer-events-none"
      style={style}
    />
  );
};

const StarsBackground = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#0a0c14]/95 backdrop-blur-md">
      {/* Mystical Blue Fog / Nebula - Matched to Reference */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Deep Bottom Fog */}
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[120%] h-[60%] blur-[80px] opacity-40 animate-pulse"
          style={{
            background: 'radial-gradient(circle at 50% 100%, #1e40af 0%, transparent 70%)',
            animationDuration: '12s'
          }}
        />
        {/* Cerulean Ethereal Mist */}
        <div
          className="absolute top-[30%] left-[-15%] w-[130%] h-[70%] blur-[60px] opacity-30"
          style={{
            background: `
              radial-gradient(circle at 30% 50%, #0ea5e9 0%, transparent 45%),
              radial-gradient(circle at 70% 60%, #0369a1 0%, transparent 50%),
              radial-gradient(circle at 50% 40%, rgba(56, 189, 248, 0.2) 0%, transparent 60%)
            `,
            transform: 'rotate(-5deg)'
          }}
        />
        {/* Floating Light Pockets */}
        <div
          className="absolute inset-0 blur-[100px] opacity-20 animate-[pulse_15s_infinite_alternate]"
          style={{
            background: 'radial-gradient(circle at 60% 30%, #38bdf8 0%, transparent 40%)',
          }}
        />
      </div>

      <RealisticMeteoroid id={1} />
      {[...Array(15)].map((_, i) => (
        <DynamicStar key={i} id={i} />
      ))}
      {[...Array(3)].map((_, i) => (
        <FlareStar key={`flare-${i}`} id={i} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
    </div>
  );
};

export const EditorSidebar = ({

  onAddText,
  onAddShape,
  onAddImage,
  onBulkDataUpload,
  bulkFileName,
  bulkRecordCount,
  bulkColumns = [],
  textElements = [],
  fieldMappings = {},
  onFieldMapping,
  onApplyFontPairing,
  onApplyBorder,
  onApplyStyle,
  bulkData = [],
  previewRecordIndex = -1,
  onPreviewRecordChange,
  panelWidth = 320,
  mappingFields = [],
  simplified = false,
  selectedObject,
  onDelete,
  onBringForward,
  onSendBackward,
  onGroup,
  onUngroup,
  onToggleLock,
  layers = [],
  onSelectLayer,
  isModuleMode = false,
  loadingModuleData = false,
  columnsMetadata = {},
  manualValues = {},
  onManualValueChange,
  onSetBackground,
  onLoadTemplate,
  onSelectTemplate,
  onLoadFromJSON,
  activeTemplateId: initialActiveTemplateId,
}: EditorSidebarProps) => {
  const { canvas } = useCanvasContext();
  const [activeTool, setActiveTool] = useState<ToolType>('templates');
  const [loadCount, setLoadCount] = useState(0);

  // Properties State
  const [fontSize, setFontSizeState] = useState(32);
  const [fontFamily, setFontFamilyState] = useState('Outfit');
  const [fillColor, setFillColorState] = useState('#1a1a1a');
  const [opacity, setOpacityState] = useState(100);
  const [textAlign, setTextAlignState] = useState('center');
  const [fontWeight, setFontWeightState] = useState('normal');
  const [fontStyle, setFontStyleState] = useState('normal');

  // Input States for reliable syncing
  const [recipientName, setRecipientName] = useState('');
  const [certificateDate, setCertificateDate] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(initialActiveTemplateId || null);

  useEffect(() => {
    if (initialActiveTemplateId) setActiveTemplateId(initialActiveTemplateId);
  }, [initialActiveTemplateId]);
  const [isLocking, setIsLocking] = useState(false);
  const [layoutOverrides, setLayoutOverrides] = useState<any[]>([]);
  const [uploads, setUploads] = useState<any[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    if (selectedObject) {
      if (selectedObject.fontSize) setFontSizeState(selectedObject.fontSize);
      if (selectedObject.fontFamily) setFontFamilyState(selectedObject.fontFamily);
      if (selectedObject.fill && typeof selectedObject.fill === 'string') {
        let color = selectedObject.fill;
        if (color.startsWith('rgb')) {
          const rgb = color.match(/\d+/g);
          if (rgb && rgb.length >= 3) {
            color = "#" + ((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1);
          }
        }
        setFillColorState(color);
      }
      if (selectedObject.opacity !== undefined) setOpacityState(selectedObject.opacity * 100);
      if (selectedObject.textAlign) setTextAlignState(selectedObject.textAlign);
      if (selectedObject.fontWeight) setFontWeightState(selectedObject.fontWeight);
      if (selectedObject.fontStyle) setFontStyleState(selectedObject.fontStyle);
    }
  }, [selectedObject]);

  const updateProperty = (property: string, value: any) => {
    if (!selectedObject) return;
    if (selectedObject.type === 'group') {
      selectedObject.set(property, value);
      if (property === 'fill' || property === 'opacity' || property === 'stroke') {
        selectedObject.forEachObject?.((obj: any) => {
          if (property === 'fill' && obj.fill && obj.fill !== 'transparent') obj.set('fill', value);
          else if (property === 'stroke' && obj.stroke && obj.stroke !== 'transparent') obj.set('stroke', value);
          else if (property === 'opacity') obj.set('opacity', value);
        });
      }
    } else {
      selectedObject.set(property, value);
    }
    selectedObject.canvas?.renderAll();
  };



  const [myTemplates, setMyTemplates] = useState<any[]>([]);
  const [publicTemplates, setPublicTemplates] = useState<any[]>([]);
  const [isPublicTemplatesLoaded, setIsPublicTemplatesLoaded] = useState(false);

  useEffect(() => {
    const fetchPublicTemplates = async () => {
      try {
        const response = await fetch('/api/templates/public');
        if (response.ok) {
          const data = await response.json();
          const mapped = data.map((t: any) => ({
            ...t,
            id: t._id,
            preview: t.thumbnail,
            sceneGraph: t.sceneGraph || t.canvasData
          }));
          setPublicTemplates(mapped);
          setIsPublicTemplatesLoaded(true);
        }
      } catch (error) {
        console.error("Failed to fetch public templates", error);
      }
    };
    fetchPublicTemplates();
  }, []);

  const [fontSearch, setFontSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated } = useAuth();

  // Reset preview index when data changes
  useEffect(() => {
    if (bulkData.length > 0 && previewRecordIndex === -1) {
      onPreviewRecordChange?.(0);
    }
  }, [bulkData, previewRecordIndex, onPreviewRecordChange]);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!isAuthenticated || !user?.token) return;

      try {
        const response = await fetch('/api/templates', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setMyTemplates(data);
        }
      } catch (error) {
        console.error("Failed to fetch user templates", error);
      }
    };

    if (activeTool === 'templates') {
      fetchTemplates();
    }
  }, [isAuthenticated, user?.token, activeTool]);

  // Fetch overrides on mount
  useEffect(() => {
    const fetchOverrides = async () => {
      try {
        const headers: any = {};
        if (user?.token) {
          headers['Authorization'] = `Bearer ${user.token}`;
        }

        const response = await fetch('/api/templates/layout-overrides', {
          headers
        });

        if (response.ok) {
          const data = await response.json();
          setLayoutOverrides(data);
        }
      } catch (error) {
        console.error("Failed to fetch overrides", error);
      }
    };
    fetchOverrides();
  }, [user?.token]);

  const handleLockLayout = async () => {
    if (!canvas || !activeTemplateId || !user?.token || !user.canLockLayout) return;

    setIsLocking(true);
    try {
      const overrides: any = {};
      const objects = canvas.getObjects();

      objects.forEach((obj: any) => {
        if (obj.role && ['recipient', 'date', 'signature', 'description'].includes(obj.role)) {
          overrides[obj.role] = {
            transform: {
              x: obj.left,
              y: obj.top,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
              rotation: obj.angle
            },
            style: {
              fontSize: obj.fontSize,
              fontFamily: obj.fontFamily,
              textAlign: obj.textAlign,
              fill: obj.fill,
              fontWeight: obj.fontWeight,
              fontStyle: obj.fontStyle,
              originX: obj.originX,
              originY: obj.originY,
              width: obj.width
            }
          };
        }
      });

      const response = await fetch('/api/templates/layout-override', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          templateId: activeTemplateId,
          layoutOverrides: overrides
        })
      });

      if (response.ok) {
        toast.success("Layout locked! This is now the default for this template.");
        // Refresh local overrides
        const newOverride = await response.json();
        setLayoutOverrides(prev => {
          const filtered = prev.filter(o => o.templateId !== activeTemplateId);
          return [...filtered, newOverride];
        });
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to lock layout");
      }
    } catch (error) {
      console.error("Error locking layout:", error);
      toast.error("An error occurred while locking the layout");
    } finally {
      setIsLocking(false);
    }
  };


  // ----------------------------------------------------------------------
  // Role-Based Input Logic (Universal Template Support)
  // ----------------------------------------------------------------------

  // Universal updater function (STRICT REPLACEMENT ONLY)
  const updateCanvasByRole = (role: string, value: string) => {
    if (!canvas) return;

    // The user requested that we NEVER create new objects.
    // We only replace the text of existing objects that have the matching role.
    const updateObject = (obj: any) => {
      if (!obj) return;

      if (obj.type === 'group' || obj.type === 'activeSelection') {
        obj.getObjects().forEach(updateObject);
        return;
      }

      // We only update if a value is provided. 
      // This prevents wiping out [Date] with an empty string before the user types.
      if (obj.role === role && (obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text')) {
        // Only update if value is present, otherwise keep placeholder
        if (value.trim() !== '') {
          obj.set('text', value);
          obj.setCoords();
        }
      }
    };

    canvas.getObjects().forEach(updateObject);
    canvas.requestRenderAll();
  };

  const applyOverridesToSceneGraph = (sceneGraph: any, templateId: string) => {
    const override = layoutOverrides.find(o => o.templateId === templateId);
    if (!override) return sceneGraph;

    // Deep clone to avoid mutating original data
    const updatedGraph = JSON.parse(JSON.stringify(sceneGraph));

    const processNode = (node: any) => {
      if (node.role && override.layoutOverrides[node.role]) {
        const ov = override.layoutOverrides[node.role];
        // Apply transform
        if (ov.transform) {
          node.transform = {
            ...node.transform,
            x: ov.transform.x,
            y: ov.transform.y,
            scaleX: ov.transform.scaleX,
            scaleY: ov.transform.scaleY,
            rotation: ov.transform.rotation
          };
        }
        // Apply styles
        if (ov.style) {
          Object.keys(ov.style).forEach(key => {
            node[key] = ov.style[key];
          });
        }
      }

      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(processNode);
      }
    };

    processNode(updatedGraph.root);
    return updatedGraph;
  };

  // Sync Inputs -> Canvas
  useEffect(() => {
    if (canvas) updateCanvasByRole('recipient', recipientName);
  }, [recipientName, canvas]);

  useEffect(() => {
    if (canvas) updateCanvasByRole('date', certificateDate);
  }, [certificateDate, canvas]);

  useEffect(() => {
    if (canvas) updateCanvasByRole('signature', signatureText);
  }, [signatureText, canvas]);

  useEffect(() => {
    if (canvas) updateCanvasByRole('description', descriptionText);
  }, [descriptionText, canvas]);

  // Sync Canvas Content (when template loads)
  useEffect(() => {
    if (canvas && loadCount > 0) {
      // We explicitly DO NOT wipe placeholders if inputs are empty
      // Re-apply current React state only if user has actually typed something
      if (recipientName) updateCanvasByRole('recipient', recipientName);
      if (certificateDate) updateCanvasByRole('date', certificateDate);
      if (signatureText) updateCanvasByRole('signature', signatureText);
      if (descriptionText) updateCanvasByRole('description', descriptionText);
    }
  }, [canvas, loadCount]);

  const tools = [
    { id: 'templates' as ToolType, icon: LayoutTemplate, label: 'Templates' },
    // If a template is loaded, hide layout-breaking tools from casual users
    { id: 'text' as ToolType, icon: Type, label: 'Text' },
    { id: 'uploads' as ToolType, icon: Image, label: 'Uploads' },
    // Only show Mapping tool if mappingFields are provided
    ...(mappingFields && mappingFields.length > 0 ? [{ id: 'mapping' as ToolType, icon: Database, label: 'Mapping' }] : []),
    // Hide Bulk if simplified is true
    ...(!simplified ? [
      { id: 'bulk' as ToolType, icon: Users, label: 'Bulk' },
    ] : []),
  ];

  const fetchUploads = async () => {
    if (!user?.token) return;
    try {
      setUploadLoading(true);

      const [uploadsRes, templatesRes] = await Promise.all([
        fetch('/api/uploads', { headers: { 'Authorization': `Bearer ${user.token}` } }),
        fetch('/api/templates', { headers: { 'Authorization': `Bearer ${user.token}` } })
      ]);

      const newUploads = [];

      if (uploadsRes.ok) {
        const data = await uploadsRes.json();
        newUploads.push(...data);
      }

      if (templatesRes.ok) {
        const templates = await templatesRes.json();
        const uploadedTemplates = templates.filter((t: any) => t.category === 'uploaded').map((t: any) => ({
          _id: t._id,
          name: t.name,
          data: t.thumbnail, // Map thumbnail to data
          type: 'template_asset' // Distinguish type if needed
        }));
        newUploads.push(...uploadedTemplates);
      }

      // Sort by whatever criteria, maybe reverse order (newest first)?
      // For now just set state.
      setUploads(newUploads);

    } catch (error) {
      console.error("Failed to fetch uploads", error);
    } finally {
      setUploadLoading(false);
    }
  };

  useEffect(() => {
    if (activeTool === 'uploads') {
      fetchUploads();
    }
  }, [activeTool, user?.token]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Add to canvas immediately
      onAddImage(file);

      // 2. Save to backend
      if (user?.token) {
        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            await fetch('/api/uploads', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
              },
              body: JSON.stringify({
                data: base64,
                name: file.name,
                type: 'image'
              })
            });
            fetchUploads(); // Refresh list
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error("Failed to save upload", error);
        }
      }
    }
  };

  const handleDeleteUpload = async (id: string, e: React.MouseEvent, type?: string) => {
    e.stopPropagation();
    if (!user?.token) return;
    try {
      const endpoint = type === 'template_asset' ? `/api/templates/${id}` : `/api/uploads/${id}`;

      await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      setUploads(prev => prev.filter(u => u._id !== id));
      toast.success('Image removed from library');
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const addUploadToCanvas = async (upload: any) => {
    // Helper to convert base64 to File object/Blob for onAddImage
    // Or we can modify onAddImage to accept URL/Base64, but for now let's convert
    try {
      const res = await fetch(upload.data);
      const blob = await res.blob();
      const file = new File([blob], upload.name, { type: 'image/png' });
      onAddImage(file);
    } catch (e) {
      console.error("Failed to load image from history", e);
    }
  };

  const renderToolContent = () => {
    switch (activeTool) {
      case 'templates':
        return (
          <div className="pl-5 pr-7 py-6 min-h-full relative z-10 text-white">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <h3 className="font-bold text-lg text-white">Templates</h3>
              </div>

              <div className="space-y-8">
                {/* My Templates Section */}
                {isAuthenticated && myTemplates.length > 0 && (
                  <>
                    <h4 className="font-semibold text-[11px] mb-4 text-white/60 uppercase tracking-[0.2em] px-1 opacity-80">My Saved Templates</h4>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {myTemplates.map((template, index) => {
                        const isLocked = user?.activePlan === 'Free Demo' && index >= 3;
                        const isActive = activeTemplateId === template._id;
                        return (
                          <button
                            key={template._id}
                            onClick={() => {
                              if (isLocked) {
                                toast.error("Upgrade to Pro to unlock unlimited templates!");
                                return;
                              }
                              if (template.sceneGraph) {
                                if (template.sceneGraph.root) {
                                  const finalGraph = applyOverridesToSceneGraph(template.sceneGraph, template._id);
                                  onLoadTemplate(finalGraph);
                                } else if (onLoadFromJSON) {
                                  onLoadFromJSON(template.sceneGraph);
                                }
                                onSelectTemplate(template._id);
                                setActiveTemplateId(template._id);
                                setLoadCount(prev => prev + 1);
                              }
                            }}
                            className="w-full text-left"
                          >
                            <div
                              className={`bg-transparent rounded-lg overflow-hidden cursor-pointer transition-all group ${isActive ? 'ring-2 ring-cosmic-cyan ring-offset-2 ring-offset-[#0B0F1A] shadow-[0_0_20px_rgba(103,232,249,0.3)]' : 'hover:opacity-80'}`}
                            >
                              <div className="aspect-[4/3] w-full bg-white/5 relative overflow-hidden p-4 border border-white/10 rounded-lg">
                                <img
                                  src={template.thumbnail}
                                  alt={template.name}
                                  className={`w-full h-full object-cover transition-transform duration-500 ${['Vibrant Colors', 'Simple Border', 'Corporate Grey', 'Professional Blue'].includes(template.name)
                                    ? 'scale-120 group-hover:scale-125'
                                    : 'group-hover:scale-105'
                                    }`}
                                />
                                {isActive && (
                                  <div className="absolute inset-0 bg-[#4F46E5]/20 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-200">
                                    <div className="btn-premium-indigo text-white text-[10px] px-2 py-1 rounded-md font-bold shadow-lg flex items-center gap-1 border-none">
                                      <Check className="h-3 w-3" />
                                      Selected
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <Separator className="my-5 opacity-20" />
                  </>
                )}

                {/* All Templates Section */}
                <div>
                  <h4 className="font-semibold text-[11px] mb-4 text-white/60 uppercase tracking-[0.2em] px-1 opacity-80">All Templates</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {(isPublicTemplatesLoaded ? publicTemplates : certificateTemplates).map((template, index) => {
                      const isLocked = user?.activePlan === 'Free Demo' && index >= 3;
                      const id = template.id || template._id;
                      const isActive = activeTemplateId === id;

                      return (
                        <button
                          key={id}
                          onClick={() => {
                            if (isLocked) {
                              toast.error("Upgrade to Pro to unlock all premium templates!");
                              return;
                            }
                            if (template.sceneGraph) {
                              if (template.sceneGraph.root) {
                                const finalGraph = applyOverridesToSceneGraph(template.sceneGraph, id);
                                onLoadTemplate(finalGraph);
                              } else if (onLoadFromJSON) {
                                onLoadFromJSON(template.sceneGraph);
                              }
                              onSelectTemplate(id);
                              setActiveTemplateId(id);
                              setLoadCount(prev => prev + 1);
                            }
                          }}
                          className="w-full text-left"
                        >
                          <div
                            className={`bg-transparent rounded-lg overflow-hidden cursor-pointer transition-all group ${isActive ? 'ring-2 ring-cosmic-cyan ring-offset-2 ring-offset-[#0B0F1A] shadow-[0_0_20px_rgba(103,232,249,0.3)]' : 'hover:opacity-80'} ${isLocked ? 'opacity-50' : ''}`}
                          >
                            <div className="aspect-[4/3] w-full bg-white/5 relative overflow-hidden p-4 border border-white/10 rounded-lg">
                              <img
                                src={template.preview || template.thumbnail}
                                alt={template.name}
                                className={`w-full h-full object-cover transition-transform duration-500 ${['Vibrant Colors', 'Simple Border', 'Corporate Grey', 'Professional Blue'].includes(template.name)
                                  ? 'scale-120 group-hover:scale-125'
                                  : 'group-hover:scale-105'
                                  }`}
                              />
                              {isLocked && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                  <LockIcon className="w-5 h-5 text-white/50" />
                                </div>
                              )}
                              {isActive && !isLocked && (
                                <div className="absolute inset-0 bg-[#4F46E5]/20 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-200">
                                  <div className="btn-premium-indigo text-white text-[10px] px-2 py-1 rounded-md font-bold shadow-lg flex items-center gap-1 border-none">
                                    <Check className="h-3 w-3" />
                                    Selected
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div >


              {/* Dynamic Inputs Section */}
              {
                loadCount > 0 && (
                  <div className="border-t border-white/10 pt-4 mt-2">
                    <div className="px-5 mb-4">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-white">
                        <Type className="h-4 w-4" />
                        Quick Customize
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-white/60">Recipient Name</label>
                          <input
                            className="w-full px-3 py-2 text-sm rounded-md border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
                            placeholder="e.g. Andrew Scott"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-white/60">Date</label>
                          <input
                            className="w-full px-3 py-2 text-sm rounded-md border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
                            placeholder="e.g. 12/25/2023"
                            value={certificateDate}
                            onChange={(e) => setCertificateDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-white/60">Signature</label>
                          <input
                            className="w-full px-3 py-2 text-sm rounded-md border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
                            placeholder="e.g. Dr. Arnold"
                            value={signatureText}
                            onChange={(e) => setSignatureText(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-white/60">Description / Content</label>
                          <textarea
                            className="w-full px-3 py-2 text-sm rounded-md border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm min-h-[80px]"
                            placeholder="e.g. For successfully completing the Advanced Agentic Coding course..."
                            value={descriptionText}
                            onChange={(e) => setDescriptionText(e.target.value)}
                          />
                        </div>



                      </div>
                    </div>

                    {/* Mapping Section - Only show when mappingFields are available (Registration Link mode) */}
                    {mappingFields && mappingFields.length > 0 && (
                      <div className="border-t border-white/10 pt-6 mt-4 px-5 pb-8 bg-black/20">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-sm flex items-center gap-2 text-white">
                            <Database className="h-4 w-4 text-violet-400" />
                            Map to Registration Data
                          </h4>
                          <Badge variant="outline" className="text-[9px] border-violet-500/30 text-violet-300 bg-violet-500/10">
                            {mappingFields.length} Columns
                          </Badge>
                        </div>

                        <p className="text-[10px] text-gray-400 mb-5 leading-relaxed">
                          Link your certificate fields to registration data. Manual values will be overridden by the linked data for members.
                        </p>

                        <div className="space-y-4">
                          {[
                            { label: 'Recipient Name', role: 'recipient', icon: Users },
                            { label: 'Date', role: 'date', icon: Type },
                            { label: 'Signature', role: 'signature', icon: Type },
                            { label: 'Description', role: 'description', icon: Type }
                          ].map((field) => {
                            const targetObject = layers?.find(l => l.object.role === field.role);
                            const currentMapping = targetObject ? fieldMappings?.[targetObject.object.id] : null;

                            return (
                              <div key={field.role} className="group/map">
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                                    <field.icon className="h-3 w-3 text-gray-500" />
                                    {field.label}
                                  </label>
                                  {currentMapping && (
                                    <span className="text-[9px] text-[#A855F7] font-bold flex items-center gap-1">
                                      <Check className="h-2.5 w-2.5" />
                                      Linked to {currentMapping}
                                    </span>
                                  )}
                                </div>
                                <div className="relative">
                                  <select
                                    className={cn(
                                      "w-full pl-3 pr-8 py-2 text-sm rounded-lg border-2 appearance-none transition-all outline-none",
                                      currentMapping
                                        ? "bg-violet-950/20 border-violet-500/30 text-violet-100 hover:border-violet-500/50"
                                        : "bg-white border-transparent text-gray-900 focus:ring-2 focus:ring-violet-500"
                                    )}
                                    value={currentMapping || ''}
                                    onChange={(e) => {
                                      if (targetObject && onFieldMapping) {
                                        onFieldMapping(targetObject.object.id, e.target.value);
                                      } else if (!targetObject) {
                                        toast.error(`"${field.label}" field not found on template`);
                                      }
                                    }}
                                  >
                                    <option value="">Manual Entry (No Mapping)</option>
                                    {mappingFields.map(col => (
                                      <option key={col} value={col}>{col}</option>
                                    ))}
                                  </select>
                                  <ChevronDownIcon className={cn(
                                    "absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors",
                                    currentMapping ? "text-violet-400" : "text-gray-400"
                                  )} />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Available Columns List for reference */}
                        <div className="mt-8">
                          <h5 className="text-[10px] uppercase font-black tracking-widest text-[#9333EA] mb-3">
                            Available Source Columns
                          </h5>
                          <div className="flex flex-wrap gap-1.5">
                            {mappingFields.map(col => (
                              <div
                                key={col}
                                className="px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-300 font-medium"
                              >
                                {col}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              }
            </div >
          </div >
        );

      case 'text':
        return (
          <div className="pl-5 pr-7 py-6 min-h-full relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="font-bold text-lg text-white">Text</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-6">
              <Button
                variant="outline"
                className="h-12 text-sm font-bold justify-start rounded-xl bg-white/5 border-white/10 text-white hover:bg-cosmic-purple/20 hover:border-cosmic-purple/50 transition-all px-3"
                onClick={() => onAddText('Add a heading')}
              >
                Heading
              </Button>
              <Button
                variant="outline"
                className="h-12 text-sm font-medium justify-start rounded-xl bg-white/5 border-white/10 text-white hover:bg-cosmic-purple/20 hover:border-cosmic-purple/50 transition-all px-3"
                onClick={() => onAddText('Add a subheading')}
              >
                Subheading
              </Button>
              <Button
                variant="outline"
                className="h-12 text-sm justify-start rounded-xl bg-white/5 border-white/10 text-white hover:bg-cosmic-purple/20 hover:border-cosmic-purple/50 transition-all px-3 col-span-2"
                onClick={() => onAddText('Add body text')}
              >
                Add body text paragraph
              </Button>
            </div>

            <Separator className="my-6 opacity-50" />

            <div className="flex flex-col gap-6 mb-8 px-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-violet-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search 60+ fonts..."
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-white/20 bg-white/10 focus:bg-white/15 focus:ring-4 focus:ring-cosmic-purple/20 focus:border-cosmic-purple/60 outline-none transition-all text-sm font-medium text-white placeholder:text-white/50"
                />
                {fontSearch && (
                  <button
                    onClick={() => setFontSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-8">
              {/* Free Fonts Section */}
              <div className="space-y-6">
                {['Serif', 'Sans-Serif', 'Humanist'].map((category) => {
                  const categoryFonts = ALL_FONTS.filter(f =>
                    f.category === category &&
                    f.name.toLowerCase().includes(fontSearch.toLowerCase())
                  );

                  if (categoryFonts.length === 0) return null;

                  return (
                    <div key={category}>
                      <h4 className="font-semibold text-[10px] mb-3 text-muted-foreground uppercase tracking-widest px-1">
                        {category}
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {categoryFonts.map((font) => (
                          <button
                            key={font.id}
                            onClick={() => onApplyFontPairing?.({ title: font.id, recipient: font.id, body: font.id })}
                            className="flex flex-col items-center gap-2 p-2 rounded-lg border border-white/20 transition-all group/item bg-white/10 hover:bg-cosmic-purple/30 hover:border-cosmic-purple/60 aspect-square justify-center shadow-lg backdrop-blur-sm"
                            title={font.name}
                          >
                            <div className="h-10 w-full flex items-center justify-center overflow-hidden">
                              <p
                                className="text-2xl text-white group-hover/item:text-cosmic-cyan group-hover/item:scale-110 transition-all font-bold"
                                style={{ fontFamily: font.id }}
                              >
                                Ag
                              </p>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-tight text-center leading-none px-1 truncate w-full text-white/50 group-hover/item:text-white/90">
                              {font.name.split(' ')[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Premium Fonts Section */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-6 px-1">
                  <h3 className="text-xs font-black text-white uppercase tracking-tighter flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] shadow-[0_0_8px_#EAB308]"></span>
                    Premium Fonts
                  </h3>
                  {user?.activePlan?.toLowerCase() !== 'enterprise' && (
                    <span className="text-[#EAB308] font-black text-[9px] animate-pulse drop-shadow-md">UPGRADE ENTERPRISE</span>
                  )}
                </div>

                <div className="space-y-8">
                  {['Modern Corporate', 'Elegant', 'UI-Variable'].map((category) => {
                    const categoryFonts = ALL_FONTS.filter(f =>
                      f.category === category &&
                      f.name.toLowerCase().includes(fontSearch.toLowerCase())
                    );

                    if (categoryFonts.length === 0) return null;

                    return (
                      <div key={category} className="pl-1">
                        <h4 className="font-semibold text-[9px] mb-3 text-white/50 uppercase tracking-widest flex items-center gap-2">
                          <ChevronRight className="h-2.5 w-2.5" />
                          {category}
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {categoryFonts.map((font) => {
                            const isLocked = user?.activePlan?.toLowerCase() !== 'enterprise';

                            return (
                              <button
                                key={font.id}
                                onClick={() => {
                                  if (isLocked) {
                                    toast.error('Enterprise Plan Required', {
                                      description: `The font "${font.name}" is only available on our Enterprise plan.`
                                    });
                                    return;
                                  }
                                  onApplyFontPairing?.({ title: font.id, recipient: font.id, body: font.id });
                                }}
                                className={`flex flex-col items-center gap-2 p-2 rounded-lg border transition-all group/item relative overflow-hidden aspect-square justify-center shadow-[0_0_20px_rgba(251,191,36,0.05)] backdrop-blur-md ${isLocked
                                  ? 'bg-amber-400/10 border-amber-400/20 cursor-not-allowed opacity-60'
                                  : 'bg-amber-400/20 border-amber-400/40 hover:bg-amber-400/40 hover:border-amber-400/80 hover:shadow-[0_0_25px_rgba(251,191,36,0.2)]'
                                  }`}
                                title={isLocked ? `${font.name} (Enterprise Required)` : font.name}
                              >
                                <div className="h-10 w-full flex items-center justify-center overflow-hidden">
                                  <p
                                    className={`text-2xl font-black transition-all drop-shadow-[0_0_5px_rgba(251,191,36,0.5)] ${isLocked ? 'text-amber-400/40' : 'text-amber-300 group-hover/item:text-white group-hover/item:scale-110 group-hover/item:drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]'}`}
                                    style={{ fontFamily: font.id }}
                                  >
                                    Ag
                                  </p>
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-tight text-center leading-none px-1 truncate w-full ${isLocked ? 'text-amber-400/40' : 'text-amber-400 group-hover/item:text-white'}`}>
                                  {font.name.split(' ')[0]}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {ALL_FONTS.filter(f => f.name.toLowerCase().includes(fontSearch.toLowerCase())).length === 0 && (
                <div className="py-16 text-center bg-muted/10 rounded-3xl border-2 border-dashed border-muted">
                  <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">No matching fonts found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFontSearch('')}
                    className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white mt-4"
                  >
                    Browse All
                  </Button>
                </div>
              )}
            </div>
          </div>
        );





      case 'uploads':
        return (
          <div className="pl-5 pr-7 py-6 min-h-full relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="font-bold text-lg text-white">Uploads</h3>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/3] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 bg-white/5 hover:border-cosmic-purple/50 hover:bg-cosmic-purple/10 transition-all group"
            >
              <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-cosmic-purple transition-colors">
                <Upload className="h-8 w-8 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-semibold mb-1 text-white">Drop files or click</p>
                <p className="text-xs text-white/40">PNG, JPG, SVG up to 10MB</p>
              </div>
            </button>

            {/* Uploads Grid */}
            <div className="mt-6">
              <h4 className="font-semibold text-[11px] mb-4 text-white/60 uppercase tracking-[0.2em] px-1 opacity-80">Your Uploads</h4>
              {uploadLoading ? (
                <div className="flex justify-center py-8"><div className="animate-spin h-5 w-5 border-2 border-violet-500 border-t-transparent rounded-full" /></div>
              ) : uploads.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {uploads.map((upload) => (
                    <div
                      key={upload._id}
                      className="group relative aspect-square bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-violet-500/50 cursor-pointer transition-all"
                      onClick={() => addUploadToCanvas(upload)}
                    >
                      <img src={upload.data} alt={upload.name} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => handleDeleteUpload(upload._id, e, upload.type)}
                        className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/40 text-xs bg-white/5 rounded-lg border border-dashed border-white/10">
                  No uploads yet
                </div>
              )}
            </div>

            <Separator className="my-6" />

            <div className="p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md">
              <h4 className="font-semibold text-sm mb-3 text-white">Pro Tips</h4>
              <ul className="text-xs text-white/70 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-violet-400">•</span>
                  Add company logos and signatures
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-400">•</span>
                  Use high-resolution images for print
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-400">•</span>
                  PNG format for transparent backgrounds
                </li>
              </ul>
            </div>
          </div>
        );



      case 'mapping':
        return (
          <div className="pl-5 pr-7 py-6 min-h-full relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="font-bold text-lg text-white">Field Mapping</h3>
            </div>

            <div className="bg-violet-600/10 border border-violet-500/30 rounded-xl p-4 mb-6 backdrop-blur-md">
              <p className="text-xs text-white/80 leading-relaxed font-medium">
                Select a text element on the canvas, then click a field below to map it. The text will be replaced with a placeholder like <b className="text-violet-300 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]">{`{{Field}}`}</b>.
              </p>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-violet-300 font-bold font-mono">
                <span className="bg-white/10 px-1.5 py-0.5 rounded border border-white/20 text-white/70">1. Select Text</span>
                <ChevronRight className="h-3 w-3" />
                <span className="bg-white/10 px-1.5 py-0.5 rounded border border-white/20 text-white/70">2. Click Field</span>
              </div>
            </div>

            <h4 className="font-semibold text-[11px] mb-4 text-white/60 uppercase tracking-[0.2em] px-1 opacity-80">Available Fields</h4>
            <div className="space-y-2">
              {mappingFields && mappingFields.map((field) => (
                <button
                  key={field}
                  onClick={() => {
                    if (onFieldMapping) {
                      onFieldMapping('CURRENT_SELECTION', field);
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/10 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-xs border border-violet-500/20">
                      {field.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white">{field}</span>
                  </div>
                  <Plus className="h-4 w-4 text-white/20 group-hover:text-violet-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        );



      case 'bulk':
        return (
          <div className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <h3 className="font-bold text-lg">Bulk Data</h3>
            </div>

            <BulkSection
              onDataUpload={onBulkDataUpload || (() => { })}
              uploadedFileName={bulkFileName}
              recordCount={bulkRecordCount}
              columns={bulkColumns}
              textElements={textElements}
              fieldMappings={fieldMappings}
              onFieldMapping={onFieldMapping}
              isModuleMode={isModuleMode}
              loadingModuleData={loadingModuleData}
              columnsMetadata={columnsMetadata}
              manualValues={manualValues}
              onManualValueChange={onManualValueChange}
            />

            <Separator className="my-5 opacity-20" />
            <div className="p-4 rounded-xl bg-violet-600/5 border border-violet-500/20 backdrop-blur-sm">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-white">
                <span className="h-5 w-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center">1</span>
                How It Works
              </h4>
              <ul className="text-xs text-white/50 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 font-bold">•</span>
                  Upload your Excel/CSV with recipient data
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 font-bold">•</span>
                  Select text elements to map to columns
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 font-bold">•</span>
                  Download all certificates at once
                </li>
              </ul>
            </div>

            {bulkData.length > 0 && (
              <div className="space-y-4">
                <Separator className="my-6 border-white/10 opacity-40" />
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm text-white/70 uppercase tracking-wider flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview Records
                  </h4>
                  <span className="text-[10px] bg-violet-500/30 text-white font-black px-2 py-0.5 rounded-full border border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                    {(previewRecordIndex >= 0 ? previewRecordIndex + 1 : 1)} / {bulkData.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={previewRecordIndex <= 0}
                    onClick={() => onPreviewRecordChange?.(previewRecordIndex - 1)}
                    className="flex-1 h-12 rounded-xl"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={previewRecordIndex >= bulkData.length - 1}
                    onClick={() => onPreviewRecordChange?.(previewRecordIndex + 1)}
                    className="flex-1 h-12 rounded-xl"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 border border-dashed border-white/20 text-center backdrop-blur-md">
                  <p className="text-[10px] text-white/70 leading-relaxed font-medium">
                    Cycling through records will temporarily update the canvas text with real data.
                    Click "Generate" to process all records.
                  </p>
                </div>
              </div>
            )}
          </div>
        );





      default:
        return null;
    }
  };

  return (
    <div className="flex h-full border-r border-white/10 bg-[#0B0F1A] relative z-[50]">
      {/* Tool Icons Area */}
      <div className="w-[72px] border-r border-white/10 flex flex-col items-center py-4 gap-2 bg-[#080a13]">
        {tools.map((tool) => {
          const isLocked = user?.activePlan === 'Free Demo' && tool.id === 'bulk';

          return (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                if (isLocked) {
                  toast.error('Upgrade Required', {
                    description: `The ${tool.label} feature is available on Pro and Enterprise plans.`
                  });
                  return;
                }
                setActiveTool(tool.id);
              }}
              className={`h-14 w-14 flex-col gap-1.5 rounded-lg transition-all relative ${activeTool === tool.id ? 'btn-premium-indigo shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              title={tool.label}
            >
              <tool.icon className={`h-6 w-6 ${isLocked ? 'opacity-40' : ''}`} />
              {isLocked && <Lock className="h-3 w-3 absolute top-2 right-2 text-cosmic-cyan fill-cosmic-cyan/20" />}
            </Button>
          );
        })}
      </div>

      {/* Tool Panel Content Area */}
      <ScrollArea
        className={cn(
          "h-full border-r border-white/10 relative bg-[#0B0F1A]",
          (activeTool === 'templates' || activeTool === 'text' || activeTool === 'uploads') && "galaxy-background overflow-hidden"
        )}
        style={{ width: panelWidth }}
      >
        {(activeTool === 'templates' || activeTool === 'text' || activeTool === 'uploads') && <StarsBackground />}
        {renderToolContent()}
      </ScrollArea>

    </div>
  );
};
