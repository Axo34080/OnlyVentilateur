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
| socket.io-client | 4.x                   | WebSocket client (chat temps réel)      |
| @daily-co/daily-js | —                   | SDK appel vidéo (Daily.co embed)        |

### Backend

| Outil        | Version | Rôle                          |
| ------------ | ------- | ----------------------------- |
| NestJS       | 11      | Framework API REST            |
| TypeORM      | 0.3     | ORM PostgreSQL                |
| PostgreSQL   | 16      | Base de données (Docker)      |
| passport-jwt | —       | Stratégie JWT                 |
| bcrypt       | —       | Hash des mots de passe        |
| socket.io    | 4.x     | WebSocket server (chat + signaling WebRTC) |

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
| `/creators`             | `pages/Creators.tsx`       | Public — liste + recherche créateurs |
| `/creators/:id`         | `Views/CreatorProfile.tsx` | Public — profil + onglets Posts/À propos/Abonnements |
| `/posts/:id`            | `pages/PostDetail.tsx`     | Public — détail d'un post         |
| `/shop`                 | `Views/Shop.tsx`           | Public — boutique goodies         |
| `/shop/:id`             | `pages/GoodieDetail.tsx`   | Public — détail d'un article boutique |
| `/feed`                 | `Views/Feed.tsx`           | **Protégé** — fil infinite scroll + onglets Nouveautés/Abonnements |
| `/profile`              | `Views/UserProfile.tsx`    | **Protégé** — redirige systématiquement vers `/creators/:id` (tous les users sont créateurs) |
| `/profile/edit`         | `Views/UserProfile.tsx`    | **Protégé** — formulaire édition profil (username, bio, avatar) + profil créateur |
| `/subscribe/:creatorId` | `pages/Subscribe.tsx`      | **Protégé** — abonnement          |
| `/notifications`        | `pages/Notifications.tsx`  | **Protégé** — centre de notifications |
| `/dashboard`            | `Views/Dashboard.tsx`      | **Protégé** — espace créateur (stats + posts + boutique) |
| `/dashboard/new-post`   | `Views/NewPost.tsx`        | **Protégé** — créer un post       |
| `/dashboard/edit-post/:id` | `Views/NewPost.tsx`     | **Protégé** — éditer un post      |
| `/users/:id`            | `Views/UserPublicProfile.tsx` | Public — profil utilisateur (redirect `/creators/:id` si créateur) |
| `/messages`             | `pages/Messages.tsx`       | **Protégé** — liste des conversations privées |
| `/messages/:userId`     | `Views/Chat.tsx`           | **Protégé** — fenêtre de chat + transfert fichiers P2P + appel vidéo |
| `*`                     | `pages/NotFound.tsx`       | Public — 404 catch-all            |

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
  creatorId?: string;     // toujours défini — tout utilisateur est créateur à l'inscription
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

### `types/Message.ts`

```typescript
type MessageType = 'text' | 'file'

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string | null
  type: MessageType
  fileName: string | null
  createdAt: string
}

interface Conversation {
  userId: string
  username: string
  avatar: string | null
  lastMessage: Message
}
```

---

## Contextes

### `context/ToastContext.tsx` ✅

Notifications toast légères (feedback immédiat des actions). Auto-dismiss après 3s.

```typescript
interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}
```

Utilisé dans : `useCreatorProfileViewModel`, `useUserProfileViewModel`, `useNewPostViewModel`, `useDashboardViewModel`. Rendu par `components/ToastContainer.tsx` (fixé `bottom-4 right-4`, vert/rouge/ardoise).

### `context/CartContext.tsx` ✅

État global du panier goodies.

```typescript
export interface GoodieItem {
  id: string; name: string; price: number; image: string; creator: string;
  variants?: string[];  // options disponibles (tailles, couleurs…)
  variant?: string;     // option sélectionnée pour cet article
}
export interface CartItem extends GoodieItem {
  quantity: number;
  cartKey: string;  // `${id}|${variant}` ou `${id}` — unicité par variante
}
interface CartContextType {
  items: CartItem[];
  addItem: (item: GoodieItem) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}
```

`cartKey` : même goodie dans des tailles différentes → lignes panier distinctes.

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

| Fonction            | Signature                                         | Description                             |
| ------------------- | ------------------------------------------------- | --------------------------------------- |
| `getCreators`       | `() => Promise<Creator[]>`                        | GET `/api/creators`                     |
| `getCreatorById`    | `(id: string) => Promise<CreatorWithPosts>`       | GET `/api/creators/:id`                 |
| `getPostById`       | `(id: string) => Promise<Post & { creator }>`     | GET `/api/posts/:id`                    |
| `getLikedPostIds`   | `(token: string) => Promise<string[]>`            | GET `/api/posts/liked` — IDs likés par l'user |

**Note :** Normalise `subscriptionPrice` (decimal PostgreSQL → number) et `tags` (simple-array → string[]).

### `services/subscriptionService.ts` ✅

| Fonction                 | Signature                              | Description                             |
| ------------------------ | -------------------------------------- | --------------------------------------- |
| `getUserSubscriptions`   | `(token) => Promise<string[]>`         | GET `/api/subscriptions` → ids          |
| `getSubscribedCreators`  | `(token) => Promise<Creator[]>`        | GET `/api/subscriptions` → créateurs    |
| `subscribe`              | `(creatorId, token) => Promise<void>`  | POST `/api/subscriptions`               |
| `unsubscribe`            | `(creatorId, token) => Promise<void>`  | DELETE `/api/subscriptions/:creatorId`  |

### `services/postService.ts` ✅

| Fonction       | Signature                                              | Description                          |
| -------------- | ------------------------------------------------------ | ------------------------------------ |
| `getMyPosts`   | `(token) => Promise<Post[]>`                           | GET `/api/posts/mine`                |
| `createPost`   | `(data, token) => Promise<Post>`                       | POST `/api/posts`                    |
| `updatePost`   | `(id, data, token) => Promise<Post>`                   | PATCH `/api/posts/:id`               |
| `deletePost`   | `(id, token) => Promise<void>`                         | DELETE `/api/posts/:id`              |

### `services/uploadService.ts` ✅

| Fonction     | Signature                              | Description                                              |
| ------------ | -------------------------------------- | -------------------------------------------------------- |
| `uploadFile` | `(file: File, token) => Promise<string>` | POST `/api/upload` (multipart) → URL `/uploads/uuid.ext` |

Envoie le fichier en `FormData`. Retourne l'URL servie statiquement. Utilisé dans `NewPost`, `CreatorProfile` (avatar + cover).

### `services/commentsService.ts` ✅

| Fonction       | Signature                                          | Description                              |
| -------------- | -------------------------------------------------- | ---------------------------------------- |
| `getComments`  | `(postId: string) => Promise<Comment[]>`           | GET `/api/posts/:id/comments` — public   |
| `addComment`   | `(postId, content, token) => Promise<Comment>`     | POST `/api/posts/:id/comments` — JWT     |

`Comment` : `{ id, postId, userId, username, avatar, content, createdAt }`.

### `services/notificationsService.ts` ✅

| Fonction          | Signature                              | Description                                              |
| ----------------- | -------------------------------------- | -------------------------------------------------------- |
| `getNotifications`| `(token) => Promise<Notification[]>`   | GET `/api/notifications` — retourne tout + marque lu    |
| `getUnreadCount`  | `(token) => Promise<number>`           | GET `/api/notifications/unread-count` — pour badge Navbar |

`Notification` : `{ id, userId, type ('subscribe'|'like'|'comment'), message, isRead, postId, actorAvatar, createdAt }`.

### `services/goodiesService.ts` ✅

| Fonction          | Signature                                                       | Description                          |
| ----------------- | --------------------------------------------------------------- | ------------------------------------ |
| `getGoodieById`   | `(id: string) => Promise<Goodie>`                               | GET `/api/goodies/:id`               |
| `getGoodies`      | `(creatorId?: string) => Promise<Goodie[]>`                     | GET `/api/goodies[?creatorId=]`      |
| `createGoodie`    | `(data, token) => Promise<Goodie>`                              | POST `/api/goodies`                  |
| `updateGoodie`    | `(id, data, token) => Promise<Goodie>`                          | PATCH `/api/goodies/:id`             |
| `deleteGoodie`    | `(id, token) => Promise<void>`                                  | DELETE `/api/goodies/:id`            |
| `goodieToCartItem`| `(g: Goodie, variant?: string) => GoodieItem`                   | Convertit un Goodie API en GoodieItem (CartContext) avec variante optionnelle |

### `services/checkoutService.ts` ✅

Appels vers le backend Stripe Checkout.

| Fonction | Signature | Description |
| --- | --- | --- |
| `createSubscriptionCheckout` | `(creatorId, token) => Promise<string>` | POST `/api/checkout/subscription` → URL Stripe |
| `createOrderCheckout` | `(items: CartItemWithQty[], token) => Promise<string>` | POST `/api/checkout/order` → URL Stripe |

Le frontend redirige avec `window.location.href = url`. Les items sont envoyés avec variante dans le nom : `"T-shirt TurboFan (L)"`.

### `services/messagesService.ts` ✅

| Fonction           | Signature                                       | Description                              |
| ------------------ | ----------------------------------------------- | ---------------------------------------- |
| `getConversations` | `(token) => Promise<Conversation[]>`            | GET `/api/messages/conversations`        |
| `getHistory`       | `(token, userId) => Promise<Message[]>`         | GET `/api/messages/:userId`              |
| `createVideoRoom`  | `(token) => Promise<{ url: string }>`           | POST `/api/video/room` → URL Daily.co    |

### `services/socketService.ts` ✅

Gère la connexion socket.io vers le namespace `/chat`. Authentification via `auth.token` (JWT).

| Fonction             | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| `connectSocket(token)` | Crée la connexion au namespace `/chat`                      |
| `disconnectSocket()` | Ferme la connexion                                            |
| `sendMessage(receiverId, content, type?, fileName?)` | Émet `send_message` |
| `onNewMessage(handler)` | S'abonne à `new_message` + `message_sent` → retourne unsubscribe |
| `sendOffer/Answer/IceCandidate(targetUserId, data)` | Signaling WebRTC |
| `requestCall(targetUserId, roomUrl)` | Notifie le destinataire d'un appel entrant |
| `acceptCall/rejectCall(targetUserId)` | Réponse à un appel entrant |

### `services/webrtcService.ts` ✅

Transfert de fichiers peer-to-peer via **WebRTC DataChannel** (aucun serveur intermédiaire).

| Fonction                        | Description                                                     |
| ------------------------------- | --------------------------------------------------------------- |
| `initiateFileTransfer(targetUserId, file, onProgress)` | Crée la connexion P2P, envoie le fichier en chunks 16 KB |
| `handleIncomingOffer(targetUserId, offer)` | Répond à un `webrtc_offer`, reçoit les chunks      |
| `handleAnswer(answer)` / `handleIceCandidate(candidate)` | Signaling RTCPeerConnection |
| `setFileReceiveHandler(handler)` | Callback `(fileName, blob)` appelé quand le fichier est reçu   |
| `closePeerConnection()` | Ferme DataChannel + RTCPeerConnection                          |

STUN server : `stun:stun.l.google.com:19302` (gratuit, public).

### `services/usersService.ts` ✅

| Fonction        | Signature                        | Description                                   |
| --------------- | -------------------------------- | --------------------------------------------- |
| `getPublicUser` | `(id: string) => Promise<PublicUser>` | GET `/api/users/:id` — sans password/email |

`PublicUser` : `{ id, username, avatar?, bio?, creatorId? }`.

---

## Données mockées

### `data/mockCreators.ts`

5 créateurs avec images LoremFlickr (thème ventilateur). **Gardé pour référence** — l'app utilise désormais `GET /api/creators`.

### `data/mockPosts.ts`

13 posts répartis sur les 5 créateurs. Mix public / premium. **Gardé pour référence** — l'app utilise désormais `GET /api/posts`.

---

## Composants

### `components/CreatorCard.tsx` ✅

Card réutilisable pour afficher un créateur. **Toute la carte est cliquable** (`<Link>` wrapper) — clic n'importe où → `/creators/:id`. Texte "Voir le profil →" en bas à droite.

| Prop      | Type      | Description         |
| --------- | --------- | ------------------- |
| `creator` | `Creator` | Données du créateur |

Affiche : cover, avatar flottant, badge Premium, displayName, username, bio (tronquée), stats abonnés/posts (`?? 0`), prix.

### `components/PostCard.tsx` ✅

Card pour afficher un post. Gère automatiquement le flou premium via `PremiumBlur`. **Toute la carte est cliquable.** Le bouton like utilise `e.stopPropagation()` pour ne pas déclencher la navigation.

**Navigation au clic :**
- Post déverrouillé (ou propre post) → `/posts/:id`
- Post verrouillé + connecté → `/subscribe/:creatorId` (proposition d'abonnement directe)
- Post verrouillé + non connecté → `/login`

`isOwnPost = user?.creatorId === post.creatorId` — le créateur voit ses propres posts sans flou ni redirection.

| Prop           | Type                                   | Description                               |
| -------------- | -------------------------------------- | ----------------------------------------- |
| `post`         | `Post`                                 | Données du post                           |
| `isSubscribed` | `boolean` (optionnel)                  | Si `true`, le contenu premium est visible |
| `isLiked`      | `boolean` (optionnel)                  | ❤️ rouge si `true`, 🤍 si `false`         |
| `onLike`       | `(postId: string) => void` (optionnel) | Callback au clic sur le cœur             |

### `components/PremiumBlur.tsx` ✅

Overlay flou sur le contenu verrouillé.

| Prop       | Type        | Description                                |
| ---------- | ----------- | ------------------------------------------ |
| `isLocked` | `boolean`   | Si `true`, applique `blur-sm` + overlay 🔒 |
| `children` | `ReactNode` | Contenu à afficher (ou flouter)            |

### `components/VideoCallModal.tsx` ✅

Modal d'appel vidéo via **Daily.co embed** (`@daily-co/daily-js`).

| Prop      | Type         | Description                         |
| --------- | ------------ | ------------------------------------ |
| `roomUrl` | `string`     | URL de la room Daily.co              |
| `onClose` | `() => void` | Callback fermeture (bouton ✕ ou `left-meeting`) |

Crée un `DailyIframe.createFrame()` dans un `div` référencé, rejoint la room, écoute l'événement `left-meeting` pour fermer automatiquement.

### `components/ProtectedRoute.tsx` ✅

Redirige vers `/login` si l'utilisateur n'est pas authentifié.

---

## Pages & Views

### `pages/Home.tsx` ✅

Landing page publique. Hero + grille de 4 créateurs vedettes (depuis API) + section pitch. Responsive : 1 → 2 → 4 colonnes. "Rejoindre" redirige vers `/signup`.

### `pages/Login.tsx` ✅

Formulaire de **connexion uniquement**. Redirige vers `/feed` si déjà connecté ou après connexion réussie. Lien vers `/signup`.

### `pages/Signup.tsx` ✅

Formulaire d'**inscription uniquement** (email + username + password). Redirige vers `/feed` si déjà connecté ou après inscription réussie. Lien vers `/login`.

### `pages/NotFound.tsx` ✅

Page 404 — affichée pour toute route inconnue via `path="*"`. Boutons Accueil et Fil d'actualité.

### `pages/Creators.tsx` ✅

Liste de tous les créateurs (depuis `GET /api/creators`) en grille responsive avec skeleton loading et **barre de recherche** (filtre par displayName/username). Responsive : 1 → 2 → 3 colonnes.

### `pages/PostDetail.tsx` ✅

Page détail d'un post. Fil d'ariane vers le créateur. Likes persistés en BDD — le statut "liké" (❤️/🤍) est rechargé depuis `GET /api/posts/liked` au montage.

**Gestion du contenu premium :**
- `locked = post.isLocked && !isSubscribed && !isOwnPost`
- Si `locked` → page CTA complète (image floutée + overlay 🔒, avatar créateur, bouton "S'abonner — X €/mois" ou "Se connecter" si non connecté). La page post normale n'est jamais rendue.
- `isSubscribed` et `isOwnPost` sont résolus dans un seul `useEffect` avec `Promise.allSettled` pour isoler les erreurs sans bloquer l'affichage.
- Si le backend retourne `403` sur `GET /api/posts/:id` (protection côté API), `setError(true)` → redirect `/feed`.

**Section commentaires** (bas de page) :
- Chargement depuis `GET /api/posts/:id/comments` au montage
- Formulaire textarea + bouton "Commenter" si connecté — sinon lien "Connecte-toi"
- Nouveau commentaire ajouté en tête de liste optimistically (sans rechargement)

### `pages/Notifications.tsx` ✅

Centre de notifications (`/notifications`, protégé). Chargement depuis `GET /api/notifications` (marque tout lu automatiquement). Affiche : avatar acteur (ou icône par type), message, temps relatif, lien "Voir →" vers le post si applicable. Les notifs non lues ont un fond légèrement bleu.

**Types de notifications déclenchées :**
- `subscribe` — quelqu'un s'abonne à votre profil
- `like` — quelqu'un like un de vos posts
- `comment` — quelqu'un commente un de vos posts
- Pas de notification sur son propre contenu

### `pages/Subscriptions.tsx` ~~supprimée~~

Fusionnée dans `Views/Feed.tsx` — l'onglet "Abonnements" remplace cette page. Route `/subscriptions` et lien Navbar "Abonnements" supprimés.

### `pages/Subscribe.tsx` ✅

Page d'abonnement Stripe. Charge le créateur via `getCreatorById(creatorId)`.

- `handleConfirm()` → `createSubscriptionCheckout(creatorId, token)` → `window.location.href = url`
- Détecte `?payment=success` au montage → `subscriptionService.subscribe()` → écran succès
- Détecte `?payment=cancel` → message d'annulation inline
- Skeleton loading pendant le chargement du créateur

### `Views/CreatorProfile.tsx` ✅ (MVVM)

Profil complet d'un créateur. Bannière + avatar flottant, **onglets Posts / À propos** (+ **Mes abonnements** si `isOwnProfile`). Bouton abonnement (redirige vers `/login` si non connecté). Skeleton loading. Redirige vers `/creators` si l'id est inconnu.

- Onglet **Posts** : grille des publications (toutes visibles si `isOwnProfile`)
- Onglet **À propos** : bio + 3 stat-cards (abonnés, posts, prix/mois) + badge Premium
- Onglet **Mes abonnements** (own uniquement) : liste des créateurs suivis avec désabonnement

**Mode édition inline (own profile) :**
- Bouton "Modifier le profil" → active `isEditingProfile`
- Couverture : overlay avec bouton fichier (`POST /api/upload`) + champ URL de secours
- Avatar : clic → `<input type="file">` caché → `POST /api/upload` → URL stockée dans le formulaire (spinner pendant upload)
- Nom d'affichage, bio, prix abonnement : champs inline
- Sauvegarde : `PATCH /api/users/me` (bio/avatar) + `PATCH /api/creators/me` (displayName/coverImage/price)
- Boutons "Sauvegarder / Annuler" en haut à droite (désactivés pendant upload)

**ViewModel :** `ViewModels/useCreatorProfileViewModel.ts`

- Input : `creatorId: string` (depuis `useParams`)
- Retourne : `creator`, `posts`, `isSubscribed`, `isCheckingSubscription`, `isLoading`, `error`, `isOwnProfile`
- Retourne également : `isEditingProfile`, `isSavingProfile`, `profileForm`, `profileError`, `subscriptions`, `isUploadingAvatar`, `isUploadingCover`
- Handlers : `handleEditProfile`, `handleCancelEditProfile`, `handleSaveProfile`, `handleProfileChange`, `handleAvatarFileChange`, `handleCoverFileChange`, `handleUnsubscribeFromCreator`, `handleSubscribe`, `handleLike`, `isPostLiked`
- `isCheckingSubscription` : `true` pendant la vérification API → bouton désactivé, évite le flash "S'abonner"
- `handleSubscribe` → redirige vers `/login` si pas de token, met à jour `subscriberCount` optimistically
- `subscriptions` chargés depuis `GET /api/subscriptions` uniquement si `isOwnProfile`
- `likedPostIds` chargés depuis `GET /api/posts/liked` au montage — persistent au rechargement

### `Views/Feed.tsx` ✅ (MVVM)

Fil de tous les posts avec le créateur associé. Skeleton loading. **Infinite scroll** (Intersection Observer, batches de 9). **Onglets filtre** "Nouveautés" / "Abonnements" style X.com. Bannière d'erreur si le backend est hors ligne.

**Onglet Nouveautés** : tous les posts triés par `createdAt` DESC.
**Onglet Abonnements** : posts filtrés sur les créateurs suivis (IDs via `getUserSubscriptions`).

**ViewModel :** `ViewModels/useFeedViewModel.ts`

- Retourne : `visiblePosts`, `getCreator(creatorId)`, `handleLike`, `isPostLiked`, `isCreatorSubscribed(creatorId)`, `isLoading`, `isFetchingMore`, `hasMore`, `loadMore`, `error`, `filter`, `setFilter`
- `filter: 'nouveautes' | 'abonnements'` — `setFilter` reset le `displayedCount` à 9
- `subscribedCreatorIds: Set<string>` chargés depuis `GET /api/subscriptions` — `isCreatorSubscribed(id)` retourne `true/false`
- `likedPostIds` chargés depuis `GET /api/posts/liked` au montage — persistent au rechargement
- Revert optimistic si l'appel like échoue (res.ok check)
- Sentinel `<div ref={sentinelRef}>` + `IntersectionObserver` dans `Feed.tsx` déclenchent `loadMore()`
- `PostCard` reçoit `isSubscribed={isCreatorSubscribed(post.creatorId)}` — détermine si le post est flouté et la destination du clic

### `Views/UserProfile.tsx` ✅ (MVVM)

Accessible via `/profile` et `/profile/edit`. `/profile` redirige **systématiquement** vers `/creators/:id` (tous les utilisateurs sont créateurs). `/profile/edit` affiche le formulaire d'édition : username, bio, avatar + section "Profil créateur" (displayName, coverImage, prix abonnement) + liste des abonnements avec désabonnement.

**ViewModel :** `ViewModels/useUserProfileViewModel.ts`

- `handleSave` appelle `PATCH /api/users/me` — lit `body.message` pour afficher l'erreur API exacte
- Si créateur : `PATCH /api/users/me` synce aussi avatar/bio sur le profil créateur (via back)
- `handleSaveCreator` appelle `PATCH /api/creators/me` — displayName, coverImage, subscriptionPrice
- `subscriptions: Creator[]` — chargés depuis `GET /api/subscriptions` au montage
- `handleUnsubscribe(creatorId)` — appelle `DELETE /api/subscriptions/:creatorId` et retire de la liste

### `Views/UserPublicProfile.tsx` ✅ (MVVM)

Profil public d'un utilisateur (`/users/:id`). Si l'utilisateur est créateur → `<Navigate to="/creators/:creatorId" replace />` (tous les utilisateurs sont créateurs, donc redirect systématique). Sinon : avatar (fallback `ui-avatars.com`), username, bio.

- **Own profile** : bouton "Modifier le profil" (→ `/profile/edit`)
- **Autre profil** : lien "Découvrir les créateurs"

**ViewModel :** `ViewModels/useUserPublicProfileViewModel.ts` — retourne `{ publicUser, isLoading, isOwnProfile, isCreator }`.

### `Views/Shop.tsx` ✅ (MVVM)

Boutique de goodies (`/shop`). Chargement depuis `GET /api/goodies`. Filtre par créateur. Grille produits responsive. Panier latéral sticky (quantités, total, checkout Stripe). État `isLoading` avec skeleton.

**ViewModel :** `ViewModels/useShopViewModel.ts`

- Retourne : `goodies`, `filteredGoodies`, `creators`, `filter`, `addedId`, `isLoading`, `isCheckingOut`, `checkoutSuccess`, `checkoutError`
- Handlers : `handleFilter`, `handleAddToCart`, `handleCheckout`
- `handleAddToCart` → flash "Ajouté !" 1.5s via `addedId`
- `handleCheckout` → `createOrderCheckout(items, token)` → `window.location.href = url`
- Détecte `?payment=success` au montage → `clearCart()` + écran succès
- Détecte `?payment=cancel` → message d'annulation
- Cards boutique : si `goodie.variants?.length > 0` → bouton "Choisir" (`<Link to="/shop/:id">`) au lieu de "Ajouter"
- Panier : `removeItem(item.cartKey)`, `updateQuantity(item.cartKey, qty)` — variante affichée en bleu sous le nom

### `pages/GoodieDetail.tsx` ✅

Page détail d'un article boutique (`/shop/:id`, publique). Fetch via `getGoodieById(id)` au montage. Affiche : image, nom, créateur (lien cliquable → `/creators/:id`), description, prix, bouton "Ajouter au panier" ou badge "Rupture de stock". Skeleton loading. Lien retour → `/shop`.

**Sélecteur de variante** (si `goodie.variants?.length > 0`) :
- Boutons pour chaque option — `border-blue-600` sur la sélection active
- Label auto-détecté : "Taille" (valeurs S/M/L/XL) ou "Coloris" (autres)
- Bouton "Ajouter" désactivé + message hint si variantes présentes mais aucune sélectionnée
- `cartKey = ${id}|${selectedVariant}` pour l'unicité panier

### `Views/Dashboard.tsx` ✅ (MVVM)

Espace créateur (`/dashboard`). Tous les utilisateurs sont créateurs — pas de garde "non-créateur". Sections :

1. **Stats** : posts, abonnés, prix abonnement, posts premium
2. **Mes posts** : liste avec image/titre/tags, boutons Éditer (→ `/dashboard/edit-post/:id`) + Supprimer (confirm)
3. **Ma boutique** : liste des goodies du créateur + formulaire inline create/edit/delete

**ViewModel :** `ViewModels/useDashboardViewModel.ts`

- Charge `getMyPosts()` + `getCreatorById()` en parallèle au montage
- Charge `getGoodies(creatorId)` pour la section boutique
- Retourne posts + creator + goodies + états loading/error
- Handlers goodies : `handleNewGoodie`, `handleEditGoodie`, `handleCancelGoodie`, `handleSaveGoodie`, `handleDeleteGoodie`, `handleGoodieFormChange`
- `newGoodieOpen: boolean` — flag dédié pour l'ouverture du formulaire "nouveau goodie"
- **Upload image goodie** : `handleGoodieImageFile(file)` → `POST /api/upload` → `goodieForm.image = url`. `isUploadingGoodieImage` désactive le bouton "Créer" pendant l'upload. Champ URL de secours toujours présent.
- **Variantes** : `goodieForm.variants: string` — saisie libre virgule-séparée ("S, M, L, XL, XXL"). Parsée en `string[]` au save, `undefined` si vide.

### `pages/Messages.tsx` ✅

Liste des conversations privées (`/messages`, protégé). Charge depuis `GET /api/messages/conversations`. Affiche : avatar, username, dernier message (texte ou `📎 fichier`), date. Skeleton loading. Clic → `/messages/:userId`.

### `Views/Chat.tsx` ✅ (MVVM)

Fenêtre de conversation (`/messages/:userId`, protégé).

- **Texte** : textarea + `Entrée` pour envoyer → socket `send_message`
- **Fichiers** : bouton 📎 → `<input type="file">` → `webrtcService.initiateFileTransfer()` — transfert P2P direct, barre de progression
- **Appel vidéo** : bouton 📹 → `POST /api/video/room` → `VideoCallModal` + socket `call_request` au destinataire
- **Appel entrant** : bannière fixe en bas avec "Accepter" / "Refuser" (événement socket `incoming_call`)
- Auto-scroll vers le dernier message via `ref` + `scrollIntoView`
- Messages reçus via socket `new_message` + `message_sent` — dédoublonnage par `id`

**ViewModel :** `ViewModels/useChatViewModel.ts`

- Retourne : `messages`, `isLoading`, `text`, `setText`, `sendText`, `sendFile`, `fileProgress`, `videoRoomUrl`, `incomingCall`, `callError`, `startVideoCall`, `closeVideoCall`, `acceptIncomingCall`, `rejectIncomingCall`, `bottomRef`, `currentUserId`

### `pages/Messages.tsx` utilise `useConversationsViewModel`

**ViewModel :** `ViewModels/useConversationsViewModel.ts` — charge `GET /api/messages/conversations`, retourne `{ conversations, isLoading, error }`.

### `Views/NewPost.tsx` ✅ (MVVM)

Création (`/dashboard/new-post`) et édition (`/dashboard/edit-post/:id`) d'un post. Champs : titre, description, image (bouton fichier → `POST /api/upload` + champ URL de secours), tags (virgule-séparés), isLocked, prix. Bouton submit désactivé pendant l'upload.

**ViewModel :** `ViewModels/useNewPostViewModel.ts`

- Mode édition : charge le post existant au montage (`GET /api/posts/:id`) et pré-remplit le formulaire
- `handleImageFileChange(file)` → `uploadFile()` → `form.image = url`
- `isUploadingImage` : désactive le submit pendant l'upload
- Sauvegarde : `POST /api/posts` (création) ou `PATCH /api/posts/:id` (édition) → redirect `/dashboard`

---

## Backend NestJS

### Structure

```
OnlyVentilateurBack/src/
├── main.ts                 # Bootstrap — bodyParser: false + json/urlencoded 10mb, prefix /api, CORS, ValidationPipe
├── app.module.ts           # ConfigModule + TypeORM + ThrottlerModule (30 req/min) + tous les modules
├── auth/                   # POST /api/login + /api/signup + JWT strategy
├── users/                  # GET/PATCH /api/users/me (+ unicité username + sync creator avatar/bio)
├── creators/               # GET /api/creators, /api/creators/:id, /api/creators/me (GET+PATCH), POST /api/creators
├── posts/                  # CRUD complet + liked + like toggle + commentaires
├── notifications/          # GET /api/notifications + unread-count
├── subscriptions/          # GET/POST/DELETE /api/subscriptions (+ blocage auto-abonnement)
├── goodies/                # GET/POST/PATCH/DELETE /api/goodies (CRUD + ownership check)
├── orders/                 # GET/POST /api/orders (JWT protégé)
├── upload/                 # POST /api/upload (multer, images uniquement, 5 MB max)
├── messages/               # chat texte (socket.io) + signaling WebRTC + historique
├── video/                  # POST /api/video/room (Daily.co room creation)
└── seed/                   # OnModuleInit — créateurs + posts + goodies + Users liés
```

### Endpoints Creators

| Méthode | Route                  | Auth | Description                                       |
| ------- | ---------------------- | ---- | ------------------------------------------------- |
| GET     | `/api/creators`        | —    | Liste tous les créateurs                          |
| GET     | `/api/creators/me`     | JWT  | Profil créateur de l'utilisateur connecté         |
| PATCH   | `/api/creators/me`     | JWT  | Modifier displayName, coverImage, subscriptionPrice |
| GET     | `/api/creators/:id`    | —    | Un créateur par ID (avec posts, subscriberCount, postCount) |

> ⚠️ La route `/me` doit être déclarée **avant** `/:id` dans le controller pour éviter la collision.
> ℹ️ Le `POST /api/creators` (devenir créateur) est supprimé — la création est automatique à l'inscription.

### Endpoints Posts

| Méthode | Route                    | Auth | Description                                       |
| ------- | ------------------------ | ---- | ------------------------------------------------- |
| GET     | `/api/posts`             | —    | Tous les posts (optionnel `?creatorId=`)          |
| GET     | `/api/posts/mine`        | JWT  | Posts du créateur connecté                        |
| GET     | `/api/posts/liked`       | JWT  | IDs des posts likés par l'utilisateur             |
| GET     | `/api/posts/:id`         | JWT opt. | Un post par ID — `403` si `isLocked` et non abonné (ni créateur) |
| POST    | `/api/posts`             | JWT  | Créer un post (ownership via creatorId du User)   |
| PATCH   | `/api/posts/:id`         | JWT  | Modifier un post (ownership check)                |
| DELETE  | `/api/posts/:id`         | JWT  | Supprimer un post (ownership check)               |
| POST    | `/api/posts/:id/like`    | JWT  | Toggle like → `{ likes, isLiked }`                |
| GET     | `/api/posts/:id/comments` | —   | Commentaires d'un post (DESC createdAt)            |
| POST    | `/api/posts/:id/comments` | JWT | Créer un commentaire `{ content: string }`         |

> ⚠️ Les routes `/mine` et `/liked` doivent être déclarées **avant** `/:id` dans le controller.
>
> **Protection contenu premium :** `GET /api/posts/:id` utilise `OptionalJwtAuthGuard` (`auth/optional-jwt-auth.guard.ts`). Si le post est verrouillé, `postsService.findOne()` vérifie : 1) si l'utilisateur est le créateur du post (`usersRepo` — `creatorId` match) → accès autorisé, 2) sinon vérifie un abonnement actif (`subscriptionRepo`) → `403 ForbiddenException` si absent.

