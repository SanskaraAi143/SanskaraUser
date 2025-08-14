import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TaskSummaryProps {
  completed: number;
  total: number;
}

const TaskSummary = ({ completed, total }: TaskSummaryProps) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Task Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{completed} / {total}</div>
        <p className="text-xs text-muted-foreground">
          Tasks completed
        </p>
        <Progress value={percentage} className="mt-4 h-2" />
      </CardContent>
    </Card>
  );
};

export default TaskSummary;
