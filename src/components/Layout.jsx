import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  GitBranch,
  BarChart3,
  Menu,
  X,
  Zap,
  Settings,
  User,
  ChevronRight,
  LogOut,
  Kanban,
  ChevronDown,
  Mail,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

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
];

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const settingsMenuRef = useRef(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target)
      ) {
        setSettingsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
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
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-500 hover:text-gray-600 lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              {/* <div className="ml-3 lg:ml-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  {navigation.find((item) => item.href === location.pathname)
                    ?.name || "AI Outreach"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {navigation.find((item) => item.href === location.pathname)
                    ?.description || "Automation Platform"}
                </p>
              </div> */}
            </div>

            <div className="flex items-center space-x-3">
              {/* User Avatar + Settings Dropdown */}
              <div className="relative" ref={settingsMenuRef}>
                <button
                  onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100"
                  aria-label="User menu"
                >
                  <div className="w-10 h-10 bg-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      settingsMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {settingsMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        Account
                      </p>
                      <p className="text-xs text-gray-500">
                        Manage your profile
                      </p>
                    </div>

                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <User className="w-4 h-4 mr-3 text-gray-400" />
                        Profile Settings
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <Settings className="w-4 h-4 mr-3 text-gray-400" />
                        Preferences
                      </button>
                    </div>

                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
      {/* Logo Section */}
      <div className="flex items-center flex-shrink-0 px-6 py-8 border-b border-gray-200">
        <div className="flex items-center w-full">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-600 rounded-lg">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-900">AI Outreach</h2>
            <p className="text-sm text-gray-500 font-medium">
              Automation Platform
            </p>
          </div>
        </div>
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
              {/* <ChevronDown
                className={`h-4 w-4 transition-all duration-200 ${
                  isActive
                    ? "text-gray-900"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              /> */}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <div className="flex items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200 cursor-pointer group">
          <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
