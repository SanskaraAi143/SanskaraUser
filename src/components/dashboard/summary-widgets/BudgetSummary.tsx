import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/utils/formatters";

interface BudgetSummaryProps {
  spent: number;
  total: number;
}

const BudgetSummary = ({ spent, total }: BudgetSummaryProps) => {
  const percentage = total > 0 ? (spent / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Budget Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(spent)}</div>
        <p className="text-xs text-muted-foreground">
          Spent of {formatCurrency(total)}
        </p>
        <Progress value={percentage} className="mt-4 h-2" />
      </CardContent>
    </Card>
  );
};

export default BudgetSummary;
