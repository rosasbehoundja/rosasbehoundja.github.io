## rosas-behoundja.github.io

Les contenus bilingues sont organisés en bundles :

```text
contents/news/posts/2026-07-17-mentoring-noai/
├── index.fr.md
└── index.en.md
```

Les dossiers de billets et d'actualités suivent la convention `AAAA-MM-JJ-slug`. Les pages et thématiques sans date utilisent simplement leur slug (`contents/pages/home/`, par exemple), toujours avec un fichier par langue.

Pour ajouter un billet au blog, il suffit de créer son bundle dans `contents/blog/posts/`. La liste chronologique et la page `/pages/blog/articles/AAAA-MM-JJ-slug/` sont générées automatiquement au build. Les actualités placées dans `contents/news/posts/` reçoivent de la même manière leur propre page.

Le frontmatter de chaque version d'un billet doit contenir `title`, `date` et
`description`. La description alimente les métadonnées standard, Open Graph et
Twitter de la page d'article.

### Développement

```bash
npm install
npm run dev
```

Le site utilise Vite et TypeScript. `npm run build` génère toutes les pages depuis les Markdown, vérifie les types et produit le dossier `dist/` déployable.

### GitHub Pages

Le workflow `.github/workflows/deploy.yml` construit et publie automatiquement `dist/` à chaque push sur `main`. Dans les paramètres GitHub du dépôt, choisir **GitHub Actions** comme source de GitHub Pages.
