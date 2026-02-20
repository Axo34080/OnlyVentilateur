# DOCUMENTATION — OnlyVentilateur

> Projet scolaire B3 DW (35h) — troll OnlyFans avec des ventilateurs électriques.
> **Mettre à jour après chaque feature terminée.**

---

## Stack technique

| Outil | Version | Rôle |
|-------|---------|------|
| React | 19.2 | UI — composants fonctionnels + hooks |
| TypeScript | 5.9 (strict) | Typage statique |
| Vite | 7.3 | Build tool + serveur de dev |
| React Router DOM | 7.13 | Routing SPA |
| Tailwind CSS | 4.2 | Styles utilitaires |
| ESLint | 9 + typescript-eslint | Linting |

**Lancer le projet :**
```bash
npm run dev      # http://localhost:5173
npm run build    # build production
npm run lint     # vérification ESLint
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
└── data/            # Données mockées (Phase 1-2, temporaire)
```

**Règle MVVM :** Les `Views/` ne contiennent que du JSX. Toute logique est dans le `ViewModel` correspondant (custom hook). Les `pages/` sont des routes simples sans ViewModel si la logique est légère.

---

## Routing

| Route | Fichier | Accès |
|-------|---------|-------|
| `/` | `pages/Home.tsx` | Public — landing page |
| `/login` | `pages/Login.tsx` | Public — login / signup |
| `/creators` | `pages/Creators.tsx` | Public — liste tous les créateurs |
| `/creators/:id` | `Views/CreatorProfile.tsx` | Public — profil + posts |
| `/feed` | `Views/Feed.tsx` | Public (à protéger Phase 3) |
| `/profile` | `Views/UserProfile.tsx` | **Protégé** (Phase 3) |
| `/subscribe/:creatorId` | `pages/Subscribe.tsx` | **Protégé** (Phase 3) |

Les routes protégées utiliseront `components/ProtectedRoute.tsx` (Phase 3) — redirige vers `/login` si `isAuthenticated === false`.

---

## Types TypeScript

### `types/User.ts`
```typescript
interface User {
  id: string
  email: string
  username: string
  avatar?: string
  bio?: string
  subscribedTo: string[]   // ids des créateurs abonnés
}
```

### `types/Creator.ts`
```typescript
interface Creator {
  id: string
  username: string           // ex: "@TurboFan2000"
  displayName: string
  avatar: string
  coverImage: string
  bio: string
  subscriberCount: number
  postCount: number
  subscriptionPrice: number  // €/mois
  isPremium: boolean
}
```

### `types/Post.ts`
```typescript
interface Post {
  id: string
  creatorId: string
  title: string
  description: string
  image: string
  isLocked: boolean          // true = contenu premium (flou)
  price?: number
  likes: number
  createdAt: string
  tags: string[]
}
```

---

## Contextes

### `context/AuthContext.tsx` ✅

État global d'authentification. Token JWT stocké **en mémoire uniquement** (jamais localStorage).

**Interface :**
```typescript
interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean   // = !!token
}
```

**Utilisation :**
```typescript
import { useAuth } from "../context/AuthContext"

const { user, isAuthenticated, login, logout } = useAuth()
```

**Note :** `useAuth()` lève une erreur si appelé hors d'un `<AuthProvider>`.

---

## Services

### `services/authService.ts` ✅

Centralise les appels d'authentification. Actuellement **mocké** (Phase 1) — les vraies requêtes vers `/api/login` et `/api/signup` sont commentées, prêtes pour la Phase 4 (backend NestJS).

| Fonction | Signature | Description |
|----------|-----------|-------------|
| `login` | `(email, password) => Promise<AuthResponse>` | Connexion — retourne `{ access_token, user }` |
| `signup` | `(email, username, password) => Promise<AuthResponse>` | Inscription — retourne `{ access_token, user }` |

**Migrer vers le vrai backend (Phase 4) :** décommenter les blocs `fetch()` dans ce fichier et supprimer le mock.

---

## Données mockées

### `data/mockCreators.ts` ✅

5 créateurs : `@TurboFan2000`, `@SilentBreeze`, `@MegaSouffle`, `@BreezyGirl`, `@CycloneMaster`.
Images via `picsum.photos/seed/{slug}/`. **Temporaire** — remplacé par `GET /api/creators` en Phase 4.

### `data/mockPosts.ts` ✅

13 posts répartis sur les 5 créateurs. Mix public / premium (`isLocked`). Certains ont un `price` individuel.
**Temporaire** — remplacé par `GET /api/posts` en Phase 4.

---

## Composants

### `components/CreatorCard.tsx` ✅

Card réutilisable pour afficher un créateur.

| Prop | Type | Description |
|------|------|-------------|
| `creator` | `Creator` | Données du créateur |

Affiche : cover, avatar flottant, badge Premium, displayName, username, bio (tronquée), stats abonnés/posts, prix, lien vers `/creators/:id`.

### `components/PostCard.tsx` ✅

Card pour afficher un post. Gère automatiquement le flou premium via `PremiumBlur`.

| Prop | Type | Description |
|------|------|-------------|
| `post` | `Post` | Données du post |
| `isSubscribed` | `boolean` (optionnel) | Si `true`, le contenu premium est visible |
| `onLike` | `(postId: string) => void` (optionnel) | Callback au clic sur ❤️ |

### `components/PremiumBlur.tsx` ✅

Overlay flou sur le contenu verrouillé.

