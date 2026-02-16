import { Project } from "../models/Project.js";

export const handleInvite = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.body; // Récupéré du corps de la requête (POST)

        if (!userId) {
            return res.status(401).json({ error: "Utilisateur non identifié" });
        }

        // Ajoute l'utilisateur au tableau collaborators s'il n'y est pas déjà
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