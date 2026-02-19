import Editor from "@monaco-editor/react";
import Navbar from "../NavbarComponent/Navbar";

function MyEditor({ code, onChange }) {

    return (
        <Editor
        height="90vh"
        theme="vs-light"
        defaultLanguage="latex"
        value={code}
        onChange={onChange}
        />
    );
}

export default MyEditor;