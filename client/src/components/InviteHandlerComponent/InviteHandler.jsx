import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


const InviteHandler = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const acceptInvite = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                
                if (!user) return navigate(`/auth?redirect=/invite/${projectId}`);

                let result = await fetch(`/api/invite/${projectId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user._id }),
                });

                if (!await result.ok) return navigate("/");
                
            } catch (err) navigate("/");
        };

        acceptInvite();
    }, [projectId, navigate]);

    return <div>Traitement de l'invitation en cours...</div>;
};

export default InviteHandler;