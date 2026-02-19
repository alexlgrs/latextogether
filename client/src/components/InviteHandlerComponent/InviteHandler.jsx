import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // ou fetch

const InviteHandler = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const acceptInvite = async () => {
            try {
                // On récupère l'user stocké dans le navigateur
                const user = JSON.parse(localStorage.getItem("user"));
                
                if (!user || !user._id) {
                    // Si pas connecté, on le renvoie vers /auth avec l'id du projet pour plus tard
                    navigate(`/auth?redirect=/invite/${projectId}`);
                    return;
                }

                // On appelle l'API backend
                await axios.post(`/api/invite/${projectId}`, { userId: user._id });

                // Une fois ajouté, on va vers l'éditeur
                navigate(`/editor/${projectId}`);
            } catch (err) {
                console.error("Erreur invite:", err);
                navigate("/"); // Retour accueil si erreur
            }
        };

        acceptInvite();
    }, [projectId, navigate]);

    return <div>Traitement de l'invitation en cours...</div>;
};

export default InviteHandler;