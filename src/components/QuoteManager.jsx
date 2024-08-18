import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { saveAs } from 'file-saver';

function QuoteManager() {
  const [quotes, setQuotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newQuote, setNewQuote] = useState({
    name: '',
    projectId: '',
    file: null
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuotes();
    fetchProjects();
  }, []);

  const fetchQuotes = async () => {
    try {
      const quotesCollection = collection(db, 'quotes');
      const quoteSnapshot = await getDocs(quotesCollection);
      const quoteList = quoteSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setQuotes(quoteList);
    } catch (err) {
      console.error("Error fetching quotes:", err);
      setError("Impossibile caricare i preventivi. Riprova più tardi.");
    }
  };

  const fetchProjects = async () => {
    try {
      const projectsCollection = collection(db, 'projects');
      const projectSnapshot = await getDocs(projectsCollection);
      const projectList = projectSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setProjects(projectList);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Impossibile caricare i progetti. Riprova più tardi.");
    }
  };

  const handleFileChange = (e) => {
    setNewQuote({...newQuote, file: e.target.files[0]});
  };

  const addQuote = async (e) => {
    e.preventDefault();
    if (newQuote.name.trim() !== '' && newQuote.file) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const fileContent = e.target.result;
          const quoteData = {
            name: newQuote.name,
            projectId: newQuote.projectId,
            fileName: newQuote.file.name,
            fileContent: fileContent,
            createdAt: new Date().toISOString()
          };
          const docRef = await addDoc(collection(db, 'quotes'), quoteData);

          if (newQuote.projectId) {
            await updateDoc(doc(db, 'projects', newQuote.projectId), {
              quoteId: docRef.id
            });
          }

          setNewQuote({
            name: '',
            projectId: '',
            file: null
          });
          fetchQuotes();
        };
        reader.readAsDataURL(newQuote.file);
      } catch (err) {
        console.error("Error adding quote:", err);
        setError("Impossibile aggiungere il preventivo. Riprova più tardi.");
      }
    }
  };

  const deleteQuote = async (id) => {
    try {
      await deleteDoc(doc(db, 'quotes', id));
      const projectToUpdate = projects.find(project => project.quoteId === id);
      if (projectToUpdate) {
        await updateDoc(doc(db, 'projects', projectToUpdate.id), {
          quoteId: ''
        });
      }
      fetchQuotes();
      fetchProjects();
    } catch (err) {
      console.error("Error deleting quote:", err);
      setError("Impossibile eliminare il preventivo. Riprova più tardi.");
    }
  };

  const downloadQuote = (quote) => {
    const byteCharacters = atob(quote.fileContent.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: 'application/pdf'});
    saveAs(blob, quote.fileName);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Gestione Preventivi</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <form onSubmit={addQuote} className="mb-6 space-y-4">
        <input
          type="text"
          value={newQuote.name}
          onChange={(e) => setNewQuote({...newQuote, name: e.target.value})}
          placeholder="Nome preventivo"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={newQuote.projectId}
          onChange={(e) => setNewQuote({...newQuote, projectId: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleziona un progetto (opzionale)</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300">
          Aggiungi Preventivo
        </button>
      </form>

      <ul className="space-y-2">
        {quotes.map(quote => (
          <li key={quote.id} className="bg-gray-100 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-semibold">{quote.name}</span>
              <button onClick={() => downloadQuote(quote)} className="text-blue-500 hover:underline">
                Scarica PDF
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Progetto: {projects.find(p => p.id === quote.projectId)?.name || 'Nessun progetto associato'}
            </div>
            <div className="mt-2">
              <button onClick={() => deleteQuote(quote.id)} className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition duration-300">
                Elimina
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuoteManager;