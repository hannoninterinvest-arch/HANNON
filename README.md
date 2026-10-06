# HANNON — Sovereign Capital Advisory

Plateforme Next.js (front) + NestJS (API), avec TypeORM sur **Neon**, photos projets sur **Cloudinary**, comptes investisseurs et console administrateur.

## Stack

- **Front** : Next.js 14, TypeScript, Tailwind CSS, Recharts
- **Back** : NestJS, TypeORM, JWT, Multer
- **Base** : Neon (PostgreSQL)
- **Médias** : Cloudinary (`hannon/projects`)

## Fonctionnalités

- **Services** enregistrés dans PostgreSQL : création, modification, photo, publication, ordre, page `/services/[slug]`
- Plateformes d’un service (nom, description, lien facultatif, deux images maximum, brouillon ou publié)
- Formulaire public **Envoyez votre proposition ou votre question** (sans compte)
- Compte **admin** : projets, services, propositions et questions, historique des investisseurs
- L’inscription et la connexion investisseurs sont désactivées. La connexion administrateur reste active
- Photos de projets et de services uploadées vers **Cloudinary** (jamais sur le disque temporaire)
- Cartes projets avec **ombres** or / navy et survol

## Comptes de démonstration (créés au premier démarrage de l’API)

| Rôle | Email | Mot de passe |
|------|--------|----------------|
| Admin | `admin@hannoninterinvest.com` | `HannonAdmin2026!` |

Les comptes investisseurs déjà présents (y compris les comptes de démonstration) sont conservés, sans droits administrateur. Ils ne peuvent plus se connecter ni être recréés via `/api/auth/register`.

Changez `ADMIN_EMAIL` / `ADMIN_PASSWORD` dans `backend/.env` avant le premier boot si besoin.

## Démarrage

### 1. Base Neon

Créez une base sur [Neon](https://neon.tech) et copiez l’URL `postgresql://...`.

Pour un développement local sans Neon :

```bash
docker compose up -d
```

URL locale : `postgresql://hannon:hannon@localhost:5432/hannon`

### 2. API NestJS

```bash
cp backend/.env.example backend/.env
# renseigner DATABASE_URL, JWT_SECRET, CLOUDINARY_*
cd backend
npm install
npm run start:dev
```

L’API écoute sur `http://localhost:4000/api`.

### 3. Front Next.js

```bash
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:4000/api
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Variables d’environnement

**Front (`.env.local`)**

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

**API (`backend/.env`)**

```
PORT=4000
CORS_ORIGIN=*
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
JWT_SECRET=...
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADMIN_EMAIL=admin@hannoninterinvest.com
ADMIN_PASSWORD=HannonAdmin2026!
```

## Services et demandes investisseurs

Les pages publiques `/services` et `/services/[slug]` lisent uniquement les services **publiés**. Les quatorze activités HANNON manquantes sont préparées en **brouillon** au démarrage de l’API, sans doublon. HANNON Finance reçoit trois plateformes vides, à renseigner dans l’administration.

Le formulaire public est sur `/contact` (l’ancienne adresse `/register` y redirige). Chaque envoi est stocké dans `investor_inquiries` (`nouveau` ou `traité`). Aucun e-mail n’est envoyé : l’API n’a pas de transport mail configuré. La consultation se fait dans **Propositions et questions**.

La protection anti-spam (honeypot, délai minimum, dédoublonnage et quotas par adresse et par IP) est enregistrée dans PostgreSQL, donc elle reste valable si l’API tourne en plusieurs instances.

### Migration

Avec la configuration actuelle, TypeORM `synchronize` crée les nouvelles tables au démarrage de l’API, sans supprimer les données existantes.

Une migration SQL additive est aussi fournie, à exécuter seulement si `synchronize` est désactivé :

```bash
psql "$DATABASE_URL" -f backend/migrations/001_services_and_inquiries.sql
```

Le script ne contient ni `DROP` ni `DELETE`. Il crée `services`, `service_platforms`, `investor_inquiries` et `inquiry_throttles` s’ils n’existent pas.

### Images

Les photos de services passent par le même Cloudinary que les projets, dans le dossier `hannon/services`. L’upload utilise la mémoire puis Cloudinary : rien n’est écrit sur le disque de Vercel ou de Render.

Variables déjà attendues par l’API (Render, ou l’hôte de l’API) :

```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Aucune nouvelle variable n’est nécessaire sur Vercel si `NEXT_PUBLIC_API_URL` pointe déjà vers l’API. Après déploiement de l’API, redéployer le front pour publier les pages `/services` et `/contact`.

## Déploiement (front Vercel + back Render)

Le site Next.js tourne sur **Vercel**, l’API NestJS sur **Render**. `CORS_ORIGIN=*` autorise le navigateur Vercel à appeler Render.

**Render → Environment**

```
CORS_ORIGIN=*
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_EMAIL=admin@hannoninterinvest.com
ADMIN_PASSWORD=HannonAdmin2026!
NPM_CONFIG_PRODUCTION=false
```

Ne pas définir `PORT` sur Render.

**Vercel → Environment Variables** (Production + Preview), puis Redeploy :

```
NEXT_PUBLIC_API_URL=https://YOUR-SERVICE.onrender.com/api
```

Si le site Vercel affiche `404 NOT_FOUND` :

1. Framework Preset = Next.js
2. Ne pas forcer un Output Directory vers `public/`
3. Redeploy without cache

## Palette

| Nom       | Hex       |
|-----------|-----------|
| navy-900  | #060f1e   |
| navy-800  | #0a1a30   |
| gold-500  | #c9a35c   |
| ivory     | #f6f4ef   |

## Typographie

- Titres : **Cormorant Garamond**
- Corps : **Jost**
