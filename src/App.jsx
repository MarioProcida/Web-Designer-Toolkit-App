import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import ProjectManager from './components/ProjectManager';
import ProjectDetail from './components/ProjectDetail';
import QuoteManager from './components/QuoteManager';
import QuoteDetail from './components/QuoteDetail';
import ContractManager from './components/ContractManager';
import ContractDetail from './components/ContractDetail';
import CodeEditor from './components/CodeEditor';
import DesignTools from './components/DesignTools';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <main className="container mx-auto mt-8 p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectManager />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/quotes" element={<QuoteManager />} />
            <Route path="/quotes/:id" element={<QuoteDetail />} />
            <Route path="/contracts" element={<ContractManager />} />
            <Route path="/contracts/:id" element={<ContractDetail />} />
            <Route path="/code-editor" element={<CodeEditor />} />
            <Route path="/design-tools" element={<DesignTools />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;