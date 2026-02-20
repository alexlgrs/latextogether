import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
// import Editor from '../../components/EditorComponent/Editor';

import Editor from "@monaco-editor/react"
import Preview from '../../components/PreviewComponent/Preview';
import "./EditorPage.css";

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';


import Navbar from '../../components/NavbarComponent/Navbar';

import { io } from "socket.io-client";

const EditorPage = () => {

  const { projectId } = useParams();
  const debounceTimerRef = useRef(null);
  const isRemoteUpdateRef = useRef(false);
  
  // contenu de base du fichier latex
  const [latexCode, setLatexCode] = useState(
    `\\documentclass{article}\n\\begin{document}\n\\section{Introduction}\n Taper le code ici et compiler.\n\\end{document}
  `);
  
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState("Nouveau Projet");
  const [documents, setDocuments] = useState([]);
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [username, setUsername] = useState("");

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

  // arrivée dans le doucment, on rejoint le socket et on écoute les changements
  useEffect(() => {
    if (currentDocumentId) {
      socketRef.current.emit("join-document", { documentId: currentDocumentId, username });

      const handleReceiveChanges = (newContent) => {
        isRemoteUpdateRef.current = true;
        setLatexCode(newContent);
      };

      socketRef.current.on("receive-changes", handleReceiveChanges);

      return () => {
        socketRef.current.off("receive-changes", handleReceiveChanges);
      };
    }
  }, [currentDocumentId, username]);

  // si ctrl+s, on compile
  useEffect(() => {

    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') handleCompile(); 

    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [latexCode, currentDocumentId]);

  // changement de document
  const handleSelectDocument = (doc) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setCurrentDocumentId(doc._id);
    setLatexCode(doc.content || '');
    setPdfUrl(null);
  };

  // changements dans l'editeur
  const handleEditorChange = (value) => {
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }
    
    setLatexCode(value);
    
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    debounceTimerRef.current = setTimeout(() => {
      socketRef.current.emit("send-changes", { 
        documentId: currentDocumentId, 
        content: value 
      });
    }, 100);
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

  const handleInviteButton = () => {
    // créer une invite et copier le lien dans le presse-papiers
    const inviteLink = `${window.location.origin}/invite/${projectId}`;
    navigator.clipboard.writeText(inviteLink)
      .then(() => alert("lien d'invitation copié"))
      .catch(err => console.error("erruer de copie du lien d'invitation:", err));
  }

  
  const editorRef = useRef(null);
  const [status, setStatus] = useState("Déconnecté");
  
  const roomName = "monaco-collab-demo-123"; 
  


  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    // moteur de synchro, mieix que juste socket
    let doc = new Y.Doc();

    // chargé de distribution des updates
    let provider = new WebsocketProvider('/yjs', roomName, doc);

    // c'est là qu'on fait le lien entre monaco et yjs
    let yText = doc.getText('monaco');

    // sert a faire les changements dans les 2 sens
    let binding = new MonacoBinding(yText, editor.getModel(), new Set([editor]));

    // récupérer l'état de la connexion
    provider.on('status', (event) => {
      setStatus(event.status === 'connected' ? "Connecté" : "Reconnexion...");
    });

    return () => {
      provider.disconnect();
      doc.destroy();
    };
  }


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
            >              <p>Statut : {status}</p>

              + Nouveau
            </button>

            <button 
              onClick={handleInviteButton}
              className="createInviteButton"
            >
              Invite
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
          </div>

          <div className='latexAera'>
            <div className='latexCodeArea'>
              <Editor code={latexCode} onMount={handleEditorDidMount}/>
              
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