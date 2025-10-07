import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { inviteCollaborator } from '@/services/weddingApi';
import InviteCollaboratorModal from '@/components/dashboard/InviteCollaboratorModal';
import { Button } from '@/components/ui/button';

const WeddingDashboardPage = () => {
  const { user } = useAuth();

  const handleInvite = async (email: string) => {
    if (!user?.wedding_id) {
      throw new Error('No wedding associated with this user.');
    }
    await inviteCollaborator(user.wedding_id, email);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Your Wedding Dashboard</h1>
          <p className="text-muted-foreground">
            An overview of your wedding planning progress.
          </p>
        </div>
        <InviteCollaboratorModal onInvite={handleInvite}>
          <Button>Invite Collaborator</Button>
        </InviteCollaboratorModal>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for Budget Widget */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold">Budget Overview</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A summary of your wedding budget will be displayed here.
            </p>
          </div>
        </div>

        {/* Placeholder for Tasks Widget */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold">Upcoming Tasks</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your upcoming tasks and to-dos will be listed here.
            </p>
          </div>
        </div>

        {/* Placeholder for Guest List Widget */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold">Guest List Summary</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A summary of your guest list and RSVPs will be shown here.
            </p>
          </div>
        </div>

        {/* Placeholder for Timeline Widget */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold">Timeline</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Key dates and events from your wedding timeline will appear here.
            </p>
          </div>
        </div>

        {/* Placeholder for Mood Board Widget */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold">Mood Board</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A preview of your latest mood board images will be here.
            </p>
          </div>
        </div>

        {/* Placeholder for Collaborators List */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold">Collaborators</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A list of people collaborating on this wedding plan will be shown here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeddingDashboardPage;