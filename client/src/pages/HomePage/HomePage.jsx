import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import "./HomePage.css"
import Navbar from '../../components/NavbarComponent/Navbar';

const HomePage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // double !! car !null = true alors que !salut = false, donc on re negationne pour avoir le bon

  const getLatestModificationDate = (project) => {
    if (!project.files || project.files.length === 0) {
      return new Date(project.createdAt);
    }
    const latestDate = new Date(Math.max(...project.files.map(file => new Date(file.updatedAt))));
    return latestDate;
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
          data.forEach(project => {
            
            console.log(`Projet: ${project.name}`);
            if (project.files && project.files.length > 0) {
              project.files.forEach(file => {
                console.log(` - Document: ${file.name} et modifié : ${new Date(file.updatedAt).toLocaleString('fr-FR')}`);
              });
            }

          });
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
      <Navbar projectName="Tableau de bord" />
    
      <div className='projectsSection'>
        <h2>Mes Projets LaTeX</h2>
        
        {loading ? (
          <div className="loading-state">Chargement de vos documents...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>Vous n'avez pas encore de projet. Commencez par en créer un !</p>
          </div>
        ) : (
          <div className='projectsList'>
            {projects.map((project) => (
              <Link 
                key={project._id} 
                to={`/editor/${project._id}`} 
                className='projectCard'
              >
                <div>
                  <h3>{project.name}</h3>
                </div>
                <p className='projectDate'>
                  Modifié le {getLatestModificationDate(project).toLocaleDateString('fr-FR')} à {getLatestModificationDate(project).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleCreateProject} className='createProjectButton linkButton'>
        + Nouveau Projet
      </button>
    </div>
  );
};

export default HomePage;