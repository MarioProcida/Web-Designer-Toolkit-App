import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    url: '',
    tags: [],
    client: '',
    active: true,
    notes: '',
    contractPeriod: { start: '', end: '' },
    quoteId: '',
    contractId: ''
  });
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const projectsCollection = collection(db, 'projects');
      const projectSnapshot = await getDocs(projectsCollection);
      const projectList = projectSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          contractPeriod: data.contractPeriod || { start: '', end: '' },
          tags: data.tags || [],
          active: data.active !== undefined ? data.active : true,
          quoteId: data.quoteId || '',
          contractId: data.contractId || ''
        };
      });
      setProjects(projectList);
      
      const tags = [...new Set(projectList.flatMap(project => project.tags))];
      setAllTags(tags);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Impossibile caricare i progetti. Riprova più tardi.");
    }
  };

  const addOrUpdateProject = async (e) => {
    e.preventDefault();
    if (newProject.name.trim() !== '') {
      try {
        const projectData = {
          ...newProject,
          lastModified: new Date().toISOString()
        };
        
        if (editingProject) {
          await updateDoc(doc(db, 'projects', editingProject.id), projectData);
        } else {
          projectData.createdAt = new Date().toISOString();
          await addDoc(collection(db, 'projects'), projectData);
        }
        
        setNewProject({
          name: '',
          url: '',
          tags: [],
          client: '',
          active: true,
          notes: '',
          contractPeriod: { start: '', end: '' },
          quoteId: '',
          contractId: ''
        });
        setEditingProject(null);
        fetchProjects();
      } catch (err) {
        console.error("Error adding/updating project:", err);
        setError("Impossibile aggiungere/aggiornare il progetto. Riprova più tardi.");
      }
    }
  };

  const deleteProject = async (id) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
      fetchProjects();
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Impossibile eliminare il progetto. Riprova più tardi.");
    }
  };

  const startEditing = (project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      url: project.url || '',
      tags: project.tags || [],
      client: project.client || '',
      active: project.active !== undefined ? project.active : true,
      notes: project.notes || '',
      contractPeriod: project.contractPeriod || { start: '', end: '' },
      quoteId: project.quoteId || '',
      contractId: project.contractId || ''
    });
  };

  const addTag = () => {
    if (newTag.trim() !== '' && !newProject.tags.includes(newTag.trim())) {
      setNewProject({...newProject, tags: [...newProject.tags, newTag.trim()]});
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewProject({...newProject, tags: newProject.tags.filter(tag => tag !== tagToRemove)});
  };

  const exportProjects = () => {
    const dataStr = JSON.stringify(projects, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'projects.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (project.client && project.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (project.notes && project.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTags = selectedTags.length === 0 || 
                        selectedTags.every(tag => project.tags && project.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const toggleTagFilter = (tag) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag) 
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag]
    );
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Gestione Progetti</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Cerca progetti..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      />

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Filtra per tag:</h3>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTagFilter(tag)}
              className={`px-2 py-1 rounded-full text-sm ${
                selectedTags.includes(tag) 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={addOrUpdateProject} className="mb-6 space-y-4">
        <input
          type="text"
          value={newProject.name}
          onChange={(e) => setNewProject({...newProject, name: e.target.value})}
          placeholder="Nome progetto"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="url"
          value={newProject.url}
          onChange={(e) => setNewProject({...newProject, url: e.target.value})}
          placeholder="URL del progetto"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={newProject.client}
          onChange={(e) => setNewProject({...newProject, client: e.target.value})}
          placeholder="Nome cliente"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center">
          <label className="mr-2">Stato:</label>
          <select
            value={newProject.active ? 'active' : 'inactive'}
            onChange={(e) => setNewProject({...newProject, active: e.target.value === 'active'})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Attivo</option>
            <option value="inactive">Non attivo</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Periodo contratto:</label>
          <div className="flex space-x-2">
            <input
              type="date"
              value={newProject.contractPeriod.start}
              onChange={(e) => setNewProject({...newProject, contractPeriod: {...newProject.contractPeriod, start: e.target.value}})}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={newProject.contractPeriod.end}
              onChange={(e) => setNewProject({...newProject, contractPeriod: {...newProject.contractPeriod, end: e.target.value}})}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Aggiungi tag"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="button" onClick={addTag} className="mt-2 bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600 transition duration-300">
            Aggiungi Tag
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {newProject.tags.map((tag, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {tag}
              <button onClick={() => removeTag(tag)} className="ml-1 text-red-500 font-bold">×</button>
            </span>
          ))}
        </div>
        <textarea
          value={newProject.notes}
          onChange={(e) => setNewProject({...newProject, notes: e.target.value})}
          placeholder="Note del progetto"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300">
          {editingProject ? 'Aggiorna Progetto' : 'Aggiungi Progetto'}
        </button>
      </form>

      <ul className="space-y-2">
        {filteredProjects.map(project => (
          <li key={project.id} className="bg-gray-100 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <Link to={`/projects/${project.id}`} className="text-gray-800 font-semibold hover:text-blue-600">
                {project.name}
              </Link>
              <span className={`text-sm ${project.active ? 'text-green-500' : 'text-red-500'}`}>
                {project.active ? 'Attivo' : 'Non attivo'}
              </span>
            </div>
            <div className="text-sm text-blue-600 hover:underline">
              <a href={project.url} target="_blank" rel="noopener noreferrer">{project.url}</a>
            </div>
            <div className="text-sm text-gray-600">Cliente: {project.client}</div>
            <div className="text-xs text-gray-400 mt-1">
              Contratto: {project.contractPeriod.start || 'N/A'} - {project.contractPeriod.end || 'N/A'}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {project.tags && project.tags.map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <strong>Note:</strong> {project.notes}
            </div>
            <div className="mt-2 space-x-2">
              <button onClick={() => startEditing(project)} className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 transition duration-300">
                Modifica
              </button>
              <button onClick={() => deleteProject(project.id)} className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition duration-300">
                Elimina
              </button>
              {project.quoteId && (
                <Link to={`/quotes/${project.quoteId}`} className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 transition duration-300">
                  Preventivo
                </Link>
              )}
              {project.contractId && (
                <Link to={`/contracts/${project.contractId}`} className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600 transition duration-300">
                  Contratto
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>

      <button onClick={exportProjects} className="mt-4 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition duration-300 w-full">
        Esporta Progetti
      </button>
    </div>
  );
}

export default ProjectManager;