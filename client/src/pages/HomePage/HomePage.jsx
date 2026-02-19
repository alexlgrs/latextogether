import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import "./HomePage.css"

const HomePage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // double !! car !null = true alors que !salut = false, donc on re negationne pour avoir le bon

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  useEffect(() => {
    if(isLoggedIn) {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log(`Utilisateur connecté : ${user.username}`);
    } else {
      console.log("Aucun utilisateur connecté, direction auth");
      navigate("/auth");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    setLoading(true);
    fetch(`/api/projects/projectsfromid?userId=${user._id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data);
          console.log("Projets de l'utilisateur :", data);
        } else {
          console.error("Erreur récupération des projets :", data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur fetch:", err);
        setLoading(false);
      });
  }, []);

  const handleCreateProject = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    var name = prompt("Veuillez entrer le nom du projet :", "Nouveau projet");

    if(name){
      fetch('/api/projects/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, owner: user._id }),
      }).then(res => res.json()).then(data => {
          setProjects(prevProjects => [...prevProjects, data]);
      }).catch(err => console.error("Erreur création projet:", err));
    }
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
            Déconnexion
        </button>
      </div>

      <div className='projectsSection'>
        <h2>Mes Projets</h2>
        {loading && <p>Chargement des projets...</p>}
        {!loading && projects.length === 0 && <p>Aucun projet trouvé</p>}
        <div className='projectsList'>
          {projects.map((project) => (
            <Link 
              key={project._id} 
              to={`/editor/${project._id}`} 
              className='projectCard'
            >
              <h3>{project.name}</h3>
              <p className='projectDate'>
                {new Date(project.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </Link>
          ))}
        </div>
      </div>


      <button onClick={handleCreateProject} className='createProjectButton linkButton'>
        Créer un projet
      </button>
    </div>
  );
};

export default HomePage;