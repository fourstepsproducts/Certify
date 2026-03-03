import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CoreEditor } from '@/components/editor/CoreEditor';

interface EditorDialogProps {
    open: boolean;
    onClose: () => void;
    templateId?: string | null;
    onSave?: (canvasData: any, thumbnail: string) => Promise<void>;
    fields?: string[];
}

export const EditorDialog = ({ open, onClose, templateId, onSave, fields = [] }: EditorDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] h-[90vh] p-0 overflow-hidden rounded-xl border-none">
                <DialogTitle className="sr-only">Certificate Editor</DialogTitle>
                <DialogDescription className="sr-only">Design and customize your certificate template</DialogDescription>
                <CoreEditor
                    userTemplateId={templateId}
                    onClose={onClose}
                    onSave={onSave}
                    // We can hide the header if we want a cleaner modal look, or keep it for the actions
                    renderHeader={true}
                    mappingFields={fields}
                    simplified={true}
                // In modal mode, returnTo isn't relevant for navigation, but we might want to close the modal
                />
            </DialogContent>
        </Dialog>
    );
};
