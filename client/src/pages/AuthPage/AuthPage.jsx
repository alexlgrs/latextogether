import { useState } from 'react';
import Login from "../../components/LoginComponent/Login";
import Register from "../../components/RegisterComponent/Register";
import "./AuthPage.css";

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className='AuthPage'>
      <div className='authContainer'>
        <div className='authHeader'>
          <h1>LatexTogether</h1>
          <p>Collaborez sur vos documents LaTeX en temps réel</p>
        </div>

        <div className='authToggle'>
          <button 
            className={isLoginView ? 'active' : ''} 
            onClick={() => setIsLoginView(true)}
          >
            Connexion
          </button>
          <button 
            className={!isLoginView ? 'active' : ''} 
            onClick={() => setIsLoginView(false)}
          >
            Inscription
          </button>
        </div>

        <div className='authContent'>
          {isLoginView ? <Login /> : <Register />}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;