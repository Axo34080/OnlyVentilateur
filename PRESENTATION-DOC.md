# OnlyVentilateur — Documentation

> B3 DEW 25-26 — Projet Web React + MVVM

---

## 1. Contexte

**OnlyVentilateur** est une application web parodique inspirée d'OnlyFans, où des créateurs de contenu sont... des ventilateurs.

L'idée est de construire une vraie plateforme B2C avec toutes les fonctionnalités attendues d'un réseau social de créateurs : abonnements payants, contenu premium, boutique, chat, et appels vidéo.

**Fonctionnalités principales :**

- Inscription / connexion (JWT)
- Profils créateurs avec contenu public et premium
- Abonnements avec paiement Stripe
- Fil d'actualité avec infinite scroll
- Boutique goodies + panier persistant
- Chat temps réel (Socket.io) + appels vidéo (Jitsi Meet)
- Notifications (like, commentaire, abonnement)
- Dashboard créateur : CRUD posts et goodies, stats

---

## 2. Fonctionnalités — point de vue utilisateur

### S'inscrire et se connecter

L'utilisateur crée un compte via `/signup`. À l'inscription, un profil créateur lui est automatiquement associé. La connexion se fait via `/login` — le token JWT est conservé en `sessionStorage` pour persister la session.

### Découvrir des créateurs

La page `/creators` liste tous les créateurs avec recherche par nom. Chaque carte est cliquable et mène au profil du créateur avec ses posts, sa bio et sa boutique.

### S'abonner à un créateur

Sur le profil d'un créateur, le bouton "S'abonner" redirige vers un checkout Stripe (mode démo). Au retour, l'accès aux contenus premium est déverrouillé — les posts qui étaient flous deviennent visibles.

### Le fil d'actualité (`/feed`)

Affiche tous les posts ou uniquement ceux des créateurs suivis (onglets "Nouveautés" / "Abonnements"). Le scroll charge automatiquement les posts suivants via Intersection Observer. Les likes se mettent à jour instantanément (optimistic update).

### La boutique (`/shop`)

Liste les goodies de tous les créateurs avec filtre par créateur. Le panier est persisté en `localStorage`. Le checkout passe par Stripe (mode démo).

### Chat et appels vidéo (`/messages`)

Messagerie privée en temps réel entre utilisateurs. Chaque conversation supporte l'envoi de fichiers. Depuis une conversation, un bouton lance un appel vidéo via Jitsi Meet — la bannière d'appel entrant apparaît sur toutes les pages grâce au `CallContext`.

### Gérer son profil (`/profile`)

L'utilisateur peut modifier son avatar (upload), son username, sa bio, et son prix d'abonnement. Il peut aussi activer/désactiver la réception d'appels vidéo.

### Dashboard créateur (`/dashboard`)

Vue réservée aux créateurs avec : statistiques (posts, abonnés, revenus), création/édition/suppression de posts, gestion de la boutique goodies.

---

## 3. Technique

### Stack

| Côté     | Outil            | Version | Rôle                  |
| -------- | ---------------- | ------- | --------------------- |
| Frontend | React            | 19.2    | UI                    |
| Frontend | TypeScript       | 5.9     | Typage strict         |
| Frontend | Vite             | 7.3     | Dev server + build    |
| Frontend | React Router DOM | 7.13    | Routing               |
| Frontend | Tailwind CSS     | 4.2     | Styling utility-first |
| Frontend | socket.io-client | 4.x     | Chat temps réel       |
| Backend  | NestJS           | 11      | API REST              |
| Backend  | TypeORM          | 0.3     | ORM                   |
| Backend  | PostgreSQL       | 16      | Base de données       |
| Backend  | passport-jwt     | 4       | Auth JWT              |
| Backend  | Stripe           | 20      | Checkout démo         |

### Architecture MVVM

L'application frontend suit le pattern **MVVM** :

```
src/
├── Views/        # JSX uniquement — aucune logique
├── ViewModels/   # Custom hooks — état + logique métier
├── pages/        # Routes simples sans logique complexe
├── components/   # Composants UI réutilisables (props only)
├── context/      # État global partagé (4 contextes)
├── services/     # Tous les fetch() centralisés ici
└── types/        # Interfaces TypeScript
```

**Règle stricte :** une `View` ne contient que du JSX. Elle consomme son `ViewModel` (custom hook) qui lui fournit données et handlers. Les `services/` ne font que du I/O — jamais de logique métier.

### Context API

4 contextes couvrent l'état global :

| Contexte       | Responsabilité                                                            |
| -------------- | ------------------------------------------------------------------------- |
| `AuthContext`  | user + token JWT, login/logout, persistance sessionStorage                |
| `CartContext`  | panier goodies, persistance localStorage                                  |
| `ToastContext` | notifications UI (feedbacks visuels)                                      |
| `ChatContext`  | badge messages non lus, listener socket centralisé                        |
| `CallContext`  | état des appels vidéo (entrant/sortant), accessible sur toutes les routes |

### Flux de données

```
Utilisateur
    │
    ▼
View (JSX)
    │  appelle
    ▼
ViewModel (custom hook)
    │  appelle
    ▼
Service (fetch / socket)
    │  HTTP / WS
    ▼
API NestJS ──► PostgreSQL
```

**Flux d'authentification :**

```
Login form ──► authService.login()
                    │
                    ▼
             POST /api/login
                    │
              token JWT + user
                    │
                    ▼
          AuthContext.login()
          sessionStorage + state
                    │
                    ▼
        Tous les composants via useAuth()
```

**Flux temps réel (chat) :**

```
useChatViewModel ──► connectSocket(token)
                           │
                    Socket.io /chat
                           │
             ┌─────────────┴─────────────┐
             │                           │
      new_message                  message_sent
             │                           │
      ChatContext                 Chat view
   (badge sidebar)             (ajout au fil)
```

### Routing

| Route                                                                 | Accès         |
| --------------------------------------------------------------------- | ------------- |
| `/`, `/creators`, `/creators/:id`, `/posts/:id`, `/shop`, `/shop/:id` | Public        |
| `/feed`, `/profile`, `/dashboard`, `/messages`, `/notifications`      | Protégé (JWT) |

Les routes protégées sont wrappées dans `<ProtectedRoute>` qui redirige vers `/login` si l'utilisateur n'est pas authentifié.

### Lancer le projet

```bash
# Base de données
docker start pg-onlyvent

# Backend
cd OnlyVentilateurBack && npm run start:dev

# Frontend
cd OnlyVentilateur && npm run dev
```

Frontend : `http://localhost:5173` — Backend : `http://localhost:3000`
