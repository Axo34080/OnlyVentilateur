# DOCUMENTATION - OnlyVentilateur

> Projet scolaire B3 DW.
> Plateforme parodique inspiree d'OnlyFans autour de createurs de ventilateurs.

---

## Vue d'ensemble

OnlyVentilateur est un projet en deux parties :

- `OnlyVentilateur/` : frontend React + TypeScript + Vite
- `OnlyVentilateurBack/` : backend NestJS + TypeORM + PostgreSQL

Fonctionnalites principales :

- authentification JWT
- profils utilisateur / createur
- posts publics et premium
- abonnements
- boutique goodies + panier
- checkout Stripe en mode demo
- notifications
- chat prive, transfert de fichiers, appel video Jitsi Meet
- toggle confidentialite : autoriser / bloquer les appels video entrants

---

## Etat actuel

### Principes importants

- tout utilisateur inscrit devient automatiquement createur
- `/creators/:id` est la page profil en lecture seule ; toute modification passe par `/profile/edit`
- l'avatar dans la sidebar navigue vers le profil createur (`/creators/:id`) ou vers `/profile/edit` pour les non-createurs
- les paiements Stripe sont en **mode demo**
- l'abonnement premium est finalise au retour du checkout par `POST /api/subscriptions`
- `POST /api/subscriptions` est traite de facon idempotente
- `PATCH /api/users/me` accepte `username`, `bio`, `avatar`, `allowVideoCall`
- le logout frontend ferme aussi la connexion Socket.IO
- `CallContext` gere l'etat global des appels video (entrant, sortant, en attente) independamment de la route active

### Verification connue

- frontend : `npx tsc -b` passe
- frontend : `npm run lint` passe
- backend : `npm run build` passe
- backend : `npm test -- --runInBand` passe

---

## Stack technique

### Frontend

| Outil | Version | Role |
| --- | --- | --- |
| React | 19.2 | UI |
| TypeScript | 5.9 | Typage |
| Vite | 7.3 | Dev server + build |
| React Router DOM | 7.13 | Routing |
| Tailwind CSS | 4.2 | Styling |
| ESLint | 9 | Lint |
| socket.io-client | 4.x | Chat temps reel |
| Jitsi Meet (embed iframe) | — | Appel video |

### Backend

| Outil | Version | Role |
| --- | --- | --- |
| NestJS | 11 | API REST |
| TypeORM | 0.3 | ORM |
| PostgreSQL | 16 | Base de donnees |
| passport-jwt | 4 | Auth JWT |
| bcrypt | 6 | Hash mot de passe |
| socket.io | 4.x | WebSocket |
| Stripe | 20 | Checkout demo |

---

## Lancer le projet

```bash
# 1. Base de donnees
docker start pg-onlyvent

# 2. Backend
cd OnlyVentilateurBack
npm run start:dev

# 3. Frontend
cd OnlyVentilateur
npm run dev
```

Frontend : `http://localhost:5173`
Backend : `http://localhost:3000`

---

## Architecture

### Frontend

```text
src/
|-- Views/          # vues principales
|-- ViewModels/     # logique metier sous forme de hooks
|-- pages/          # routes simples
|-- components/     # composants UI reutilisables
|-- context/        # Auth, Cart, Toast, Chat, Call
|-- services/       # appels API / socket / webRTC
|-- types/          # interfaces TypeScript
`-- data/           # anciens mocks conserves en reference
```

### Backend

```text
src/
|-- auth/
|-- users/
|-- creators/
|-- posts/
|-- subscriptions/
|-- goodies/
|-- orders/
|-- notifications/
|-- messages/
|-- video/
|-- upload/
`-- seed/
```

### Regle MVVM

- `Views/` : rendu et composition
- `ViewModels/` : etat, chargement, mutations, orchestration
- `services/` : I/O uniquement

---

## Routing frontend

| Route | Fichier | Acces |
| --- | --- | --- |
| `/` | `pages/Home.tsx` | Public |
| `/login` | `pages/Login.tsx` | Public |
| `/signup` | `pages/Signup.tsx` | Public |
| `/creators` | `pages/Creators.tsx` | Public |
| `/creators/:id` | `Views/CreatorProfile.tsx` | Public |
| `/posts/:id` | `pages/PostDetail.tsx` | Public |
| `/shop` | `Views/Shop.tsx` | Public |
| `/shop/:id` | `pages/GoodieDetail.tsx` | Public |
| `/users/:id` | `Views/UserPublicProfile.tsx` | Public |
| `/feed` | `Views/Feed.tsx` | Protege |
| `/profile` | `Views/UserProfile.tsx` | Protege |
| `/profile/edit` | `Views/UserProfile.tsx` | Protege |
| `/subscribe/:creatorId` | `pages/Subscribe.tsx` | Protege |
| `/notifications` | `pages/Notifications.tsx` | Protege |
| `/dashboard` | `Views/Dashboard.tsx` | Protege |
| `/dashboard/new-post` | `Views/NewPost.tsx` | Protege |
| `/dashboard/edit-post/:id` | `Views/NewPost.tsx` | Protege |
| `/messages` | `pages/Messages.tsx` | Protege |
| `/messages/:userId` | `Views/Chat.tsx` | Protege |
| `*` | `pages/NotFound.tsx` | Public |

Notes :

- `ProtectedRoute` verifie l'authentification
- `/profile` redirige vers la page createur si `creatorId` est connu
- l'ancien ecran `/subscriptions` a ete supprime au profit d'un onglet dans `/feed`

---

## Types principaux

### `types/User.ts`

```ts
interface User {
  id: string
  email: string
  username: string
  avatar?: string
  bio?: string
  subscribedTo: string[]
  creatorId?: string
  allowVideoCall?: boolean  // toggle confidentialite appels video (defaut: true)
}
```

### `types/Creator.ts`

```ts
interface Creator {
  id: string
  username: string
  displayName: string
  avatar: string
  coverImage: string
  bio: string
  subscriptionPrice: number
  isPremium: boolean
  subscriberCount?: number
  postCount?: number
}
```

### `types/Post.ts`

```ts
interface Post {
  id: string
  creatorId: string
  title: string
  description: string
  image: string | null
  isLocked: boolean
  price?: number
  likes: number
  createdAt: string
  tags: string[]
}
```

### `types/Message.ts`

```ts
type MessageType = "text" | "file"

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string | null
  type: MessageType
  fileName: string | null
  createdAt: string
}
```

---

## Contextes

### AuthContext

Responsabilites :

- stocke `user` + `token`
- expose `login`, `signup`, `logout`, `updateUser`
- persiste la session en `sessionStorage`
- coupe Socket.IO au logout

### CallContext

Responsabilites :

- gere l'etat global des appels video (disponible sur toutes les routes)
- ecoute les evenements socket `incoming_call`, `call_accepted`, `call_rejected`, `call_blocked`
- expose `startCall`, `acceptIncomingCall`, `rejectIncomingCall`, `closeCall`
- affiche `IncomingCallBanner`, `CallerWaitingOverlay` et `VideoCallModal` via `GlobalCallUI`

### CartContext

Responsabilites :

- stocke les articles du panier goodies
- persistance `localStorage`
- gere quantites, suppression, total, variantes

### ChatContext

Responsabilites :

- centralise le compteur de messages non lus (`unreadMessages`)
- ecoute le socket `new_message` une seule fois (evite la duplication)
- expose `resetUnread()` accessible depuis la Sidebar et la vue Chat

### ToastContext

Responsabilites :

- affichage de feedbacks UI
- auto-dismiss

---

## Services frontend

### Auth

- `authService.ts`
- login / signup via `/api/login` et `/api/signup`

### Creators / Posts / Subscriptions

- `creatorsService.ts`
- `postService.ts`
- `subscriptionService.ts`

Notes :

- `subscriptionService.subscribe()` finalise l'acces premium au retour du checkout demo
- `subscriptionService.unsubscribe()` retire l'abonnement cote backend

### Upload / Goodies / Checkout

- `uploadService.ts`
- `goodiesService.ts`
- `checkoutService.ts`

Notes checkout :

- Stripe est utilise en **mode demo**
- il n'y a pas de webhook `checkout.session.completed`
- le checkout sert a simuler un flux de redirection et de retour utilisateur

### Chat / Temps reel

- `messagesService.ts`
- `socketService.ts`
- `webrtcService.ts`

Fonctionnalites :

- messages texte
- historique de conversation
- signalement WebRTC
- transfert de fichiers P2P
- appel video Jitsi Meet

---

## Backend

### Endpoints principaux

#### Auth

| Methode | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/signup` | Non | Inscription |
| POST | `/api/login` | Non | Connexion |

#### Users

| Methode | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/users/me` | JWT | Profil connecte |
| PATCH | `/api/users/me` | JWT | Modifie `username`, `bio`, `avatar`, `allowVideoCall` |
| GET | `/api/users/:id` | Non | Profil public |

#### Creators

| Methode | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/creators` | Non | Liste |
| GET | `/api/creators/:id` | Non | Profil createur + posts |
| GET | `/api/creators/me` | JWT | Mon profil createur |
| PATCH | `/api/creators/me` | JWT | Mise a jour profil createur |

#### Posts

| Methode | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/posts` | Optionnel | Liste des posts |
| GET | `/api/posts/:id` | Optionnel | Detail post |
| GET | `/api/posts/mine` | JWT | Mes posts |
| GET | `/api/posts/liked` | JWT | IDs likes |
| POST | `/api/posts` | JWT | Creation |
| PATCH | `/api/posts/:id` | JWT | Edition |
| DELETE | `/api/posts/:id` | JWT | Suppression |
| POST | `/api/posts/:id/like` | JWT | Toggle like |
| GET | `/api/posts/:id/comments` | Non | Liste commentaires |
| POST | `/api/posts/:id/comments` | JWT | Ajouter commentaire |

#### Subscriptions

| Methode | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/subscriptions` | JWT | Mes abonnements |
| POST | `/api/subscriptions` | JWT | Abonnement demo, idempotent |
| DELETE | `/api/subscriptions/:creatorId` | JWT | Desabonnement |

#### Goodies / Orders

| Methode | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/goodies` | Non | Liste goodies |
| GET | `/api/goodies/:id` | Non | Detail goodie |
| POST | `/api/goodies` | JWT | Creation goodie |
| PATCH | `/api/goodies/:id` | JWT | Edition goodie |
| DELETE | `/api/goodies/:id` | JWT | Suppression goodie |
| GET | `/api/orders` | JWT | Mes commandes |
| POST | `/api/orders` | JWT | Creation commande |

#### Checkout Stripe demo

| Methode | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/checkout/subscription` | JWT | Session checkout abonnement |
| POST | `/api/checkout/order` | JWT | Session checkout goodies |

#### Notifications / Messages / Video / Upload

| Methode | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/notifications` | JWT | Liste notifications |
| GET | `/api/notifications/unread-count` | JWT | Badge navbar |
| GET | `/api/messages/conversations` | JWT | Liste conversations |
| GET | `/api/messages/:userId` | JWT | Historique |
| PATCH | `/api/messages/:userId/read` | JWT | Marque lu |
| POST | `/api/video/room` | JWT | Creation room Jitsi Meet |
| POST | `/api/upload` | JWT | Upload image |

---

## Temps reel

Namespace : `/chat`

Evenements principaux :

- `send_message`
- `new_message`
- `message_sent`
- `webrtc_offer`
- `webrtc_answer`
- `webrtc_ice_candidate`
- `call_request` — emis par l'appelant avec `targetUserId` + `roomUrl`
- `incoming_call` — recu par l'appele, contient `fromUserId`, `roomUrl`, `callerUsername`
- `call_accepted` — emis par l'appele pour accepter, recu par l'appelant
- `call_rejected` — emis par l'appele pour refuser, recu par l'appelant
- `call_blocked` — recu par l'appelant si l'appele a desactive `allowVideoCall`

---

## Securite

### Mis en place

- JWT
- mots de passe hashes avec bcrypt
- DTOs NestJS + ValidationPipe
- throttle global + throttle login
- upload borne aux images et limite de taille
- `PATCH /api/users/me` borne a un DTO dedie
- masquage du contenu premium pour les non abonnes

### Limites connues

- le token reste stocke en `sessionStorage` car c'est un projet de cours
- Stripe est en mode demo, pas en mode production complet
- le checkout goodies reste un flux de demonstration, pas une implementation e-commerce finale

---

## Donnees et seed

Le seed backend cree automatiquement :

- createurs de demonstration
- posts publics et premium
- goodies
- comptes utilisateurs lies

Le seed n'est rejoue que si la base est vide.

---

## Progression / To-do historique

Cette section garde une trace de ce qui a ete fait, meme si certaines etapes intermediaires ont ensuite ete refactorisees.

### Phase 1 - Base MVP

- [x] Scaffolding Vite + React + TypeScript + Tailwind
- [x] Architecture MVVM
- [x] Types principaux
- [x] `AuthContext`
- [x] Home publique
- [x] Cartes createurs

### Phase 2 - Contenu

- [x] `PostCard`
- [x] `PremiumBlur`
- [x] `CreatorProfile`
- [x] `Feed`
- [x] likes cote frontend

### Phase 3 - Abonnements et profil

- [x] pages Login / Signup
- [x] `ProtectedRoute`
- [x] `Subscribe.tsx`
- [x] `UserProfile`
- [x] service abonnements
- [x] persistence session

### Phase 4 - Backend NestJS

- [x] NestJS + TypeORM + PostgreSQL
- [x] entites `User`, `Creator`, `Post`, `Subscription`
- [x] modules auth / users / creators / posts / subscriptions
- [x] seed automatique
- [x] migration des services frontend vers l'API reelle

### Phase 5 - UX reseau social

- [x] recherche createurs
- [x] feed affine
- [x] post detail
- [x] likes persistants
- [x] commentaires
- [x] notifications
- [x] suppression de la page `/subscriptions` au profit d'un onglet dans `/feed`

### Phase 6 - Espace createur

- [x] tout utilisateur inscrit devient createur
- [x] dashboard createur
- [x] creation / edition / suppression de posts
- [x] boutique goodies
- [x] panier persistant
- [x] profil createur unifie

### Phase 7 - Upload / Paiement / Temps reel

- [x] upload fichiers
- [x] Stripe Checkout demo
- [x] chat prive
- [x] transfert de fichiers P2P
- [x] appel video Daily.co

### Phase 8 - Durcissement et nettoyage

- [x] fix route video `/api/video/room`
- [x] DTO dedie pour `PATCH /api/users/me`
- [x] ecriture explicite des champs autorises
- [x] abonnement idempotent
- [x] fermeture du socket au logout
- [x] correction dashboard non-createur
- [x] `npx tsc -b` frontend OK
- [x] `npm run lint` frontend OK
- [x] `npm run build` backend OK
- [x] `npm test -- --runInBand` backend OK

### Phase 9 - Appels video et confidentialite

- [x] integration appel video Jitsi Meet (iframe embed)
- [x] `CallContext` : etat global appels video (fonctionne sur toutes les routes)
- [x] `IncomingCallBanner` : notification entrant avec nom de l'appelant
- [x] `CallerWaitingOverlay` : ecran attente pour l'appelant avec timer
- [x] `GlobalCallUI` : orchestration des composants appel dans `App.tsx`
- [x] `allowVideoCall` : colonne BDD + DTO + service + toggle UI dans `/profile/edit`
- [x] gateway : verifie `allowVideoCall` avant d'emettre `incoming_call`, sinon `call_blocked`
- [x] gateway : `handleConnection` recupere le `username` pour l'inclure dans `incoming_call`
- [x] page createur en lecture seule : edition uniquement via `/profile/edit`
- [x] sidebar : avatar navigue vers `/creators/:id` (ou `/profile/edit` si non-createur)

---

## Notes restantes

- revoir encore la responsive mobile complete
- l'envoi image / video dans le chat reste a verifier fonctionnellement
- le flux goodies Stripe reste acceptable pour un projet de cours, pas pour une vraie boutique
