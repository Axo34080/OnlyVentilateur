# 🌀 OnlyVentilateur

Projet scolaire B3 DW — plateforme de créateurs de contenu ventilateur.

---

## Prérequis

- [Node.js](https://nodejs.org/) v20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (pour PostgreSQL)

---

## Lancer le projet (dev)

### 1. Base de données PostgreSQL (Docker)

```bash
# Premier lancement — créer le container
docker run --name pg-onlyvent \
  -e POSTGRES_PASSWORD=PASSWORD \
  -e POSTGRES_DB=NOMDB \
  -p 5432:5432 \
  -d postgres:16

# Les fois suivantes — relancer le container existant
docker start pg-onlyvent
```

> Ou utiliser **Docker Desktop** → démarrer le container `pg-onlyvent` en 1 clic.

---

### 2. Backend NestJS

```bash
cd OnlyVentilateurBack
npm install
npm run start:dev  # http://localhost:3000
```

Au premier démarrage, le seed est automatique : 5 créateurs + 25 posts sont insérés en BDD.

**Variables d'environnement** (`.env` à la racine du backend) :

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<votre_mot_de_passe>
DB_NAME=onlyventilateur
JWT_SECRET=<votre_secret_jwt>
```

---

### 3. Frontend React

```bash
cd OnlyVentilateur
npm install        # une seule fois
npm run dev        # http://localhost:5173
```

Le proxy Vite redirige automatiquement `/api/*` → `http://localhost:3000`.

---

## Résumé des commandes quotidiennes

| Étape                 | Commande                                       |
| --------------------- | ---------------------------------------------- |
| 1. Démarrer la BDD    | `docker start pg-onlyvent` (ou Docker Desktop) |
| 2. Lancer le backend  | `cd OnlyVentilateurBack && npm run start:dev`  |
| 3. Lancer le frontend | `cd OnlyVentilateur && npm run dev`            |

---

## Endpoints API

| Méthode | Route                           | Auth | Description                  |
| ------- | ------------------------------- | ---- | ---------------------------- |
| POST    | `/api/signup`                   | Non  | Créer un compte              |
| POST    | `/api/login`                    | Non  | Connexion → JWT              |
| GET     | `/api/users/me`                 | JWT  | Mon profil                   |
| PATCH   | `/api/users/me`                 | JWT  | Modifier mon profil          |
| GET     | `/api/creators`                 | Non  | Liste tous les créateurs     |
| GET     | `/api/creators/:id`             | Non  | Profil + posts d'un créateur |
| GET     | `/api/posts`                    | Non  | Tous les posts               |
| GET     | `/api/posts?creatorId=:id`      | Non  | Posts d'un créateur          |
| POST    | `/api/posts/:id/like`           | JWT  | Liker un post                |
| GET     | `/api/subscriptions`            | JWT  | Mes abonnements              |
| POST    | `/api/subscriptions`            | JWT  | S'abonner                    |
| DELETE  | `/api/subscriptions/:creatorId` | JWT  | Se désabonner                |

---

## Routes frontend

| URL                     | Accès    | Description             |
| ----------------------- | -------- | ----------------------- |
| `/`                     | Public   | Landing page            |
| `/login`                | Public   | Connexion               |
| `/signup`               | Public   | Inscription             |
| `/creators`             | Public   | Liste des créateurs     |
| `/creators/:id`         | Public   | Profil créateur + posts |
| `/feed`                 | Connecté | Fil d'actualité         |
| `/profile`              | Connecté | Mon profil              |
| `/subscribe/:creatorId` | Connecté | S'abonner à un créateur |

---

## Réinitialiser la BDD (reseed)

```bash
docker exec pg-onlyvent psql -U postgres -d onlyventilateur \
  -c "TRUNCATE post, subscription, creator RESTART IDENTITY CASCADE;"
# Redémarrer le backend → seed automatique
```

---

## Stack

**Frontend** : React 19 · TypeScript 5 · Vite 7 · Tailwind CSS 4 · React Router 7

**Backend** : NestJS · TypeORM · PostgreSQL 16 · JWT · bcrypt

**Architecture** : MVVM — `Views/` (JSX) + `ViewModels/` (hooks logique) + `services/` (fetch)
