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

<<<<<<< Updated upstream
=======
  const socketRef = useRef(null);



  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUsername(user.username);
      } catch (error) {
        console.error("Erreur parsing user data:", error);
      }
    }

    socketRef.current = io();

    socketRef.current.on("connect", () => {
      console.log("Connecté au serveur de sockets ! ID:", socketRef.current.id);
    });

    
    // Affichage de la liste des utilisateurs en utilisation du socket dans ce document
    
    socketRef.current.on("users-in-document", (users) => {

      
      console.log("Utilisateurs dans le document:", users);
      // supprimer les doublons (dans le cas ou un utilisateur ouvrirait le même document dans plusieurs onglets)
      const uniqueUsers = Array.from(new Set(users.map(u => u.username))). map(username => {
        return users.find(u => u.username === username);
      });

      setConnectedUsers(uniqueUsers);
    }); 

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };

        
  }, []);

  // récupération du projet et des documents
>>>>>>> Stashed changes
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

  // changements dans l'editeur
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
<<<<<<< Updated upstream
=======

            <div className='connectedUsersPanel'>
              <h4>Connectés ({connectedUsers.length})</h4>
              <ul className='usersList'>
                {connectedUsers.map((user, index) => (
                  <li key={index} className='userItem'>
                    <span className='userBadge'></span>
                    <span className='userName'>{user.username}</span>
                  </li>
                ))}
              </ul>
            </div>
>>>>>>> Stashed changes
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