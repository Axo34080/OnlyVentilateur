# DOCUMENTATION — OnlyVentilateur

> Projet scolaire B3 DW (35h) — troll OnlyFans avec des ventilateurs électriques.
> **Mettre à jour après chaque feature terminée.**

---

## Stack technique

### Frontend

| Outil            | Version               | Rôle                                    |
| ---------------- | --------------------- | --------------------------------------- |
| React            | 19.2                  | UI — composants fonctionnels + hooks    |
| TypeScript       | 5.9 (strict)          | Typage statique                         |
| Vite             | 7.3                   | Build tool + dev server + proxy `/api`  |
| React Router DOM | 7.13                  | Routing SPA                             |
| Tailwind CSS     | 4.2                   | Styles utilitaires                      |
| ESLint           | 9 + typescript-eslint | Linting                                 |

### Backend

| Outil        | Version | Rôle                          |
| ------------ | ------- | ----------------------------- |
| NestJS       | 11      | Framework API REST            |
| TypeORM      | 0.3     | ORM PostgreSQL                |
| PostgreSQL   | 16      | Base de données (Docker)      |
| passport-jwt | —       | Stratégie JWT                 |
| bcrypt       | —       | Hash des mots de passe        |

**Lancer le projet :**

```bash
# 1. Base de données
docker start pg-onlyvent

# 2. Backend — http://localhost:3000
cd OnlyVentilateurBack && npm run start:dev

# 3. Frontend — http://localhost:5173
cd OnlyVentilateur && npm run dev
```

---

## Architecture MVVM

```
src/
├── Views/           # JSX uniquement — aucune logique métier
├── ViewModels/      # Custom hooks — état + logique (useFooViewModel)
├── pages/           # Pages simples sans logique complexe
├── components/      # Composants UI réutilisables (props only)
├── context/         # État global partagé (AuthContext)
├── services/        # Tous les appels fetch() centralisés
├── types/           # Interfaces TypeScript
└── data/            # Données mockées (Phase 1-2, gardées pour référence)
```

**Règle MVVM :** Les `Views/` ne contiennent que du JSX. Toute logique est dans le `ViewModel` correspondant (custom hook). Les `pages/` sont des routes simples sans ViewModel si la logique est légère.

---

## Routing

| Route                   | Fichier                    | Accès                             |
| ----------------------- | -------------------------- | --------------------------------- |
| `/`                     | `pages/Home.tsx`           | Public — landing page             |
| `/login`                | `pages/Login.tsx`          | Public — connexion uniquement     |
| `/signup`               | `pages/Signup.tsx`         | Public — inscription uniquement   |
| `/creators`             | `pages/Creators.tsx`       | Public — liste tous les créateurs |
| `/creators/:id`         | `Views/CreatorProfile.tsx` | Public — profil + posts           |
| `/feed`                 | `Views/Feed.tsx`           | **Protégé** — fil d'actualité     |
| `/profile`              | `Views/UserProfile.tsx`    | **Protégé** — édition profil      |
| `/subscribe/:creatorId` | `pages/Subscribe.tsx`      | **Protégé** — abonnement          |

Les routes protégées utilisent `components/ProtectedRoute.tsx` — redirige vers `/login` si `isAuthenticated === false`.

---

## Types TypeScript

### `types/User.ts`

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  subscribedTo: string[]; // ids des créateurs abonnés
}
```

### `types/Creator.ts`

```typescript
interface Creator {
  id: string;
  username: string;       // ex: "TurboFan2000"
  displayName: string;
  avatar: string;
  coverImage: string;
  bio: string;
  subscriberCount?: number;   // calculé côté API (loadRelationCountAndMap)
  postCount?: number;         // calculé côté API (loadRelationCountAndMap)
  subscriptionPrice: number;  // €/mois
  isPremium: boolean;
}
```

### `types/Post.ts`

```typescript
interface Post {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  image: string;
  isLocked: boolean; // true = contenu premium (flou)
  price?: number;
  likes: number;
  createdAt: string;
  tags: string[];
}
```

---

## Contextes

### `context/AuthContext.tsx` ✅

État global d'authentification. Token JWT stocké en **sessionStorage** (persist F5, effacé à la fermeture du navigateur).

**Interface :**

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean; // = !!token
}
```