| Prop | Type | Description |
|------|------|-------------|
| `isLocked` | `boolean` | Si `true`, applique `blur-sm` + overlay 🔒 |
| `children` | `ReactNode` | Contenu à afficher (ou flouter) |

---

## Pages & Views

### `pages/Home.tsx` ✅
Landing page publique. Hero + grille de 4 créateurs vedettes (données mockées) + section pitch 3 blocs. Responsive : 1 → 2 → 4 colonnes.

### `pages/Login.tsx` 🔲
Squelette en place. **À implémenter** : formulaire login/signup connecté à `useAuth()`.

### `pages/Creators.tsx` ✅
Liste de tous les créateurs (`MOCK_CREATORS`) en grille responsive. Responsive : 1 → 2 → 3 colonnes.

### `Views/CreatorProfile.tsx` ✅ (MVVM)
Profil complet d'un créateur. Bannière + avatar flottant, bio, stats, bouton abonnement toggle, grille de posts.
Redirige vers `/creators` si l'id est inconnu.

**ViewModel :** `ViewModels/useCreatorProfileViewModel.ts`
- Input : `creatorId: string` (depuis `useParams` dans la View)
- Retourne : `creator`, `posts`, `isSubscribed`, `handleSubscribe`, `handleLike`
- `handleLike` met à jour les likes en local state

### `Views/Feed.tsx` ✅ (MVVM)
Fil de tous les posts avec le créateur associé affiché au-dessus de chaque card. Grille responsive.

**ViewModel :** `ViewModels/useFeedViewModel.ts`
- Retourne : `posts`, `getCreator(creatorId)`, `handleLike`

---

## Sécurité

- JWT stocké en mémoire dans `AuthContext` — pas de `localStorage` / `sessionStorage`
- Aucun secret dans le code source (clés Stripe, JWT_SECRET → `.env` backend)
- Routes sensibles protégées via `ProtectedRoute` (Phase 3) + guard JWT côté API (Phase 4)
- Validation des inputs : à faire côté formulaires (Login) et côté API (class-validator NestJS)

---

## Progression

### Phase 1 — Base MVP ✅
- [x] Scaffolding Vite + React 19 + TypeScript strict + Tailwind v4 + React Router v7
- [x] Architecture MVVM en place
- [x] Types TypeScript (`Creator`, `Post`, `User`)
- [x] `AuthContext` + `useAuth()`
- [x] `authService.ts` (mocké, prêt pour Phase 4)
- [x] `data/mockCreators.ts` — 5 créateurs
- [x] `components/CreatorCard.tsx`
- [x] `pages/Home.tsx` — landing complète
- [ ] `pages/Login.tsx` — formulaire login/signup (squelette en place)

### Phase 2 — Contenu ✅
- [x] `data/mockPosts.ts` — 13 posts
- [x] `components/PremiumBlur.tsx`
- [x] `components/PostCard.tsx`
- [x] `Views/CreatorProfile.tsx` + `ViewModels/useCreatorProfileViewModel.ts`
- [x] `Views/Feed.tsx` + `ViewModels/useFeedViewModel.ts`
- [x] `pages/Creators.tsx`
- [x] Système de likes (local state dans les ViewModels)

### Phase 3 — Abonnements & Profil ✅
- [x] `pages/Login.tsx` — formulaire login/signup avec `useAuth()`, toggle login/signup, redirect si déjà connecté
- [x] `components/ProtectedRoute.tsx` — redirect `/login` si non connecté
- [x] `pages/Subscribe.tsx` — récap créateur + paiement simulé + écran succès
- [x] `Views/UserProfile.tsx` + `ViewModels/useUserProfileViewModel.ts` — édition username/bio/avatar
- [x] `services/subscriptionService.ts` — mocké, prêt Phase 4
- [x] `AuthContext` — ajout `updateUser()`
- [x] `Navbar` — avatar + username si connecté, bouton déconnexion

### Phase 4 — Backend NestJS
- [ ] Scaffolding NestJS + TypeORM + PostgreSQL
- [ ] Modules Auth, Users, Creators, Posts, Subscriptions
- [ ] Seed des données initiales
- [ ] Proxy Vite + migration des services

### Phase 5 — Bonus
- [ ] Paiement Stripe Checkout
- [ ] Upload photos/vidéos (multipart)
- [ ] Chat vidéo (WebRTC ou Daily.co)

---

## Specs cours — couverture

| Spec | Statut | Fichier(s) |
|------|--------|-----------|
| Application B2C | ✅ Fait | `Home.tsx` (public) + `/feed` (connecté) |
| Gestion de profil | ✅ Fait | `Views/UserProfile.tsx` + `useUserProfileViewModel` |
| Affichage d'articles | ✅ Fait | `components/PostCard.tsx` + `Views/Feed.tsx` |
| Fetch API REST | 🟡 Mocké | `services/authService.ts` (Phase 4 : vrais fetch) |
| Responsive | ✅ Fait | Grilles Tailwind 1→2→3/4 colonnes partout |
| Sécurisé | ✅ Fait | JWT en mémoire, `ProtectedRoute`, inputs validés |
| MVVM | ✅ Fait | `CreatorProfile` + `Feed` avec ViewModels |
| Custom hooks | ✅ Fait | `useFeedViewModel`, `useCreatorProfileViewModel` |
| Context API | ✅ Fait | `AuthContext` |
| React Router | ✅ Fait | 7 routes (4 publiques + 3 protégées via `ProtectedRoute`) |