### Entités TypeORM

| Entité       | Fichier                             | Relations                                              |
| ------------ | ----------------------------------- | ------------------------------------------------------ |
| User         | `users/user.entity.ts`              | OneToMany Subscription                                 |
| Creator      | `creators/creator.entity.ts`        | OneToMany Post, OneToMany Subscription                 |
| Post         | `posts/post.entity.ts`              | ManyToOne Creator                                      |
| PostLike     | `posts/post-like.entity.ts`         | `userId` + `postId` — `@Unique(['userId', 'postId'])` |
| Comment      | `posts/comment.entity.ts`           | ManyToOne Post (cascade delete), `userId`, `username`, `avatar`, `content` |
| Notification | `notifications/notification.entity.ts` | `userId`, `type`, `message`, `isRead`, `postId?`, `actorAvatar?` |
| Subscription | `subscriptions/subscription.entity.ts` | ManyToOne User, ManyToOne Creator — Unique(user, creator) |
| Goodie       | `goodies/goodie.entity.ts`          | ManyToOne Creator (eager) — `variants: string[] \| null` (JSON) |
| Order        | `orders/order.entity.ts`            | `items: OrderLineItem[]` (JSON), `userId`, `total`     |
| Message      | `messages/message.entity.ts`        | ManyToOne User×2 (sender, receiver) — `content`, `type` ('text'|'file'), `fileName?` |

