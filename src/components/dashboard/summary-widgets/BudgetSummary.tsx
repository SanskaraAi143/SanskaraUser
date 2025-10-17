import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BudgetSummaryProps {
  spent: number;
  total: number;
  currency?: string; // e.g., 'INR', 'USD'
}

const BudgetSummary = ({ spent, total, currency = 'USD' }: BudgetSummaryProps) => {
  const percentage = total > 0 ? (spent / total) * 100 : 0;
  const formatter = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Budget Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatter.format(spent)} / {formatter.format(total)}
        </div>
        <p className="text-xs text-muted-foreground">
          {percentage.toFixed(0)}% of budget spent
        </p>
        <Progress value={percentage} className="mt-4 h-2" />
      </CardContent>
    </Card>
  );
};

export default BudgetSummary;
