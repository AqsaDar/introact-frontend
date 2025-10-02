import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Zap,
  User,
  ChevronDown,
  LogOut,
  Bell,
  Settings,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Header = ({ onMenuToggle, showMenuButton = false }) => {
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const settingsMenuRef = useRef(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Show branding only on login page
  const showBranding = location.pathname === '/login';

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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Left side - Logo and Menu */}
        <div className="flex items-center">
          {showMenuButton && (
            <button
              onClick={onMenuToggle}
              className="text-gray-500 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors mr-3"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          
          {/* Logo - Only show on login page */}
          {showBranding && (
            <Link to="/" className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Lead Enrichment System</h1>
                <p className="text-sm text-gray-500 font-medium">Automation Platform</p>
              </div>
            </Link>
          )}
        </div>

        {/* Right side - Notifications and User Menu */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}

          {/* User Avatar + Settings Dropdown */}
          {user && (
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
                      {user.email || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Account Settings
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
                    <button
                      onClick={() => navigate('/invite-analyst')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      {
                        user.is_superadmin ? (
                          <>
                            <svg className="w-4 h-4 mr-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                            Invite Analyst
                          </>
                        ) : (
                          <></>
                        )
                      }
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
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
