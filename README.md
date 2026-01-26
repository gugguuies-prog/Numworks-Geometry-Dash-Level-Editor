# Numworks Geometry Dash Level Editor

Une application web pour créer et éditer des niveaux Geometry Dash pour NumWorks, construite avec React, Express et PostgreSQL.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 20 ou supérieure)
- **npm** (inclus avec Node.js)
- **PostgreSQL** (version 16 recommandée)

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/gugguuies-prog/Numworks-Geometry-Dash-Level-Editor.git
cd Numworks-Geometry-Dash-Level-Editor
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de la base de données

#### Créer une base de données PostgreSQL

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE numworks_level_studio;

# Créer un utilisateur (optionnel)
CREATE USER studio_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE numworks_level_studio TO studio_user;
```

#### Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
DATABASE_URL=postgresql://username:password@localhost:5432/numworks_geometry_dash
NODE_ENV=development
```

Remplacez `username`, `password` par vos identifiants PostgreSQL.

### 4. Initialiser la base de données

```bash
npm run db:push
```

Cette commande va créer les tables nécessaires dans votre base de données.

## 🛠️ Développement

### Lancer le serveur de développement

```bash
npm run dev
```

Le serveur sera accessible à l'adresse : `http://localhost:5000`

### Vérifier les types TypeScript

```bash
npm run check
```

## 🏗️ Build et Production

### 1. Construire l'application

```bash
npm run build
```

Cette commande :
- Compile le client React dans `dist/public/`
- Compile le serveur Express dans `dist/`

### 2. Lancer en production

```bash
npm start
```

## 📁 Structure du projet

```
├── client/                 # Application React (frontend)
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/         # Pages de l'application
│   │   ├── hooks/         # Hooks React personnalisés
│   │   └── lib/           # Utilitaires et configuration
│   └── public/            # Assets statiques
├── server/                # Serveur Express (backend)
│   ├── auth.ts           # Authentification
│   ├── db.ts             # Configuration base de données
│   ├── routes.ts         # Routes API
│   └── index.ts          # Point d'entrée serveur
├── shared/               # Code partagé client/serveur
│   ├── schema.ts         # Schémas de base de données
│   └── routes.ts         # Définitions des routes
└── script/               # Scripts de build
```

## 🔧 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Construit l'application pour la production |
| `npm start` | Lance l'application en mode production |
| `npm run check` | Vérifie les types TypeScript |
| `npm run db:push` | Met à jour le schéma de la base de données |

## 🌐 Fonctionnalités

- **Éditeur de niveaux** : Interface graphique pour créer des niveaux
- **Authentification** : Système de connexion utilisateur
- **Sauvegarde** : Stockage des niveaux en base de données
- **Interface responsive** : Compatible mobile et desktop

## 🔍 Dépannage

### Erreur de connexion à la base de données

Vérifiez que :
- PostgreSQL est démarré
- La variable `DATABASE_URL` est correctement configurée
- L'utilisateur a les permissions nécessaires

### Port déjà utilisé

Si le port 5000 est occupé, vous pouvez le changer en modifiant la configuration dans `server/index.ts`.

### Problèmes de build

Assurez-vous que toutes les dépendances sont installées :

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -am 'Ajoute nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.