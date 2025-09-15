import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Kanban
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Overview & Analytics' },
  { name: 'Upload', href: '/upload', icon: Upload, description: 'File Management' },
  { name: 'Pipeline', href: '/pipeline', icon: GitBranch, description: 'Lead Tracking' },
  { name: 'Kanban', href: '/kanban', icon: Kanban, description: 'Task Management' },
  { name: 'Reports', href: '/reports', icon: BarChart3, description: 'Performance Data' },
];

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
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

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72">
          <SidebarContent onLogout={handleLogout} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-500 hover:text-gray-600 lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="ml-3 lg:ml-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {navigation.find(item => item.href === location.pathname)?.name || 'AI Outreach'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {navigation.find(item => item.href === location.pathname)?.description || 'Automation Platform'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ onLogout }) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl">
      {/* Logo Section */}
      <div className="flex items-center flex-shrink-0 px-6 py-8 border-b border-gray-200/50">
        <div className="flex items-center w-full">
          <div className="relative">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-2xl shadow-lg">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              AI Outreach
            </h2>
            <p className="text-sm text-gray-500 font-medium">Automation Platform</p>
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
              className={`group flex items-center justify-between px-4 py-4 text-sm font-medium rounded-2xl transition-all duration-300 hover:scale-105 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 transform scale-105'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <item.icon
                    className={`h-5 w-5 transition-all duration-200 ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                    }`}
                  />
                </div>
                <div className="ml-4">
                  <span className="block font-semibold">{item.name}</span>
                  <span className={`text-xs block mt-0.5 ${
                    isActive ? 'text-white/80' : 'text-gray-400 group-hover:text-gray-500'
                  }`}>
                    {item.description}
                  </span>
                </div>
              </div>
              <ChevronRight 
                className={`h-4 w-4 transition-all duration-200 ${
                  isActive 
                    ? 'text-white transform rotate-90' 
                    : 'text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1'
                }`}
              />
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200/50">
        <div className="flex items-center p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 cursor-pointer group">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {user?.name || user?.email || 'User'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
        
        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full mt-3 flex items-center justify-center px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 hover:scale-105"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Layout;
