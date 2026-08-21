# HANNON — Sovereign Capital Advisory

Site Next.js (App Router) + TypeScript + Tailwind CSS, reproduisant le design fourni.

## Structure

```
app/
  layout.tsx        # Layout racine (polices Cormorant Garamond + Jost)
  page.tsx           # Page d'accueil (assemble tous les composants)
  globals.css         # Styles globaux + classes utilitaires (.btn, .eyebrow...)
components/
  Navbar.tsx          # En-tête / navigation (sticky, menu mobile)
  Hero.tsx            # Section hero avec skyline SVG
  TrustBar.tsx        # Bandeau de confiance institutionnelle
  Services.tsx        # Grille des 6 services
  GlobalReach.tsx      # Portée mondiale + Leadership (2 colonnes)
  Footer.tsx           # Pied de page
```

## Démarrage

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Palette

| Nom       | Hex       |
|-----------|-----------|
| navy-900  | #060f1e   |
| navy-800  | #0a1a30   |
| navy-700  | #0f2440   |
| gold-500  | #c9a35c   |
| gold-400  | #dcb977   |
| ivory     | #f6f4ef   |

## Typographie

- Titres : **Cormorant Garamond** (serif, élégant)
- Corps : **Jost** (sans-serif, léger)

Les deux polices sont chargées via `next/font/google` dans `app/layout.tsx`.
