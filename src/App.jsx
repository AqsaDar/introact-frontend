import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Pipeline from './pages/Pipeline';
import React from 'react';
import Reports from './pages/Reports';
import Upload from './pages/Upload';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
