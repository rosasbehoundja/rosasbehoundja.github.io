### rosas-behoundja.github.io

Les contenus bilingues sont organisés en bundles :

```text
content/news/posts/2026-07-17-mentoring-noai/
├── index.fr.md
└── index.en.md
```

Les dossiers de billets et d'actualités suivent la convention `AAAA-MM-JJ-slug`. Les pages et thématiques sans date utilisent simplement leur slug (`content/pages/home/`, par exemple), toujours avec un fichier par langue.

Pour ajouter un billet au blog, créer son bundle dans `content/blog/posts/`, puis ajouter son slug daté à `POST_SLUGS` dans `assets/js/blog-loader.js` afin qu'il apparaisse dans la liste chronologique.

Le frontmatter de chaque version d'un billet doit contenir `title`, `date` et
`description`. La description alimente les métadonnées standard, Open Graph et
Twitter de la page d'article.
