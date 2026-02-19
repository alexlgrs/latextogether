import { Project } from "../models/Project.js";

export const handleInvite = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Utilisateur non identifié" });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { $addToSet: { collaborators: userId } },
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ error: "Projet introuvable" });
        }

        res.status(200).json({ message: "Collaborateur ajouté avec succès" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

export default handleInvite;