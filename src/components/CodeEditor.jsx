import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { db } from '../firebase/config.js';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

function CodeEditor() {
  const [code, setCode] = useState('// Scrivi il tuo codice qui');
  const [language, setLanguage] = useState('javascript');
  const [snippetName, setSnippetName] = useState('');
  const [snippets, setSnippets] = useState([]);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [output, setOutput] = useState('');
  const [editorHeight, setEditorHeight] = useState('400px');

  useEffect(() => {
    fetchSnippets();
    updateEditorHeight();
    window.addEventListener('resize', updateEditorHeight);
    return () => window.removeEventListener('resize', updateEditorHeight);
  }, []);

  const updateEditorHeight = () => {
    const height = window.innerHeight * 0.5; // 50% della altezza della finestra
    setEditorHeight(`${height}px`);
  };

  const fetchSnippets = async () => {
    try {
      const snippetsCollection = collection(db, 'snippets');
      const snippetSnapshot = await getDocs(snippetsCollection);
      const snippetList = snippetSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setSnippets(snippetList);
    } catch (error) {
      console.error("Error fetching snippets:", error);
    }
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const saveSnippet = async () => {
    if (snippetName.trim() !== '') {
      try {
        const snippetData = {
          name: snippetName,
          code: code,
          language: language
        };
        if (selectedSnippet) {
          await updateDoc(doc(db, 'snippets', selectedSnippet.id), snippetData);
        } else {
          await addDoc(collection(db, 'snippets'), snippetData);
        }
        setSnippetName('');
        setSelectedSnippet(null);
        fetchSnippets();
      } catch (error) {
        console.error("Error saving snippet:", error);
      }
    }
  };

  const loadSnippet = (snippet) => {
    setCode(snippet.code);
    setLanguage(snippet.language);
    setSnippetName(snippet.name);
    setSelectedSnippet(snippet);
  };

  const deleteSnippet = async (id) => {
    try {
      await deleteDoc(doc(db, 'snippets', id));
      fetchSnippets();
      if (selectedSnippet && selectedSnippet.id === id) {
        setSelectedSnippet(null);
        setCode('// Scrivi il tuo codice qui');
        setSnippetName('');
      }
    } catch (error) {
      console.error("Error deleting snippet:", error);
    }
  };

  const runCode = () => {
    try {
      // Nota: eval è usato qui solo per dimostrazione. In un'app reale,
      // considera alternative più sicure come un ambiente sandbox.
      const result = eval(code);
      setOutput(String(result));
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 md:p-6 max-w-full mx-auto">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Editor di Codice</h2>
      <div className="mb-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
        <input
          type="text"
          value={snippetName}
          onChange={(e) => setSnippetName(e.target.value)}
          placeholder="Nome dello snippet"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
      </div>
      <div className="border border-gray-300 rounded-md overflow-hidden mb-4">
        <Editor
          height={editorHeight}
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on'
          }}
        />
      </div>
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
        <button onClick={saveSnippet} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 w-full md:w-auto">
          {selectedSnippet ? 'Aggiorna Snippet' : 'Salva Snippet'}
        </button>
        <button onClick={runCode} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300 w-full md:w-auto">
          Esegui Codice
        </button>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Output:</h3>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">{output}</pre>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Snippet Salvati:</h3>
        <ul className="space-y-2">
          {snippets.map(snippet => (
            <li key={snippet.id} className="flex flex-col md:flex-row md:items-center justify-between bg-gray-100 p-2 rounded-md">
              <span className="cursor-pointer hover:text-blue-600 mb-2 md:mb-0" onClick={() => loadSnippet(snippet)}>
                {snippet.name} ({snippet.language})
              </span>
              <button onClick={() => deleteSnippet(snippet.id)} className="text-red-500 hover:text-red-700 w-full md:w-auto">
                Elimina
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CodeEditor;