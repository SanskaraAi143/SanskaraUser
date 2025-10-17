import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons"

export const statuses = [
  {
    value: "Backlog",
    label: "Backlog",
    icon: QuestionMarkCircledIcon,
  },
  {
    value: "To Do",
    label: "To Do",
    icon: CircleIcon,
  },
  {
    value: "Doing",
    label: "Doing",
    icon: StopwatchIcon,
  },
  {
    value: "Done",
    label: "Done",
    icon: CheckCircledIcon,
  },
]

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDownIcon,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRightIcon,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUpIcon,
  },
]
