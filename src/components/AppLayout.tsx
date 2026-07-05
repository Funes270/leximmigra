import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Shield,
  Gavel,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const menuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/clienti", label: "Anagrafiche", icon: Users },
  { path: "/pratiche", label: "Pratiche", icon: FolderOpen },
  { path: "/permessi", label: "Permessi di Soggiorno", icon: FileText },
  { path: "/protezione", label: "Protezione Internazionale", icon: Shield },
  { path: "/contenzioso", label: "Contenzioso", icon: Gavel },
  { path: "/scadenze", label: "Scadenze", icon: Calendar },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar Desktop */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 hidden lg:flex flex-col ${
          sidebarOpen ? "w-[280px]" : "w-[68px]"
        }`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center border-b border-gray-200 px-4">
          <Scale className="w-7 h-7 text-[#1a365d] flex-shrink-0" />
          {sidebarOpen && (
            <span className="ml-3 font-semibold text-[#1a365d] text-base truncate">
              LexImmigra
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center mx-3 mb-1 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-blue-50 text-blue-700 border-l-[3px] border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } ${!sidebarOpen && "justify-center"}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-blue-600" : "text-gray-500"}`} />
                {sidebarOpen && <span className="ml-3 truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Toggle Sidebar */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 lg:hidden transition-transform duration-300 w-[280px] ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-14 flex items-center justify-between border-b border-gray-200 px-4">
          <div className="flex items-center">
            <Scale className="w-7 h-7 text-[#1a365d]" />
            <span className="ml-3 font-semibold text-[#1a365d]">LexImmigra</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <nav className="py-4">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center mx-3 mb-1 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-50 text-blue-700 border-l-[3px] border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-500"}`} />
                <span className="ml-3">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? "lg:ml-[280px]" : "lg:ml-[68px]"
        }`}
      >
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {menuItems.find((item) => isActive(item.path))?.label || "LexImmigra"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3" />
              <Input
                placeholder="Cerca..."
                className="pl-9 w-64 h-9 text-sm bg-gray-50 border-gray-200"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User */}
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1a365d] flex items-center justify-center text-white text-sm font-medium">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="hidden md:block text-sm text-gray-700 font-medium">{user.name}</span>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
