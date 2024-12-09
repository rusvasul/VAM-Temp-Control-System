import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { SettingsProvider } from "./contexts/SettingsContext"
import { ManagerSettingsProvider } from "./contexts/ManagerSettingsContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { Dashboard } from "./pages/Dashboard"
import { Monitoring } from "./pages/Monitoring"
import { History } from "./pages/History"
import { Alarms } from "./pages/Alarms"
import { Settings } from "./pages/Settings"
import { Admin } from "./pages/Admin"
import { Layout } from "./components/Layout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Sidebar } from "./components/Sidebar"
import { useEffect } from "react"

function App() {
  console.log("App component rendering");

  useEffect(() => {
    console.log("App component mounted");
    return () => console.log("App component unmounting");
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <AuthProvider>
        <SettingsProvider>
          <ManagerSettingsProvider>
            <Router>
              <Routes>
                {(() => { console.log("Router rendering"); return null; })()}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <div className="h-full relative">
                        <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-background border-r">
                          <Sidebar />
                        </div>
                        <main className="md:pl-72 min-h-screen">
                          <Layout />
                        </main>
                      </div>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="monitoring" element={<Monitoring />} />
                  <Route path="history" element={<History />} />
                  <Route path="alarms" element={<Alarms />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="admin" element={<Admin />} />
                </Route>
              </Routes>
              <Toaster />
            </Router>
          </ManagerSettingsProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App