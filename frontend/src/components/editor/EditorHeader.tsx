import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Canvas as FabricCanvas } from 'fabric';
import {
  Award,
  ChevronDown,
  Cloud,
  Download,
  FileImage,
  FileText,
  History,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Redo2,
  Save,
  Settings,
  Share2,
  Undo2,
  User,
  ShieldCheck,
  Layout,
  Lock,
  CheckCircle,
  Folder,
  Layers,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';
import { generateBulkCertificates } from '@/utils/bulkGenerate';
import { useAuth } from '@/context/AuthContext';
import { BulkGenerationToast, BulkGenerationSuccessToast } from './BulkGenerationToast';
import { EmailConfigDialog } from './EmailConfigDialog';

interface EditorHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExportPNG: (multiplier?: number) => void;
  onExportPDF: (multiplier?: number) => void;
  isExportingPNG?: boolean;
  isExportingPDF?: boolean;
  isBulkMode?: boolean;
  bulkRecordCount?: number;
  fieldMappings?: Record<string, string>;
  canvas?: FabricCanvas | null;
  bulkData?: any[];
  onToggleSafeZone?: () => void;
  showSafeZone?: boolean;
  onBulkExport?: (count: number, format: 'PNG' | 'PDF', multiplier: number) => void;
  onPickDirectory?: () => void;
  directoryName?: string;
  returnTo?: string | null;
  onFinish?: () => void;
  finishButtonText?: string;
  manualValues?: Record<string, string>;
  moduleId?: string | null;
  activeTemplateId?: string | null;
}

