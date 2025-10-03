import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Pipeline from "./pages/Pipeline";
import React from "react";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";
import Upload from "./pages/Upload";
import Kanban from "./pages/Kanban";
import EmailTemplates from "./pages/EmailTemplates";
import InviteAnalyst from "./pages/InviteAnalyst";
import VapiIntegration from "./pages/VapiIntegration";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Public Route component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppContent = () => {
  const { user } = useAuth();
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          {user?.is_superadmin ? (
            <Route
              path="/invite-analyst"
              element={
                <ProtectedRoute>
                  <Layout>
                    <InviteAnalyst />
                  </Layout>
                </ProtectedRoute>
              }
            />
          ) : (
            <></>
          )}
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Layout>
                  <Upload />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pipeline"
            element={
              <ProtectedRoute>
                <Layout>
                  <Pipeline />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/kanban"
            element={
              <ProtectedRoute>
                <Layout>
                  <Kanban />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-call"
            element={
              <ProtectedRoute>
                {/* <Layout> */}
                <VapiIntegration />
                {/* </Layout> */}
              </ProtectedRoute>
            }
          />
          <Route
            path="/email-templates"
            element={
              <ProtectedRoute>
                <Layout>
                  <EmailTemplates />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Catch-all 404 */}
          <Route
            path="*"
            element={
              <Layout>
                <NotFound />
              </Layout>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <AppContent />
    </AuthProvider>
  );
};

export default App;
