# HANNON — Sovereign Capital Advisory

Site Next.js déployé entièrement sur **Vercel** : pages publiques, administration et API `/api`. Les données restent dans **PostgreSQL** (Neon). Les photos passent par **Cloudinary**, en mémoire, sans écriture sur le disque de Vercel.

## Stack

- **Application** : Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts
- **API** : routes Next.js `/api` (Node.js), JWT, `pg`
- **Base** : PostgreSQL (Neon)
- **Médias** : Cloudinary (`hannon/projects`, `hannon/services`)

## Fonctionnalités

- **Services** enregistrés dans PostgreSQL : création, modification, photo, publication, ordre, page `/services/[slug]`
- Plateformes d’un service (nom, description, lien facultatif, deux images maximum, brouillon ou publié)
- Formulaire public **Envoyez votre proposition ou votre question** (sans compte)
- Compte **admin** : projets, services, propositions et questions, historique des investisseurs
- L’inscription et la connexion investisseurs sont désactivées. La connexion administrateur reste active
- Photos de projets et de services envoyées vers **Cloudinary**

## Compte administrateur

| Rôle | Email | Mot de passe |
|------|--------|----------------|
| Admin | `admin@hannoninterinvest.com` | valeur de `ADMIN_PASSWORD` |

Le mot de passe par défaut, seulement si aucun compte avec `ADMIN_EMAIL` n’existe encore, est `HannonAdmin2026!`. Un administrateur déjà présent n’est pas réécrit.

Les comptes investisseurs déjà présents sont conservés, sans droits administrateur. Ils ne peuvent plus se connecter ni être recréés via `/api/auth/register`.

## Démarrage local

PostgreSQL local :

```bash
docker compose up -d
```

URL : `postgresql://hannon:hannon@localhost:5432/hannon`

```bash
cp .env.example .env.local
# renseigner DATABASE_URL, JWT_SECRET et, pour les photos, CLOUDINARY_*
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000). Le navigateur appelle `/api` sur le même serveur. Aucune API séparée n’est nécessaire.

Au premier appel, l’application crée les tables manquantes et prépare les services HANNON absents. Elle ne supprime pas les données existantes.

## Variables Vercel

Dans **Vercel → Settings → Environment Variables**, pour Production et Preview, puis **Redeploy**.

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST-pooler.region.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=une-longue-chaine-aleatoire
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_EMAIL=admin@hannoninterinvest.com
ADMIN_PASSWORD=change-me
```

`DATABASE_URL` est lu **au moment des requêtes**, pas pendant le build. Utilisez l’hôte Neon qui contient `-pooler`.

Ne définissez pas `NEXT_PUBLIC_API_URL`. Si cette variable est encore présente, supprimez-la : le site ignore l’ancienne adresse Render et appelle `/api`.

`ADMIN_PASSWORD` ne sert que pour créer le premier administrateur. `CLOUDINARY_*` est obligatoire pour envoyer des photos. Sans ces trois variables, l’enregistrement d’une image échoue avec un message explicite ; le reste du site continue de fonctionner.

Aucun e-mail n’est envoyé.

## Services et demandes

Les pages publiques `/services` et `/services/[slug]` lisent uniquement les services **publiés**. Les quatorze activités HANNON manquantes sont préparées en **brouillon**, sans doublon. HANNON Finance reçoit trois plateformes vides, à renseigner dans l’administration. Si l’administrateur les supprime, elles ne sont pas recréées.

Le formulaire public est sur `/contact` (l’ancienne adresse `/register` y redirige). Chaque envoi est stocké dans `investor_inquiries` (`nouveau` ou `traité`). La consultation se fait dans **Propositions et questions**.

La protection anti-spam (champ invisible, délai minimum, dédoublonnage, quotas par adresse et par IP) est enregistrée dans PostgreSQL.

Les photos sont limitées à 4 Mo, taille acceptée par Vercel. Elles sont envoyées depuis la mémoire vers Cloudinary.

## Schéma

Le schéma est appliqué au premier appel API : tables créées seulement si elles manquent, sans `DROP` ni `DELETE`.

## Déploiement Vercel

- Framework : Next.js
- Build : `next build` (déjà indiqué dans `vercel.json`)
- Node.js : 24.x (`engines` dans `package.json`)
- Ne pas définir d’Output Directory vers `public/`

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
