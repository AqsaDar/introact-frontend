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
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
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
    setSidebarOpen(!sidebarOpen);
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
            <SidebarContent onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Desktop sidebar - Always visible on desktop, toggleable */}
      <div className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'lg:block' : 'lg:hidden'}`}>
        <div className="flex flex-col w-72">
          <SidebarContent onLogout={handleLogout} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuToggle={toggleSidebar} showMenuButton={true} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 h-full">{children}</div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

function SidebarContent({ onLogout }) {
  const location = useLocation();

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
      {/* Logo Section */}
      <div className="flex items-center flex-shrink-0 px-6 py-8 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center w-full group">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-600 rounded-lg group-hover:bg-gray-700 transition-colors">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-gray-950">Lead Enrichment System</h2>
            <p className="text-sm text-gray-500 font-medium">
              Automation Platform
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center justify-between px-4 py-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-green-100 text-gray-900"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-green-200"
                      : "bg-gray-100 group-hover:bg-gray-200"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 transition-all duration-200 ${
                      isActive
                        ? "text-gray-900"
                        : "text-gray-500 group-hover:text-gray-700"
                    }`}
                  />
                </div>
                <div className="ml-4">
                  <span className="block font-semibold">{item.name}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="flex items-center justify-center p-4 rounded-lg bg-gray-50">
        <button
          onClick={onLogout}
          className="inline-flex cursor-pointer items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Layout;
