import { useState } from 'react';
import Editor from '../../components/EditorComponent/Editor';
import Preview from '../../components/PreviewComponent/Preview';
import "./EditorPage.css";

const EditorPage = () => {
  const [latexCode, setLatexCode] = useState(
    `\\documentclass{article}\n\\begin{document}\n\\section{Introduction}\n Taper le code ici et compiler.\n\\end{document}
  `);
  
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/latex/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: latexCode }),
      });
      // Methode gemini pour récupérer le PDF
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
      } else {
        alert("Erreur lors de la compilation");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div >
      <div className='title'>LATEXTOGETHER</div>

      <div className='latexAera'>
        <div className='latexCodeArea'>
          <Editor code={latexCode} onChange={(value) => setLatexCode(value)} />
          
          <button 
            onClick={handleCompile} 
            className="compileButton" 
            disabled={loading}
          >
            {loading ? "CHARGEMENT..." : "COMPILER"}
          </button>
        </div>

        <div className='latexPreviewAera'>
          <Preview pdfUrl={pdfUrl} isLoading={loading} />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;