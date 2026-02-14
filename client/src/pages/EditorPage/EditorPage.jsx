import { useState } from 'react';
import Preview from '../../components/PreviewComponent/Preview';
import "./EditorPage.css"

const EditorPage = () => {
  const [latexCode, setLatexCode] = useState("\\int_a^b f(x)dx = F(b) - F(a)");

  return (
    <div>
        <div className='title'>EDITEUR LATEX</div>

      <div className='latexAera'>
        <div className='latexCodeArea'>
          <textarea value={latexCode} className="latexCodeAeraContent" onChange={(e) => setLatexCode(e.target.value)}/>
        </div>

        <div className='latexPreviewAera'>
          <Preview code={latexCode} />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;