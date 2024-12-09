import { ThemeToggle } from "./ui/theme-toggle"
import { UserMenu } from "./UserMenu"
import { useLocation } from "react-router-dom"

export function Header() {
  const location = useLocation()
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Dashboard'
      case '/monitoring':
        return 'Monitoring'
      case '/history':
        return 'History'
      case '/alarms':
        return 'Alarms'
      case '/settings':
        return 'Settings'
      case '/admin':
        return 'Admin'
      default:
        return 'Dashboard'
    }
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="text-xl font-bold text-foreground">
          {getPageTitle(location.pathname)}
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}