export const EditorHeader = ({
  title,
  onTitleChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExportPNG,
  onExportPDF,
  isExportingPNG = false,
  isExportingPDF = false,
  isBulkMode = false,
  bulkRecordCount = 0,
  fieldMappings = {},
  canvas,
  bulkData = [],
  onToggleSafeZone,
  showSafeZone = false,
  onBulkExport,
  onPickDirectory,
  directoryName,
  returnTo,
  onFinish,
  finishButtonText = 'Finish',
  manualValues = {},
  moduleId,
  activeTemplateId,
}: EditorHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resolution, setResolution] = useState(2); // 1=480p, 2=720p (default), 3=1080p
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkCount, setBulkCount] = useState(1);
  const [bulkFormat, setBulkFormat] = useState<'PNG' | 'PDF'>('PNG');
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const requireAuth = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      // Save current state before redirecting
      if (canvas) {
        try {
          // Preserve custom properties like _id 
          const json = canvas.toObject(['_id']);
          localStorage.setItem('temp_canvas_state', JSON.stringify(json));
          localStorage.setItem('temp_canvas_title', title);

          if (isBulkMode && bulkData.length > 0) {
            localStorage.setItem('temp_bulk_data', JSON.stringify(bulkData));
            localStorage.setItem('temp_field_mappings', JSON.stringify(fieldMappings));
          }

          toast.info('Your work has been temporarily saved. Please sign in to continue.');
        } catch (err) {
          console.error("Failed to save temporary state", err);
        }
      }

      toast.error('Please sign in to continue');
      navigate('/signin');
    }
  };

  const handleBulkGeneratePDF = async () => {
    requireAuth(async () => {
      if (!canvas || bulkData.length === 0) {
        toast.error('No data to generate certificates');
        return;
      }

      if (Object.keys(fieldMappings).length === 0) {
        toast.error('Please map at least one field before generating');
        return;
      }

      setIsGenerating(true);

      // Show loading toast with progress bar starting at 0%
      let toastId = toast(<BulkGenerationToast current={0} total={bulkRecordCount} format="PDF" />, {
        duration: Infinity,
      });

      try {
        await generateBulkCertificates({
          canvas,
          bulkData,
          fieldMappings,
          format: 'pdf',
          fileName: title.replace(/\s+/g, '_').toLowerCase(),
          manualValues,
          onProgress: (current, total) => {
            // Update toast with current progress
            toast(<BulkGenerationToast current={current} total={total} format="PDF" />, {
              id: toastId,
              duration: Infinity,
            });
          },
        });

        // Update to success
        toast(<BulkGenerationSuccessToast format="PDF" />, { id: toastId, duration: 3000 });
      } catch (error) {
        console.error('Bulk generation error:', error);
        toast.error('Failed to generate certificates', { id: toastId });
      } finally {
        setIsGenerating(false);
      }
    });
  };

  const handleBulkGenerateJPG = async () => {
    requireAuth(async () => {
      if (!canvas || bulkData.length === 0) {
        toast.error('No data to generate certificates');
        return;
      }

      if (Object.keys(fieldMappings).length === 0) {
        toast.error('Please map at least one field before generating');
        return;
      }

      setIsGenerating(true);

      // Show loading toast with progress bar starting at 0%
      let toastId = toast(<BulkGenerationToast current={0} total={bulkRecordCount} format="PNG" />, {
        duration: Infinity,
      });

      try {
        await generateBulkCertificates({
          canvas,
          bulkData,
          fieldMappings,
          format: 'png',
          fileName: title.replace(/\s+/g, '_').toLowerCase(),
          manualValues,
          onProgress: (current, total) => {
            // Update toast with current progress
            toast(<BulkGenerationToast current={current} total={total} format="PNG" />, {
              id: toastId,
              duration: Infinity,
            });
          },
        });

        // Update to success
        toast(<BulkGenerationSuccessToast format="PNG" />, { id: toastId, duration: 3000 });
      } catch (error) {
        console.error('Bulk generation error:', error);
        toast.error('Failed to generate certificates', { id: toastId });
      } finally {
        setIsGenerating(false);
      }
    });
  };

  const handleBulkEmail = async () => {
    requireAuth(() => {
      setIsEmailDialogOpen(true);
    });
  };

  const handleSendEmail = async (config: { fromEmail: string; subject: string; body: string }) => {
    if (!canvas) return;

    const toastId = toast.loading(`Sending certificates to ${bulkRecordCount} recipients...`);

    try {
      const activeModuleId = moduleId || (window as any).moduleId;

      if (!activeModuleId) {
        throw new Error('Module ID is missing. Cannot identify eligible recipients.');
      }

      // Pre-process: Convert all images to Base64 to ensure backend can load them
      // (Backend cannot load blob: URLs or relative paths easily)
      const objects = canvas.getObjects();
      for (const obj of objects) {
        if (obj.type === 'image' && (obj as any)._element) {
          try {
            const imgObj = obj as any;
            // Use toDataURL on the object itself to get a representation? 
            // Or better: get the source element and draw to canvas.
            // Fabric objects have toDataURL but that returns the object rendering.
            // We want the original image source as base64.
            // Simplest: use fabric's toDataURL for that object (cropped/etc handled?)
            // Actually, simplest is to use the object's toDataURL format 'png'.
            const dataUrl = imgObj.toDataURL();
            // But WAIT, toDataURL returns the whole object rotated/scaled.
            // We want the SRC to be base64.
            // Let's assume the element is an Image. use utils.
            if (imgObj.src && (imgObj.src.startsWith('blob:') || imgObj.src.startsWith('/'))) {
              // Create temp canvas to extract base64
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = imgObj._element.naturalWidth || imgObj.width;
              tempCanvas.height = imgObj._element.naturalHeight || imgObj.height;
              const ctx = tempCanvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(imgObj._element, 0, 0);
                imgObj.src = tempCanvas.toDataURL('image/png');
              }
            }
          } catch (err) {
            console.warn('Failed to convert image to base64', ((obj as any).src), err);
          }
        }
      }

      // Get canvas data for server-side rendering
      const canvasData = canvas.toObject(['_id', 'id', 'name', 'type', 'text', 'src', 'width', 'height', 'left', 'top', 'scaleX', 'scaleY', 'angle', 'opacity', 'fill', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'textDecoration', 'textAlign', 'lineHeight', 'charSpacing']);

      // Ensure dimensions are included
      canvasData.width = canvas.getWidth();
      canvasData.height = canvas.getHeight();
      canvasData.backgroundColor = canvas.backgroundColor;

      const response = await fetch('/api/certificates/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          moduleId: activeModuleId,
          emailConfig: config,
          canvasData,
          fieldMappings // Send mappings so backend knows how to replace text
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send emails');
      }

      toast.success(data.message || `Certificates successfully sent to ${data.count} recipients!`, { id: toastId });

    } catch (error: any) {
      console.error('Email sending failed:', error);
      toast.error(error.message || 'Failed to send emails', { id: toastId });
    }
  };

  const handleSave = () => {
    requireAuth(async () => {
      if (!canvas) return;

      const toastId = toast.loading('Saving template...');
      try {
        // Save current viewport transform
        const currentTransform = (canvas.viewportTransform?.slice() || [1, 0, 0, 1, 0, 0]) as [number, number, number, number, number, number];

        // Temporarily reset viewport to get original object positions
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        canvas.renderAll();

        const thumbnail = canvas.toDataURL({
          format: 'png',
          quality: 0.8,
          multiplier: 0.5
        });

        // Get canvas data with custom properties and dimensions
        const canvasData = canvas.toObject(['_id', 'id']);

        // Ensure dimensions are saved correctly
        canvasData.width = canvas.getWidth();
        canvasData.height = canvas.getHeight();
        canvasData.backgroundColor = canvas.backgroundColor;

        // Restore viewport transform
        canvas.setViewportTransform(currentTransform);
        canvas.renderAll();

        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
          body: JSON.stringify({
            name: title,
            canvasData,
            thumbnail,
            category: 'achievement' // Valid category: participation, achievement, completion, award
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to save template');
        }

        toast.success('Template saved successfully', { id: toastId });

        // Handle Return Flow
        if (returnTo) {
          setTimeout(() => {
            navigate(returnTo);
          }, 1000);
        }

      } catch (error: any) {
        console.error('Save error:', error);
        toast.error(error.message || 'Failed to save template', { id: toastId });
      }
    });
  };

  const handleLockLayout = async () => {
    console.log('EditorHeader: handleLockLayout called. activeTemplateId:', activeTemplateId);
    if (!canvas || !activeTemplateId || !user?.token || !user.canLockLayout) {
      if (!activeTemplateId) toast.error("Please select a template first.");
      return;
    }

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
        toast.success("Default template updated successfully.");
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

  return (
    <header className="h-16 border-b border-white/10 bg-[#0B0F1A] flex items-center justify-between pl-6 pr-10 shrink-0 shadow-lg relative z-[60]">
      {/* Left - Logo & Title */}
      <div className="flex items-center gap-5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-premium-indigo shadow-lg transition-transform group-hover:scale-110">
            <Award className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg hidden sm:block text-white/90 tracking-tight">Certify<span className="text-cosmic-cyan">Pro</span></span>
        </Link>

        <div className="h-8 w-px bg-border/50" />

        {/* Editable Title */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="bg-white/5 border border-white/20 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cosmic-purple/20 px-3 py-1.5 min-w-[200px] text-white"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-semibold text-white/80 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              {title ? (
                <>
                  {title}
                  <span className="text-[10px] text-white/40 font-normal">(click to edit)</span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-32 bg-white/10 animate-pulse rounded" />
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Center - History Controls */}
      <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 rounded-full p-1.5 shadow-inner">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="h-8 w-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="h-8 w-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          title="Version History"
          className="h-8 w-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-110 active:scale-95"
          onClick={() => toast.info('Version history coming soon')}
        >
          <History className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <Button
          variant={showSafeZone ? 'secondary' : 'ghost'}
          size="icon"
          onClick={onToggleSafeZone}
          title={showSafeZone ? "Hide Safe Zone" : "Show Safe Zone"}
          className={`h-8 w-8 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${showSafeZone ? 'text-cosmic-cyan bg-cosmic-cyan/20 border border-cosmic-cyan/30 shadow-[0_0_15px_rgba(110,231,249,0.2)]' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
        >
          <Layout className="h-4 w-4" />
        </Button>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {loading ? (
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse shadow-sm" />
        ) : (
          isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-3 py-1.5 hover:bg-white/[0.08] border border-transparent hover:border-white/10 rounded-xl transition-all duration-300 group shadow-none hover:shadow-[0_0_20px_rgba(139,124,255,0.15)]">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-cyan text-white flex items-center justify-center font-bold text-xs shadow-lg transition-transform group-hover:scale-110">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col items-start hidden md:flex">
                    <span className="text-xs font-semibold leading-none text-white/90 group-hover:text-white transition-colors">{user.name}</span>
                    <span className="text-[10px] text-white/50 leading-none mt-1 group-hover:text-white/70 transition-colors truncate max-w-[120px]">{user.email}</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 mt-2">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => navigate('/dashboard')} className="gap-3 cursor-pointer rounded-lg py-2.5">
                  <Award className="h-4 w-4" />
                  <span>My Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-3 cursor-pointer rounded-lg py-2.5">
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-3 cursor-pointer rounded-lg py-2.5">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate('/signin');
                  }}
                  className="gap-3 cursor-pointer rounded-lg py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        )}

        {/* Resolution Selector */}
        <div className="hidden md:flex items-center mr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl h-9 text-xs font-semibold bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20 hover:text-white transition-all duration-300">
                <span className="text-white/70 group-hover:text-white">{resolution === 1 ? '480p' : resolution === 2 ? '720p (HD)' : '1080p (FHD)'}</span>
                <ChevronDown className="h-3 w-3 text-white/40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl p-1">
              <DropdownMenuItem onClick={() => setResolution(1)} className="text-xs cursor-pointer rounded-lg">
                <span className="flex-1">Standard (480p)</span>
                {resolution === 1 && <CheckCircle className="h-3 w-3 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setResolution(2)} className="text-xs cursor-pointer rounded-lg">
                <span className="flex-1">High Quality (720p)</span>
                {resolution === 2 && <CheckCircle className="h-3 w-3 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (user?.activePlan === 'Free Demo') {
                    toast.error('Pro Feature', { description: '1080p export is available on Pro plan' });
                    return;
                  }
                  setResolution(3);
                }}
                className={`text-xs cursor-pointer rounded-lg ${user?.activePlan === 'Free Demo' ? 'opacity-70' : ''}`}
              >
                <span className="flex-1 flex items-center gap-2">
                  Full HD (1080p)
                  {user?.activePlan === 'Free Demo' && <Lock className="h-3 w-3 text-primary" />}
                </span>
                {resolution === 3 && <CheckCircle className="h-3 w-3 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          variant={returnTo ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            "gap-2 rounded-xl hidden sm:flex transition-all duration-300 border border-transparent hover:border-white/10",
            returnTo ? "btn-premium-indigo px-4" : "text-white/70 hover:text-white hover:bg-white/[0.08]"
          )}
          onClick={handleSave}
        >
          <Cloud className="h-4 w-4 transition-transform group-hover:scale-110" />
          {returnTo ? 'Save & Return' : 'Save'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-2 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.08] transition-all duration-300 border border-transparent hover:border-white/10"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>

        {onFinish ? (
          <Button
            size="sm"
            className="gap-2 rounded-xl shadow-lg hover:shadow-xl transition-shadow bg-primary text-primary-foreground px-6 py-5 font-bold text-base"
            onClick={onFinish}
          >
            <CheckCircle className="h-5 w-5" />
            {finishButtonText}
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2.5 rounded-xl shadow-lg hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] transition-all duration-500 btn-premium-indigo px-5 font-bold hover:scale-[1.02] active:scale-95 group">
                <Download className="h-4 w-4 group-hover:animate-bounce" />
                {isBulkMode ? `Generate ${bulkRecordCount}` : 'Download'}
                <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl p-2">
              {isBulkMode ? (
                <>
                  <DropdownMenuItem onClick={handleBulkGeneratePDF} className="gap-3 cursor-pointer rounded-lg py-3">
                    <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <div className="font-medium">All as PDF</div>
                      <div className="text-xs text-muted-foreground">{bulkRecordCount} certificates</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleBulkGenerateJPG} className="gap-3 cursor-pointer rounded-lg py-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FileImage className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">All as JPG</div>
                      <div className="text-xs text-muted-foreground">{bulkRecordCount} certificates</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleBulkEmail} className="gap-3 cursor-pointer rounded-lg py-3">
                    <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <div className="font-medium">Send via Email</div>
                      <div className="text-xs text-muted-foreground">To recipients</div>
                    </div>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => requireAuth(() => onExportPNG(resolution))} className="gap-3 cursor-pointer rounded-lg py-3" disabled={isExportingPNG || isExportingPDF}>
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      {isExportingPNG ? (
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                      ) : (
                        <FileImage className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{isExportingPNG ? 'Exporting...' : 'PNG Image'}</div>
                      <div className="text-xs text-muted-foreground">High quality image</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      if (user?.activePlan === 'Free Demo') {
                        toast.error('Pro Feature', {
                          description: 'PDF export is only available on Pro and Enterprise plans.'
                        });
                        return;
                      }
                      requireAuth(() => onExportPDF(resolution));
                    }}
                    className={`gap-3 cursor-pointer rounded-lg py-3 ${user?.activePlan === 'Free Demo' ? 'opacity-70 group/pdf' : ''}`}
                    disabled={isExportingPNG || isExportingPDF}
                  >
                    <div className={`h-8 w-8 rounded-lg ${user?.activePlan === 'Free Demo' ? 'bg-muted text-muted-foreground' : 'bg-red-500/10'} flex items-center justify-center`}>
                      {isExportingPDF ? (
                        <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                      ) : (
                        <div className="relative">
                          <FileText className={`h-4 w-4 ${user?.activePlan === 'Free Demo' ? '' : 'text-red-500'}`} />
                          {user?.activePlan === 'Free Demo' && (
                            <Lock className="h-2 w-2 absolute -top-1 -right-1 text-primary" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{isExportingPDF ? 'Exporting...' : 'PDF Document'}</div>
                        {user?.activePlan === 'Free Demo' && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase transition-all group-hover/pdf:bg-primary group-hover/pdf:text-white">Pro</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">Print-ready format</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsBulkDialogOpen(true)}
                    className="gap-3 cursor-pointer rounded-lg py-3"
                    disabled={isExportingPNG || isExportingPDF}
                  >
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Layers className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <div className="font-medium">Bulk Copies</div>
                      <div className="text-xs text-muted-foreground">Download multiple copies</div>
                    </div>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Bulk Quantity Dialog */}
        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-500" />
                Download Bulk Copies
              </DialogTitle>
              <DialogDescription>
                Specify how many copies you want to download.
                {user?.activePlan === 'Free Demo' && " (Max 3 for Free plan)"}
                {user?.activePlan === 'Pro' && " (Max 500 for Pro plan)"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="count" className="text-right">
                  Count
                </Label>
                <Input
                  id="count"
                  type="number"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
                  className="col-span-3 rounded-xl shadow-sm focus:ring-purple-500 border-purple-100"
                  min={1}
                  max={user?.activePlan === 'Free Demo' ? 3 : (user?.activePlan === 'Pro' ? 500 : 9999)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Format</Label>
                <div className="col-span-3 flex gap-2">
                  <Button
                    variant={bulkFormat === 'PNG' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 rounded-xl"
                    onClick={() => setBulkFormat('PNG')}
                  >
                    PNG
                  </Button>
                  <Button
                    variant={bulkFormat === 'PDF' ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 rounded-xl ${user?.activePlan === 'Free Demo' ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (user?.activePlan === 'Free Demo') {
                        toast.error('Pro Feature', { description: 'PDF export requires Pro plan.' });
                        return;
                      }
                      setBulkFormat('PDF');
                    }}
                  >
                    PDF
                  </Button>
                </div>
              </div>

              {/* Directory Picker Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Destination Folder</Label>
                  {directoryName && (
                    <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 font-medium flex items-center gap-1">
                      <CheckCircle className="h-2 w-2" /> Selected
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  className={`w-full justify-start gap-3 h-12 rounded-xl border-dashed ${directoryName ? 'border-green-200 bg-green-50/30' : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/30'}`}
                  onClick={onPickDirectory}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${directoryName ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                    <Folder className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-medium ${directoryName ? 'text-green-700' : 'text-purple-700'}`}>
                      {directoryName || 'Select Download Folder'}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                      {directoryName ? 'All files will be saved here automatically' : 'Avoid individual "Save As" prompts'}
                    </div>
                  </div>
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsBulkDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                className="rounded-xl px-8 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20"
                onClick={() => {
                  onBulkExport(bulkCount, bulkFormat, resolution);
                  setIsBulkDialogOpen(false);
                }}
              >
                Start Bulk Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <EmailConfigDialog
          open={isEmailDialogOpen}
          onOpenChange={setIsEmailDialogOpen}
          onSend={handleSendEmail}
          recipientCount={bulkRecordCount}
        />
      </div>
    </header>
  );
};