**Utilisation :**

```typescript
import { useAuth } from "../context/AuthContext";

const { user, isAuthenticated, login, logout } = useAuth();
```

**Persistence :** La session est chargée depuis `sessionStorage` à l'initialisation — l'utilisateur reste connecté après F5.

---

## Services

### `services/authService.ts` ✅

Appels réels vers le backend NestJS.

| Fonction | Signature                                              | Description                                     |
| -------- | ------------------------------------------------------ | ----------------------------------------------- |
| `login`  | `(email, password) => Promise<AuthResponse>`           | POST `/api/login` → `{ access_token, user }`    |
| `signup` | `(email, username, password) => Promise<AuthResponse>` | POST `/api/signup` → `{ access_token, user }`   |

### `services/creatorsService.ts` ✅

Centralise les appels créateurs + posts.

| Fonction          | Signature                                         | Description                             |
| ----------------- | ------------------------------------------------- | --------------------------------------- |
| `getCreators`     | `() => Promise<Creator[]>`                        | GET `/api/creators`                     |
| `getCreatorById`  | `(id: string) => Promise<{ creator, posts }>`     | GET `/api/creators/:id`                 |

**Note :** Normalise `subscriptionPrice` (decimal PostgreSQL → number) et `tags` (simple-array → string[]).

### `services/subscriptionService.ts` ✅

| Fonction                | Signature                              | Description                             |
| ----------------------- | -------------------------------------- | --------------------------------------- |
| `getUserSubscriptions`  | `(token) => Promise<string[]>`         | GET `/api/subscriptions` → ids          |
| `subscribe`             | `(creatorId, token) => Promise<void>`  | POST `/api/subscriptions`               |
| `unsubscribe`           | `(creatorId, token) => Promise<void>`  | DELETE `/api/subscriptions/:creatorId`  |

---

## Données mockées

### `data/mockCreators.ts`

5 créateurs avec images LoremFlickr (thème ventilateur). **Gardé pour référence** — l'app utilise désormais `GET /api/creators`.

### `data/mockPosts.ts`

13 posts répartis sur les 5 créateurs. Mix public / premium. **Gardé pour référence** — l'app utilise désormais `GET /api/posts`.

---

## Composants

### `components/CreatorCard.tsx` ✅

Card réutilisable pour afficher un créateur.

| Prop      | Type      | Description         |
| --------- | --------- | ------------------- |
| `creator` | `Creator` | Données du créateur |

Affiche : cover, avatar flottant, badge Premium, displayName, username, bio (tronquée), stats abonnés/posts (`?? 0`), prix, lien vers `/creators/:id`.

### `components/PostCard.tsx` ✅

Card pour afficher un post. Gère automatiquement le flou premium via `PremiumBlur`.

| Prop           | Type                                   | Description                               |
| -------------- | -------------------------------------- | ----------------------------------------- |
| `post`         | `Post`                                 | Données du post                           |
| `isSubscribed` | `boolean` (optionnel)                  | Si `true`, le contenu premium est visible |
| `onLike`       | `(postId: string) => void` (optionnel) | Callback au clic sur ❤️                   |

### `components/PremiumBlur.tsx` ✅

Overlay flou sur le contenu verrouillé.

| Prop       | Type        | Description                                |
| ---------- | ----------- | ------------------------------------------ |
| `isLocked` | `boolean`   | Si `true`, applique `blur-sm` + overlay 🔒 |
| `children` | `ReactNode` | Contenu à afficher (ou flouter)            |

### `components/ProtectedRoute.tsx` ✅

Redirige vers `/login` si l'utilisateur n'est pas authentifié.

---

## Pages & Views

### `pages/Home.tsx` ✅