> ⚠️ Toutes les entités doivent être listées dans `entities: [...]` du `TypeOrmModule.forRootAsync` dans `app.module.ts` pour que `synchronize: true` crée les tables.

### Endpoints Notifications

| Méthode | Route                              | Auth | Description                                        |
| ------- | ---------------------------------- | ---- | -------------------------------------------------- |
| GET     | `/api/notifications/unread-count`  | JWT  | `{ count: number }` — pour le badge Navbar         |
| GET     | `/api/notifications`               | JWT  | Toutes les notifs + marque tout lu automatiquement |

> ⚠️ `/unread-count` doit être déclaré **avant** le catch-all dans le controller.

Déclencheurs (côté service) :
- `subscriptions.service.ts` → `subscribe()` → notif type `subscribe`
- `posts.service.ts` → `toggleLike()` (nouveau like) → notif type `like`
- `posts.service.ts` → `addComment()` → notif type `comment`
- Guard : pas de notif si `actor.id === owner.id`

### Endpoints Goodies

| Méthode | Route                | Auth | Description                                      |
| ------- | -------------------- | ---- | ------------------------------------------------ |
| GET     | `/api/goodies`       | —    | Tous les goodies (optionnel `?creatorId=`)       |
| GET     | `/api/goodies/:id`   | —    | Un goodie par ID                                 |
| POST    | `/api/goodies`       | JWT  | Créer un goodie (créateur uniquement)            |
| PATCH   | `/api/goodies/:id`   | JWT  | Modifier un goodie (ownership check)             |
| DELETE  | `/api/goodies/:id`   | JWT  | Supprimer un goodie (ownership check)            |

