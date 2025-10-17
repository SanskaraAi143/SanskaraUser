import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GuestSummaryProps {
  attending: number;
  awaiting: number;
  declined: number;
}

const GuestSummary = ({ attending, awaiting, declined }: GuestSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-heading text-foreground">Guest List Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{attending}</div>
            <p className="text-xs text-text-secondary">Attending</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">{awaiting}</div>
            <p className="text-xs text-text-secondary">Awaiting</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-destructive">{declined}</div>
            <p className="text-xs text-text-secondary">Declined</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestSummary;
