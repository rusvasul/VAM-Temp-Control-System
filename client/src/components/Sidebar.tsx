import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ThermometerIcon,
  History,
  Settings,
  Bell,
  Shield,
  Beer,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const getRoutes = (isAdmin: boolean) => [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Monitoring",
    icon: ThermometerIcon,
    href: "/monitoring",
    color: "text-violet-500",
  },
  {
    label: "History",
    icon: History,
    href: "/history",
    color: "text-pink-700",
  },
  {
    label: "Alarms",
    icon: Bell,
    color: "text-orange-700",
    href: "/alarms",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-emerald-500",
  },
  {
    label: "Beer Styles",
    icon: Beer,
    href: "/beer-styles",
    color: "text-amber-500",
  },
  ...(isAdmin ? [{
    label: "Admin",
    icon: Shield,
    href: "/admin",
    color: "text-red-500",
  }] : []),
]

export function Sidebar() {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const routes = getRoutes(isAdmin);

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-background border-r">
      <div className="px-3 py-2 flex-1">
        <Link to="/" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold text-foreground">
            Brewery Control
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-foreground hover:bg-primary/10 rounded-lg transition",
                (location.pathname === route.href || (route.href === "/" && location.pathname === "/"))
                  ? "text-foreground bg-primary/10"
                  : "text-muted-foreground",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}