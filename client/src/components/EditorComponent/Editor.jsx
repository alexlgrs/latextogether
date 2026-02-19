import Editor from "@monaco-editor/react";
import Navbar from "../NavbarComponent/Navbar";

import latexData from "../../assets/latex_symbols.json"; // Importation du JSON


export default function MyEditor({ code, onChange }) {
    // code gemini pour auto completion
    const handleEditorDidMount = (editor, monaco) => {
        monaco.languages.register({ id: 'latex' });

        const provider = monaco.languages.registerCompletionItemProvider('latex', {
            triggerCharacters: ['\\'],
            provideCompletionItems: (model, position) => {
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn - 1, 
                    endColumn: word.endColumn,
                };

                const suggestions = latexData.commands.map(cmd => ({
                    label: cmd.label,
                    kind: monaco.languages.CompletionItemKind[cmd.kind],
                    documentation: cmd.desc,
                    insertText: '\\' + cmd.insert, 
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range
                }));

                return { suggestions: suggestions };
            }
        });

        return () => provider.dispose();
    };

    return (
        <Editor
            height="90vh"
            language="latex"
            theme="vs-dark"
            value={code}
            onMount={handleEditorDidMount}
            onChange={onChange}
            options={{
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                tabCompletion: "on"
            }}
        />
    );
}
