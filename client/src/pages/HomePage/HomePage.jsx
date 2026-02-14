import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import "./HomePage.css"

const HomePage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // double !! car !null = true alors que !salut = false, donc on re negationne pour avoir le bon

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  if(isLoggedIn) {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log(`Utilisateur connecté : ${user.username}`);
  } else {
    console.log("Aucun utilisateur connecté, direction auth");
    navigate("/auth");
  }

  return (
    <div className='HomePage'>
      <div className='logo'>
        LATEXTOGETHER
      </div>
      
      <div className='linkButtons'>
        <Link to="/editor" className='editorLink linkButton'>
          editeur
        </Link>
        
        <button onClick={handleLogout} className='authLink linkButton'> 
            déconnexion
          </button>
      </div>
    </div>
  );
};

export default HomePage;