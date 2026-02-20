import { useState, useEffect, useRef } from 'react';
import { createPath, useParams } from 'react-router-dom';
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
  const [roomName, setRoomName] = useState("");
  const [editor, setEditor] = useState(null);


  useEffect(() => {
      console.log("Project ID:", projectId);
      setCurrentDocumentId(projectId);
  }, [projectId]);

  // Récupération du nom d'utilisateur et des utilisateurs connectés au document
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
  }, []);

  // gestion synchro yjs
  useEffect(() => {
    if (!editor || !currentDocumentId) return;

    const doc = new Y.Doc();
    const currentRoomName = `document-${currentDocumentId}`;
    
    const provider = new WebsocketProvider("/yjs", currentRoomName, doc);
    const yText = doc.getText('monaco');
    
    const binding = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor])
    );

    provider.on('status', (event) => {
      setStatus(event.status === 'connected' ? "Connecté" : "Reconnexion");
    });

    return () => {
      binding.destroy();
      provider.destroy();
      doc.destroy();
    };
  }, [currentDocumentId, editor]);


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


  // changement de document
  const handleSelectDocument = (doc) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setCurrentDocumentId(doc._id);
    setLatexCode(doc.content || '');
    setPdfUrl(null);
    console.log("Document sélectionné:", currentDocumentId);
  };

  useEffect(() => {
    if (!currentDocumentId) return;
    console.log("Document sélectionné (useEffect):", currentDocumentId);
  }, [currentDocumentId]);

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
          content: editor.getValue(),
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

  const handleEditorChange = (value) => {
    setLatexCode(value);
  }
  
  const [status, setStatus] = useState("Déconnecté");
  
  


  function handleEditorDidMount(editorInstance, monaco) {
    setEditor(editorInstance);
    console.log("Editor monté:", editorInstance);
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