### Endpoints Orders

| Méthode | Route          | Auth | Description                          |
| ------- | -------------- | ---- | ------------------------------------ |
| POST    | `/api/orders`  | JWT  | Créer une commande                   |
| GET     | `/api/orders`  | JWT  | Commandes de l'utilisateur connecté  |

### Endpoints Stripe Checkout

| Méthode | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/checkout/subscription` | JWT | Crée une session Stripe pour abonnement créateur → `{ url }` |
| POST | `/api/checkout/order` | JWT | Crée une session Stripe pour commande goodies → `{ url }` |

**Module** : `src/stripe/` — `StripeService` + `StripeController` + `StripeModule`.

- `createSubscriptionSession` : récupère le Creator via `CreatorsService.findOne()`, crée une Checkout Session `mode: 'payment'` avec le prix de l'abonnement.
- `createOrderSession` : crée une Checkout Session avec les line items du panier. `shipping_address_collection: { allowed_countries: ['FR', 'BE', 'CH', 'LU'] }` — adresse de livraison collectée nativement par Stripe.
- Success URL : `/subscribe/:id?payment=success` (abonnements) ou `/shop?payment=success` (commandes)
- Cancel URL : `/subscribe/:id?payment=cancel` ou `/shop?payment=cancel`
- Secret : `STRIPE_SECRET_KEY=sk_test_...` dans `.env` backend

### Endpoints Messages

| Méthode | Route                              | Auth | Description                                        |
| ------- | ---------------------------------- | ---- | -------------------------------------------------- |
| GET     | `/api/messages/conversations`      | JWT  | Liste des conversations (dernier message par user) |
| GET     | `/api/messages/:userId`            | JWT  | Historique de la conversation avec un utilisateur  |

**WebSocket** `/chat` (socket.io, JWT via `auth.token`) :

| Événement émis          | Payload                              | Description                        |
| ----------------------- | ------------------------------------ | ---------------------------------- |
| `send_message`          | `{ receiverId, content, type?, fileName? }` | Envoie un message texte     |
| `webrtc_offer/answer/ice_candidate` | `{ targetUserId, data }`  | Signaling WebRTC                   |
| `call_request`          | `{ targetUserId, roomUrl }`          | Notifie un appel Daily.co entrant  |
| `call_accepted/rejected`| `{ targetUserId }`                   | Réponse à l'appel                  |

| Événement reçu   | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `new_message`    | Message reçu d'un autre utilisateur                     |
| `message_sent`   | Confirmation de l'envoi (retour au sender)              |
| `incoming_call`  | `{ fromUserId, roomUrl }` — appel vidéo entrant         |

### Endpoint Vidéo

| Méthode | Route             | Auth | Description                                     |
| ------- | ----------------- | ---- | ----------------------------------------------- |
| POST    | `/api/video/room` | JWT  | Crée une room Daily.co (expire après 1h) → `{ url }` |

Nécessite `DAILY_API_KEY` dans `.env` backend.

### Endpoint Upload

| Méthode | Route          | Auth | Description                                          |
| ------- | -------------- | ---- | ---------------------------------------------------- |
| POST    | `/api/upload`  | JWT  | Upload image → `{ url: "/uploads/uuid.ext" }` (5 MB max) |

Les fichiers sont servis statiquement via `/uploads` (`useStaticAssets`). Proxy Vite `/uploads → http://localhost:3000`.