Landing page publique. Hero + grille de 4 créateurs vedettes (depuis API) + section pitch. Responsive : 1 → 2 → 4 colonnes. "Rejoindre" redirige vers `/signup`.

### `pages/Login.tsx` ✅

Formulaire de **connexion uniquement**. Redirige vers `/` si déjà connecté. Lien vers `/signup`.

### `pages/Signup.tsx` ✅

Formulaire d'**inscription uniquement** (email + username + password). Redirige vers `/` si déjà connecté. Lien vers `/login`.

### `pages/Creators.tsx` ✅

Liste de tous les créateurs (depuis `GET /api/creators`) en grille responsive avec skeleton loading. Responsive : 1 → 2 → 3 colonnes.

### `pages/Subscribe.tsx` ✅

Récapitulatif créateur + paiement simulé + écran de succès.

### `Views/CreatorProfile.tsx` ✅ (MVVM)

Profil complet d'un créateur. Bannière + avatar flottant, bio, stats, bouton abonnement toggle, grille de posts. Skeleton loading pendant le chargement. Redirige vers `/creators` si l'id est inconnu (après chargement terminé).

**ViewModel :** `ViewModels/useCreatorProfileViewModel.ts`

- Input : `creatorId: string` (depuis `useParams` dans la View)
- Retourne : `creator`, `posts`, `isSubscribed`, `isLoading`, `error`, `handleSubscribe`, `handleLike`

### `Views/Feed.tsx` ✅ (MVVM)

Fil de tous les posts avec le créateur associé. Skeleton loading. Grille responsive.

**ViewModel :** `ViewModels/useFeedViewModel.ts`

- Retourne : `posts`, `getCreator(creatorId)`, `handleLike`, `isLoading`

### `Views/UserProfile.tsx` ✅ (MVVM)

Édition du profil utilisateur (username, bio, avatar).

**ViewModel :** `ViewModels/useUserProfileViewModel.ts`

- `handleSave` appelle `PATCH /api/users/me` avec Bearer token

---

## Backend NestJS

### Structure

```
OnlyVentilateurBack/src/
├── main.ts                 # Bootstrap — prefix /api, CORS, ValidationPipe
├── app.module.ts           # ConfigModule + TypeORM + tous les modules
├── auth/                   # POST /api/login + /api/signup + JWT strategy
├── users/                  # GET/PATCH /api/users/me
├── creators/               # GET /api/creators + /api/creators/:id
├── posts/                  # GET /api/posts + POST /api/posts/:id/like
├── subscriptions/          # GET/POST/DELETE /api/subscriptions
└── seed/                   # OnModuleInit — insert créateurs + posts si BDD vide
```

### Entités TypeORM

| Entité       | Fichier                             | Relations                                              |
| ------------ | ----------------------------------- | ------------------------------------------------------ |
| User         | `users/user.entity.ts`              | OneToMany Subscription                                 |
| Creator      | `creators/creator.entity.ts`        | OneToMany Post, OneToMany Subscription                 |
| Post         | `posts/post.entity.ts`              | ManyToOne Creator                                      |
| Subscription | `subscriptions/subscription.entity.ts` | ManyToOne User, ManyToOne Creator — Unique(user, creator) |

### Seed

`seed/seed.service.ts` implémente `OnModuleInit` — vérifie si la BDD est vide et insère 5 créateurs + 5 posts chacun. Images via LoremFlickr (thème ventilateur). Le seed est ignoré si des créateurs existent déjà.

---

## Sécurité

| Point           | Implémentation                                                          |
| --------------- | ----------------------------------------------------------------------- |
| JWT             | Stocké en sessionStorage (persist F5, effacé à fermeture navigateur)   |
| Mots de passe   | Hashés avec bcrypt (rounds: 10) côté backend                            |
| Secrets         | JWT_SECRET, DB_PASSWORD → `.env` backend uniquement                    |
| Routes sensibles | `ProtectedRoute` frontend + `JwtAuthGuard` NestJS                      |
| Inputs          | `ValidationPipe` NestJS (whitelist: true) + `required`/`minLength` HTML |
| CORS            | Backend autorise uniquement `http://localhost:5173`                     |

