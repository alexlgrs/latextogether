import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '../../components/EditorComponent/Editor';
import Preview from '../../components/PreviewComponent/Preview';
import "./EditorPage.css";

import Navbar from '../../components/NavbarComponent/Navbar';

const EditorPage = () => {
  const { projectId } = useParams();
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

  const handleCompile = async () => {
    if (!projectId || !currentDocumentId) {
      alert("Veuillez sélectionner un projet et un document");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/latex/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: latexCode,
          projectId: projectId,
          documentId: currentDocumentId
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.documents) {
          setDocuments(data.documents);
        }
        if (data.pdfPath) {
          setPdfUrl(`/temp/${data.pdfPath}`);
        }
      } else {
        const error = await response.json();
        alert("Erreur lors de la compilation: " + error.error);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la compilation");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!projectId) {
      alert("Veuillez sélectionner un projet");
      return;
    }

    var documentName = prompt("Veuillez entrer le nom du document :", "Nouveau Document");

    if(documentName){
      try {
        const response = await fetch('/api/projects/create-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: projectId, name: documentName }),
        });

        if (response.ok) {
          const newDoc = await response.json();
          setDocuments([...documents, newDoc]);
          setCurrentDocumentId(newDoc._id);
          setLatexCode(newDoc.content || '');
        } else {
          alert("Erreur lors de la création du document");
        }
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la création du document");
      }
    }
  };

  return (
    <div>
      <Navbar />

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
        </>
      )}
    </div>
  );
};

export default EditorPage;