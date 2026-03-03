import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  ChevronUp,
  Italic,
  Layers,
  Move,
  Trash2,
  Group,
  Ungroup,
  Type,
  Image as ImageIcon,
  Lock,
  Unlock,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { FieldMapping } from './FieldMapping';

interface PropertiesPanelProps {
  selectedObject: any;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onToggleLock?: () => void;
  layers?: any[];
  onSelectLayer?: (obj: any) => void;
  bulkColumns?: string[];
  onFieldMapping?: (objectId: string, column: string) => void;
  fieldMappings?: Record<string, string>;
}

import { ALL_FONTS } from '@/data/fonts';
import { useAuth } from '@/context/AuthContext';

const fontFamilies = ALL_FONTS;

const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96];

export const PropertiesPanel = ({
  selectedObject,
  onDelete,
  onBringForward,
  onSendBackward,
  onGroup,
  onUngroup,
  onToggleLock,
  layers = [],
  onSelectLayer,
  bulkColumns = [],
  onFieldMapping,
  fieldMappings = {},
}: PropertiesPanelProps) => {
  const { user } = useAuth();
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Outfit');
  const [fillColor, setFillColor] = useState('#1a1a1a');
  const [opacity, setOpacity] = useState(100);
  const [textAlign, setTextAlignState] = useState('center');
  const [fontWeight, setFontWeight] = useState('normal');
  const [fontStyle, setFontStyle] = useState('normal');
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (selectedObject) {
      if (selectedObject.fontSize) setFontSize(selectedObject.fontSize);
      if (selectedObject.fontFamily) setFontFamily(selectedObject.fontFamily);
      if (selectedObject.fill && typeof selectedObject.fill === 'string') {
        let color = selectedObject.fill;
        // Fix: Convert RGB to Hex for Input[type="color"]
        if (color.startsWith('rgb')) {
          const rgb = color.match(/\d+/g);
          if (rgb && rgb.length >= 3) {
            color = "#" + ((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1);
          }
        }
        setFillColor(color);
      }
      if (selectedObject.opacity !== undefined) setOpacity(selectedObject.opacity * 100);
      if (selectedObject.textAlign) setTextAlignState(selectedObject.textAlign);
      if (selectedObject.fontWeight) setFontWeight(selectedObject.fontWeight);
      if (selectedObject.fontStyle) setFontStyle(selectedObject.fontStyle);
    }
  }, [selectedObject]);

  const updateProperty = useCallback((property: string, value: any) => {
    if (!selectedObject) return;

    // Handle group property propagation for icons/elements
    if (selectedObject.type === 'group') {
      const group = selectedObject;
      group.set(property, value);

      // Propagate fill/opacity to children for vector icons
      if (property === 'fill' || property === 'opacity' || property === 'stroke') {
        (group as any).forEachObject?.((obj: any) => {
          // Only update fill if it's not transparent
          if (property === 'fill' && obj.fill && obj.fill !== 'transparent') {
            obj.set('fill', value);
          } else if (property === 'stroke' && obj.stroke && obj.stroke !== 'transparent') {
            obj.set('stroke', value);
          } else if (property === 'opacity') {
            obj.set('opacity', value);
          }
        });
      }
    } else {
      selectedObject.set(property, value);
    }

    selectedObject.canvas?.renderAll();
    forceUpdate({});
  }, [selectedObject]);

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    updateProperty('fontSize', size);
  };

  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family);
    updateProperty('fontFamily', family);
  };

  const handleColorChange = (color: string) => {
    setFillColor(color);
    updateProperty('fill', color);
  };

  const handleOpacityChange = (value: number[]) => {
    const opacityValue = value[0];
    setOpacity(opacityValue);
    updateProperty('opacity', opacityValue / 100);
  };

  const toggleBold = () => {
    const newWeight = fontWeight === 'bold' ? 'normal' : 'bold';
    setFontWeight(newWeight);
    updateProperty('fontWeight', newWeight);
  };

  const toggleItalic = () => {
    const newStyle = fontStyle === 'italic' ? 'normal' : 'italic';
    setFontStyle(newStyle);
    updateProperty('fontStyle', newStyle);
  };

  const handleTextAlign = (align: string) => {
    setTextAlignState(align);
    updateProperty('textAlign', align);
  };

  const handleBringForward = () => {
    onBringForward();
    toast.success('Moved forward');
  };

  const handleSendBackward = () => {
    onSendBackward();
    toast.success('Moved backward');
  };

  if (!selectedObject) {
    return (
      <ScrollArea className="w-80 border-l border-white/10 bg-[#141824] relative z-[50]">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-cosmic-purple/10 flex items-center justify-center">
              <Layers className="h-4 w-4 text-cosmic-purple" />
            </div>
            <h3 className="font-bold text-lg text-white/90">Layers</h3>
          </div>

          <div className="space-y-2">
            {!layers || layers.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                  <Layers className="h-6 w-6 text-white/20" />
                </div>
                <p className="text-sm text-white/40 font-medium">No layers yet</p>
              </div>
            ) : (
              layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => onSelectLayer?.(layer.object)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10 group text-left bg-white/5"
                >
                  <div className="h-8 w-8 rounded-lg bg-[#0B0F1A] border border-white/10 flex items-center justify-center text-white/40 group-hover:text-cosmic-purple transition-colors">
                    {layer.type === 'image' ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : layer.type === 'textbox' || layer.type === 'i-text' ? (
                      <Type className="h-4 w-4" />
                    ) : layer.type === 'group' ? (
                      <Group className="h-4 w-4" />
                    ) : (
                      <Layers className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-white/80 group-hover:text-white transition-colors">{layer.name}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">{layer.type}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </ScrollArea>
    );
  }

  const isText = selectedObject.type === 'textbox' || selectedObject.type === 'i-text';
  // Robust check for Group/ActiveSelection (case insensitive + structural check)
  const type = selectedObject.type?.toLowerCase();
  const isGroup = type === 'group';
  const isMultiple = type === 'activeselection' || (selectedObject._objects?.length > 1 && !isGroup);

  return (
    <ScrollArea className="w-80 border-l border-white/10 bg-[#141824] relative z-[50]">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-cosmic-purple/10 flex items-center justify-center">
              <Layers className="h-4 w-4 text-cosmic-purple" />
            </div>
            <h3 className="font-bold text-lg text-white/90">Properties</h3>
          </div>
          <div className="flex items-center gap-1">

            {(isMultiple || isGroup) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isMultiple) {
                    console.log('Group button clicked in PropertiesPanel');
                    onGroup();
                  } else {
                    console.log('Ungroup button clicked in PropertiesPanel');
                    onUngroup();
                  }
                }}
                className="hover:bg-primary/10 hover:text-primary rounded-xl"
                title={isMultiple ? "Group" : "Ungroup"}
              >
                {isMultiple ? <Group className="h-5 w-5" /> : <Ungroup className="h-5 w-5" />}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
              title="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Layer Controls */}
        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <Label className="text-xs font-semibold text-white/40 mb-3 block uppercase tracking-wider">
            Layer Order
          </Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-10 rounded-lg border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all"
              onClick={handleBringForward}
            >
              <ChevronUp className="h-4 w-4 mr-2" />
              Forward
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-10 rounded-lg border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all"
              onClick={handleSendBackward}
            >
              <ChevronDown className="h-4 w-4 mr-2" />
              Backward
            </Button>
          </div>
        </div>

        {/* Field Mapping for Bulk Mode */}
        {isText && bulkColumns.length > 0 && onFieldMapping && (
          <>
            <Separator className="mb-6 bg-white/10" />
            <FieldMapping
              columns={bulkColumns}
              selectedMapping={selectedObject?._id ? fieldMappings[selectedObject._id] : undefined}
              onMappingChange={(column) => {
                if (selectedObject?._id) {
                  onFieldMapping(selectedObject._id, column);
                }
              }}
            />
          </>
        )}

        <Separator className="mb-6 bg-white/10" />

        {/* Text Properties */}
        {isText && (
          <>
            <div className="mb-5">
              <Label className="text-xs font-semibold text-white/40 mb-3 block uppercase tracking-wider">
                Font Family
              </Label>
              <select
                value={fontFamily}
                onChange={(e) => {
                  const selectedFont = ALL_FONTS.find(f => f.id === e.target.value);
                  const isLocked = selectedFont?.premium && user?.activePlan?.toLowerCase() !== 'enterprise';

                  if (isLocked) {
                    toast.error('Enterprise Plan Required', {
                      description: `The font "${selectedFont?.name}" is only available on our Enterprise plan.`
                    });
                    return;
                  }
                  handleFontFamilyChange(e.target.value);
                }}
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-white/80 text-sm font-medium cursor-pointer hover:border-white/20 transition-colors focus:outline-none"
              >
                {ALL_FONTS.map((font) => (
                  <option key={font.id} value={font.id} style={{ fontFamily: font.id }} className="bg-[#141824] text-white">
                    {font.name}
                  </option>
                ))}
              </select>
              {user?.activePlan?.toLowerCase() !== 'enterprise' && (
                <p className="text-[10px] text-amber-400/80 mt-1.5 font-semibold text-center italic">
                  Unlock 30+ Premium fonts with Enterprise
                </p>
              )}
            </div>

            <div className="mb-5">
              <Label className="text-xs font-semibold text-white/40 mb-3 block uppercase tracking-wider">
                Font Size
              </Label>
              <select
                value={fontSize}
                onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-white/80 text-sm font-medium cursor-pointer hover:border-white/20 transition-colors focus:outline-none"
              >
                {fontSizes.map((size) => (
                  <option key={size} value={size} className="bg-[#141824] text-white">
                    {size}px
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <Label className="text-xs font-semibold text-white/40 mb-3 block uppercase tracking-wider">
                Text Style
              </Label>
              <div className="flex gap-2">
                <Button
                  variant={fontWeight === 'bold' ? 'default' : 'outline'}
                  size="icon"
                  onClick={toggleBold}
                  className={`h-11 w-11 rounded-xl border-white/10 ${fontWeight === 'bold' ? 'btn-premium-indigo text-white shadow-md' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
                >
                  <Bold className="h-5 w-5" />
                </Button>
                <Button
                  variant={fontStyle === 'italic' ? 'default' : 'outline'}
                  size="icon"
                  onClick={toggleItalic}
                  className={`h-11 w-11 rounded-xl border-white/10 ${fontStyle === 'italic' ? 'btn-premium-indigo text-white shadow-md' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
                >
                  <Italic className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="mb-5">
              <Label className="text-xs font-semibold text-white/40 mb-3 block uppercase tracking-wider">
                Alignment
              </Label>
              <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
                <Button
                  variant={textAlign === 'left' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => handleTextAlign('left')}
                  className={`h-10 w-10 rounded-lg flex-1 ${textAlign === 'left' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
                >
                  <AlignLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant={textAlign === 'center' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => handleTextAlign('center')}
                  className={`h-10 w-10 rounded-lg flex-1 ${textAlign === 'center' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
                >
                  <AlignCenter className="h-5 w-5" />
                </Button>
                <Button
                  variant={textAlign === 'right' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => handleTextAlign('right')}
                  className={`h-10 w-10 rounded-lg flex-1 ${textAlign === 'right' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
                >
                  <AlignRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Separator className="mb-6 bg-white/10" />
          </>
        )}

        {/* Color */}
        <div className="mb-5">
          <Label className="text-xs font-semibold text-white/40 mb-3 block uppercase tracking-wider">
            {isText ? 'Text Color' : 'Fill Color'}
          </Label>
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="color"
                value={fillColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="h-11 w-11 rounded-xl border border-white/10 cursor-pointer appearance-none bg-transparent"
              />
            </div>
            <Input
              value={fillColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="flex-1 h-11 rounded-xl font-mono text-sm bg-white/5 border-white/10 text-white"
              placeholder="#000000"
            />
          </div>
          {/* Quick Color Presets */}
          <div className="flex gap-2 mt-3">
            {['#FFFFFF', '#C0C0C0', '#111111', '#7C3AED', '#0ea5e9', '#ef4444'].map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`h-8 w-8 rounded-lg border transition-all hover:scale-110 ${fillColor === color ? 'border-cosmic-purple ring-2 ring-cosmic-purple/30' : 'border-white/10'
                  }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Opacity */}
        <div className="mb-5">
          <Label className="text-xs font-semibold text-white/40 mb-3 block uppercase tracking-wider">
            Opacity: {Math.round(opacity)}%
          </Label>
          <Slider
            value={[opacity]}
            onValueChange={handleOpacityChange}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </ScrollArea>
  );
};
