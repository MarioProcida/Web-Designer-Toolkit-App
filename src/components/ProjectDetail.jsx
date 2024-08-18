import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase/config.js';
import { doc, getDoc } from 'firebase/firestore';

function ProjectDetail() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectDoc = await getDoc(doc(db, 'projects', id));
        if (projectDoc.exists()) {
          setProject({ id: projectDoc.id, ...projectDoc.data() });
        } else {
          setError('Progetto non trovato');
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError('Errore nel caricamento del progetto');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) return <div className="text-center mt-8">Caricamento...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!project) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto mt-8">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">{project.name}</h2>
      <div className="mb-4">
        <span className={`px-2 py-1 rounded-full text-sm ${project.active ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
          {project.active ? 'Attivo' : 'Non attivo'}
        </span>
      </div>
      <div className="mb-2">
        <strong>URL:</strong> <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{project.url}</a>
      </div>
      <div className="mb-2"><strong>Cliente:</strong> {project.client}</div>
      <div className="mb-2">
        <strong>Periodo contratto:</strong> {project.contractPeriod?.start || 'N/A'} - {project.contractPeriod?.end || 'N/A'}
      </div>
      <div className="mb-4">
        <strong>Tags:</strong>
        <div className="flex flex-wrap gap-1 mt-1">
          {project.tags && project.tags.map((tag, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{tag}</span>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <strong>Note:</strong>
        <p className="mt-1 text-gray-600">{project.notes}</p>
      </div>
      <div className="mb-4">
        <strong>Preventivo:</strong>
        {project.quoteId ? (
          <Link to={`/quotes/${project.quoteId}`} className="ml-2 text-blue-600 hover:underline">
            Visualizza Preventivo
          </Link>
        ) : (
          <span className="ml-2 text-gray-500">Nessun preventivo associato</span>
        )}
      </div>
      <div className="mb-4">
        <strong>Contratto:</strong>
        {project.contractId ? (
          <Link to={`/contracts/${project.contractId}`} className="ml-2 text-blue-600 hover:underline">
            Visualizza Contratto
          </Link>
        ) : (
          <span className="ml-2 text-gray-500">Nessun contratto associato</span>
        )}
      </div>
      <Link to="/projects" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300">
        Torna alla lista progetti
      </Link>
    </div>
  );
}

export default ProjectDetail;