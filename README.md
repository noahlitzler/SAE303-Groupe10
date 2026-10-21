- URL site WEB : https://sae303-clement-noah-10.netlify.app/
- URL Notebook Observable : https://observablehq.com/@mmi-montbeliard/sae-303-gr-10
- Nom : LITZLER
- Prénom : Noah
- Nom binome : BERTRAND
- Prénom binome : Clément

# Remarques :

**Derrière le prompt** répond au défi ADEME « L'impact environnemental de l'IA générative » (Open Data University). Public : des utilisateurs de l'IA sans ordre de grandeur en tête. Question : que se cache-t-il derrière une requête d'IA, de sa consommation à ses infrastructures ?

## Récit en 4 temps

| Temps | Où | Titre porteur | Visualisation |
|---|---|---|---|
| Contexte | introduction + face 01 | « Derrière le prompt » · « Un texte. Des machines. » | V4 — compteurs eau / CO₂e / électricité par modèle |
| Exploration | faces 02 et 03 | « Tous les modèles ne se valent pas » · « Changer d'échelle » | V1 — sphères EcoLogits · V3 — barres AI Energy Score |
| Révélation | face 04 | « Le numérique a une adresse » | V2 — cartes des datacenters vérifiés |
| Conclusion | dernière section | « L'invisible existe » | lien vers la page [Méthode](src/pages/methode.astro) |

## Éléments techniques

- **Navigation** : un cube 3D à quatre faces pivote au défilement ([DepthExperience.astro](src/components/DepthExperience.astro)) ; la navigation latérale amène sur chaque face ; seule la face active reçoit le focus (`inert` sur les autres).
- **Visualisations** : les quatre fonctions écrites dans le notebook (`dessinerConstellation`, `dessinerCarte`, `dessinerTaches`, `dessinerImpact`) sont recopiées dans [src/visualisations/visualisations.js](src/visualisations/visualisations.js). Elles reçoivent leurs données en paramètre ; [client.ts](src/visualisations/client.ts) les monte dans les faces et les ajuste à leur rectangle (largeur pleine, cartes qui prennent la hauteur libre, recadrage Leaflet).
- **Route d'export** : B (rendu chez le lecteur) pour les quatre, car toutes réagissent au lecteur (sélecteur de modèle, fiche au clic, bascule d'échelle, cartes). Justification détaillée sur la page Méthode.
- **Données** : quatre JSON préfiltrés dans [public/data](public/data) (16 Ko au total), exportés depuis les tables `donneesV1` à `donneesV4` du notebook : colonnes utiles, unité et dénominateur, 3 chiffres significatifs (les plus petites valeurs seraient nulles avec deux décimales). Ils sont téléchargeables depuis la page Méthode.
- **Accessibilité** : chaque graphique est un `<figure>` avec `<figcaption>` (source et date) et une alternative textuelle (`aria-label`) mise à jour à l'interaction ; utilisation au clavier ; `prefers-reduced-motion` respecté ; titre `h1` sur l'accueil.
- **Responsive** : les visualisations se réduisent uniformément sur petit écran ; les deux cartes s'empilent sous 760 px.
