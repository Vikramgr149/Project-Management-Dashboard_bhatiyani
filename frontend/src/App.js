/**
 * Main Application Component - Project Management Dashboard
 * 
 * This is the main component that handles routing and provides the overall
 * structure for the project management dashboard application.
 * Uses React Router for navigation and includes multiple views.
 * 
 * Features:
 * - Dashboard with analytics
 * - Project management
 * - Task management  
 * - React Flow workflow visualization
 * - Chart.js analytics
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';

// Import components
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import Analytics from './components/Analytics';
import WorkflowView from './components/WorkflowView';

/**
 * Main App component that sets up routing and provides global structure
 * @returns {JSX.Element} The main application component
 */
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Main application routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/workflow/:projectId" element={<WorkflowView />} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
        {/* Global toast notifications */}
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;