---

## Progression

### Phase 1 — Base MVP ✅

- [x] Scaffolding Vite + React 19 + TypeScript strict + Tailwind v4 + React Router v7
- [x] Architecture MVVM en place
- [x] Types TypeScript (`Creator`, `Post`, `User`)
- [x] `AuthContext` + `useAuth()`
- [x] `data/mockCreators.ts` — 5 créateurs
- [x] `components/CreatorCard.tsx`
- [x] `pages/Home.tsx` — landing complète

### Phase 2 — Contenu ✅

- [x] `data/mockPosts.ts` — 13 posts
- [x] `components/PremiumBlur.tsx`
- [x] `components/PostCard.tsx`
- [x] `Views/CreatorProfile.tsx` + `ViewModels/useCreatorProfileViewModel.ts`
- [x] `Views/Feed.tsx` + `ViewModels/useFeedViewModel.ts`
- [x] `pages/Creators.tsx`
- [x] Système de likes (local state dans les ViewModels)

### Phase 3 — Abonnements & Profil ✅

- [x] `pages/Login.tsx` — connexion avec `useAuth()`, redirect si déjà connecté
- [x] `pages/Signup.tsx` — inscription séparée
- [x] `components/ProtectedRoute.tsx` — redirect `/login` si non connecté
- [x] `pages/Subscribe.tsx` — récap créateur + paiement simulé + écran succès
- [x] `Views/UserProfile.tsx` + `ViewModels/useUserProfileViewModel.ts`
- [x] `services/subscriptionService.ts`
- [x] `AuthContext` — ajout `updateUser()`
- [x] `Navbar` — avatar + username si connecté, bouton déconnexion

### Phase 4 — Backend NestJS ✅

- [x] Scaffolding NestJS + TypeORM + PostgreSQL (Docker)
- [x] Entités : User, Creator, Post, Subscription
- [x] Modules : Auth (JWT + bcrypt), Users, Creators, Posts, Subscriptions
- [x] Seed automatique au premier démarrage (5 créateurs + 25 posts)
- [x] Images thématiques ventilateur via LoremFlickr
- [x] Migration des services frontend → vrais appels API
- [x] Loading states dans tous les ViewModels
- [x] Séparation Login / Signup (deux pages distinctes)
- [x] Persistence session avec sessionStorage (persist F5)

### Phase 5 — Bonus

- [ ] Paiement Stripe Checkout
- [ ] Upload photos/vidéos (multipart)
- [ ] Chat vidéo (WebRTC ou Daily.co)

---

## Specs cours — couverture

| Spec                 | Statut  | Fichier(s)                                                          |
| -------------------- | ------- | ------------------------------------------------------------------- |
| Application B2C      | ✅ Fait | `Home.tsx` (public) + `/feed` (connecté)                            |
| Gestion de profil    | ✅ Fait | `Views/UserProfile.tsx` + `useUserProfileViewModel`                 |
| Affichage d'articles | ✅ Fait | `components/PostCard.tsx` + `Views/Feed.tsx`                        |
| Fetch API REST       | ✅ Fait | `services/creatorsService.ts`, `authService.ts`, `subscriptionService.ts` |
| Responsive           | ✅ Fait | Grilles Tailwind 1→2→3/4 colonnes partout                           |
| Sécurisé             | ✅ Fait | JWT sessionStorage, bcrypt, `ProtectedRoute`, `JwtAuthGuard`        |
| MVVM                 | ✅ Fait | `CreatorProfile` + `Feed` + `UserProfile` avec ViewModels           |
| Custom hooks         | ✅ Fait | `useFeedViewModel`, `useCreatorProfileViewModel`, `useUserProfileViewModel` |
| Context API          | ✅ Fait | `AuthContext`                                                       |
| React Router         | ✅ Fait | 8 routes (5 publiques + 3 protégées via `ProtectedRoute`)           |
