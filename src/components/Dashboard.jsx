import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config.js';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [projectCount, setProjectCount] = useState(0);
  const [snippetCount, setSnippetCount] = useState(0);
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      const snippetsSnapshot = await getDocs(collection(db, 'snippets'));
      
      setProjectCount(projectsSnapshot.size);
      setSnippetCount(snippetsSnapshot.size);

      const projects = projectsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      const sortedProjects = projects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      setRecentProjects(sortedProjects.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Statistiche</h2>
          <p className="mb-2">Progetti totali: {projectCount}</p>
          <p>Snippet totali: {snippetCount}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Progetti Recenti</h2>
          <ul>
            {recentProjects.map(project => (
              <li key={project.id} className="mb-2">
                <Link to={`/projects/${project.id}`} className="text-blue-600 hover:underline">
                  {project.name}
                </Link>
                <span className="text-sm text-gray-500 ml-2 block md:inline">
                  ({new Date(project.lastModified).toLocaleDateString()})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;