# 📝 LaTeX Together

> **La collaboration scientifique, simplifiée.** > Travaillez à plusieurs sur vos documents LaTeX, organisez vos projets par dossiers et gérez vos ressources (images, fichiers sources) en temps réel.

---

## 🚀 Fonctionnalités

* **Multi-projets :** Créez et gérez plusieurs espaces de travail distincts.
* **Collaboration en temps réel :** Éditez vos fichiers `.tex` avec vos collègues.
* **Gestion de fichiers intelligente :** Upload d'images et de ressources organisé dynamiquement par projets.
* **Compilation Cloud :** Visualisez vos PDF directement, avec possibilité de les télécharger, les imprimer etc.

---

## 🛠 Stack Technique

* **Backend :** Node.js, Express
* **Base de données :** MongoDB (Atlas)
* **Gestion de fichiers :** Multer (Stockage local structuré)
* **Frontend :** Vue, React


---

## ⚙️ Installation

### Prérequis
* Node.js (v16+)
* NPM ou Yarn
* Un cluster MongoDB
* LaTeX installé sur la machine

### Étapes

1.  **Cloner le dépôt**
    ```bash
    git clone https://github.com/alexlgrs/latextogether.git
    cd latextogether
    ```

2.  **Configuration du Backend**
    * Allez dans le dossier serveur : `cd server`
    * Installez les dépendances : `npm install`
    * Créez un fichier `.env` et ajoutez vos variables :
        ```env
        PORT=3000
        JWT_KEY = EXAMPLEKEY
        ```

    * Allez dans le dossier client : `cd client`
    * Installez les dépendances : `npm install`

    * A la racine, installer les dépendances aussi : `npm install`

3.  **Lancement**
    ```bash
    # En mode développement (avec nodemon)
    npm run dev
    ```

---

## 🤝 Contribution

1.  Forkez le projet.
2.  Créez votre branche : `git checkout -b feature/ma-super-feature`.
3.  Committez vos changements : `git commit -m 'Ajout de ma feature'`.
4.  Poussez la branche : `git push origin feature/ma-super-feature`.
5.  Ouvrez une Pull Request.
