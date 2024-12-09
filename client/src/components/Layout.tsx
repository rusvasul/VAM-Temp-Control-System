import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { Footer } from "./Footer"

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-20">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}