import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { saveAs } from 'file-saver';

function ContractManager() {
  const [contracts, setContracts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newContract, setNewContract] = useState({
    name: '',
    projectId: '',
    file: null
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContracts();
    fetchProjects();
  }, []);

  const fetchContracts = async () => {
    try {
      const contractsCollection = collection(db, 'contracts');
      const contractSnapshot = await getDocs(contractsCollection);
      const contractList = contractSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setContracts(contractList);
    } catch (err) {
      console.error("Error fetching contracts:", err);
      setError("Impossibile caricare i contratti. Riprova più tardi.");
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
    setNewContract({...newContract, file: e.target.files[0]});
  };

  const addContract = async (e) => {
    e.preventDefault();
    if (newContract.name.trim() !== '' && newContract.file) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const fileContent = e.target.result;
          const contractData = {
            name: newContract.name,
            projectId: newContract.projectId,
            fileName: newContract.file.name,
            fileContent: fileContent,
            createdAt: new Date().toISOString()
          };
          const docRef = await addDoc(collection(db, 'contracts'), contractData);

          if (newContract.projectId) {
            await updateDoc(doc(db, 'projects', newContract.projectId), {
              contractId: docRef.id
            });
          }

          setNewContract({
            name: '',
            projectId: '',
            file: null
          });
          fetchContracts();
        };
        reader.readAsDataURL(newContract.file);
      } catch (err) {
        console.error("Error adding contract:", err);
        setError("Impossibile aggiungere il contratto. Riprova più tardi.");
      }
    }
  };

  const deleteContract = async (id) => {
    try {
      await deleteDoc(doc(db, 'contracts', id));
      const projectToUpdate = projects.find(project => project.contractId === id);
      if (projectToUpdate) {
        await updateDoc(doc(db, 'projects', projectToUpdate.id), {
          contractId: ''
        });
      }
      fetchContracts();
      fetchProjects();
    } catch (err) {
      console.error("Error deleting contract:", err);
      setError("Impossibile eliminare il contratto. Riprova più tardi.");
    }
  };

  const downloadContract = (contract) => {
    const byteCharacters = atob(contract.fileContent.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: 'application/pdf'});
    saveAs(blob, contract.fileName);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Gestione Contratti</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <form onSubmit={addContract} className="mb-6 space-y-4">
        <input
          type="text"
          value={newContract.name}
          onChange={(e) => setNewContract({...newContract, name: e.target.value})}
          placeholder="Nome contratto"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={newContract.projectId}
          onChange={(e) => setNewContract({...newContract, projectId: e.target.value})}
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
          Aggiungi Contratto
        </button>
      </form>

      <ul className="space-y-2">
        {contracts.map(contract => (
          <li key={contract.id} className="bg-gray-100 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-semibold">{contract.name}</span>
              <button onClick={() => downloadContract(contract)} className="text-blue-500 hover:underline">
                Scarica PDF
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Progetto: {projects.find(p => p.id === contract.projectId)?.name || 'Nessun progetto associato'}
            </div>
            <div className="mt-2">
              <button onClick={() => deleteContract(contract.id)} className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition duration-300">
                Elimina
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ContractManager;