### Seed

`seed/seed.service.ts` implémente `OnModuleInit` — vérifie si la BDD est vide et insère :
- 5 créateurs (TurboFan2000, SilentBreeze, MegaSouffle, BreezyGirl, CycloneMaster)
- 25 posts (5 par créateur, mix public/premium)
- 10+ goodies répartis sur les 5 créateurs
- 5 comptes User liés (`username@onlyventilateur.fr` / `password123`)

Le seed est ignoré si des créateurs existent déjà.

---

## Sécurité

| Point              | Implémentation                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| JWT                | Stocké en sessionStorage (persist F5, effacé à fermeture navigateur) — expiry `7d`                      |
| Mots de passe      | Hashés avec bcrypt (rounds: 10) — politique : 8+ chars, 1 majuscule, 1 chiffre (`@Matches`)             |
| Secrets            | JWT_SECRET, DB_PASSWORD, STRIPE_KEY → `.env` backend — `.gitignore` présent sur les deux projets        |
| Routes sensibles   | `ProtectedRoute` frontend + `JwtAuthGuard` NestJS                                                       |
| Inputs             | `ValidationPipe` NestJS (whitelist: true) + `@MaxLength` / `@MinLength` sur tous les DTOs               |
| CORS               | Backend autorise uniquement `FRONTEND_URL` (`.env`)                                                     |
| Rate limiting      | Global : 30 req/60s — Login : 5 req/60s (`@Throttle` sur `POST /login`)                                 |
| Upload fichiers    | MIME `image/*` + whitelist extensions `.jpg .jpeg .png .gif .webp` + limite 5 Mo                        |
| Commentaires       | `CreateCommentDto` : `@MinLength(1) @MaxLength(1000)` — plus de body non validé                         |
| Contenu premium    | Posts verrouillés : `image` **et** `description` masqués si non abonné et non propriétaire              |
| Traçabilité (P)    | `Logger` NestJS dans `AuthService` — connexion réussie, échec mdp, email inconnu, inscription              |

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

### Phase 5 — Ressembler à OnlyFans ✅

- [x] Redirect vers `/login` si clic "S'abonner" sans être connecté
- [x] Onglets Posts / À propos sur la page créateur (bio + stats card)
- [x] Recherche/filtre de créateurs sur `/creators`
- [x] Feed paginé (9 posts/page) + bannière d'erreur réseau
- [x] Page détail d'un post `/posts/:id` + fil d'ariane
- [x] Page abonnements actifs `/subscriptions`
- [x] Navbar : lien "Abonnements" + "Fil" visibles quand connecté uniquement
- [x] Carte créateur entièrement cliquable (Link wrapper) — même logique pour PostCard (navigate)
- [x] Likes persistés en BDD — entité `PostLike` + `@Unique(['userId', 'postId'])` (1 like/user)
- [x] Toggle like — revert optimistic si le backend échoue
- [x] `GET /api/posts/:id` + `POST /api/posts/:id/like` au backend
- [x] `GET /api/posts/liked` — IDs likés persistés au rechargement (Feed, CreatorProfile, PostDetail)
- [x] `subscriberCount` mis à jour optimistically + persisté au rechargement (`findOne` avec `loadRelationCountAndMap`)
- [x] Bouton abonnement : bleu "S'abonner" / rouge "Se désabonner" + `isCheckingSubscription` (pas de flash)
- [x] `/profile` affiche les abonnements réels avec bouton "Se désabonner"
- [x] Login/Signup redirigent vers `/feed` (au lieu de `/`)
- [x] Page 404 (`pages/NotFound.tsx`) + route catch-all `path="*"`
- [x] `PostLike` ajouté dans `entities` de `app.module.ts` (fix table non créée)
- [x] Body parser NestJS : limite 10 mb (fix 413 sur upload avatar base64)
- [x] Unicité username à la mise à jour profil — `ConflictException` backend + message affiché frontend

### Phase 6 — Espace créateur

