import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import "./Preview.css"

const Preview = ({ code }) => {
    return (    
    <div className="preview-container">   
        <BlockMath math={code} />
    </div>
    );
};

export default Preview;