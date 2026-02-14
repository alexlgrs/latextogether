import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/home");
        } else {
            console.log(data.message);
        }
    }

    return (
        <div>
            <h2>Connexion</h2>

            <form className="flex flex-col gap-5 w-full" onSubmit={handleLogin}>
                <input 
                    type="text" 
                    placeholder="Nom d'utilisateur" 
                    autoComplete='off'
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                />

                <input 
                    type="password" 
                    placeholder="Mot de passe" 
                    autoComplete='off'
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                />

                <button type="submit">
                    Se connecter
                </button>
            </form>
        </div>
    );
}

export default Login;