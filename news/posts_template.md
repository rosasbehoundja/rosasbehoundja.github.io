---
title_fr: Mon titre en français
title_en: My title in English
date: 2026-08-01
date_display_fr: Août 2026
date_display_en: August 2026
breadcrumb_fr: Nom court FR
breadcrumb_en: Short name EN
---

<!--lang:fr-->
Ton contenu en **Markdown** classique ici...

<!--lang:en-->
Your content in classic **Markdown** here...

Image simple (Markdown pur) :
```![Texte alternatif](../media/news/photo.jpg)```
Image avec légende (figure/figcaption, comme ton image World Backup Day) :

```html
<figure>
  <img src="../media/news/world-backup-day.jpeg" alt="World Backup Day">
  <figcaption>Molly Sanders, Pinterest</figcaption>
</figure>
```
Vidéo :
```html
<video controls>
  <source src="../media/news/video.mp4" type="video/mp4">
</video>
```
Audio (comme ton extrait d'interview) :
```html
<audio controls>
  <source src="../media/news/audios/interview.mp3" type="audio/mpeg">
</audio>
```
Galerie (grille d'images) :
```html
<div class="gallery">
  <img src="../media/news/1.jpg" alt="">
  <img src="../media/news/2.jpg" alt="">
</div>
```
Comme le contenu FR et EN sont dans deux conteneurs séparés, tu n'as pas besoin des spans fr-text/en-text à l'intérieur : place juste le bloc HTML avec la légende dans la bonne langue, à l'endroit du texte où tu le veux — comme un paragraphe normal.