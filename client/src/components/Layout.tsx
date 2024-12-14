import { Outlet } from "react-router-dom"
import { Footer } from "./Footer"

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 container mx-auto px-4">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}