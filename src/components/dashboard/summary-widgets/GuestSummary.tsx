import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GuestSummaryProps {
  confirmed: number;
  invited: number;
}

const GuestSummary = ({ confirmed, invited }: GuestSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Guest List Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{confirmed}</div>
        <p className="text-xs text-muted-foreground">
          Guests confirmed out of {invited}
        </p>
      </CardContent>
    </Card>
  );
};

export default GuestSummary;
