import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase/config.js';
import { doc, getDoc } from 'firebase/firestore';
import { saveAs } from 'file-saver';

function QuoteDetail() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const quoteDoc = await getDoc(doc(db, 'quotes', id));
        if (quoteDoc.exists()) {
          setQuote({ id: quoteDoc.id, ...quoteDoc.data() });
        } else {
          setError('Preventivo non trovato');
        }
      } catch (err) {
        console.error("Error fetching quote:", err);
        setError('Errore nel caricamento del preventivo');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [id]);

  const downloadQuote = () => {
    if (quote && quote.fileContent) {
      const byteCharacters = atob(quote.fileContent.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {type: 'application/pdf'});
      saveAs(blob, quote.fileName || 'preventivo.pdf');
    }
  };

  if (loading) return <div className="text-center mt-8">Caricamento...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!quote) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto mt-8">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Dettagli Preventivo</h2>
      <div className="mb-2"><strong>Nome:</strong> {quote.name}</div>
      <div className="mb-2"><strong>Progetto:</strong> {quote.projectId ? <Link to={`/projects/${quote.projectId}`} className="text-blue-600 hover:underline">Vai al progetto</Link> : 'Non associato'}</div>
      <div className="mb-2"><strong>Data creazione:</strong> {new Date(quote.createdAt).toLocaleString()}</div>
      <div className="mb-4">
        <button onClick={downloadQuote} className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300">
          Scarica PDF
        </button>
      </div>
      <Link to="/quotes" className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300">
        Torna alla lista preventivi
      </Link>
    </div>
  );
}

export default QuoteDetail;