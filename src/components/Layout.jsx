import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  GitBranch,
  BarChart3,
  Menu,
  X,
  Zap,
  User,
  ChevronRight,
  LogOut,
  Kanban,
  ChevronDown,
  Mail,
  Phone,
  ChevronLeft,
  Package,
  Users,
  FileText,
  TrendingUp,
  CreditCard,
  Square,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Header from "./Header";
import Footer from "./Footer";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview & Analytics",
  },
  {
    name: "Upload",
    href: "/upload",
    icon: Upload,
    description: "File Management",
  },
  {
    name: "Pipeline",
    href: "/pipeline",
    icon: GitBranch,
    description: "Lead Tracking",
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    description: "Performance Data",
  },
  {
    name: "Email Templates",
    href: "/email-templates",
    icon: Mail,
    description: "Choose & preview templates",
  },
  // {
  //   name: "VAPI Integration",
  //   href: "/vapi-integration",
  //   icon: Phone,
  //   description: "Voice AI calls & automation",
  // },
];

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Check if screen is mobile on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Set initial sidebar state based on screen size
  useEffect(() => {
    setSidebarOpen(!isMobile); // Open on desktop, closed on mobile
  }, [isMobile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-full max-w-xs bg-white shadow-2xl">
            <div className="absolute top-0 right-0 p-2 -mr-12">
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-white bg-opacity-20 backdrop-blur-sm"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <SidebarContent
              onLogout={handleLogout}
              collapsed={false}
              onToggle={toggleSidebar}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar - Always visible on desktop, toggleable between expanded/collapsed */}
      <div className="hidden lg:flex lg:flex-shrink-0 transition-all duration-300">
        <div
          className={`flex flex-col transition-all duration-300 ${
            sidebarCollapsed ? "w-16" : "w-72"
          }`}
        >
          <SidebarContent
            onLogout={handleLogout}
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden overflow-y-auto">
        {/* Header */}
        <Header onMenuToggle={toggleSidebar} showMenuButton={true} />

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6 h-full">{children}</div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

function SidebarContent({ onLogout, collapsed = false, onToggle }) {
  const location = useLocation();

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
      {/* Sidebar Header with Toggle */}
      <div className="flex items-center justify-end p-4 border-b border-gray-200">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center transition-all duration-200 rounded-lg ${
                collapsed
                  ? `justify-center p-3 ${
                      isActive
                        ? "bg-green-100 text-gray-900"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  : `px-3 py-3 ${
                      isActive
                        ? "bg-green-100 text-gray-900"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`
              }`}
              title={collapsed ? item.name : undefined}
            >
              <div
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-green-200"
                    : "bg-gray-100 group-hover:bg-gray-200"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive
                      ? "text-gray-900"
                      : "text-gray-500 group-hover:text-gray-700"
                  }`}
                />
              </div>
              {!collapsed && (
                <span className="ml-3 font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center rounded-lg border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200 ${
            collapsed ? "p-3" : "px-4 py-3"
          }`}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2 font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );
}

export default Layout;
