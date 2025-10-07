import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface InviteCollaboratorModalProps {
  onInvite: (email: string) => Promise<void>;
  children: React.ReactNode;
}

const InviteCollaboratorModal: React.FC<InviteCollaboratorModalProps> = ({ onInvite, children }) => {
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onInvite(email);
      toast({
        title: 'Success!',
        description: `Invitation sent to ${email}.`,
      });
      setIsOpen(false);
      setEmail('');
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to send invitation. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite a Collaborator</DialogTitle>
          <DialogDescription>
            Enter the email address of the person you want to invite to your wedding plan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="collaborator@example.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleInvite}>Send Invitation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteCollaboratorModal;