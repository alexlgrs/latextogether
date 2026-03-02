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
    
    try {
        await Document.findByIdAndUpdate(documentId, { content, updatedAt: new Date() });

        let projectFolderPath = path.resolve(__dirname, '../temp/projects', projectId.trim());
        let latexFile = path.resolve(projectFolderPath, `${documentId.trim()}.tex`);

        if (!fs.existsSync(projectFolderPath)) fs.mkdirSync(projectFolderPath, { recursive: true });

        // verifier que le dossier du projet existe
        if (!fs.existsSync(projectFolderPath)) {
            console.error("Le dossier du projet n'existe pas:", projectFolderPath);
            return res.status(400).json({ error: "Le projet n'existe pas" });
        }

        fs.writeFileSync(latexFile, content, 'utf-8');

        try {
            await execAsync(`pdflatex -interaction=nonstopmode -output-directory="${projectFolderPath}" "${latexFile}"`);
        } catch (execErr) {
            console.error("erreur pdflatex :", execErr.message);
        }

        const pdfFile = path.join(projectFolderPath, `${documentId}.pdf`);

        if (fs.existsSync(pdfFile)) {
            const project = await Project.findById(projectId).populate('files');
            res.json({
                success: true,
                pdfPath: `${projectId}/${documentId}.pdf`, 
                documents: project.files || []
            });
        } else {
            res.status(500).json({ error: "erreur, pdf pas générés" });
        }
    } catch (error) {
        console.error("erreur compilation:", error);
        res.status(500).json({ error: "erreur de compilation" });
    }
}

export default compileToPdf;