- [x] Mode créateur : page "Devenir créateur" (`/become-creator`) + `POST /api/creators` — formulaire displayName, bio, prix abonnement
- [x] Dashboard créateur (`/dashboard`) : stats (posts, abonnés, prix abonnement, posts premium), liste des posts avec édition/suppression
- [x] Création de post (`/dashboard/new-post`) : titre, description, image (URL + aperçu), tags, isLocked, prix unitaire
- [x] Édition de post (`/dashboard/edit-post/:id`) — même formulaire `NewPost.tsx` en mode édition
- [x] Suppression de post depuis le dashboard (avec confirmation `confirm()`)
- [x] **Boutique goodies** (`/shop`) + `CartContext` : 8 goodies mockés, filtre par créateur, panier latéral sticky avec gestion des quantités, checkout simulé
- [x] `CartContext` global (add, remove, updateQuantity, clearCart, totalItems, totalPrice) branché dans `App.tsx`
- [x] Navbar : liens Boutique, Dashboard (toujours visible), badge panier avec compteur
- [x] `User.creatorId` — toujours défini, tout utilisateur inscrit est automatiquement un créateur
- [x] Nouveaux endpoints NestJS implémentés : `GET/PATCH /api/creators/me`, `GET /api/posts/mine`, `POST /api/posts`, `PATCH /api/posts/:id`, `DELETE /api/posts/:id`
- [x] Profil utilisateur = profil créateur unifié : avatar + bio syncés automatiquement, `coverImage` + `displayName` éditables depuis `/profile`
- [x] Sécurité API : fix JWT fallback secret, `Object.assign()` → assignation explicite, DTOs validés (class-validator), rate limiting `@nestjs/throttler` (30 req/min), `synchronize` conditionnel prod
- [x] Auto-abonnement bloqué : `POST /api/subscriptions` vérifie `user.creatorId !== dto.creatorId` (backend) + bouton "Gérer mon espace" sur sa propre page créateur (frontend)
- [x] **Page créateur = page profil** : `/profile` redirige systématiquement vers `/creators/:id` — tous les users sont créateurs à l'inscription (auto-création à `POST /api/signup`)
- [x] **Édition inline sur la page créateur** : avatar (upload fichier), couverture (URL + preview), nom d'affichage, bio, prix — tout éditable directement depuis sa propre page créateur
- [x] **Onglet "Mes abonnements"** sur la page créateur (own) : liste des créateurs suivis + désabonnement
- [x] Boutons own page : "Modifier le profil" (inline edit) + "Gérer mon espace →" (→ `/dashboard`)
- [x] Posts propres toujours visibles sans abonnement (`isSubscribed || isOwnProfile`)

### Phase 7 — Finalisation ✅

- [x] **Upload fichiers (multer)** : `POST /api/upload` → `{ url }` + `useStaticAssets('/uploads')` — images stockées sur disque, proxy Vite `/uploads`, `services/uploadService.ts`, file picker dans NewPost + CreatorProfile. DTOs : `@IsUrl()` remplacé par `@IsString()` sur les champs image.
- [x] **Home dynamique** : `pages/Home.tsx` utilise `getCreators()` — aucune donnée hardcodée.
- [x] **Page profil public utilisateur** (`/users/:id`) : si le user est créateur → redirect `/creators/:id`. Sinon : avatar, username, bio. Own profile : boutons "Modifier le profil" + "Devenir créateur". `services/usersService.ts` + `ViewModels/useUserPublicProfileViewModel.ts` + `Views/UserPublicProfile.tsx`. Endpoint `GET /api/users/:id` public (masque password/email).
- [x] **Boutique backend** : entité `Goodie` (id, name, description, price, image, inStock, creatorId, creator eager) + entité `Order` (items JSON, userId, total). CRUD complet : `GET/POST/PATCH/DELETE /api/goodies`, `GET/POST /api/orders`. Ownership check via `UsersService.findById()`.
- [x] **Dashboard boutique** : section "Ma boutique" dans `/dashboard` — liste des goodies + formulaire inline create/edit/delete. `useDashboardViewModel` étendu avec goodies CRUD.
- [x] **Shop branché API** : `mockGoodies.ts` remplacé par `GET /api/goodies` dans `useShopViewModel`. État `isLoading` + skeleton. `goodieToCartItem()` helper dans `goodiesService.ts`.
- [x] **Seed + vrais comptes** : pour chaque créateur seedé, un compte User est créé (`username@onlyventilateur.fr` / `password123`). Goodies seedés (10+ articles répartis sur 5 créateurs).

### Phase 8 — Bonus cours

- [x] **Paiement Stripe Checkout** — abonnements (`POST /api/checkout/subscription`) + goodies (`POST /api/checkout/order`) — redirect Stripe, retour `?payment=success`, `shipping_address_collection` (FR/BE/CH/LU)
- [x] **Variantes goodies** — champ `variants: string[] | null` (JSON) sur l'entité Goodie — sélecteur taille/couleur sur `/shop/:id` — bouton "Choisir" dans la grille boutique si variantes présentes — champ Dashboard (virgule-séparé) — `cartKey` unique par id+variante dans CartContext
- [x] **Chat privé + vidéo** — socket.io (texte temps réel), WebRTC DataChannel (fichiers P2P, aucun stockage serveur), Daily.co embed (appel vidéo) — `DAILY_API_KEY` dans `.env`

### Phase 9 — Audit sécurité ✅

- [x] **`.gitignore` backend créé** — `.env`, `node_modules`, `dist`, `uploads/` exclus du dépôt git
- [x] **Rate limiting login** — `@Throttle({ default: { ttl: 60000, limit: 5 } })` sur `POST /login` (anti brute-force)
- [x] **`CreateCommentDto`** — `@IsString() @MinLength(1) @MaxLength(1000)` — remplace le body non typé `{ content: string }`
- [x] **Upload renforcé** — whitelist d'extensions (`.jpg .jpeg .png .gif .webp`) en plus du check MIME (MIME peut être forgé par le client)
- [x] **Politique mot de passe** — `SignupDto` : `@MinLength(8) @Matches(uppercase + digit)` + `@MaxLength` sur tous les champs email/username/password
- [x] **Contenu premium** — `description` (et pas seulement `image`) masquée pour les non-abonnés dans `PostsService.findAll()`
- [x] **Traçabilité (DICP - P)** — `Logger` NestJS dans `AuthService` : connexion réussie (`[LOGIN]`), échec mot de passe, email inconnu, inscription (`[SIGNUP]`)

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
| Context API          | ✅ Fait | `context/AuthContext.tsx` + `context/CartContext.tsx`               |
| React Router         | ✅ Fait | 18 routes (7 publiques + 11 protégées via `ProtectedRoute`)         |
