import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

const EditorPageYJS = () => {
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
      <p>Statut : {status}</p>
      
      <div>
        <Editor
          height="70vh"
          width="50vw"
          defaultLanguage="latex"
          defaultValue="code ici"
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default EditorPageYJS;