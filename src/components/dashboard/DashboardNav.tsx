import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function DashboardNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const { pathname } = useLocation();
  const a = pathname.split("/");
  const currentPath = a[a.length - 1];

  const links = [
    {
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      name: "Tasks",
      path: "/dashboard/tasks",
    },
    {
      name: "Budget",
      path: "/dashboard/budget",
    },
    {
      name: "Guests",
      path: "/dashboard/guests",
    },
    {
      name: "Vendors",
      path: "/dashboard/vendors",
    },
    {
      name: "Moodboard",
      path: "/dashboard/moodboard",
    },
  ];

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {links.map((link) => (
        <Link
          key={link.name}
          to={link.path}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            currentPath === link.path.split("/").pop()
              ? ""
              : "text-muted-foreground"
          }`}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
}
