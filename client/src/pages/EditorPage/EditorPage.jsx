import { useState } from 'react';
import Editor from '../../components/EditorComponent/Editor';
import Preview from '../../components/PreviewComponent/Preview';
import "./EditorPage.css";

import Navbar from '../../components/NavbarComponent/Navbar';

import { io } from "socket.io-client";
const socket = io("http://localhost:4000");

const EditorPage = () => {
  const [latexCode, setLatexCode] = useState(
    `\\documentclass{article}\n\\begin{document}\n\\section{Introduction}\n Taper le code ici et compiler.\n\\end{document}
  `);
  
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState("Nouveau Projet");
  const [documents, setDocuments] = useState([]);
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);

  useEffect(() => {
    if (projectId) {
      setLoadingProject(true);
      fetch(`/api/projects/${projectId}`)
        .then(res => res.json())
        .then(data => {
          setProjectName(data.name);
          setDocuments(data.files || []);
          
          if (data.files && data.files.length > 0) {
            const firstDoc = data.files[0];
            setCurrentDocumentId(firstDoc._id);
            if (firstDoc.content) {
              setLatexCode(firstDoc.content);
            }
          }
        })
        .catch(err => console.error("Erreur chargement projet:", err))
        .finally(() => setLoadingProject(false));
    }
  }, [projectId]);

  const [isRemoteUpdate, setIsRemoteUpdate] = useState(false);

  useEffect(() => {
    if (currentDocumentId) {
      socket.emit("join-document", currentDocumentId);

      socket.on("receive-changes", (newContent) => {
        setIsRemoteUpdate(true); // pour éviter de boucler nos modifs
        setLatexCode(newContent);
      });
    }

    return () => {
      socket.off("receive-changes");
    };
  }, [currentDocumentId]);

  useEffect(() => {

    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') handleCompile(); 

    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [latexCode, currentDocumentId]);

  const handleSelectDocument = (doc) => {
    setCurrentDocumentId(doc._id);
    setLatexCode(doc.content || '');
    setPdfUrl(null);
  };

  const handleEditorChange = (value) => {
    if (isRemoteUpdate) {
      setIsRemoteUpdate(false);
      return;
    }
    
    setLatexCode(value);
    socket.emit("send-changes", { 
      documentId: currentDocumentId, 
      content: value 
    });
  };


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

      {loadingProject ? (
        <div className='loading'>Chargement du projet...</div>
      ) : (
        <>
          <div className='documentsPanel'>
            <h3>Projet <strong>{ projectName }</strong></h3>
            <button 
              onClick={handleCreateDocument}
              className="createDocButton"
            >
              + Nouveau
            </button>
            <div className='documentsList'>
              {documents.length === 0 ? (
                <p>Aucun document</p>
              ) : (
                documents.map(doc => (
                  <div 
                    key={doc._id}
                    className={`documentItem ${currentDocumentId === doc._id ? 'active' : ''}`}
                    onClick={() => handleSelectDocument(doc)}
                  >
                    {doc.name}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className='latexAera'>
            <div className='latexCodeArea'>
              <Editor code={latexCode} onChange={handleEditorChange} />
              
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
        </>
      )}
    </div>
  );
};

export default EditorPage;