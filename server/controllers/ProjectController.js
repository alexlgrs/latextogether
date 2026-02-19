import { Project } from "../models/Project.js";
import { Document } from "../models/Document.js";
import { User } from "../models/User.js";

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
    const projects = await Project.find().populate("owner").populate("collaborators").populate("files");
    res.json(projects);
}

export const getProject = async (req, res) => {
    const { id } = req.params;
    try {
        const project = await Project.findById(id).populate("owner").populate("collaborators").populate("files");
        if (!project) return res.status(404).json({ error: "Projet non trouvé" });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: "Erreur récupération du projet" });
    }
};

export const createProject = async (req, res) => {
    const { name, owner } = req.body;
    try {
        const project = await Project.create({ name, owner });
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: "Erreur création du projet" });
    }
};

export const createDocument = async (req, res) => {
    try {
        const { projectId, name } = req.body;

        if (!projectId) {
            return res.status(400).json({ error: "projectId requis" });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Projet non trouvé" });
        }

        const document = await Document.create({ name: name });
        project.files.push(document._id);
        await project.save();
        
        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ error: "Erreur création du document" });
    }
};