import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send } from 'lucide-react';
import { useState } from 'react';

interface EmailConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSend: (config: { fromEmail: string; subject: string; body: string }) => void;
    recipientCount: number;
}

export const EmailConfigDialog = ({
    open,
    onOpenChange,
    onSend,
    recipientCount,
}: EmailConfigDialogProps) => {
    const [fromEmail, setFromEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const handleSubmit = () => {
        onSend({
            fromEmail,
            subject,
            body,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Send Certificates via Email
                    </DialogTitle>
                    <DialogDescription>
                        Configure the email that will be sent to all <strong>{recipientCount}</strong> eligible recipients.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="fromEmail">From Email (Sender)</Label>
                        <Input
                            id="fromEmail"
                            placeholder="e.g. certificates@yourorg.com"
                            value={fromEmail}
                            onChange={(e) => setFromEmail(e.target.value)}
                            className="rounded-xl"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="subject">Email Subject</Label>
                        <Input
                            id="subject"
                            placeholder="e.g. Your Certificate of Achievement"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="rounded-xl"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="body">Email Body (Plain Text)</Label>
                        <Textarea
                            id="body"
                            placeholder="Enter the email content here..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="rounded-xl min-h-[120px]"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Note: This same message will be sent to all recipients.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} className="rounded-xl gap-2">
                        <Send className="h-4 w-4" />
                        Send Certificates
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
