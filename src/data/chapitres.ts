// Les quatre chapitres de l'expérience, partagés par le cube (DepthExperience) et les pages Explorer.
// question : la question à laquelle répond le chapitre ; suite : la phrase qui prépare le chapitre suivant.
export const chapitres = [
  {
    n: '01', temps: 'CONTEXTE', k: 'LA REQUÊTE', title: 'UN TEXTE.\nDES MACHINES.',
    question: 'Que déclenche une simple question ?',
    desc: 'Pour répondre, une IA calcule son texte morceau par morceau sur des serveurs. Ces calculs consomment de l’électricité et, indirectement, de l’eau ; ils émettent du CO₂e. Choisissez un modèle : voici les estimations EcoLogits pour une réponse de 150 tokens.',
    suite: 'Mais d’un modèle à l’autre, la dépense est-elle la même ?',
    note: 'ECOLOGITS / 150 TOKENS · MIX MONDIAL', viz: 'v4', kind: 'input',
    label: 'V4 — L’empreinte invisible d’une requête : compteurs interactifs d’électricité, d’eau et de CO₂e par modèle',
  },
  {
    n: '02', temps: 'EXPLORATION', k: 'COMPARER LES MODÈLES', title: 'TOUS LES MODÈLES\nNE SE VALENT PAS.',
    question: 'Tous les modèles consomment-ils autant ?',
    desc: 'Même demande, même longueur de réponse, huit modèles. La surface de chaque sphère est proportionnelle à l’électricité estimée : deux fois plus de surface, deux fois plus de Wh. Ce sont des estimations EcoLogits, pas des mesures.',
    suite: 'Et si l’on mesurait l’énergie directement, tâche par tâche ?',
    note: 'ECOLOGITS / ESTIMATIONS DU 19/10/2026', viz: 'v1', kind: 'energy',
    label: 'V1 — Toutes les IA ne consomment pas autant : huit sphères EcoLogits proportionnelles à l’électricité estimée',
  },
  {
    n: '03', temps: 'EXPLORATION', k: 'MESURER L’ÉNERGIE', title: 'CHANGER\nD’ÉCHELLE.',
    question: 'L’énergie dépend-elle aussi de ce qu’on demande ?',
    desc: 'On passe des estimations aux mesures : AI Energy Score a relevé l’énergie des cartes graphiques (GPU) pour dix tâches. Créer une image ou trier des phrases : l’écart va jusqu’à plusieurs centaines de fois. Seuls les GPU sont mesurés, pas tout le datacenter.',
    suite: 'Ces GPU ne flottent pas dans un nuage : où sont-ils ?',
    note: 'AI ENERGY SCORE / CAMPAGNE FÉVRIER 2025', viz: 'v3', kind: 'scale',
    label: 'V3 — Une tâche, un impact : énergie GPU médiane par requête pour dix tâches, échelle linéaire ou logarithmique',
  },
  {
    n: '04', temps: 'RÉVÉLATION', k: 'LES INFRASTRUCTURES', title: 'LE NUMÉRIQUE\nA UNE ADRESSE.',
    question: 'Où ces calculs ont-ils lieu ?',
    desc: 'Dans des datacenters : des bâtiments remplis de serveurs, alimentés et refroidis en continu. Voici 23 installations à l’adresse vérifiée en France, dont 18 en Île-de-France. Ces cartes ne montrent pas le trajet de vos requêtes.',
    suite: 'Ce que ce parcours nous apprend',
    note: 'DATACENTERS FRANCE / © OPENSTREETMAP', viz: 'v2', kind: 'earth',
    label: 'V2 — Le numérique a une adresse : cartes des datacenters vérifiés en France et en Île-de-France',
  },
] as const;

export type Chapitre = (typeof chapitres)[number];
