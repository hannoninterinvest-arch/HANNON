# HANNON — Sovereign Capital Advisory

Plateforme Next.js (front) + NestJS (API), avec TypeORM sur **Neon**, photos projets sur **Cloudinary**, comptes investisseurs et console administrateur.

## Stack

- **Front** : Next.js 14, TypeScript, Tailwind CSS, Recharts
- **Back** : NestJS, TypeORM, JWT, Multer
- **Base** : Neon (PostgreSQL)
- **Médias** : Cloudinary (`hannon/projects`)

## Fonctionnalités

- Comptes **investisseurs** (inscription → validation admin)
- Compte **admin** : créer / supprimer des projets, approuver les investisseurs, accepter ou refuser les demandes d’investissement
- L’investisseur consulte chaque projet visible (informations + **courbes** de statistiques) et envoie une **demande d’investissement**
- Photos de projets uploadées vers **Cloudinary**
- Cartes projets avec **ombres** or / navy et survol

## Comptes de démonstration (créés au premier démarrage de l’API)

| Rôle | Email | Mot de passe |
|------|--------|----------------|
| Admin | `admin@hannoninterinvest.com` | `HannonAdmin2026!` |
| Investisseur (approuvé) | `investor@hannoninterinvest.com` | `Investor2026!` |
| Investisseur (en attente) | `pending@hannoninterinvest.com` | `Investor2026!` |

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
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=http://localhost:3000
```

## Déploiement

- **Front** : Vercel (`next build`). Définir `NEXT_PUBLIC_API_URL` vers l’API publique.
- **API** : Render, Railway ou équivalent Node. Définir les variables Neon + Cloudinary + `FRONTEND_URL` (domaine Vercel, CORS).

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
