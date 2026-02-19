import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document } from '../models/Document.js';
import { Project } from '../models/Project.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

async function compileToPdf(req, res) {
    const { content, projectId, documentId } = req.body;
    
    if (!projectId || !documentId) {
        return res.status(400).json({ error: "projectId et documentId requis" });
    }

    try {
        const doc = await Document.findByIdAndUpdate(
            documentId,
            { 
                content: content,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!doc) {
            return res.status(404).json({ error: "Document non trouvé" });
        }

        const tempId = `doc_${projectId}_${documentId}`;
        const folderPath = path.join(__dirname, '../temp');
        const latexFile = path.join(folderPath, `${tempId}.tex`);

        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

        fs.writeFileSync(latexFile, content);

        console.log("Compilation:", folderPath, latexFile);
        
        try {
            await execAsync(`pdflatex -interaction=nonstopmode -output-directory=${folderPath} ${latexFile}`);
        } catch (execErr) {
            console.error("Erreur pdflatex:", execErr.message);
        }
        
        const pdfFile = path.join(folderPath, `${tempId}.pdf`);

        if (fs.existsSync(pdfFile)) {
            const project = await Project.findById(projectId).populate('files');
            
            res.json({
                success: true,
                pdfPath: `${tempId}.pdf`,
                documents: project.files || []
            });
        } else {
            res.status(500).json({ error: "compilation ratée - PDF non généré" });
        }
    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).json({ error: "Erreur lors de la compilation", details: error.message });
    }
}

export default compileToPdf;