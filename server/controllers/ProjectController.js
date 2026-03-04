import { Project } from "../models/Project.js";
import { Document } from "../models/Document.js";
import { User } from "../models/User.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getProjectsFromId = async (req, res) => {
    const userId = req.query.userId;
    try {
        const projects = await Project.find({ $or: [{ owner: userId }, { collaborators: userId }] })
            .populate("owner")
            .populate("collaborators")
            .populate("files");
        
        // triage les projets par date de dernière mise a jour
        projects.sort((a, b) => {
            const getLatestUpdate = (project) => {
                if (!project.files || project.files.length === 0) {
                    return new Date(project.createdAt);
                }
                return new Date(Math.max(...project.files.map(file => new Date(file.updatedAt))));
            };
            
            return getLatestUpdate(b) - getLatestUpdate(a);
        });
        
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: "Erreur récupération projets" });
    }
};

export const getProjects = async (req, res) => {
    try {
        let projects = await Project.find().populate("owner").populate("collaborators").populate("files");
        // triage les projets par date de dernière mise a jour
        // triage gemini
        projects.sort((a, b) => {
            const getLatestUpdate = (project) => {
                if (!project.files || project.files.length === 0)  return new Date(project.createdAt);
                return new Date(Math.max(...project.files.map(file => new Date(file.updatedAt))));
            };

            return getLatestUpdate(b) - getLatestUpdate(a);
        });
        let projectsWithImages = await Promise.all(projects.map(async (project) => {
            let projectObj = project.toObject();
            let imagesFolderPath = path.resolve(__dirname, '../temp/projects', project._id.toString(), "images");
            let images = [];
            if (fs.existsSync(imagesFolderPath)) images = fs.readdirSync(imagesFolderPath);
            projectObj.images = images;
            return projectObj;
        }));

        res.json(projectsWithImages);
    } catch (error) {
        res.status(500).json({ error: "Erreur récupération projets" });
    }
}

export const getProject = async (req, res) => {
    const { id } = req.params;
    try {
        const projectDoc = await Project.findById(id)
            .populate("owner")
            .populate("collaborators")
            .populate("files");

        if (!projectDoc) return res.status(404).json({ error: "projet non trouvé" });

        let project = projectDoc.toObject();

        let imagesFolderPath = path.resolve(__dirname, '../temp/projects', id, "images");
        let images = [];

        if (fs.existsSync(imagesFolderPath)) {
            images = fs.readdirSync(imagesFolderPath);
            // on transforme en tableau d'objets avec le nom de l'image et son url
            images = images.map(imgName => ({
                name: imgName,
            }));

        } else {
            console.log("pas de dossier images");
        }

        project.images = images;

        res.json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "erreur recupération project" });
    }
};

export const createProject = async (req, res) => {
    const { name, owner } = req.body;
    try {
        const project = await Project.create({ name, owner });
        // créer dossier dans le système de fichiers
        try {
            let projectFolderPath = path.resolve(__dirname, '../temp/projects', project._id.toString());
            console.log("Création dossier pour projet:", projectFolderPath);
            if (!fs.existsSync(projectFolderPath)) {
                fs.mkdirSync(projectFolderPath, { recursive: true });
                // création d'un dossier images dans le dossier projet
                let imagesFolderPath = path.join(projectFolderPath, 'images');
                fs.mkdirSync(imagesFolderPath);

            }
        } catch (fsError) {
            console.error("erreur création dossier projet ", fsError);
        }


        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: "erreur création projet" });
    }
};



export const createDocument = async (req, res) => {
    try {
        const { projectId, name } = req.body;

        if (!projectId) return res.status(400).json({ error: "projectId requis" });

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ error: "projet non trouvé" });
        

        const document = await Document.create({ name: name, project: projectId });
        project.files.push(document._id);
        await project.save();

        // créer un fichier [name].tex vide dans le système de fichiers
        try {
            // path.resolve donné par gemini pour éviter les problèmes de chemins relatifs
            let documentFilePath = path.resolve(__dirname, '../temp/projects', projectId, `${document._id}.tex`);
            console.log("Création fichier pour document:", documentFilePath);
            fs.writeFileSync(documentFilePath, `\\documentclass{article}\n\\begin{document}\n\\section{Introduction}\n Taper le code ici et compiler.\n\\end{document}`, 'utf-8');
        } catch (fsError) {
            console.error("zrreur création fichier document:", fsError);
        }
        
        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ error: "erreur création document" });
    }
};

export const getDocument = async (req, res) => {
    const { documentId } = req.params;

    try {
        const document = await Document.findById(documentId);
        
        if (!document) {
            return res.status(404).json({ error: "document pas troivé" });
        }

        const projectId = document.project ? document.project.toString() : null;
        
        if (!projectId) {
            console.error("document sans projet");
            return res.json({ ...document._doc, content: "" }); 
        }

        const documentFilePath = path.join(__dirname, '../temp/projects', projectId, `${document._id}.tex`);

        if (fs.existsSync(documentFilePath)) {
            document.content = fs.readFileSync(documentFilePath, 'utf-8');
        } else {
            document.content = ""; 
        }

        res.json(document);
    } catch (error) {
        console.error("erreur getdocuments", error);
        res.status(500).json({ error: "erreur recup document" });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        const projectId = req.body.projectId;
        const uploadPath = path.join('temp', 'projects', String(projectId), 'images');

        fs.mkdirSync(uploadPath, { recursive: true });

        callBack(null, uploadPath);
    },
    filename: (req, file, callBack) => {
        callBack(null, file.originalname);
    }
});

export const upload = multer({ storage: storage });

export const uploadFile = async (req, res, next) => {
    const file = req.file;
    if (!file) {
        const error = new Error('No File');
        error.status = 400;
        return next(error);
    }
    res.send(file);
};