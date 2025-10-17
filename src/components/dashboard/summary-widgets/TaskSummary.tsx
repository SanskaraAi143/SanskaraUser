import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CircularProgress from "@/components/ui/CircularProgress"; // Import the new component

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
      <CardContent className="flex flex-col items-center justify-center">
        <CircularProgress percentage={percentage} size={80} strokeWidth={8} />
        <p className="text-sm text-muted-foreground mt-2">
          {completed} of {total} tasks completed
        </p>
      </CardContent>
    </Card>
  );
};

export default TaskSummary;
