import React, { useState } from 'react';

function DesignTools() {
  const [color, setColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [sampleText, setSampleText] = useState('Testo di esempio');
  const [palette, setPalette] = useState([]);

  const generatePalette = () => {
    const newPalette = [];
    for (let i = 0; i < 5; i++) {
      newPalette.push('#' + Math.floor(Math.random()*16777215).toString(16));
    }
    setPalette(newPalette);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copiato negli appunti!');
    }, (err) => {
      console.error('Errore nella copia: ', err);
    });
  };

  const generateCSS = () => {
    return `
      font-family: ${fontFamily};
      font-size: ${fontSize}px;
      color: ${color};
    `;
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Strumenti di Design</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Selettore Colore</h3>
        <div className="flex items-center space-x-2">
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded-md cursor-pointer"
          />
          <input 
            type="text" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Dimensione Font: {fontSize}px</h3>
        <input 
          type="range" 
          min="8" 
          max="72" 
          value={fontSize} 
          onChange={(e) => setFontSize(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Famiglia Font</h3>
        <select 
          value={fontFamily} 
          onChange={(e) => setFontFamily(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier">Courier</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Testo di Esempio</h3>
        <input 
          type="text" 
          value={sampleText} 
          onChange={(e) => setSampleText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Anteprima</h3>
        <div 
          style={{ 
            color: color, 
            fontSize: `${fontSize}px`, 
            fontFamily: fontFamily,
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        >
          {sampleText}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">CSS Generato</h3>
        <pre className="bg-gray-100 p-4 rounded-md">
          {generateCSS()}
        </pre>
        <button 
          onClick={() => copyToClipboard(generateCSS())}
          className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Copia CSS
        </button>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Generatore Palette</h3>
        <button 
          onClick={generatePalette}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Genera Palette
        </button>
        <div className="flex mt-4">
          {palette.map((color, index) => (
            <div 
              key={index} 
              style={{
                backgroundColor: color,
                width: '50px',
                height: '50px',
                marginRight: '5px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => copyToClipboard(color)}
              title={`Clicca per copiare: ${color}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DesignTools;