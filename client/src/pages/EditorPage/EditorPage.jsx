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

import latexData from "../../assets/latex_symbols.json";

import axios from 'axios';



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
  const [images, setImages] = useState([]);


  // Récupération du nom d'utilisateur
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUsername(user.username);
      } catch (error) {
        console.error("erreur recupération utilisateur :", error);
      }
    }
  }, []);

  // gestion synchro yjs
  useEffect(() => {
    if (!editor || !currentDocumentId || currentDocumentId === projectId) return;
    const doc = new Y.Doc();
    const provider = new WebsocketProvider("ws://localhost:1234", currentDocumentId, doc);
    const yText = doc.getText('monaco');

    const binding = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );

    provider.awareness.setLocalStateField('user', {username: username });

    const updateUsers = () => {
      const states = provider.awareness.getStates();
      const users = [];
      
      states.forEach((state) => {
        if (state.user) users.push(state.user);
      });
      
      setConnectedUsers(users);
    };

    provider.awareness.on('change', updateUsers);
    
    updateUsers();


    // après synchro
    provider.on('sync', async (isSynced) => {
      if (isSynced && currentDocumentId) {
        // document vide = première connexion, on charge le contenu depuis le serveur
        if (yText.toString().length == 0) {
          console.log("room vide, on charge content depuis serveur");
          
          try {
            const response = await fetch(`/api/projects/get-document/${currentDocumentId}`);
            const data = await response.json();
            
            if (data.content && yText.toString().length === 0) {
              // on insere le contenu dans yjs, pour l'afficher dans l'editor et l'envoyer
              yText.insert(0, data.content);
            }
          } catch (err) {
            console.error("error :", err);
          }
        }
      }
    });

    return () => {
      binding.destroy();
      provider.destroy();
      doc.destroy();
    };
  }, [currentDocumentId, editor]);

  // récupération du projet et des documents et des images
  useEffect(() => {
    if (projectId) {
      setLoadingProject(true);
      fetch(`/api/projects/${projectId}`)
        .then(res => res.json())
        .then(data => {
          setProjectName(data.name);
          setDocuments(data.files || []);
          setImages(data.images || []);
          if (data.files && data.files.length > 0)  setCurrentDocumentId(data.files[0]._id);
        })
        .catch(err => console.error("erreur projet:", err))
        .finally(() => setLoadingProject(false));
    }
  }, [projectId]);

  // changement de document
  const handleSelectDocument = (doc) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setCurrentDocumentId(doc._id);

    console.log("document selectionné :", currentDocumentId);
  };

  useEffect(() => {
    if (currentDocumentId && currentDocumentId !== projectId) {
      fetch(`/api/projects/get-document/${currentDocumentId}`)
        .then(res => {
          if (!res.ok) throw new Error("erreur recup document");
          return res.json();
        })
        .then(data => {
          if (data && data.name) setProjectName(data.name);
        })
        .catch(err => console.error("erreur chargement document", err));
    }
  }, [currentDocumentId]);


  const handleCompile = async () => {
    if (!projectId || !currentDocumentId) {
      alert("Aucun projet ou document sélectionné");
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
      alert("Aucun projet sélectionné");
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
        } else {
          alert("erreur création document");
        }
      } catch (err) {
        console.error(err);
        alert("erreur création document");
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

//   const handleImageUpload = async (event) => {
//     console.log("upload image");
//     const file = event.target.files[0];
//     if (!file || !projectId) return;

//     const formData = new FormData();
//     formData.append('image', file);
//     formData.append('projectId', projectId);

//     setLoading(true);
//     try {
//         const response = await fetch('/api/projects/upload-image', {
//             method: 'POST',
//             body: formData,
//         });

//         if (response.ok) {
//             const data = await response.json();
//             console.log("image ajoutée :", data);
//         } else {
//             alert("erreur");
//         }
//     } catch (error) {
//         console.error("Erreur upload:", error);
//     } finally {
//         setLoading(false);
//     }
// };

  
  const [status, setStatus] = useState("Déconnecté");
  
  const handleEditorDidMount = (editor, monaco) => {
    setEditor(editor);

    if (!monaco.languages.getLanguages().some(lang => lang.id === 'latex')) {
      monaco.languages.register({ id: 'latex' });
    }

    monaco.languages.registerCompletionItemProvider('latex', {
      triggerCharacters: ['\\'],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn - 1, 
          endColumn: word.endColumn,
        };

        const suggestions = latexData.commands.map(cmd => {
          return {
            label: cmd.label,
            kind: monaco.languages.CompletionItemKind[cmd.kind] || monaco.languages.CompletionItemKind.Snippet,
            documentation: cmd.desc,
            insertText: '\\' + cmd.insert,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            filterText: cmd.label 
          };
        });

        return { suggestions: suggestions };
      }
    });
  };

  const handleImageUpload = (event) =>{
    const data = new FormData() ;
    data.append('projectId', projectId);
    data.append('image', event.target.files[0]);
    axios.post("/api/projects/uploadFile", data)
        .then(res => {
          console.log(res.statusText)
          if(res.status === 200){
            setImages([...images, {name: event.target.files[0].name}]);
          }
        })
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

            <div className="imagesPanel">
              <div className='imageUploadSection'>
                  <input type="file" onChange={handleImageUpload} className='createDocButton'/>
                  {/* <button className="createDocButton" onClick={() => document.getElementById('imageInput').click()} disabled={loading}>
                      {loading ? "Envoi..." : "+ Ajouter Image"}
                  </button> */}
              </div>

              <h4>Images</h4>
              {images.length == 0 ? (
                <p>Aucune image</p>
              ) : (
                <ul className='imagesList'>
                  {images.map((img, index) => (
                    // liste du nom des images
                    <li key={index} className='imageItem'>
                      <div className='imageName'>{img.name}</div>
                    </li>
                  ))}
                </ul>
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
              <Editor
                  language="latex"
                  theme="vs-light"
                  value={latexCode}
                  onMount={handleEditorDidMount}
                  options={{
                      suggestOnTriggerCharacters: true,
                      quickSuggestions: { other: true, strings: true },
                      wordBasedSuggestions: true,
                      tabCompletion: "on"
                  }}
              />

              {/* <Editor code={latexCode} onMount={handleEditorDidMount}/> */}
              
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

export default EditorPage