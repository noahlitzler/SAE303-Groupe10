const _120 = (md) => {
return (
md`# SAE 303 — Gr 10`
)
};

const _121 = (md) => {
return (
md`# DERRIÈRE LE PROMPT

## Que se cache-t-il derrière une requête d'intelligence artificielle, de sa consommation énergétique aux infrastructures qui la rendent possible ?

Clément Bertrand et Noah Litzler · Défi ADEME « L'impact environnemental de l'IA générative » (Open Data University)

L'intelligence artificielle générative est devenue un outil du quotidien. Pourtant, derrière une simple question envoyée à un modèle se cachent des calculs informatiques, une consommation d'énergie et des infrastructures physiques souvent invisibles pour les utilisateurs.

Nous étudions trois jeux de données complémentaires : les impacts environnementaux **estimés** de huit configurations de modèles (EcoLogits), l'énergie GPU **mesurée** pour onze tâches d'IA (AI Energy Score) et la **localisation vérifiée** de datacenters en France (Datacenters France).

Notre objectif n'est pas d'attribuer une consommation universelle à chaque requête, mais de montrer pourquoi les résultats varient, comment ils sont obtenus et dans quelles limites ils peuvent être lus.

**Plan :** 01 Fiche d'intention · 02 Sources · 03 Chargement, nettoyage et transformations · 04 Les cinq questions · 05 Données préparées · 06 Visualisations · 07 Intégration Astro · 08 Synthèse · 09 Journal IA`
)
};

const _122 = (md) => {
return (
md`## 01 — Fiche d'intention

| | |
|---|---|
| **Public visé** | Public principal : étudiants, jeunes adultes et utilisateurs réguliers d'IA générative, sans connaissances techniques particulières et sans ordre de grandeur en tête. Public secondaire : personnes intéressées par le numérique responsable et l'impact environnemental de l'IA. |
| **Question principale** | Que se cache-t-il derrière une requête d'intelligence artificielle, de sa consommation énergétique aux infrastructures qui la rendent possible ? |
| **Angle** | Partir d'un geste familier, l'envoi d'une requête, puis révéler progressivement ce qu'il mobilise : de l'énergie estimée, de l'énergie mesurée selon la tâche, et des bâtiments bien réels. |

### Un récit en quatre temps

| Temps | Ce que découvre le lecteur | Source | Visualisation |
|---|---|---|---|
| 1 · Le déclencheur | Une requête d'IA, geste apparemment anodin | — (introduction narrative) | — |
| 2 · Mesurer l'énergie | Selon le modèle, l'impact estimé d'une même requête varie fortement | EcoLogits | V1 (distribution), V4 (interaction) |
| 3 · Une tâche, un impact | Selon la tâche demandée, l'énergie GPU mesurée change d'ordre de grandeur | AI Energy Score | V3 (comparaison) |
| 4 · Le numérique a une adresse | Ces calculs reposent sur des installations physiques situées sur le territoire | Datacenters France | V2 (carte de lieux) |

Les trois sources répondent à des questions différentes : nous ne les additionnons pas et ne relions pas un modèle à un datacenter particulier.`
)
};

const _123 = (md) => {
return (
md`## 02 — Sources et données

| | EcoLogits | AI Energy Score | Datacenters France |
|---|---|---|---|
| **Producteur** | Projet open source EcoLogits (dépôt \`mlco2/ecologits\`, rattaché à l'organisation CodeCarbon) ; fichier constitué par nous en interrogeant l'outil | Initiative AI Energy Score, leaderboard publié sur Hugging Face | Notre binôme, à partir d'OpenStreetMap et de vérifications (sites des exploitants, PeeringDB, sources institutionnelles) |
| **Lien** | https://ecologits.ai/ | https://huggingface.co/spaces/AIEnergyScore/Leaderboard · documentation : https://huggingface.github.io/AIEnergyScore/ | https://www.openstreetmap.org/ |
| **Date** | Collecte du 19/10/2026 | Campagnes février 2025 et décembre 2025 ; fichiers ajoutés au notebook le 19/10/2026 | Version 2, vérifications des 19 et 20/10/2026 |
| **Licence** | Code de l'outil : MPL-2.0 | Non précisée par le leaderboard (site déclaré open source) | Données dérivées d'OpenStreetMap : ODbL 1.0, « © les contributeurs d'OpenStreetMap » |
| **Nature** | **Estimation** modélisée | **Mesure** en laboratoire (GPU NVIDIA H100, 1 000 requêtes par tâche, moyenne de 10 exécutions) | **Localisation vérifiée** |
| **Fichiers** | \`ecologits_estimations.csv\` | 11 CSV, un par tâche | \`datacenters-france.csv\`, \`datacenters-france-points-carte.csv\` |
| **Contenu** | 8 configurations, scénario commun : 150 tokens générés, mix électrique mondial (\`WOR\`) | 206 évaluations réparties en 11 tâches | 39 entrées, dont 23 installations localisées représentées par 18 points |
| **Unités** | Électricité (Wh), CO₂e (mg), eau (mL), énergie primaire (MJ), ressources minérales (kg Sb eq), chacune en intervalle min / max, par requête | Énergie GPU \`total_gpu_energy\` en kWh pour 1 000 requêtes, soit **Wh par requête** du benchmark | Coordonnées en degrés décimaux ; nombre d'installations par point |
| **Limite essentielle** | Valeurs estimées, valables pour le scénario retenu | Énergie GPU seule, dans les protocoles du benchmark | Sélection documentée, non exhaustive, sans donnée de consommation |

**Unité AI Energy Score.** Le code officiel du leaderboard multiplie \`total_gpu_energy\` par 1 000 pour l'afficher en « Wh pour 1 000 requêtes » : la valeur du fichier vaut donc des kWh pour 1 000 requêtes, c'est-à-dire, numériquement, des Wh par requête. Une médiane de 5,41 signifie 5,41 Wh par requête (environ 5 400 Wh pour 1 000 requêtes).

**Fonds de carte (V2).** La carte affichée utilise les tuiles OpenStreetMap (© contributeurs OpenStreetMap, ODbL). \`regions-version-simplifiee.geojson\` sert à contrôler la région de chaque point : contours simplifiés des 13 régions de France métropolitaine, issus du dépôt \`gregoiredavid/france-geojson\` (géométries IGN Admin Express 2018, noms et codes INSEE 2018, Licence Ouverte Etalab). Téléchargé le 20/10/2026 depuis https://github.com/gregoiredavid/france-geojson. Attribution : « IGN / Admin Express COG, via gregoiredavid/france-geojson — Licence Ouverte ».

**Précaution générale.** Estimations, mesures de laboratoire et localisations ne mesurent pas la même chose : chaque visualisation utilise une seule source et rappelle son unité.`
)
};

const _124 = (md) => {
return (
md`## 03 — Chargement, nettoyage et transformations

Les fichiers sources ne sont jamais modifiés : chaque table \`…Brut\` est chargée telle quelle, puis transformée dans une table \`…Propre\`. Aucune observation n'est supprimée ; les cas particuliers sont signalés par une colonne. Les cellules techniques sont repliées (cliquer sur une cellule pour afficher son code).

Fonctions utilitaires, indépendantes des données : \`statsDescriptives\` (effectif, moyenne, médiane, min, max, quartiles), \`valeursManquantes\`, \`verifier\` (ligne de contrôle attendu / obtenu), \`tableau\` (affichage statique d'un tableau).`
)
};

const _125 = function statsDescriptives(d3){return(
function statsDescriptives(valeurs) {
  const v = valeurs.filter(x => Number.isFinite(x)).sort(d3.ascending);
  const n = v.length;
  if (n === 0) return {n: 0};
  const moyenne = d3.mean(v);
  const mediane = d3.median(v);
  return {
    n,
    moyenne,
    mediane,
    min: v[0],
    max: v[n - 1],
    q1: d3.quantile(v, 0.25),
    q3: d3.quantile(v, 0.75),
    rapportMoyenneMediane: mediane !== 0 ? moyenne / mediane : null
  };
}
)};

const _126 = function valeursManquantes(d3){return(
function valeursManquantes(lignes, colonnes = lignes.columns ?? Object.keys(lignes[0] ?? {})) {
  const estManquant = x => x === null || x === undefined || x === "" || (typeof x === "number" && Number.isNaN(x));
  return d3.sum(colonnes, c => lignes.filter(d => estManquant(d[c])).length);
}
)};

const _127 = function verifier(){return(
function verifier(controle, obtenu, attendu) {
  return {controle, attendu, obtenu, statut: JSON.stringify(obtenu) === JSON.stringify(attendu) ? "OK" : "ÉCART"};
}
)};

const _128 = function tableau(){return(
function tableau(lignes, {colonnes, max = 40} = {}) {
  const cols = colonnes ?? Object.keys(lignes[0] ?? {});
  const format = v => {
    if (v === null || v === undefined || v === "") return "—";
    if (typeof v === "boolean") return v ? "oui" : "non";
    if (typeof v === "number") return Number.isInteger(v) ? String(v) : Number(v.toPrecision(4)).toString();
    if (Array.isArray(v)) return v.map(format).join(" ; ");
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  };
  const conteneur = document.createElement("div");
  conteneur.style.overflowX = "auto";
  const table = document.createElement("table");
  table.style.fontSize = "12px";
  const entete = table.createTHead().insertRow();
  for (const c of cols) { const th = document.createElement("th"); th.textContent = c; entete.appendChild(th); }
  const corps = table.createTBody();
  for (const d of lignes.slice(0, max)) {
    const tr = corps.insertRow();
    for (const c of cols) {
      const td = tr.insertCell();
      td.textContent = format(d[c]);
      if (d[c] === "ÉCART") { td.style.color = "#b00020"; td.style.fontWeight = "bold"; }
    }
  }
  conteneur.appendChild(table);
  if (lignes.length > max) {
    const note = document.createElement("p");
    note.style.fontSize = "11px";
    note.textContent = `${max} premières lignes sur ${lignes.length}.`;
    conteneur.appendChild(note);
  }
  return conteneur;
}
)};

const _129 = (md) => {
return (
md`### 03.1 — EcoLogits

Chargement de \`ecologits_estimations.csv\` (8 lignes, 19 colonnes), puis contrôles essentiels.`
)
};

const _130 = function ecologitsBrut(FileAttachment){return(
FileAttachment("ecologits_estimations.csv").csv({typed: true})
)};

const _131 = function indicateursEcoLogits(){return(
[
  {cle: "electricite", libelle: "Électricité", unite: "Wh", min: "energie_min_Wh", max: "energie_max_Wh", milieu: "energie_milieu_Wh"},
  {cle: "co2", libelle: "Émissions de CO₂e", unite: "mgCO₂e", min: "co2_min_mg", max: "co2_max_mg", milieu: "co2_milieu_mg"},
  {cle: "eau", libelle: "Consommation d'eau", unite: "mL", min: "eau_min_mL", max: "eau_max_mL", milieu: "eau_milieu_mL"},
  {cle: "energie_primaire", libelle: "Énergie primaire", unite: "MJ", min: "energie_primaire_min_MJ", max: "energie_primaire_max_MJ", milieu: "energie_primaire_milieu_MJ"},
  {cle: "ressources", libelle: "Ressources minérales", unite: "kg Sb eq", min: "ressources_min_kgSbeq", max: "ressources_max_kgSbeq", milieu: "ressources_milieu_kgSbeq"}
]
)};

const _132 = function controleEcoLogits(ecologitsBrut,indicateursEcoLogits,verifier,valeursManquantes)
{
  const d = ecologitsBrut;
  const colonnes = indicateursEcoLogits.flatMap(i => [i.min, i.max]);
  return [
    verifier("Nombre de configurations", d.length, 8),
    verifier("Scénario : tokens générés", [...new Set(d.map(r => r.tokens_sortie))], [150]),
    verifier("Scénario : mix électrique", [...new Set(d.map(r => r.zone_electricite))], ["WOR"]),
    verifier("Bornes numériques et positives", colonnes.every(c => d.every(r => Number.isFinite(r[c]) && r[c] > 0)), true),
    verifier("Bornes cohérentes (min ≤ max)", indicateursEcoLogits.every(i => d.every(r => r[i.min] <= r[i.max])), true),
    verifier("Valeurs manquantes (variables utilisées)", valeursManquantes(d, ["fournisseur", "modele", ...colonnes]), 0)
  ];
}
;

const _133 = function(tableau,controleEcoLogits){return(
tableau(controleEcoLogits)
)};

const _134 = (md) => {
return (
md`**Transformations EcoLogits**

| Donnée d'origine | Transformation | Pourquoi | Lignes |
|---|---|---|---|
| Chaque indicateur en intervalle \`min\` / \`max\` | Ajout d'un point milieu \`(min + max) / 2\` ; bornes conservées | Disposer d'une valeur de synthèse pour classer et décrire les configurations. Le point milieu est un **choix de synthèse** : ce n'est ni une mesure, ni la valeur la plus probable | 8 → 8 |
| \`avertissements\` (texte « a; b », vide pour un modèle) | Découpage en liste ; vide = aucun avertissement | Repérer les modèles dont l'architecture n'est pas publiée | 8 → 8 |
| — | Ajout du libellé \`configuration\`, de l'unité et du scénario | Garder le dénominateur avec chaque valeur | 8 → 8 |

Aucune ligne n'est retirée.`
)
};

const _135 = function ecologitsPropre(ecologitsBrut,indicateursEcoLogits){return(
ecologitsBrut.map(d => {
  const ligne = {
    fournisseur: d.fournisseur,
    modele: d.modele,
    configuration: `${d.fournisseur} / ${d.modele}`,
    date_collecte_utc: d.date_collecte_utc
  };
  for (const i of indicateursEcoLogits) {
    ligne[i.min] = d[i.min];
    ligne[i.max] = d[i.max];
    ligne[i.milieu] = (d[i.min] + d[i.max]) / 2;
  }
  ligne.avertissements = d.avertissements ? String(d.avertissements).split(";").map(s => s.trim()).filter(Boolean) : [];
  ligne.scenario = "150 tokens générés, mix électrique mondial (WOR)";
  return ligne;
})
)};

const _136 = (md) => {
return (
md`### 03.2 — AI Energy Score

Les 11 fichiers du leaderboard sont chargés séparément (\`aesBrut\`), puis réunis en une table longue \`aesPropre\` avec la tâche d'origine. Il s'agit d'une **concaténation** et non d'une jointure : les fichiers ont les mêmes colonnes de base (\`model\`, \`total_gpu_energy\`, \`energy_score\`), et seuls la génération de texte et le raisonnement ajoutent \`class\` et \`test date\`.`
)
};

const _137 = function aesTaches(){return(
[
  {fichier: "asr.csv", code: "asr", tache: "Reconnaissance vocale"},
  {fichier: "image_captioning.csv", code: "image_captioning", tache: "Description d'images"},
  {fichier: "image_classification.csv", code: "image_classification", tache: "Classification d'images"},
  {fichier: "image_generation.csv", code: "image_generation", tache: "Génération d'images"},
  {fichier: "object_detection.csv", code: "object_detection", tache: "Détection d'objets"},
  {fichier: "question_answering.csv", code: "question_answering", tache: "Réponse à des questions"},
  {fichier: "reasoning.csv", code: "reasoning", tache: "Raisonnement"},
  {fichier: "sentence_similarity.csv", code: "sentence_similarity", tache: "Similarité de phrases"},
  {fichier: "summarization.csv", code: "summarization", tache: "Résumé de texte"},
  {fichier: "text_classification.csv", code: "text_classification", tache: "Classification de texte"},
  {fichier: "text_generation.csv", code: "text_generation", tache: "Génération de texte"}
]
)};

const _138 = async function aesBrut(FileAttachment){return(
{
  "asr.csv": await FileAttachment("asr.csv").csv({typed: true}),
  "image_captioning.csv": await FileAttachment("image_captioning.csv").csv({typed: true}),
  "image_classification.csv": await FileAttachment("image_classification.csv").csv({typed: true}),
  "image_generation.csv": await FileAttachment("image_generation.csv").csv({typed: true}),
  "object_detection.csv": await FileAttachment("object_detection.csv").csv({typed: true}),
  "question_answering.csv": await FileAttachment("question_answering.csv").csv({typed: true}),
  "reasoning.csv": await FileAttachment("reasoning.csv").csv({typed: true}),
  "sentence_similarity.csv": await FileAttachment("sentence_similarity.csv").csv({typed: true}),
  "summarization.csv": await FileAttachment("summarization.csv").csv({typed: true}),
  "text_classification.csv": await FileAttachment("text_classification.csv").csv({typed: true}),
  "text_generation.csv": await FileAttachment("text_generation.csv").csv({typed: true})
}
)};

const _139 = function aesInventaire(aesTaches,aesBrut){return(
aesTaches.map(t => {
  const d = aesBrut[t.fichier];
  const modeles = d.map(r => r.model);
  const doublons = [...new Set(modeles.filter((m, k) => modeles.indexOf(m) !== k))];
  return {
    tache: t.tache,
    fichier: t.fichier,
    evaluations: d.length,
    campagnes_du_fichier: d.columns.includes("test date") ? [...new Set(d.map(r => r["test date"]))].join(", ") : "aucune (février 2025 selon le leaderboard)",
    doublons: doublons.length ? doublons.join(", ") : "—"
  };
})
)};

const _140 = function(tableau,aesInventaire){return(
tableau(aesInventaire)
)};

const _141 = function controleAES(aesTaches,aesBrut,verifier,d3,valeursManquantes)
{
  const lignes = aesTaches.flatMap(t => aesBrut[t.fichier]);
  const communes = aesTaches.map(t => aesBrut[t.fichier].columns).reduce((a, c) => a.filter(x => c.includes(x)));
  return [
    verifier("Fichiers chargés", aesTaches.length, 11),
    verifier("Évaluations", lignes.length, 206),
    verifier("Colonnes communes", communes, ["model", "total_gpu_energy", "energy_score"]),
    verifier("Énergie numérique et positive", lignes.every(r => Number.isFinite(r.total_gpu_energy) && r.total_gpu_energy > 0), true),
    verifier("Valeurs manquantes", d3.sum(aesTaches, t => valeursManquantes(aesBrut[t.fichier])), 0),
    verifier("Campagnes présentes dans les dates", [...new Set(lignes.map(r => r["test date"]).filter(x => x != null))].sort(), ["Dec 25", "Feb 25"])
  ];
}
;

const _142 = function(tableau,controleAES){return(
tableau(controleAES)
)};

const _143 = (md) => {
return (
md`**Transformations AI Energy Score**

| Donnée d'origine | Transformation | Pourquoi | Lignes |
|---|---|---|---|
| 11 fichiers séparés | Ajout de la tâche et du fichier source, concaténation | Comparer les tâches dans une seule table | 206 → 206 |
| \`total_gpu_energy\` (kWh pour 1 000 requêtes) | \`energie_Wh_par_requete\` = valeur brute ; \`energie_Wh_1000_req\` = valeur × 1 000 | Unité confirmée par la documentation et le code du leaderboard | 206 → 206 |
| \`test date\` (« Feb 25 », « Dec 25 »), absente de 9 fichiers | \`campagne\` = février 2025 ou décembre 2025 ; \`origine_campagne\` indique si la date vient du CSV ou du leaderboard, qui rattache les 9 autres fichiers à février 2025 | Ne jamais mélanger deux campagnes dans une même statistique | 206 → 206 |
| Deux modèles présents deux fois dans un même fichier | Conservés, colonne \`doublon\` | Les deux mesures diffèrent ; aucune raison objective d'en écarter une | 206 → 206 |
| \`energy_score\` (1 à 5 étoiles) | Conservé tel quel | Note relative à une tâche, non comparable d'une tâche à l'autre | 206 → 206 |`
)
};

const _144 = function aesPropre(aesTaches,aesBrut,d3){return(
aesTaches.flatMap(t => {
  const lignes = aesBrut[t.fichier];
  const occurrences = d3.rollup(lignes, v => v.length, r => r.model);
  const campagnes = {"Feb 25": "Février 2025", "Dec 25": "Décembre 2025"};
  return lignes.map(r => {
    const dateCsv = r["test date"] ?? null;
    return {
      tache: t.tache,
      tache_code: t.code,
      fichier: t.fichier,
      modele: r.model,
      classe_taille: r.class ?? null,
      campagne: dateCsv ? campagnes[dateCsv] : "Février 2025",
      origine_campagne: dateCsv ? "date du CSV" : "rattachement du leaderboard",
      energie_Wh_par_requete: r.total_gpu_energy,
      energie_Wh_1000_req: r.total_gpu_energy * 1000,
      energy_score: r.energy_score,
      doublon: occurrences.get(r.model) > 1
    };
  });
})
)};

const _145 = (md) => {
return (
md`### 03.3 — Datacenters France

Deux exports de notre fichier vérifié : les entrées (une ligne par installation déclarée) et les points cartographiques (un point peut représenter plusieurs installations d'un même campus). Séparateur \`;\`. Les coordonnées d'origine ne sont jamais modifiées.`
)
};

const _146 = function datacentersBrut(FileAttachment){return(
FileAttachment("datacenters-france.csv").dsv({delimiter: ";", typed: true})
)};

const _147 = function pointsCarteBrut(FileAttachment){return(
FileAttachment("datacenters-france-points-carte.csv").dsv({delimiter: ";", typed: true})
)};

const _148 = function controleDatacenters(datacentersBrut,pointsCarteBrut,verifier,d3)
{
  const dc = datacentersBrut;
  const pts = pointsCarteBrut;
  const statut = s => dc.filter(d => d.statut === s).length;
  const verifiees = dc.filter(d => d.statut === "localisation_verifiee");
  const idsVerifies = new Set(verifiees.map(d => d.id));
  const membres = pts.flatMap(p => String(p.datacenters).split("|").map(s => s.trim()));
  return [
    verifier("Entrées", dc.length, 39),
    verifier("Localisations vérifiées", statut("localisation_verifiee"), 23),
    verifier("Localisations non vérifiées", statut("localisation_non_verifiee"), 15),
    verifier("Existence non confirmée", statut("existence_non_confirmee"), 1),
    verifier("Points cartographiques", pts.length, 18),
    verifier("Installations représentées par les points", d3.sum(pts, p => p.nb_datacenters), 23),
    verifier("Installations des points sans correspondance", membres.filter(id => !idsVerifies.has(id)).length, 0),
    verifier("Installations vérifiées sans point (ou dans plusieurs)", verifiees.filter(d => membres.filter(m => m === d.id).length !== 1).length, 0),
    verifier("Points en France métropolitaine (lat. 41–51,5 ; long. −5,5–10)", pts.every(p => p.latitude >= 41 && p.latitude <= 51.5 && p.longitude >= -5.5 && p.longitude <= 10), true)
  ];
}
;

const _149 = function(tableau,controleDatacenters){return(
tableau(controleDatacenters)
)};

const _150 = function regionsFrance(FileAttachment){return(
FileAttachment("regions-version-simplifiee.geojson").json()
)};

const _151 = function controleFondDeCarte(regionsFrance,d3,pointsCarteBrut,verifier)
{
  const regionDe = p => regionsFrance.features.find(f => d3.geoContains(f, [p.longitude, p.latitude]))?.properties.nom ?? null;
  const rattachements = pointsCarteBrut.map(p => ({point: p.id, region_fichier: p.region, region_fond: regionDe(p)}));
  return [
    verifier("Fond de carte : type GeoJSON", regionsFrance.type, "FeatureCollection"),
    verifier("Fond de carte : régions métropolitaines", regionsFrance.features.length, 13),
    verifier("Points situés hors de toute région du fond", rattachements.filter(r => r.region_fond === null).length, 0),
    verifier("Points dont la région du fichier diffère de la région du fond", rattachements.filter(r => r.region_fond !== null && r.region_fond !== r.region_fichier).length, 0)
  ];
}
;

const _152 = function(tableau,controleFondDeCarte){return(
tableau(controleFondDeCarte)
)};

const _153 = (md) => {
return (
md`**Correspondances points ↔ installations.** Les 23 installations vérifiées trouvent chacune un point, et chaque identifiant cité par un point correspond à une installation vérifiée : aucune donnée ne tombe à côté. Chaque point tombe aussi dans la région du fond de carte qui porte le même nom que sa région dans notre fichier. Les 16 autres entrées (15 localisations non vérifiées, 1 existence non confirmée) n'ont volontairement ni coordonnées ni point : elles restent dans \`datacentersNonLocalises\`.

**Transformations Datacenters France**

| Donnée d'origine | Transformation | Pourquoi | Lignes |
|---|---|---|---|
| Cellules vides | Converties en valeurs nulles au chargement | Distinguer l'absence d'information | 39 → 39 |
| \`datacenters\` d'un point (« id1 \\| id2 ») | Liste d'identifiants, complétée des noms et exploitants des installations | Afficher ce que représente chaque point | 18 → 18 |
| Statut, coordonnées, point | Séparation des installations cartographiables (23) et non localisées (16) | Ne cartographier que les localisations vérifiées | 39 → 23 + 16 |`
)
};

const _154 = function datacentersPropre(datacentersBrut){return(
datacentersBrut.map(d => ({
  id: d.id,
  nom: d.nom,
  exploitant: d.exploitant,
  ville: d.ville,
  region: d.region,
  statut: d.statut,
  precision: d.precision,
  latitude: d.latitude,
  longitude: d.longitude,
  point_carte: d.point_carte,
  cartographiable: d.statut === "localisation_verifiee" && Number.isFinite(d.latitude) && d.point_carte != null,
  sources: d.sources ? String(d.sources).split("|").map(s => s.trim()).filter(Boolean) : []
}))
)};

const _155 = function datacentersNonLocalises(datacentersPropre){return(
datacentersPropre
  .filter(d => !d.cartographiable)
  .map(d => ({id: d.id, nom: d.nom, exploitant: d.exploitant, ville: d.ville, region: d.region, statut: d.statut}))
)};

const _156 = function regroupementsCampus(pointsCarteBrut){return(
pointsCarteBrut
  .filter(p => p.nb_datacenters > 1)
  .map(p => ({point: p.nom, ville: p.ville, installations: p.nb_datacenters, regle: p.convention}))
)};

const _157 = function(tableau,regroupementsCampus){return(
tableau(regroupementsCampus)
)};

const _158 = (md) => {
return (
md`## 04 — Les cinq questions avant de dessiner

Pour chaque jeu de données : 1 · nature des variables · 2 · la moyenne ment-elle ? · 3 · à quoi ressemble la distribution ? · 4 · absolu ou relatif ? · 5 · d'où sort cette donnée, qui manque ? Les chiffres cités sont recalculés dans le tableau « chiffres clés » placé sous chaque jeu.`
)
};

const _159 = (md) => {
return (
md`### 04.1 — EcoLogits

**1. Nature des variables.** Le fournisseur et le modèle sont des variables qualitatives nominales : elles identifient les huit configurations. L'électricité (Wh), les émissions de gaz à effet de serre (mgCO₂e), l'eau (mL), l'énergie primaire (MJ) et les ressources minérales (kg Sb eq) sont des variables quantitatives continues, estimées pour un scénario donné. Chacune est fournie sous forme d'intervalle \`[min ; max]\`, qui traduit l'incertitude de l'estimation. Le nombre de tokens et le mix électrique sont constants : ce sont les paramètres du scénario.

**2. La moyenne ment-elle ?** Oui. Sur les points milieux des intervalles, la consommation électrique moyenne est d'environ 0,533 Wh, contre une médiane d'environ 0,161 Wh : la moyenne vaut 3,3 fois la médiane. Quelques configurations aux estimations élevées, en particulier gemini-2.5-pro, la tirent vers le haut ; elle ne décrit donc pas une configuration typique. Le rapport reste du même ordre si l'on calcule sur les bornes basses ou hautes. Nous présentons la médiane et les valeurs individuelles en plus de la moyenne. Le point milieu est un choix de synthèse : il ne correspond ni à une mesure, ni à la valeur la plus probable.

**3. À quoi ressemble la distribution ?** Elle est asymétrique vers les fortes consommations : quatre configurations sont estimées sous 0,02 Wh, trois entre 0,3 et 0,6 Wh, et une seule autour de 3 Wh. Cette distribution décrit nos huit configurations et non l'ensemble des modèles d'IA existants.

**4. Absolu ou relatif ?** Les huit configurations partagent le même scénario (150 tokens générés, mix électrique mondial) : la normalisation est portée par ce scénario commun. Nous utilisons donc des valeurs physiques par requête, chacune dans son unité. Un rapport entre deux modèles reste possible à condition de nommer le modèle de référence. Une valeur de 0,2 Wh n'a de sens que rapportée à ce scénario, et non à tous les usages possibles d'un modèle.

**5. D'où sort cette donnée ? Qui manque ?** Nous avons constitué ce fichier le 19/10/2026 en interrogeant EcoLogits pour huit configurations de quatre fournisseurs (OpenAI, Anthropic, Google, Mistral AI). Ce sont des estimations issues d'un modèle de calcul, et non des mesures de nos requêtes. Pour six configurations, EcoLogits signale que l'architecture du modèle n'est pas publiée : l'estimation s'appuie alors sur des hypothèses, ce qui se traduit par un intervalle. Les deux modèles Mistral, dont l'architecture est publiée, ont un intervalle nul. Huit configurations ne forment pas un échantillon représentatif de toutes les IA, et les conditions réelles d'exécution peuvent différer du scénario retenu.`
)
};

const _160 = function chiffresEcoLogits(statsDescriptives,ecologitsPropre)
{
  const st = cle => statsDescriptives(ecologitsPropre.map(d => d[cle]));
  const milieu = st("energie_milieu_Wh"), bas = st("energie_min_Wh"), haut = st("energie_max_Wh");
  const sousSeuil = ecologitsPropre.filter(d => d.energie_milieu_Wh < 0.02).length;
  return [
    {chiffre: "Électricité, moyenne des points milieux (Wh)", valeur: milieu.moyenne},
    {chiffre: "Électricité, médiane des points milieux (Wh)", valeur: milieu.mediane},
    {chiffre: "Rapport moyenne / médiane (points milieux)", valeur: milieu.rapportMoyenneMediane},
    {chiffre: "Rapport moyenne / médiane (bornes basses)", valeur: bas.rapportMoyenneMediane},
    {chiffre: "Rapport moyenne / médiane (bornes hautes)", valeur: haut.rapportMoyenneMediane},
    {chiffre: "Configurations sous 0,02 Wh", valeur: sousSeuil},
    {chiffre: "Configuration la plus élevée (Wh)", valeur: `${ecologitsPropre.find(d => d.energie_milieu_Wh === milieu.max).modele} : ${milieu.max.toFixed(2)}`},
    {chiffre: "Configurations avec avertissement « architecture non publiée »", valeur: ecologitsPropre.filter(d => d.avertissements.includes("model-arch-not-released")).length}
  ];
}
;

const _161 = function(tableau,chiffresEcoLogits){return(
tableau(chiffresEcoLogits)
)};

const _162 = (md) => {
return (
md`### 04.2 — AI Energy Score

**1. Nature des variables.** La tâche (génération de texte, raisonnement, génération d'images, reconnaissance vocale, classification…) est une variable qualitative nominale à onze modalités ; c'est la variable principale de notre comparaison. Le modèle est qualitatif nominal. L'énergie GPU est quantitative continue, exprimée en **Wh par requête du benchmark** (kWh pour 1 000 requêtes dans le fichier). Le score énergétique (1 à 5 étoiles) est ordinal et relatif aux modèles d'une même tâche. La classe de taille (A, B, C) est ordinale, et la campagne (février ou décembre 2025) est temporelle.

**2. La moyenne ment-elle ?** Une moyenne sur les 206 évaluations mélangerait des tâches et des campagnes différentes : nous calculons donc par tâche et par campagne. En génération de texte, campagne de février 2025, la moyenne (≈ 0,29 Wh par requête) vaut environ 17 fois la médiane (≈ 0,017 Wh) : quelques grands modèles tirent la moyenne vers le haut. En raisonnement (décembre 2025), moyenne (≈ 6,15 Wh) et médiane (≈ 5,41 Wh) sont plus proches, malgré une forte dispersion. Nous privilégions la médiane, accompagnée du nombre d'évaluations.

**3. À quoi ressemble la distribution ?** Elle diffère selon les tâches. Les 18 évaluations de raisonnement vont de 0,27 à 18,99 Wh par requête ; les 40 évaluations de génération de texte de février 2025 vont de 0,0013 à 3,43 Wh, avec une forte asymétrie. Les médianes s'échelonnent sur plusieurs ordres de grandeur : environ 5,4 Wh pour le raisonnement, 0,35 Wh pour la génération d'images, 0,10 Wh pour la description d'images et 0,017 Wh (février) ou 0,036 Wh (décembre) pour la génération de texte. Ces médianes décrivent les modèles évalués dans le benchmark ; elles ne signifient pas que toute requête de raisonnement consomme davantage que toute génération d'image.

**4. Absolu ou relatif ?** L'énergie par requête du benchmark est notre dénominateur commun. Mais une requête n'a pas la même charge de calcul d'une tâche à l'autre, puisque chaque tâche a son propre jeu de requêtes : les écarts entre tâches sont des différences observées dans les protocoles du benchmark, pas des lois générales. Les valeurs couvrant plusieurs ordres de grandeur, nous utiliserons une échelle logarithmique, signalée au lecteur : les distances y représentent des rapports et non des différences.

**5. D'où sort cette donnée ? Qui manque ?** Les données viennent du leaderboard AI Energy Score (Hugging Face) : onze fichiers CSV, 206 évaluations, mesurées sur GPU NVIDIA H100 pour 1 000 requêtes par tâche. Seule l'énergie des GPU est comptée : ni le refroidissement, ni le réseau, ni le reste du datacenter. Les données ne renseignent ni l'eau ni les émissions de CO₂. Les modèles présents dans nos fichiers sont des modèles ouverts publiés sur Hugging Face : les modèles propriétaires étudiés avec EcoLogits (GPT-4o, Claude, Gemini) n'y figurent pas. Neuf fichiers n'ont pas de date ; le leaderboard les rattache à février 2025. Deux modèles apparaissent deux fois dans un même fichier ; les deux mesures sont conservées.`
)
};

const _163 = function chiffresAES(statsDescriptives,aesPropre)
{
  const st = (tache, campagne) => statsDescriptives(aesPropre.filter(d => d.tache_code === tache && d.campagne === campagne).map(d => d.energie_Wh_par_requete));
  const tgF = st("text_generation", "Février 2025"), tgD = st("text_generation", "Décembre 2025"), rs = st("reasoning", "Décembre 2025");
  const ig = st("image_generation", "Février 2025"), ic = st("image_captioning", "Février 2025");
  const L = (chiffre, s, perimetre) => ({chiffre, perimetre, n: s.n, mediane_Wh_req: s.mediane, moyenne_Wh_req: s.moyenne, min_Wh_req: s.min, max_Wh_req: s.max});
  return [
    L("Génération de texte", tgF, "Février 2025"),
    L("Génération de texte", tgD, "Décembre 2025"),
    L("Raisonnement", rs, "Décembre 2025"),
    L("Génération d'images", ig, "Février 2025"),
    L("Description d'images", ic, "Février 2025"),
    {chiffre: "Total des évaluations", perimetre: "11 tâches", n: aesPropre.length}
  ];
}
;

const _164 = function(tableau,chiffresAES){return(
tableau(chiffresAES)
)};

const _165 = (md) => {
return (
md`### 04.3 — Datacenters France

**1. Nature des variables.** Le nom, l'exploitant, la ville et la région sont des variables qualitatives nominales. Le statut de vérification (localisation vérifiée, non vérifiée, existence non confirmée) est qualitatif. La latitude et la longitude sont des variables quantitatives continues à usage spatial. Le nombre d'installations représentées par un point est une variable quantitative discrète.

**2. La moyenne ment-elle ?** Nos 23 installations localisées sont représentées par 18 points : en moyenne 1,28 installation par point, pour une médiane de 1. La moyenne est légèrement tirée par trois regroupements : le campus Equinix de Saint-Denis (4 installations), celui de Pantin (2) et une adresse partagée à Vélizy-Villacoublay (2). La situation la plus fréquente reste un point pour une installation ; nous distinguons donc toujours le nombre de points du nombre d'installations.

**3. À quoi ressemble la distribution ?** Elle est très concentrée : 18 des 23 installations localisées (environ 78 %) se trouvent en Île-de-France, notamment à Saint-Denis, Pantin et Aubervilliers ; les cinq autres se répartissent dans cinq régions, à raison d'une chacune. Cette répartition décrit notre sélection vérifiée, pas l'ensemble des datacenters français.

**4. Absolu ou relatif ?** Sur la carte, nous affichons des valeurs absolues : la position de chaque point et le nombre d'installations qu'il représente. Une part n'a de sens que rapportée aux 23 installations localisées : « 78 % en Île-de-France » ne signifie pas que 78 % des datacenters français s'y trouvent. Faute de données de consommation, nous ne construisons pas de carte de valeurs (choroplèthe).

**5. D'où sort cette donnée ? Qui manque ?** Les entrées proviennent d'OpenStreetMap : sur 289 objets de l'export initial, 38 ont fait l'objet d'un contrôle documenté (sites des exploitants, sources institutionnelles, PeeringDB) les 19 et 20 octobre 2026. Le fichier final compte 39 entrées. Nous privilégions la fiabilité des localisations plutôt que l'exhaustivité. Manquent notamment des sites connus mais non localisés précisément (par exemple les datacenters OVHcloud de Roubaix, Gravelines et Strasbourg, connus à l'échelle de la commune), ainsi que toute donnée de consommation. Rien ne permet d'affirmer qu'un datacenter représenté héberge un modèle étudié ou traite une requête donnée.`
)
};

const _166 = function repartitionRegionale(datacentersPropre,d3,pointsCarteBrut)
{
  const localisees = datacentersPropre.filter(d => d.cartographiable);
  return d3.rollups(localisees, v => v.length, d => d.region)
    .map(([region, installations]) => ({
      region,
      installations,
      part_sur_23: installations / localisees.length,
      points: pointsCarteBrut.filter(p => p.region === region).length
    }))
    .sort((a, b) => d3.descending(a.installations, b.installations) || d3.ascending(a.region, b.region));
}
;

const _167 = function chiffresDatacenters(statsDescriptives,pointsCarteBrut,repartitionRegionale,d3,datacentersNonLocalises)
{
  const s = statsDescriptives(pointsCarteBrut.map(p => p.nb_datacenters));
  const idf = repartitionRegionale.find(d => d.region === "Île-de-France");
  return [
    {chiffre: "Installations localisées", valeur: d3.sum(repartitionRegionale, d => d.installations)},
    {chiffre: "Points cartographiques", valeur: s.n},
    {chiffre: "Installations par point : moyenne", valeur: s.moyenne},
    {chiffre: "Installations par point : médiane", valeur: s.mediane},
    {chiffre: "Installations en Île-de-France", valeur: idf.installations},
    {chiffre: "Part de l'Île-de-France (sur 23)", valeur: idf.part_sur_23},
    {chiffre: "Régions hors Île-de-France représentées", valeur: repartitionRegionale.length - 1},
    {chiffre: "Entrées non cartographiées", valeur: datacentersNonLocalises.length}
  ];
}
;

const _168 = function(tableau,chiffresDatacenters){return(
tableau(chiffresDatacenters)
)};

const _169 = (md) => {
return (
md`## 05 — Données préparées

Une table par visualisation, issue des tables \`…Propre\`. Chaque table garde son unité et son scénario ou son dénominateur.

| Table | Contenu | Lignes |
|---|---|---|
| \`donneesV1\` | Les 8 configurations EcoLogits : électricité min, max et point milieu (Wh) | 8 |
| \`donneesV2\` | Les 18 points vérifiés, avec le nombre et le nom des installations représentées ; la carte V2 affiche les 23 installations une par une, à partir de \`datacentersBrut\`, sur fond OpenStreetMap | 18 |
| \`donneesV3\` | Médiane et moyenne de l'énergie GPU par tâche **et par campagne** | 12 |
| \`donneesV4\` | Les 8 configurations × 5 indicateurs EcoLogits, format long, avec rang du point milieu et chevauchement des intervalles | 40 |`
)
};

const _170 = function donneesV1(ecologitsPropre,d3){return(
ecologitsPropre.map(d => ({
  fournisseur: d.fournisseur,
  modele: d.modele,
  configuration: d.configuration,
  energie_min_Wh: d.energie_min_Wh,
  energie_max_Wh: d.energie_max_Wh,
  energie_milieu_Wh: d.energie_milieu_Wh,
  unite: "Wh",
  scenario: d.scenario
})).sort((a, b) => d3.ascending(a.energie_milieu_Wh, b.energie_milieu_Wh))
)};

const _171 = function(tableau,donneesV1){return(
tableau(donneesV1, {colonnes: ["configuration", "energie_min_Wh", "energie_milieu_Wh", "energie_max_Wh", "unite"]})
)};

const _172 = function donneesV2(pointsCarteBrut,datacentersPropre){return(
pointsCarteBrut.map(p => {
  const ids = String(p.datacenters).split("|").map(s => s.trim());
  const installations = ids.map(id => datacentersPropre.find(d => d.id === id));
  return {
    id: p.id,
    nom: p.nom,
    ville: p.ville,
    region: p.region,
    latitude: p.latitude,
    longitude: p.longitude,
    type: p.type,
    nb_installations: p.nb_datacenters,
    ids_installations: ids,
    noms_installations: installations.map(d => d?.nom ?? null),
    exploitants: [...new Set(installations.map(d => d?.exploitant).filter(Boolean))],
    infobulle: `${p.nom} — ${p.ville} (${p.region}) · ${p.nb_datacenters} installation${p.nb_datacenters > 1 ? "s" : ""}`
  };
})
)};

const _173 = function(tableau,verifier,donneesV2){return(
tableau([verifier("Correspondances V2 : identifiants sans installation", donneesV2.flatMap(p => p.noms_installations.filter(n => n === null)).length, 0)])
)};

const _174 = function(tableau,donneesV2){return(
tableau(donneesV2, {colonnes: ["nom", "ville", "region", "type", "nb_installations", "exploitants"]})
)};

const _175 = function donneesV3(d3,aesPropre,statsDescriptives)
{
  const ordreCampagnes = ["Février 2025", "Décembre 2025"];
  return d3.groups(aesPropre, d => d.campagne, d => d.tache)
    .flatMap(([campagne, taches]) => taches.map(([tache, v]) => {
      const s = statsDescriptives(v.map(d => d.energie_Wh_par_requete));
      return {
        tache,
        campagne,
        origine_campagne: v[0].origine_campagne,
        n_evaluations: s.n,
        mediane_Wh_req: s.mediane,
        moyenne_Wh_req: s.moyenne,
        min_Wh_req: s.min,
        max_Wh_req: s.max,
        unite: "Wh GPU par requête (benchmark)",
        source: "AI Energy Score"
      };
    }))
    .sort((a, b) => d3.ascending(ordreCampagnes.indexOf(a.campagne), ordreCampagnes.indexOf(b.campagne)) || d3.descending(a.mediane_Wh_req, b.mediane_Wh_req));
}
;

const _176 = function(tableau,donneesV3){return(
tableau(donneesV3, {colonnes: ["campagne", "tache", "n_evaluations", "mediane_Wh_req", "moyenne_Wh_req", "origine_campagne"]})
)};

const _177 = function donneesV4(indicateursEcoLogits,ecologitsPropre,d3){return(
indicateursEcoLogits.flatMap(i => {
  const lignes = ecologitsPropre
    .map(d => ({
      modele: d.modele,
      fournisseur: d.fournisseur,
      configuration: d.configuration,
      indicateur: i.cle,
      libelle: i.libelle,
      unite: i.unite,
      min: d[i.min],
      max: d[i.max],
      milieu: d[i.milieu],
      scenario: d.scenario
    }))
    .sort((a, b) => d3.descending(a.milieu, b.milieu));
  const chevauche = (a, b) => a.min <= b.max && b.min <= a.max;
  return lignes.map((l, k) => ({
    ...l,
    rang: k + 1,
    chevauche_voisin: (k > 0 && chevauche(l, lignes[k - 1])) || (k < lignes.length - 1 && chevauche(l, lignes[k + 1]))
  }));
})
)};

const _178 = function(tableau,donneesV4){return(
tableau(donneesV4.filter(d => d.rang <= 2), {colonnes: ["libelle", "rang", "configuration", "min", "milieu", "max", "unite", "chevauche_voisin"]})
)};

const _179 = (md) => {
return (
md`## 06 — Nos quatre visualisations

| | Question | Source | Table |
|---|---|---|---|
| V1 | Comment les estimations de consommation électrique se répartissent-elles entre nos huit configurations ? | EcoLogits | \`donneesV1\` |
| V2 | Où se situent les datacenters dont nous avons vérifié la localisation ? | Datacenters France | \`donneesV2\` |
| V3 | Comment l'énergie GPU mesurée varie-t-elle selon les tâches ? | AI Energy Score | \`donneesV3\` |
| V4 | Si j'envoie une requête à tel modèle, combien d'eau, de gaz à effet de serre et d'électricité cela représente-t-il ? | EcoLogits | \`donneesV4\` |`
)
};

const _180 = (md) => {
return (
md`### V1 — Distribution : « Toutes les IA ne consomment pas autant »

| Élément | Contenu |
|---|---|
| 1. Question | Comment les estimations de consommation électrique se répartissent-elles entre nos huit configurations de modèles ? |
| 2. Famille | Bulles proportionnelles : une « constellation » de huit sphères dont la taille montre l'étalement des valeurs, de la plus sobre à la plus énergivore. |
| 3. Encodage et justification | Une sphère par configuration EcoLogits, avec son nom exact et sa valeur écrits à côté. **Surface** proportionnelle à l'électricité estimée par requête (point milieu de l'intervalle) : rayon = rayon maximal × √(valeur / valeur maximale). Les sphères dont le rayon calculé serait inférieur à 12 px sont affichées à 12 px pour rester visibles et cliquables, ce qu'indique la note sous la visualisation (avec le facteur d'agrandissement calculé). La position des sphères est décorative : elle ne code aucune variable, et aucune ligne ne relie les sphères. Une couleur par fournisseur (Google, OpenAI, Anthropic, Mistral AI), rappelée en légende, sur le même fond clair que les autres visualisations ; le nom et la valeur sont toujours écrits sous la sphère. Au clic (souris, clavier ou tactile), une fiche affiche le fournisseur, la valeur, le minimum et le maximum, le rang et les rapports à la configuration la plus sobre et à la médiane, tous calculés. Sphères immobiles : seule une apparition progressive au chargement est conservée (désactivée si \`prefers-reduced-motion\`), avec un halo lumineux au survol et à la sélection. |
| 4. Dénominateur | Wh estimés par requête, pour un scénario de 150 tokens générés avec mix électrique mondial ; 8 configurations. |
| 5. Titre et sous-titre porteur | « Toutes les IA ne consomment pas autant » — Chaque sphère est une configuration d'IA : plus sa surface est grande, plus sa consommation électrique estimée est élevée pour une même réponse de 150 tokens. |
| 6. Alternative textuelle | Huit sphères représentent huit configurations d'IA ; leur surface est proportionnelle à l'électricité estimée pour une requête de 150 tokens. gemini-2.5-pro domine avec environ 3 Wh, suivi de mistral-large-2512 (0,598 Wh), gpt-4o (0,315 Wh) et claude-sonnet-4-6 (0,305 Wh) ; quatre configurations restent autour de 0,01 à 0,02 Wh. La plus sobre, gemini-2.5-flash-lite (0,0101 Wh), consomme environ 300 fois moins que la plus énergivore. |`
)
};

const _204 = function dessinerConstellation(){return(
function dessinerConstellation(donnees, {largeur = 900, rayonMax, rayonMin = 12} = {}) {
  // Composant autonome : reçoit ses données en paramètre (une ligne par configuration EcoLogits), sans bibliothèque.
  const lignes = donnees
    .filter(d => Number.isFinite(d.energie_milieu_Wh))
    .map(d => ({...d}))
    .sort((a, b) => b.energie_milieu_Wh - a.energie_milieu_Wh);
  const n = lignes.length;
  const noms = {openai: "OpenAI", anthropic: "Anthropic", google_genai: "Google", mistralai: "Mistral AI"};
  const fmt = v => new Intl.NumberFormat("fr-FR", {maximumSignificantDigits: 3}).format(v);
  const fmtRapport = r => r >= 10 ? new Intl.NumberFormat("fr-FR", {maximumSignificantDigits: 2}).format(r) : new Intl.NumberFormat("fr-FR", {maximumFractionDigits: 1}).format(r);
  const largeurSvg = largeur > 720 ? largeur - 64 - 276 : largeur - 30;
  const etroit = largeurSvg < 520;
  const W = Math.max(300, Math.round(largeurSvg));
  const H = etroit ? 700 : 540;
  const rMax = rayonMax ?? (etroit ? 78 : 112);
  const vMax = lignes[0].energie_milieu_Wh;
  const valeurs = lignes.map(d => d.energie_milieu_Wh).sort((a, b) => a - b);
  const mediane = n % 2 ? valeurs[(n - 1) / 2] : (valeurs[n / 2 - 1] + valeurs[n / 2]) / 2;
  const plusSobre = lignes[n - 1];
  // Une couleur par fournisseur : les modèles d'une même famille partagent leur teinte.
  const couleursFournisseurs = {google_genai: "#2878D0", anthropic: "#EF8B34", openai: "#269A77", mistralai: "#C2408F"};
  const reserve = ["#9461CC", "#1A9BB0", "#C9A227", "#E8705A"];
  const fournisseurs = [...new Set(lignes.map(d => d.fournisseur))];
  const couleurDe = f => couleursFournisseurs[f] ?? reserve[fournisseurs.filter(x => !couleursFournisseurs[x]).indexOf(f) % reserve.length];
  // Surface proportionnelle à la consommation : r = rMax × √(v / vMax), avec un rayon minimal d'affichage.
  lignes.forEach((d, k) => {
    d.rReel = rMax * Math.sqrt(d.energie_milieu_Wh / vMax);
    d.r = Math.max(rayonMin, d.rReel);
    d.couleur = couleurDe(d.fournisseur);
    d.rang = k + 1;
    d.id = `s${k}`;
  });
  const agrandies = lignes.filter(d => d.r > d.rReel + 0.01);

  // Disposition organique sans chevauchement : relaxation déterministe (aucune variable n'est encodée par la position).
  // Disposition sans chevauchement : chaque sphère et son étiquette (placée dessous) forment une boîte ; aucune variable n'est encodée par la position.
  const ETIQ = 40, MARGE = 14;
  const demiLargeur = d => Math.max(d.r, d.modele.length * 3.9 + 4);
  const boite = d => ({g: d.x - demiLargeur(d), dr: d.x + demiLargeur(d), h: d.y - d.r, b: d.y + d.r + ETIQ});
  lignes.forEach((d, k) => {
    const a = k * 2.399963; // angle d'or : point de départ organique
    const rr = 30 + 50 * Math.sqrt(k);
    d.x = W / 2 + rr * Math.cos(a) * (etroit ? 0.7 : 1.5);
    d.y = H / 2 + rr * Math.sin(a) * (etroit ? 1.4 : 0.85);
  });
  const borner = d => {
    const dl = demiLargeur(d) + 6;
    d.x = Math.min(W - dl, Math.max(dl, d.x));
    d.y = Math.min(H - d.r - ETIQ - 6, Math.max(d.r + 6, d.y));
  };
  for (let it = 0; it < 1200; it++) {
    for (const d of lignes) { d.x += (W / 2 - d.x) * 0.002; d.y += (H / 2 - d.y) * 0.002; }
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const a = lignes[i], b = lignes[j], A = boite(a), B = boite(b);
      const ix = Math.min(A.dr, B.dr) - Math.max(A.g, B.g) + MARGE, iy = Math.min(A.b, B.b) - Math.max(A.h, B.h) + MARGE;
      if (ix > 0 && iy > 0) {
        if (ix < iy) { const s = (a.x < b.x ? -1 : 1) * ix / 2; a.x += s; b.x -= s; }
        else { const s = (a.y < b.y ? -1 : 1) * iy / 2; a.y += s; b.y -= s; }
      }
    }
    lignes.forEach(borner);
  }

  const ns = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(ns, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (parent) parent.append(e); return e; };

  const racine = document.createElement("section");
  racine.className = "dlp-constellation";
  const style = document.createElement("style");
  style.textContent = `
    .dlp-constellation{--texte:#1f2328;--texte2:#5b616b;--bord:#e5e3dd;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--texte);background:#fbfaf7;border:1px solid var(--bord);border-radius:16px;padding:24px clamp(14px,3vw,32px) 18px;max-width:1000px;box-sizing:border-box;position:relative}
    .dlp-constellation *{box-sizing:border-box}
    .dlp-constellation h3{margin:0 0 4px;font-size:clamp(20px,2.4vw,26px);line-height:1.2;font-weight:750}
    .dlp-constellation .st{margin:0 0 10px;font-size:14px;line-height:1.5;color:var(--texte2);max-width:66ch}
    .dlp-constellation .barre-outils{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 4px;font-size:12.5px;color:var(--texte2)}
    .dlp-constellation .sphere:focus-visible{outline:none}
    .dlp-constellation .legende-f{display:flex;flex-wrap:wrap;gap:4px 14px;color:var(--texte)}
    .dlp-constellation .legende-f i{display:inline-block;width:11px;height:11px;border-radius:50%;margin-right:5px;vertical-align:-1px;opacity:.85}
    .dlp-constellation .scene{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:16px;align-items:center}
    @media (max-width:720px){.dlp-constellation .scene{grid-template-columns:1fr}}
    .dlp-constellation svg{width:100%;height:auto;display:block;overflow:visible}
    .dlp-constellation .sphere{cursor:pointer}
    .dlp-constellation .corps{transform-box:fill-box;transform-origin:center;animation:dlp-entree .9s cubic-bezier(.2,.9,.25,1.15) both;animation-delay:var(--delai)}
    .dlp-constellation .halo{opacity:0;transition:opacity .35s}
    .dlp-constellation .sphere:hover .halo,.dlp-constellation .sphere:focus-visible .halo{opacity:.35}
    .dlp-constellation .sphere .contour{transition:stroke-width .3s,stroke-opacity .3s}
    .dlp-constellation .sphere .etiq{font-size:12.5px;font-weight:650;fill:var(--texte);paint-order:stroke;stroke:#fbfaf7;stroke-width:4px;stroke-linejoin:round}
    .dlp-constellation .sphere .etiq2{font-size:11px;fill:var(--texte2);paint-order:stroke;stroke:#fbfaf7;stroke-width:4px}
    .dlp-constellation .sphere .corps>circle{transition:opacity .35s}
    .dlp-constellation.choix .sphere:not(.actif) .contour{opacity:.45}
    .dlp-constellation.choix .sphere:not(.actif) .etiq{fill:#3a4462}
    .dlp-constellation .sphere:focus{outline:none}
    .dlp-constellation .sphere.actif .contour{stroke-width:3.5;stroke-opacity:1}
    .dlp-constellation .sphere.actif .halo{opacity:.55}
    .dlp-constellation .sphere:focus-visible .contour{stroke:#18203a;stroke-width:3}
    .dlp-constellation .particule{fill:#b9b6ad;opacity:.35}
    @keyframes dlp-entree{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
    @media (prefers-reduced-motion:reduce){.dlp-constellation *{animation:none!important;transition:none!important}}
    .dlp-constellation .fiche{background:#fff;border:1px solid var(--bord);border-radius:14px;padding:16px 16px 14px;box-shadow:0 8px 24px -18px rgba(31,35,40,.35);transition:opacity .25s,transform .25s}
    .dlp-constellation .fiche.change{opacity:0;transform:translateY(6px)}
    .dlp-constellation .fiche .f-four{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--texte2);margin:0}
    .dlp-constellation .fiche .f-nom{font-size:18px;font-weight:750;margin:2px 0 8px;word-break:break-word}
    .dlp-constellation .fiche .f-val{font-size:34px;font-weight:780;line-height:1;font-variant-numeric:tabular-nums;margin:0}
    .dlp-constellation .fiche .f-val small{font-size:14px;font-weight:600;color:var(--texte2);margin-left:4px}
    .dlp-constellation .fiche .f-int{font-size:12.5px;color:var(--texte2);margin:6px 0 10px}
    .dlp-constellation .fiche .f-situ{font-size:13px;line-height:1.5;margin:0;border-top:1px dashed var(--bord);padding-top:9px}
    .dlp-constellation .bulle{position:absolute;pointer-events:none;background:#fff;color:var(--texte);border:1px solid #cfccc4;box-shadow:0 6px 18px rgba(0,0,0,.12);border-radius:9px;padding:6px 9px;font-size:12.5px;line-height:1.35;opacity:0;transition:opacity .15s;z-index:3;white-space:nowrap}
    .dlp-constellation .conclusion{margin:16px 0 0;padding:11px 14px;border-left:4px solid #2878D0;background:#fff;border-radius:0 10px 10px 0;font-size:14.5px;line-height:1.5}
    .dlp-constellation .note{margin:10px 0 0;font-size:12.5px;line-height:1.5;color:var(--texte2);max-width:85ch}
    .dlp-constellation figcaption{margin-top:8px;font-size:11.5px;line-height:1.45;color:var(--texte2)}
  `;
  const titre = document.createElement("h3");
  titre.textContent = "Toutes les IA ne consomment pas autant";
  const st = document.createElement("p");
  st.className = "st";
  st.textContent = `Chaque sphère est une configuration d'IA : plus sa surface est grande, plus sa consommation électrique estimée est élevée pour une même réponse de 150 tokens. Cliquez sur une sphère pour l'explorer.`;
  const outils = document.createElement("div");
  outils.className = "barre-outils";
  const consigne = document.createElement("span");
  consigne.textContent = "Surface ∝ électricité estimée (Wh) · la position des sphères est décorative";
  const legendeF = document.createElement("span");
  legendeF.className = "legende-f";
  legendeF.innerHTML = fournisseurs.map(f => `<span><i style="background:${couleurDe(f)}"></i>${noms[f] ?? f}</span>`).join("");
  outils.append(consigne, legendeF);

  const scene = document.createElement("div");
  scene.className = "scene";
  const haut = Math.min(...lignes.map(d => d.y - d.r)) - 18, bas = Math.max(...lignes.map(d => d.y + d.r + ETIQ)) + 14;
  const svg = el("svg", {viewBox: `0 ${haut.toFixed(0)} ${W} ${(bas - haut).toFixed(0)}`, role: "group", "aria-label": `Constellation de ${n} configurations d'IA, taille proportionnelle à l'électricité estimée par requête`});
  const defs = el("defs", {}, svg);
  const filtre = el("filter", {id: "dlp-flou", x: "-50%", y: "-50%", width: "200%", height: "200%"}, defs);
  el("feGaussianBlur", {stdDeviation: "10"}, filtre);
  let graine = 7;
  const alea = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);
  const fondParticules = el("g", {"aria-hidden": "true"}, svg);
  for (let k = 0; k < 24; k++) {
    const p = el("circle", {class: "particule", cx: (alea() * W).toFixed(1), cy: (haut + alea() * (bas - haut)).toFixed(1), r: (0.8 + alea() * 1.8).toFixed(2)}, fondParticules);
  }
  const groupes = lignes.map((d, k) => {
    const grad = el("radialGradient", {id: `dlp-g-${d.id}`, cx: "35%", cy: "30%", r: "75%"}, defs);
    el("stop", {offset: "0%", "stop-color": "#ffffff", "stop-opacity": "0.95"}, grad);
    el("stop", {offset: "55%", "stop-color": d.couleur, "stop-opacity": "0.28"}, grad);
    el("stop", {offset: "100%", "stop-color": d.couleur, "stop-opacity": "0.55"}, grad);
    const g = el("g", {class: "sphere", tabindex: "0", role: "button", "aria-label": `${d.modele} (${noms[d.fournisseur] ?? d.fournisseur}) : ${fmt(d.energie_milieu_Wh)} Wh par requête`, transform: `translate(${d.x.toFixed(1)},${d.y.toFixed(1)})`}, svg);
    g.dataset.modele = d.modele;
    const corps = el("g", {class: "corps"}, g);
    corps.style.setProperty("--delai", `${(k * 0.12).toFixed(2)}s`);
    el("circle", {class: "halo", r: (d.r * 1.08).toFixed(1), fill: d.couleur, filter: "url(#dlp-flou)"}, corps);
    el("circle", {class: "contour", r: d.r.toFixed(1), fill: `url(#dlp-g-${d.id})`, stroke: d.couleur, "stroke-width": "2", "stroke-opacity": "0.9"}, corps);
    el("circle", {r: Math.max(8, d.r).toFixed(1), fill: "transparent"}, corps);
    const t1 = el("text", {class: "etiq", "text-anchor": "middle", y: (d.r + 17).toFixed(1)}, corps);
    t1.textContent = d.modele;
    const t2 = el("text", {class: "etiq2", "text-anchor": "middle", y: (d.r + 32).toFixed(1)}, corps);
    t2.textContent = `${fmt(d.energie_milieu_Wh)} Wh`;
    return {d, g};
  });
  const fiche = document.createElement("div");
  fiche.className = "fiche";
  fiche.setAttribute("aria-live", "polite");
  scene.append(svg, fiche);

  const bulle = document.createElement("div");
  bulle.className = "bulle";
  bulle.setAttribute("role", "tooltip");

  const rapportExtremes = lignes[0].energie_milieu_Wh / plusSobre.energie_milieu_Wh;
  const conclusion = document.createElement("p");
  conclusion.className = "conclusion";
  conclusion.textContent = `Pour une même quantité de texte généré, la consommation électrique estimée varie fortement selon le modèle : de ${fmt(plusSobre.energie_milieu_Wh)} Wh (${plusSobre.modele}) à ${fmt(lignes[0].energie_milieu_Wh)} Wh (${lignes[0].modele}), soit environ ${fmtRapport(rapportExtremes)} fois plus.`;
  const note = document.createElement("p");
  note.className = "note";
  note.textContent = `Valeurs : point milieu de l'intervalle minimum – maximum estimé par EcoLogits (choix de synthèse), ce ne sont pas des mesures directes. ${agrandies.length ? `Pour rester visibles et cliquables, ${agrandies.length === 1 ? "la plus petite sphère est affichée" : `les ${agrandies.length} plus petites sphères sont affichées`} avec un rayon minimal de ${rayonMin} px : leur surface réelle serait jusqu'à ${fmtRapport(Math.max(...agrandies.map(d => (d.r / d.rReel) ** 2)))} fois plus petite.` : ""}`;
  const source = document.createElement("figcaption");
  source.textContent = "Source : EcoLogits, estimations collectées le 19/10/2026 · scénario de 150 tokens générés, mix électrique mondial · Wh par requête.";

  const afficherFiche = d => {
    const rapportMed = d.energie_milieu_Wh / mediane;
    const rapportSobre = d.energie_milieu_Wh / plusSobre.energie_milieu_Wh;
    fiche.classList.add("change");
    setTimeout(() => {
      fiche.innerHTML = `<p class="f-four">${noms[d.fournisseur] ?? d.fournisseur ?? ""}</p><p class="f-nom">${d.modele}</p><p class="f-val">${fmt(d.energie_milieu_Wh)}<small>Wh / requête</small></p><p class="f-int">Estimation : de ${fmt(d.energie_min_Wh)} à ${fmt(d.energie_max_Wh)} Wh</p><p class="f-situ">Rang ${d.rang} sur ${n}, du plus au moins énergivore.<br>${d === plusSobre ? "C'est la configuration la plus sobre de notre sélection." : `Environ ${fmtRapport(rapportSobre)} fois la plus sobre (${plusSobre.modele}).`}<br>${rapportMed >= 1 ? `${fmtRapport(rapportMed)} fois la médiane (${fmt(mediane)} Wh).` : `${fmtRapport(1 / rapportMed)} fois moins que la médiane (${fmt(mediane)} Wh).`}</p>`;
      fiche.classList.remove("change");
    }, 180);
  };
  const choisir = m => {
    racine.classList.add("choix");
    for (const {d, g} of groupes) g.classList.toggle("actif", d.modele === m);
    const d = lignes.find(x => x.modele === m);
    if (d) { afficherFiche(d); racine.dataset.modele = m; }
  };
  for (const {d, g} of groupes) {
    g.addEventListener("click", () => choisir(d.modele));
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choisir(d.modele); } });
    const montrer = () => {
      bulle.textContent = `${d.modele} · ${fmt(d.energie_milieu_Wh)} Wh`;
      const r = g.getBoundingClientRect(), rr = racine.getBoundingClientRect();
      bulle.style.left = `${Math.max(6, Math.min(rr.width - 200, r.left - rr.left + r.width / 2 - 70))}px`;
      bulle.style.top = `${Math.max(6, r.top - rr.top - 34)}px`;
      bulle.style.opacity = "1";
    };
    g.addEventListener("mouseenter", montrer); g.addEventListener("focus", montrer);
    g.addEventListener("mouseleave", () => (bulle.style.opacity = "0")); g.addEventListener("blur", () => (bulle.style.opacity = "0"));
  }

  racine.setAttribute("role", "figure");
  racine.setAttribute("aria-label", `Constellation de ${n} configurations d'IA dont la surface est proportionnelle à l'électricité estimée par requête de 150 tokens. ${conclusion.textContent}`);
  racine.append(style, titre, st, outils, scene, conclusion, note, source, bulle);
  racine.choisir = choisir;
  racine.spheres = groupes.map(({d}) => ({modele: d.modele, valeur: d.energie_milieu_Wh, rayon: d.r, rayonReel: d.rReel, x: d.x, y: d.y}));
  choisir(lignes[0].modele);
  return racine;
}
)};

const _205 = function(dessinerConstellation,donneesV1,width){return(
dessinerConstellation(donneesV1, {largeur: Math.min(width, 980)})
)};

const _181 = (md) => {
return (
md`### V2 — Carte de lieux : « Le numérique a une adresse »

| Élément | Contenu |
|---|---|
| 1. Question | Où se trouvent les installations localisées de notre sélection en France métropolitaine ? |
| 2. Famille | Carte de lieux (points), en deux cartes interactives visibles en même temps : la France métropolitaine et un zoom sur l'Île-de-France. La question est un « où ? » : sans mesure de consommation par centre, une carte de valeurs serait infondée, d'autant que l'inventaire n'est pas exhaustif. |
| 3. Encodage et justification | Fond OpenStreetMap (Leaflet), zoom et déplacement possibles sur les deux cartes. Un petit marqueur circulaire par installation, à ses coordonnées d'origine : les 23 installations sont affichées une par une, sans regroupement automatique. Couleur : orange si la zone du centre dispose d'une donnée de consommation électrique, gris sinon ; nos fichiers ne contenant aucune donnée de consommation par zone, tous les points sont gris, ce que la légende et la note indiquent. La carte de droite reprend les mêmes marqueurs, cadrée sur les 18 installations franciliennes. Les points superposés (campus de Saint-Denis, Pantin, Vélizy) s'ouvrent en éventail au clic, sans modifier les coordonnées. Au clic : nom, exploitant, adresse, région, statut de la donnée électrique et précision de la localisation. |
| 4. Dénominateur | 23 installations à localisation vérifiée, sur 39 entrées du fichier ; aucune consommation n'est rapportée à ces installations. |
| 5. Titre et sous-titre porteur | « Le numérique a une adresse » — Derrière chaque requête, il y a des bâtiments bien réels : des centres de données installés dans des villes et des zones d'activité. |
| 6. Alternative textuelle | Deux cartes interactives : la France métropolitaine avec 23 installations localisées et un zoom sur l'Île-de-France avec 18 installations. 18 des 23 installations se trouvent en Île-de-France, avec des concentrations à Saint-Denis (4), Aubervilliers (2), Pantin (2) et Vélizy-Villacoublay (2). Les 5 autres se répartissent dans 5 régions, une installation chacune. |`
)
};

const _201 = function dessinerCarte(ResizeObserver){return(
function dessinerCarte(installations, {L, consommationsZones = null, entreesTotal = null, cssLeaflet = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css", hauteur = 460} = {}) {
  // Composant autonome : reçoit les installations et la bibliothèque Leaflet (L) en paramètres.
  // consommationsZones (facultatif) : Map ou objet {cleZone: {valeur, unite, annee, zone}} ; clé = installation.zone_conso.
  if (!L) throw new Error("dessinerCarte : la bibliothèque Leaflet doit être passée dans l'option L.");
  if (cssLeaflet && !document.querySelector(`link[href="${cssLeaflet}"]`)) {
    const lien = document.createElement("link"); lien.rel = "stylesheet"; lien.href = cssLeaflet; document.head.append(lien);
  }
  const ORANGE = "#EF8B34", GRIS = "#6B7280";
  const fmt = v => new Intl.NumberFormat("fr-FR", {maximumSignificantDigits: 3}).format(v);
  const conso = i => {
    if (!consommationsZones || i.zone_conso == null) return null;
    return (consommationsZones instanceof Map ? consommationsZones.get(i.zone_conso) : consommationsZones[i.zone_conso]) ?? null;
  };
  const points = installations.filter(i => Number.isFinite(i.latitude) && Number.isFinite(i.longitude));
  const estIdf = i => i.region === "Île-de-France";
  const nbAvecConso = points.filter(i => conso(i)).length;

  const racine = document.createElement("section");
  racine.className = "dlp-carte";
  const style = document.createElement("style");
  style.textContent = `
    .dlp-carte{--texte:#1f2328;--texte2:#5b616b;--bord:#e5e3dd;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--texte);background:#fbfaf7;border:1px solid var(--bord);border-radius:16px;padding:24px clamp(14px,3vw,32px) 18px;max-width:1100px;box-sizing:border-box}
    .dlp-carte *{box-sizing:border-box}
    .dlp-carte h3{margin:0 0 4px;font-size:clamp(20px,2.4vw,26px);line-height:1.2;font-weight:750}
    .dlp-carte .st{margin:0 0 16px;font-size:14px;line-height:1.5;color:var(--texte2);max-width:70ch}
    .dlp-carte .cartes{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    @media (max-width:760px){.dlp-carte .cartes{grid-template-columns:1fr}}
    .dlp-carte .bloc h4{margin:0 0 6px;font-size:15px;font-weight:700}
    .dlp-carte .bloc h4 span{font-weight:400;color:var(--texte2);font-size:13px}
    .dlp-carte .fond{height:${hauteur}px;border-radius:10px;border:1px solid var(--bord);overflow:hidden;background:#e8e6e1}
    .dlp-carte .legende{display:flex;flex-wrap:wrap;gap:8px 22px;align-items:center;margin:12px 0 0;font-size:13px}
    .dlp-carte .legende i{display:inline-block;width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.35);margin-right:6px;vertical-align:-1px}
    .dlp-carte .note,.dlp-carte .conclusion{margin:12px 0 0;font-size:13.5px;line-height:1.55;max-width:80ch}
    .dlp-carte .conclusion{padding:10px 14px;border-left:4px solid ${ORANGE};background:#fff;border-radius:0 10px 10px 0}
    .dlp-carte figcaption{margin-top:10px;font-size:11.5px;line-height:1.45;color:var(--texte2)}
    .dlp-carte .leaflet-popup-content{margin:10px 12px;font-size:12.5px;line-height:1.45;color:#1f2328}
    .dlp-carte .leaflet-popup-content strong{font-size:13.5px}
    .dlp-carte .leaflet-container img.leaflet-tile{max-width:none!important;max-height:none!important;border:0!important;margin:0!important;padding:0!important}
  `;
  const titre = document.createElement("h3");
  titre.textContent = "Le numérique a une adresse";
  const intro = document.createElement("p");
  intro.className = "st";
  intro.textContent = "Derrière chaque requête, il y a des bâtiments bien réels : des centres de données installés dans des villes et des zones d'activité. Chaque point est une installation de notre sélection dont l'emplacement a été vérifié.";

  const cartes = document.createElement("div");
  cartes.className = "cartes";
  const bloc = (t, n) => {
    const b = document.createElement("div"); b.className = "bloc";
    const h = document.createElement("h4"); h.innerHTML = `${t} <span>· ${n} installation${n > 1 ? "s" : ""}</span>`;
    const f = document.createElement("div"); f.className = "fond";
    b.append(h, f); cartes.append(b); return f;
  };
  const fondFrance = bloc("France métropolitaine", points.length);
  const pointsIdf = points.filter(estIdf);
  const fondIdf = bloc("Île-de-France", pointsIdf.length);

  const legende = document.createElement("p");
  legende.className = "legende";
  legende.innerHTML = `<span><i style="background:${ORANGE}"></i>Zone avec donnée de consommation électrique (${nbAvecConso})</span><span><i style="background:${GRIS}"></i>Zone sans donnée électrique correspondante (${points.length - nbAvecConso})</span><span style="color:var(--texte2)">Cliquez sur un point pour le détail ; les points superposés s'ouvrent en éventail.</span>`;

  const parVille = Object.entries(points.reduce((acc, i) => ((acc[i.ville] = (acc[i.ville] ?? 0) + 1), acc), {})).sort((a, b) => b[1] - a[1]);
  const regions = new Set(points.map(i => i.region));
  const conclusion = document.createElement("p");
  conclusion.className = "conclusion";
  const villesMulti = parVille.filter(([, n]) => n > 1).map(([v, n]) => `${v} (${n})`);
  const horsIdf = points.filter(i => !estIdf(i));
  const parRegion = Object.values(horsIdf.reduce((acc, i) => ((acc[i.region] = (acc[i.region] ?? 0) + 1), acc), {}));
  const nbRegions = parRegion.length;
  conclusion.textContent = `${pointsIdf.length} des ${points.length} installations localisées se trouvent en Île-de-France${villesMulti.length ? `, avec des concentrations à ${villesMulti.join(", ")}` : ""}. Les ${horsIdf.length} autres se répartissent dans ${nbRegions} région${nbRegions > 1 ? "s" : ""}${parRegion.every(n => n === 1) ? ", une installation chacune" : ""}.`;

  const note = document.createElement("p");
  note.className = "note";
  note.textContent = (entreesTotal ? `Notre fichier compte ${entreesTotal} entrées : ${points.length} sont géolocalisées et affichées, chacune par son propre point ; les ${entreesTotal - points.length} autres, dont l'emplacement n'est pas vérifié, ne figurent pas sur la carte. ` : "") +
    (consommationsZones ? "La consommation affichée est celle de la zone où se trouve le centre, tous consommateurs confondus : ce n'est pas la consommation du centre lui-même. " : "Nos fichiers ne contiennent aucune donnée de consommation électrique par zone : tous les centres apparaissent donc en gris. ") +
    "Cette carte montre une sélection documentée, pas l'ensemble des centres de données français, et n'indique pas où sont traitées les requêtes d'IA.";
  const source = document.createElement("figcaption");
  source.textContent = "Sources : Datacenters France v2 (OpenStreetMap et vérifications des 19 et 20/10/2026) · fond de carte © contributeurs OpenStreetMap (ODbL).";

  racine.setAttribute("role", "figure");
  racine.setAttribute("aria-label", `Deux cartes interactives : la France métropolitaine avec ${points.length} installations localisées et un zoom sur l'Île-de-France avec ${pointsIdf.length} installations. ${conclusion.textContent}`);
  racine.append(style, titre, intro, cartes, legende, conclusion, note, source);

  const popup = i => {
    const c = conso(i);
    const lignes = [
      `<strong>${i.nom ?? "Centre sans nom"}</strong>`,
      i.exploitant ? `Exploitant : ${i.exploitant}` : null,
      i.adresse ? `${i.adresse}` : (i.ville ? i.ville : null),
      i.region ? `Région : ${i.region}` : null,
      c ? `Consommation électrique de la zone${c.zone ? " (" + c.zone + ")" : ""} : ${fmt(c.valeur)} ${c.unite}${c.annee ? ", " + c.annee : ""}<br><em>Consommation de toute la zone, pas celle du centre.</em>` : "Donnée électrique : aucune donnée de zone correspondante",
      i.precision ? `<span style="color:#5b616b">Localisation : ${i.precision.replace(/_/g, " ")}</span>` : null
    ];
    return lignes.filter(Boolean).join("<br>");
  };

  const creerCarte = (fond, liste, vue) => {
    const carte = L.map(fond, {scrollWheelZoom: false, zoomControl: true, attributionControl: true, zoomSnap: 0.25, zoomDelta: 0.5});
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom: 19, attribution: "© contributeurs OpenStreetMap"}).addTo(carte);
    const calque = L.layerGroup().addTo(carte);
    const eventail = L.layerGroup().addTo(carte);
    const marqueurs = liste.map(i => {
      const m = L.circleMarker([i.latitude, i.longitude], {radius: 6, color: "#ffffff", weight: 1.5, fillColor: conso(i) ? ORANGE : GRIS, fillOpacity: 0.95});
      m.installation = i;
      m.on("click", e => { L.DomEvent.stopPropagation(e); ouvrirOuEventail(m); });
      m.on("mouseover", () => m.setStyle({radius: 8})); m.on("mouseout", () => m.setStyle({radius: 6}));
      m.addTo(calque);
      return m;
    });
    const fermerEventail = () => { eventail.clearLayers(); marqueurs.forEach(m => m.setStyle({opacity: 1, fillOpacity: 0.95})); };
    const ouvrirOuEventail = m => {
      const p = carte.latLngToLayerPoint(m.getLatLng());
      const voisins = marqueurs.filter(x => carte.latLngToLayerPoint(x.getLatLng()).distanceTo(p) < 14);
      if (voisins.length < 2) { fermerEventail(); L.popup({maxWidth: 240, autoPanPadding: [16, 16]}).setLatLng(m.getLatLng()).setContent(popup(m.installation)).openOn(carte); return; }
      fermerEventail();
      const centre = voisins.map(x => carte.latLngToLayerPoint(x.getLatLng())).reduce((a, b) => a.add(b)).divideBy(voisins.length);
      const rayon = 26 + voisins.length * 4;
      voisins.forEach((x, k) => {
        const angle = (2 * Math.PI * k) / voisins.length - Math.PI / 2;
        const cible = carte.layerPointToLatLng(L.point(centre.x + rayon * Math.cos(angle), centre.y + rayon * Math.sin(angle)));
        L.polyline([x.getLatLng(), cible], {color: "#1f2328", weight: 1, opacity: 0.6, interactive: false}).addTo(eventail);
        const copie = L.circleMarker(cible, {radius: 7, color: "#ffffff", weight: 2, fillColor: x.options.fillColor, fillOpacity: 1});
        copie.bindPopup(popup(x.installation), {maxWidth: 240, autoPanPadding: [16, 16]});
        copie.on("click", e => { L.DomEvent.stopPropagation(e); copie.openPopup(); });
        copie.bindTooltip(x.installation.nom ?? "", {direction: "top", offset: [0, -6]});
        copie.addTo(eventail);
        x.setStyle({opacity: 0.25, fillOpacity: 0.25});
      });
    };
    carte.on("click zoomstart", fermerEventail);
    const ajuster = () => vue.bounds ? carte.fitBounds(vue.bounds, {padding: [24, 24], maxZoom: vue.maxZoom ?? 12}) : carte.setView(vue.centre, vue.zoom);
    ajuster();
    let premier = true;
    new ResizeObserver(() => { carte.invalidateSize(); if (premier && fond.clientWidth > 0) { premier = false; ajuster(); } }).observe(fond);
    return carte;
  };
  const boundsIdf = pointsIdf.length ? L.latLngBounds(pointsIdf.map(i => [i.latitude, i.longitude])) : null;
  racine.cartes = {
    france: creerCarte(fondFrance, points, {bounds: L.latLngBounds([[42.3, -4.8], [51.1, 8.2]])}),
    idf: creerCarte(fondIdf, pointsIdf, boundsIdf ? {bounds: boundsIdf, maxZoom: 13} : {centre: [48.86, 2.35], zoom: 10})
  };
  racine.dataset.points = String(points.length);
  return racine;
}
)};

const _202 = async function(datacentersBrut,dessinerCarte)
{
  const L = await import("https://cdn.jsdelivr.net/npm/leaflet@1.9.4/+esm");
  const installations = datacentersBrut
    .filter(d => d.statut === "localisation_verifiee" && Number.isFinite(d.latitude) && Number.isFinite(d.longitude))
    .map(d => ({id: d.id, nom: d.nom, exploitant: d.exploitant, ville: d.ville, region: d.region, adresse: d.adresse, precision: d.precision, latitude: d.latitude, longitude: d.longitude}));
  return dessinerCarte(installations, {L, entreesTotal: datacentersBrut.length});
}
;

const _182 = (md) => {
return (
md`### V3 — Comparaison : « Une tâche, un impact »

| Élément | Contenu |
|---|---|
| 1. Question | Comment les consommations énergétiques GPU mesurées varient-elles selon les tâches d'intelligence artificielle évaluées ? |
| 2. Famille | Comparaison : classement en barres horizontales, avec choix de l'échelle. |
| 3. Encodage et justification | Un seul classement des dix tâches de la campagne de février 2025, triées de la plus haute à la plus basse médiane ; longueur de barre = médiane de l'énergie GPU par requête ; une couleur par tâche (le nom complet de chaque tâche reste écrit, la couleur ne porte pas seule l'information) ; valeur en Wh écrite à droite de chaque barre ; moyenne, minimum, maximum et nombre de modèles évalués au survol ou au clavier. Les médianes s'étendent de 0,00059 à 0,35 Wh : un bouton bascule, avec transition animée, entre une échelle logarithmique (graduations ×10 de 0,0001 à 1 Wh ; toutes les tâches restent lisibles, mais les longueurs ne sont pas proportionnelles, ce qui est écrit sous les boutons) et une échelle linéaire (longueurs proportionnelles ; les petites barres deviennent très courtes, leur valeur reste écrite). Une phrase calcule, à partir des données, l'écart entre génération d'images et génération de texte. La campagne de décembre 2025 (raisonnement, génération de texte) n'est pas représentée ici pour ne pas mélanger les campagnes ; elle reste dans \`donneesV3\` et en section 04. |
| 4. Dénominateur | Wh GPU par requête du benchmark ; médiane calculée parmi les modèles évalués pour chaque tâche (campagne de février 2025). |
| 5. Titre et sous-titre porteur | « Une tâche, un impact » — Énergie GPU médiane par requête pour 10 tâches d'IA évaluées par AI Energy Score (campagne de février 2025) : de la classification à la génération, les écarts sont considérables. |
| 6. Alternative textuelle | Classement des 10 tâches de la campagne de février 2025 par énergie GPU médiane par requête. En tête : génération d'images (0,35 Wh) ; en dernier : similarité de phrases (0,00059 Wh). Dans ces évaluations, la génération d'images nécessite environ 21 fois plus d'énergie GPU par requête que la génération de texte (0,35 Wh contre 0,017 Wh). |`
)
};

const _199 = function dessinerTaches(){return(
function dessinerTaches(donnees, {campagne = "Février 2025", echelle = "log", comparaison = ["Génération d'images", "Génération de texte"]} = {}) {
  // Composant autonome : un seul classement, bascule animée entre échelle logarithmique et linéaire.
  const couleurs = ["#2878D0", "#EF8B34", "#269A77", "#9461CC", "#D95774", "#1A9BB0", "#C9A227", "#5A6FD6", "#6E9E3A", "#B0663A"];
  const fmt = v => new Intl.NumberFormat("fr-FR", {maximumSignificantDigits: v >= 0.1 ? 2 : 2}).format(v);
  const lignes = donnees.filter(d => d.campagne === campagne).sort((a, b) => b.mediane_Wh_req - a.mediane_Wh_req);
  const meds = lignes.map(d => d.mediane_Wh_req);
  const lo = 10 ** Math.floor(Math.log10(Math.min(...meds)));
  const hi = 10 ** Math.ceil(Math.log10(Math.max(...meds)));
  const pasLin = (() => { const m = Math.max(...meds) / 4, p = 10 ** Math.floor(Math.log10(m)); return [1, 2, 2.5, 5, 10].map(k => k * p).find(s => s >= m); })();
  const hiLin = Math.ceil(Math.max(...meds) * 1.08 / pasLin) * pasLin;
  const pos = (v, e) => e === "log" ? 100 * (Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo)) : 100 * v / hiLin;
  const graduations = e => {
    if (e === "log") { const t = []; for (let x = lo; x <= hi * 1.0001; x *= 10) t.push(x); return t; }
    const t = []; for (let x = 0; x <= hiLin + 1e-12; x += pasLin) t.push(+x.toPrecision(6)); return t;
  };

  const racine = document.createElement("section");
  racine.className = "dlp-taches";
  const style = document.createElement("style");
  style.textContent = `
    .dlp-taches{--fond:#fbfaf7;--texte:#1f2328;--texte2:#5b616b;--bord:#e5e3dd;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--texte);background:var(--fond);border:1px solid var(--bord);border-radius:16px;padding:24px clamp(14px,3vw,32px) 18px;max-width:1000px;box-sizing:border-box;position:relative}
    .dlp-taches *{box-sizing:border-box}
    .dlp-taches h3{margin:0 0 4px;font-size:clamp(20px,2.4vw,26px);line-height:1.2;font-weight:750;letter-spacing:-.01em}
    .dlp-taches .st{margin:0 0 16px;font-size:14px;line-height:1.5;color:var(--texte2);max-width:64ch}
    .dlp-taches .bascule{display:inline-flex;background:#efede8;border-radius:999px;padding:3px;margin:0 0 8px}
    .dlp-taches .bascule button{font:inherit;font-size:13px;border:0;background:transparent;color:var(--texte);padding:7px 14px;border-radius:999px;cursor:pointer;transition:background .25s,color .25s}
    .dlp-taches .bascule button[aria-pressed="true"]{background:var(--texte);color:#fff}
    .dlp-taches .bascule button:focus-visible{outline:3px solid #2878D0;outline-offset:2px}
    .dlp-taches .explication{margin:0 0 14px;font-size:13px;line-height:1.5;color:var(--texte2);min-height:2.9em;max-width:72ch}
    .dlp-taches .graphe{display:grid;grid-template-columns:minmax(118px,190px) 1fr minmax(76px,auto);column-gap:12px;row-gap:9px;align-items:center;position:relative}
    .dlp-taches .nom{font-size:13.5px;text-align:right;line-height:1.2}
    .dlp-taches .piste{position:relative;height:22px}
    .dlp-taches .barre{position:absolute;left:0;top:0;bottom:0;border-radius:0 5px 5px 0;min-width:3px;transition:width .9s cubic-bezier(.2,.8,.2,1)}
    .dlp-taches .ligne{display:contents}
    .dlp-taches .piste:focus-visible{outline:3px solid #2878D0;outline-offset:3px;border-radius:4px}
    .dlp-taches .val{font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}
    .dlp-taches .grille{grid-column:2;position:relative;align-self:stretch;pointer-events:none;z-index:0}
    .dlp-taches .piste{z-index:1}
    .dlp-taches .grille i{position:absolute;top:-4px;bottom:-4px;width:1px;background:#e5e3dd;transition:left .9s cubic-bezier(.2,.8,.2,1),opacity .4s}
    .dlp-taches .axe{grid-column:2;position:relative;height:30px;font-size:11.5px;color:var(--texte2)}
    .dlp-taches .axe span{position:absolute;top:2px;transform:translateX(-50%);white-space:nowrap;transition:left .9s cubic-bezier(.2,.8,.2,1),opacity .4s}
    .dlp-taches .axe .titre-axe{position:absolute;right:0;top:16px;transform:none}
    .dlp-taches .conclusion{margin:18px 0 0;padding:12px 14px;border-left:4px solid #EF8B34;background:#fff;border-radius:0 10px 10px 0;font-size:14.5px;line-height:1.5}
    .dlp-taches figcaption{margin-top:10px;font-size:11.5px;line-height:1.45;color:var(--texte2)}
    .dlp-taches .bulle{position:absolute;z-index:5;pointer-events:none;background:#fff;color:var(--texte);border:1px solid #cfccc4;box-shadow:0 6px 20px rgba(0,0,0,.12);border-radius:10px;padding:9px 11px;font-size:12.5px;line-height:1.45;max-width:260px;opacity:0;transition:opacity .15s}
    @media (max-width:520px){.dlp-taches .axe span.sec{opacity:0}.dlp-taches .graphe{grid-template-columns:minmax(96px,120px) 1fr auto;column-gap:8px}.dlp-taches .nom{font-size:12px}}
    @media (prefers-reduced-motion:reduce){.dlp-taches *{transition:none!important}}
  `;
  const titre = document.createElement("h3");
  titre.textContent = "Une tâche, un impact";
  const sousTitre = document.createElement("p");
  sousTitre.className = "st";
  sousTitre.textContent = `Énergie GPU médiane par requête pour ${lignes.length} tâches d'IA évaluées par AI Energy Score (campagne de ${campagne.toLowerCase()}) : de la classification à la génération, les écarts sont considérables.`;
  const bascule = document.createElement("div");
  bascule.className = "bascule";
  bascule.setAttribute("role", "group");
  bascule.setAttribute("aria-label", "Choix de l'échelle");
  const boutons = {};
  for (const [cle, txt] of [["log", "Échelle logarithmique"], ["lin", "Échelle linéaire"]]) {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = txt; b.dataset.echelle = cle;
    b.addEventListener("click", () => appliquer(cle));
    boutons[cle] = b; bascule.append(b);
  }
  const explication = document.createElement("p");
  explication.className = "explication";
  explication.setAttribute("aria-live", "polite");

  const graphe = document.createElement("div");
  graphe.className = "graphe";
  const grille = document.createElement("div");
  grille.className = "grille";
  const bulle = document.createElement("div");
  bulle.className = "bulle";
  bulle.setAttribute("role", "tooltip");
  const elements = lignes.map((d, k) => {
    const ligne = document.createElement("div");
    ligne.className = "ligne";
    ligne.dataset.tache = d.tache;
    const etiquette = ( `${d.tache} : ${fmt(d.mediane_Wh_req)} Wh par requête (médiane de ${d.n_evaluations} évaluations)`);
    const nom = document.createElement("div"); nom.className = "nom"; nom.textContent = d.tache;
    const piste = document.createElement("div"); piste.className = "piste"; piste.tabIndex = 0; piste.setAttribute("aria-label", etiquette);
    const barre = document.createElement("div"); barre.className = "barre"; barre.style.background = couleurs[k % couleurs.length]; barre.style.width = "0%";
    piste.append(barre);
    const val = document.createElement("div"); val.className = "val"; val.textContent = `${fmt(d.mediane_Wh_req)} Wh`;
    [nom, piste, val].forEach((el, col) => { el.style.gridRow = String(k + 1); el.style.gridColumn = String(col + 1); });
    ligne.append(nom, piste, val);
    const montrer = () => {
      bulle.innerHTML = `<strong>${d.tache}</strong><br>Médiane : ${fmt(d.mediane_Wh_req)} Wh par requête<br>Moyenne : ${fmt(d.moyenne_Wh_req)} Wh<br>Évaluations : de ${fmt(d.min_Wh_req)} à ${fmt(d.max_Wh_req)} Wh<br>${d.n_evaluations} modèles évalués · ${d.campagne}${d.origine_campagne && d.origine_campagne !== "date du CSV" ? " (campagne indiquée par le leaderboard)" : ""}`;
      const r = piste.getBoundingClientRect(), rr = racine.getBoundingClientRect();
      bulle.style.left = `${Math.min(rr.width - 270, Math.max(8, r.left - rr.left + 20))}px`;
      bulle.style.top = `${r.bottom - rr.top + 6}px`;
      bulle.style.opacity = "1";
    };
    const cacher = () => (bulle.style.opacity = "0");
    for (const el of [nom, piste, val]) { el.addEventListener("mouseenter", montrer); el.addEventListener("mouseleave", cacher); }
    piste.addEventListener("focus", montrer); piste.addEventListener("blur", cacher);
    graphe.append(ligne);
    return {d, barre};
  });
  const axe = document.createElement("div");
  axe.className = "axe";
  grille.style.gridRow = `1 / span ${lignes.length}`;
  axe.style.gridRow = String(lignes.length + 1);
  graphe.append(grille, axe);

  const [a, b] = comparaison.map(t => lignes.find(d => d.tache === t));
  const conclusion = document.createElement("p");
  conclusion.className = "conclusion";
  if (a && b) {
    const r = a.mediane_Wh_req / b.mediane_Wh_req;
    const rTxt = r >= 10 ? Math.round(r) : new Intl.NumberFormat("fr-FR", {maximumFractionDigits: 1}).format(r);
    conclusion.textContent = `Dans ces évaluations, la ${a.tache.toLowerCase()} nécessite environ ${rTxt} fois plus d'énergie GPU par requête que la ${b.tache.toLowerCase()} (médianes : ${fmt(a.mediane_Wh_req)} Wh contre ${fmt(b.mediane_Wh_req)} Wh).`;
  }
  const source = document.createElement("figcaption");
  source.textContent = "Source : AI Energy Score (Hugging Face), énergie des GPU mesurée sur NVIDIA H100, médiane des modèles évalués pour chaque tâche. Il s'agit de la consommation des GPU pendant le benchmark, pas de la consommation électrique totale des équipements (serveurs, refroidissement, réseau). Chaque tâche a son propre jeu de requêtes.";

  function appliquer(e) {
    for (const [cle, bt] of Object.entries(boutons)) bt.setAttribute("aria-pressed", String(cle === e));
    explication.textContent = e === "log"
      ? `Échelle logarithmique : chaque graduation multiplie la valeur par 10 (de ${fmt(lo)} à ${fmt(hi)} Wh). Toutes les tâches restent lisibles, mais les longueurs ne sont pas proportionnelles aux consommations.`
      : `Échelle linéaire : les longueurs sont proportionnelles aux consommations (de 0 à ${fmt(hiLin)} Wh). Les plus petites barres deviennent très courtes, c'est normal : leur valeur reste écrite à droite.`;
    for (const {d, barre} of elements) barre.style.width = `${Math.max(0, pos(d.mediane_Wh_req, e))}%`;
    const t = graduations(e);
    grille.innerHTML = ""; axe.innerHTML = "";
    for (const x of t) {
      const g = document.createElement("i"); g.style.left = `${pos(Math.max(x, e === "log" ? lo : 0), e)}%`; grille.append(g);
      const s = document.createElement("span"); if (t.indexOf(x) % 2 === 1) s.className = "sec"; s.style.left = `${pos(Math.max(x, e === "log" ? lo : 0), e)}%`; s.textContent = fmt(x); axe.append(s);
    }
    const ta = document.createElement("span"); ta.className = "titre-axe"; ta.textContent = "Wh GPU par requête →"; axe.append(ta);
    racine.dataset.echelle = e;
  }

  racine.setAttribute("role", "figure");
  racine.setAttribute("aria-label", `Classement des ${lignes.length} tâches de la campagne de ${campagne.toLowerCase()} par énergie GPU médiane par requête. En tête : ${lignes[0].tache} (${fmt(lignes[0].mediane_Wh_req)} Wh) ; en dernier : ${lignes[lignes.length - 1].tache} (${fmt(lignes[lignes.length - 1].mediane_Wh_req)} Wh). ${conclusion.textContent}`);
  racine.append(style, titre, sousTitre, bascule, explication, graphe, conclusion, source, bulle);
  racine.appliquer = appliquer;
  appliquer(echelle);
  requestAnimationFrame(() => requestAnimationFrame(() => appliquer(racine.dataset.echelle)));
  return racine;
}
)};

const _200 = function(dessinerTaches,donneesV3){return(
dessinerTaches(donneesV3, {campagne: "Février 2025", echelle: "log"})
)};

const _183 = (md) => {
return (
md`### V4 — Interaction : « L'empreinte invisible d'une requête »

**Question du lecteur :** « Si j'envoie une requête à tel modèle, combien d'eau, de gaz à effet de serre et d'électricité cela représente-t-il ? »

| Élément | Contenu |
|---|---|
| 1. Question | Si j'envoie une requête à tel modèle, combien d'eau, de gaz à effet de serre et d'électricité cela représente-t-il ? |
| 2. Famille | Chiffres clés interactifs : trois compteurs animés avec sélection du modèle. |
| 3. Encodage et justification | Boutons de sélection, utilisables au clavier, regroupés par fournisseur, pour les 8 configurations présentes dans nos données EcoLogits. Trois compteurs, chacun avec son unité et sa couleur : eau en mL (bleu), CO₂e en g (violet, converti depuis les mg du fichier), électricité en Wh (orange). Le grand nombre est le point milieu de l'estimation ; il défile jusqu'à la nouvelle valeur à chaque changement de modèle. L'intervalle min – max est écrit sous chaque compteur. L'anneau situe la valeur entre 0 et la plus forte estimation de notre sélection pour cet indicateur, bornes écrites ; les trois anneaux ont chacun leur échelle et ne se comparent pas entre eux. Pas d'axe commun aux trois indicateurs, dont les unités et ordres de grandeur diffèrent. Énergie primaire et ressources minérales restent dans \`donneesV4\` mais ne sont pas affichées. |
| 4. Dénominateur | Estimations par requête, scénario de 150 tokens générés avec mix électrique mondial ; anneau rapporté au maximum de notre sélection pour chaque indicateur. |
| 5. Titre et sous-titre porteur | « L'empreinte invisible d'une requête » — Choisissez un modèle : trois compteurs révèlent l'eau, les gaz à effet de serre et l'électricité estimés pour une seule requête de 150 tokens. |
| 6. Alternative textuelle | Trois compteurs indiquent, pour le modèle choisi, l'eau, les émissions de CO₂e et l'électricité estimées pour une requête de 150 tokens, avec l'intervalle minimum – maximum. Par exemple, pour gpt-4o : 1,38 mL d'eau, 0,156 g de CO₂e et 0,315 Wh d'électricité. Le texte alternatif du composant est mis à jour à chaque changement de modèle. |`
)
};

const _192 = function dessinerImpact(){return(
function dessinerImpact(donnees, {modeleInitial, animation = true, indicateurs} = {}) {
  // Composant autonome : reçoit ses données en paramètre, n'utilise aucune bibliothèque ni aucune variable extérieure.
  const defs = indicateurs ?? [
    {cle: "eau", libelle: "Eau", unite: "mL", facteur: 1, couleur: "#2878D0", phrase: "d'eau consommée"},
    {cle: "co2", libelle: "CO₂e", unite: "g", facteur: 0.001, couleur: "#9461CC", phrase: "de gaz à effet de serre"},
    {cle: "electricite", libelle: "Électricité", unite: "Wh", facteur: 1, couleur: "#EF8B34", phrase: "d'électricité"}
  ];
  const noms = {openai: "OpenAI", anthropic: "Anthropic", google_genai: "Google", mistralai: "Mistral AI"};
  const fmt = v => {
    if (!Number.isFinite(v)) return "—";
    if (v === 0) return "0";
    return new Intl.NumberFormat("fr-FR", {maximumSignificantDigits: 3}).format(v);
  };
  const lignes = donnees.filter(d => defs.some(i => i.cle === d.indicateur));
  const modeles = [...new Set(lignes.map(d => d.modele))];
  const fournisseurDe = m => lignes.find(d => d.modele === m)?.fournisseur ?? "";
  modeles.sort((a, b) => (fournisseurDe(a) + a).localeCompare(fournisseurDe(b) + b));
  const valeur = (m, i) => {
    const d = lignes.find(x => x.modele === m && x.indicateur === i.cle);
    return d ? {milieu: d.milieu * i.facteur, min: d.min * i.facteur, max: d.max * i.facteur} : null;
  };
  const maxima = Object.fromEntries(defs.map(i => {
    const v = lignes.filter(d => d.indicateur === i.cle).map(d => d.milieu * i.facteur);
    const m = Math.max(...v);
    return [i.cle, {valeur: m, modele: lignes.find(d => d.indicateur === i.cle && d.milieu * i.facteur === m)?.modele}];
  }));

  const racine = document.createElement("section");
  racine.className = "dlp-impact";
  const style = document.createElement("style");
  style.textContent = `
    .dlp-impact{--fond:#fbfaf7;--texte:#1f2328;--texte2:#5b616b;--bord:#e5e3dd;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--texte);background:var(--fond);border:1px solid var(--bord);border-radius:16px;padding:24px clamp(16px,3vw,32px) 18px;max-width:1000px;box-sizing:border-box}
    .dlp-impact *{box-sizing:border-box}
    .dlp-impact h3{margin:0 0 4px;font-size:clamp(20px,2.4vw,26px);line-height:1.2;font-weight:750;letter-spacing:-.01em}
    .dlp-impact .st{margin:0 0 18px;font-size:14px;line-height:1.5;color:var(--texte2);max-width:64ch}
    .dlp-impact .choix{display:flex;flex-wrap:wrap;gap:8px 18px;margin:0 0 22px;padding:0;border:0}
    .dlp-impact .groupe{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
    .dlp-impact .groupe>span{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--texte2);margin-right:2px}
    .dlp-impact button.modele{font:inherit;font-size:13.5px;padding:7px 12px;border-radius:999px;border:1px solid var(--bord);background:#fff;color:var(--texte);cursor:pointer;transition:background .2s,border-color .2s,color .2s,transform .2s}
    .dlp-impact button.modele:hover{border-color:#b9b6ad;transform:translateY(-1px)}
    .dlp-impact button.modele:focus-visible{outline:3px solid #2878D0;outline-offset:2px}
    .dlp-impact button.modele[aria-pressed="true"]{background:var(--texte);border-color:var(--texte);color:#fff}
    .dlp-impact .compteurs{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:16px}
    .dlp-impact .compteur{position:relative;background:#fff;border:1px solid var(--bord);border-radius:14px;padding:18px 16px 16px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:center;overflow:hidden}
    .dlp-impact .compteur::before{content:"";position:absolute;inset:auto -30% -60% auto;width:180px;height:180px;border-radius:50%;background:var(--c);opacity:.07;filter:blur(8px);transition:transform 1.2s ease}
    .dlp-impact .compteur.anime::before{transform:scale(1.25)}
    .dlp-impact .anneau{width:84px;height:84px}
    .dlp-impact .anneau circle{fill:none;stroke-width:9}
    .dlp-impact .anneau .piste{stroke:#efede8}
    .dlp-impact .anneau .jauge{stroke:var(--c);stroke-linecap:round;transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)}
    .dlp-impact .etiquette{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--c);margin:0 0 2px}
    .dlp-impact .valeur{font-size:clamp(26px,3vw,38px);font-weight:780;line-height:1.05;font-variant-numeric:tabular-nums;letter-spacing:-.02em;white-space:nowrap}
    .dlp-impact .valeur small{font-size:.45em;font-weight:650;color:var(--texte2);margin-left:4px;letter-spacing:0}
    .dlp-impact .phrase{font-size:13px;color:var(--texte2);margin:2px 0 0}
    .dlp-impact .detail{grid-column:1/-1;font-size:12px;line-height:1.45;color:var(--texte2);border-top:1px dashed var(--bord);padding-top:8px;margin:0}
    .dlp-impact .note{margin:16px 0 0;font-size:13px;line-height:1.55;max-width:75ch}
    .dlp-impact figcaption{margin-top:10px;font-size:11.5px;line-height:1.45;color:var(--texte2)}
    .dlp-impact .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
    @media (prefers-reduced-motion:reduce){.dlp-impact *{transition:none!important}}
  `;
  const titre = document.createElement("h3");
  titre.textContent = "L'empreinte invisible d'une requête";
  const sousTitre = document.createElement("p");
  sousTitre.className = "st";
  sousTitre.textContent = "Choisissez un modèle : trois compteurs révèlent l'eau, les gaz à effet de serre et l'électricité estimés pour une seule requête de 150 tokens.";

  const choix = document.createElement("fieldset");
  choix.className = "choix";
  const legende = document.createElement("legend");
  legende.className = "sr";
  legende.textContent = "Modèle d'IA";
  choix.append(legende);
  const boutons = new Map();
  for (const f of [...new Set(modeles.map(fournisseurDe))]) {
    const g = document.createElement("div");
    g.className = "groupe";
    const t = document.createElement("span");
    t.textContent = noms[f] ?? f;
    g.append(t);
    for (const m of modeles.filter(m => fournisseurDe(m) === f)) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "modele";
      b.textContent = m;
      b.dataset.modele = m;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => choisir(m));
      boutons.set(m, b);
      g.append(b);
    }
    choix.append(g);
  }

  const zone = document.createElement("div");
  zone.className = "compteurs";
  const R = 40, C = 2 * Math.PI * R;
  const compteurs = defs.map(i => {
    const carte = document.createElement("div");
    carte.className = "compteur";
    carte.style.setProperty("--c", i.couleur);
    carte.innerHTML = `
      <svg class="anneau" viewBox="0 0 100 100" aria-hidden="true"><circle class="piste" cx="50" cy="50" r="${R}"></circle><circle class="jauge" cx="50" cy="50" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C}"></circle></svg>
      <div><p class="etiquette">${i.libelle}</p><div class="valeur"><span class="nombre">0</span><small>${i.unite}</small></div><p class="phrase">${i.phrase} par requête</p></div>
      <p class="detail"></p>`;
    zone.append(carte);
    return {i, carte, nombre: carte.querySelector(".nombre"), jauge: carte.querySelector(".jauge"), detail: carte.querySelector(".detail"), courant: 0};
  });

  const annonce = document.createElement("p");
  annonce.className = "sr";
  annonce.setAttribute("aria-live", "polite");
  const note = document.createElement("p");
  note.className = "note";
  note.textContent = `Chaque compteur affiche le point milieu de l'estimation EcoLogits (choix de synthèse) ; l'intervalle minimum – maximum est indiqué dessous. L'anneau situe la valeur entre 0 et la plus forte estimation parmi les ${modeles.length} configurations de notre sélection, pour chaque indicateur séparément : les trois anneaux n'ont pas la même échelle et ne se comparent pas entre eux. Ces chiffres sont des estimations pour un scénario précis, pas des mesures de vos requêtes.`;
  const source = document.createElement("figcaption");
  source.textContent = "Source : EcoLogits, estimations collectées le 19/10/2026 · scénario de 150 tokens générés, mix électrique mondial · CO₂e converti de mg en g.";

  const animer = (cpt, cible) => {
    const depart = cpt.courant, t0 = performance.now(), duree = 900;
    const pas = t => {
      const p = Math.min(1, (t - t0) / duree), e = 1 - Math.pow(1 - p, 3);
      cpt.nombre.textContent = fmt(depart + (cible - depart) * e);
      if (p < 1) requestAnimationFrame(pas); else cpt.nombre.textContent = fmt(cible);
    };
    requestAnimationFrame(pas);
    cpt.courant = cible;
  };

  function choisir(m) {
    for (const [nom, b] of boutons) b.setAttribute("aria-pressed", String(nom === m));
    const resume = [];
    for (const cpt of compteurs) {
      const v = valeur(m, cpt.i);
      const max = maxima[cpt.i.cle];
      if (!v) { cpt.nombre.textContent = "—"; cpt.detail.textContent = "Pas d'estimation pour ce modèle."; continue; }
      const part = Math.min(1, v.milieu / max.valeur);
      cpt.jauge.setAttribute("stroke-dashoffset", String(C * (1 - Math.max(part, 0.012))));
      cpt.detail.textContent = `Estimation : ${fmt(v.min)} à ${fmt(v.max)} ${cpt.i.unite} · anneau : 0 à ${fmt(max.valeur)} ${cpt.i.unite} (${max.modele})`;
      cpt.carte.classList.remove("anime"); void cpt.carte.offsetWidth; cpt.carte.classList.add("anime");
      if (animation) animer(cpt, v.milieu); else { cpt.nombre.textContent = fmt(v.milieu); cpt.courant = v.milieu; }
      resume.push(`${fmt(v.milieu)} ${cpt.i.unite} ${cpt.i.phrase}`);
    }
    annonce.textContent = `${m} : ${resume.join(", ")} par requête.`;
    racine.setAttribute("aria-label", `Impacts estimés d'une requête de 150 tokens pour ${m} : ${resume.join(", ")}. Estimations EcoLogits, point milieu de l'intervalle.`);
    racine.dataset.modele = m;
  }

  racine.setAttribute("role", "figure");
  racine.append(style, titre, sousTitre, choix, zone, annonce, note, source);
  racine.choisir = choisir;
  choisir(modeleInitial && modeles.includes(modeleInitial) ? modeleInitial : modeles[0]);
  return racine;
}
)};

const _193 = function(dessinerImpact,donneesV4){return(
dessinerImpact(donneesV4, {modeleInitial: "gpt-4o"})
)};

const _195 = (md) => {
return (
md`**Test de la fonction autonome.** \`dessinerImpact\` est appelée ci-dessous sur un sous-ensemble de deux configurations (\`gpt-4o\` et \`claude-sonnet-4-6\`). Le test compte les boutons de modèles réellement produits et vérifie que seuls ces deux modèles sont proposés, puis qu'un changement de sélection met bien à jour les compteurs.`
)
};

const _196 = function testDessinerImpact(dessinerImpact,donneesV4)
{
  const attendus = ["gpt-4o", "claude-sonnet-4-6"];
  const composant = dessinerImpact(donneesV4.filter(d => attendus.includes(d.modele)), {animation: false});
  const proposes = [...composant.querySelectorAll("button.modele")].map(b => b.dataset.modele);
  composant.choisir("gpt-4o");
  const valeursAffichees = [...composant.querySelectorAll(".nombre")].map(n => n.textContent);
  return [
    {controle: "Modèles proposés par la fonction", obtenu: proposes.join(", "), statut: proposes.length === 2 && proposes.every(m => attendus.includes(m)) ? "OK" : "ÉCART"},
    {controle: "Compteurs affichés", obtenu: composant.querySelectorAll(".compteur").length, statut: composant.querySelectorAll(".compteur").length === 3 ? "OK" : "ÉCART"},
    {controle: "Valeurs après sélection de gpt-4o (eau, CO₂e, électricité)", obtenu: valeursAffichees.join(" · "), statut: composant.dataset.modele === "gpt-4o" ? "OK" : "ÉCART"}
  ];
}
;

const _197 = function(tableau,testDessinerImpact){return(
tableau(testDessinerImpact)
)};

const _184 = (md) => {
return (
md`## 07 — Préparation de l'intégration Astro

**Routes d'export**

| Visualisation | Route | Justification |
|---|---|---|
| V1 | A · rendu au build | Graphique statique : rien ne change chez le lecteur. |
| V2 | B · rendu chez le lecteur | Le lecteur explore la carte (survol, clic, agrandissement de l'Île-de-France). |
| V3 | A · rendu au build | Les médianes sont fixes : aucune donnée ne bouge chez le lecteur. |
| V4 | B · rendu chez le lecteur | Le lecteur choisit l'indicateur : le graphique doit être redessiné dans la page. |

**Données exportées.** \`exportsAstro\` contient une table par visualisation, avec uniquement les colonnes utiles, l'unité et le scénario ou le dénominateur. Les valeurs sont arrondies à trois chiffres significatifs plutôt qu'à deux décimales, pour ne pas ramener à zéro les très petites valeurs (ressources minérales de l'ordre de 10⁻¹¹ kg Sb eq) ; les coordonnées restent celles d'origine. Le fond de carte (\`regions-version-simplifiee.geojson\`, environ 220 Ko, déjà simplifié) sera copié comme fichier statique avec son attribution. Aucun fichier brut du défi n'est copié dans le dépôt du site.

**Fonction autonome : V4.** \`dessinerImpact(donnees, {indicateur, largeur, couleurs})\` reçoit un tableau au format de \`donneesV4\` et renvoie un composant HTML complet (titre, sélecteur de modèles, trois compteurs animés, note, source, alternative textuelle dans \`aria-label\`, mise à jour à chaque sélection). Elle n'utilise ni \`FileAttachment\`, ni \`viewof\`, ni \`width\`, ni aucune cellule du notebook, ni bibliothèque externe : seulement ses paramètres et le DOM du navigateur. Dans Astro, elle se copie telle quelle.

**Test réalisé.** Sous la V4, \`testDessinerImpact\` appelle la fonction sur deux configurations seulement (\`gpt-4o\` et \`claude-sonnet-4-6\`), pour les cinq indicateurs, et vérifie que seules ces deux configurations sont proposées.

\`dessinerTaches\` (V3) est également autonome et sans bibliothèque : elle reçoit \`donneesV3\` et la campagne à afficher, et gère elle-même la bascule d'échelle. \`dessinerConstellation\` (V1) est elle aussi autonome et sans bibliothèque : elle reçoit \`donneesV1\` et la largeur disponible. \`dessinerCarte\` (V2) reçoit la liste des installations et la bibliothèque Leaflet en paramètres (\`import L from "leaflet"\` dans Astro) ; elle charge elle-même la feuille de style de Leaflet.
`
)
};

const _185 = function arrondir(){return(
function arrondir(x, chiffres = 3) {
  return typeof x === "number" && Number.isFinite(x) ? Number(x.toPrecision(chiffres)) : x;
}
)};

const _186 = function exportsAstro(donneesV1,arrondir,donneesV2,donneesV3,donneesV4){return(
{
  v1: donneesV1.map(d => ({modele: d.modele, fournisseur: d.fournisseur, min: arrondir(d.energie_min_Wh), milieu: arrondir(d.energie_milieu_Wh), max: arrondir(d.energie_max_Wh), unite: d.unite, scenario: d.scenario})),
  v2: donneesV2.map(d => ({id: d.id, nom: d.nom, ville: d.ville, region: d.region, latitude: d.latitude, longitude: d.longitude, type: d.type, nb_installations: d.nb_installations, installations: d.noms_installations, exploitants: d.exploitants})),
  v3: donneesV3.map(d => ({tache: d.tache, campagne: d.campagne, origine_campagne: d.origine_campagne, n_evaluations: d.n_evaluations, mediane: arrondir(d.mediane_Wh_req), moyenne: arrondir(d.moyenne_Wh_req), unite: d.unite})),
  v4: donneesV4.map(d => ({modele: d.modele, fournisseur: d.fournisseur, indicateur: d.indicateur, libelle: d.libelle, unite: d.unite, min: arrondir(d.min), milieu: arrondir(d.milieu), max: arrondir(d.max), rang: d.rang, chevauche_voisin: d.chevauche_voisin, scenario: d.scenario}))
}
)};

const _187 = function(tableau,exportsAstro){return(
tableau(Object.entries(exportsAstro).map(([fichier, lignes]) => ({fichier: `${fichier}.json`, lignes: lignes.length, colonnes: Object.keys(lignes[0]).length, taille_ko: Math.round(new Blob([JSON.stringify(lignes)]).size / 102.4) / 10})))
)};

const _188 = (md) => {
return (
md`## 08 — Synthèse`
)
};

const _189 = function synthese(md){return(
md`**Ce que nos données permettent d'établir, avant les visualisations.**

- **EcoLogits (estimation).** Pour une même requête de 150 tokens, les huit configurations étudiées ont des consommations électriques estimées très différentes : médiane d'environ 0,161 Wh, moyenne d'environ 0,533 Wh, tirée par quelques estimations élevées. Les valeurs sont des intervalles ; le point milieu est notre valeur de synthèse.
- **AI Energy Score (mesure GPU).** Sur 206 évaluations et onze tâches, l'énergie GPU par requête varie de plusieurs ordres de grandeur selon la tâche. Les comparaisons se font par campagne (février et décembre 2025), en Wh par requête du benchmark.
- **Datacenters France (localisation vérifiée).** 23 installations localisées, représentées par 18 points, dont 18 en Île-de-France. La carte montre une sélection documentée, pas l'ensemble des datacenters français.

**Précautions de lecture.** Les trois sources ne se combinent pas : une estimation par requête, une mesure GPU de laboratoire et une localisation ne s'additionnent pas, et aucun datacenter n'est relié à un modèle. Les résultats répondent à notre question pour les configurations, tâches et sites étudiés.`
)};

const _190 = (md) => {
return (
md`## 09 — Journal IA`
)
};

const _191 = function journalIA(md){return(
md`Outils utilisés : **ChatGPT (OpenAI)** et **Claude (Anthropic)**, ce dernier en partie via l'extension **Claude in Chrome**, qui agit directement dans ce notebook. Les prompts sont résumés.

| Date | Outil | Demande (résumé) | Ce que l'IA a produit | Ce que cela nous a apporté | Ce que nous avons vérifié, corrigé ou décidé |
|---|---|---|---|---|---|
| Octobre 2026 | ChatGPT | Préparer le fichier des datacenters français : structure du fichier, catégories de statut, correction d'informations signalées comme erronées | Une structure de données et trois statuts : localisation vérifiée, localisation non vérifiée, existence non confirmée | Une organisation claire entre ce qui est localisé, ce qui ne l'est pas et ce qui reste douteux | Les propositions de l'IA ne servent pas de source : chaque entrée du fichier final indique sa source de vérification (colonnes existence, localisation et sources) |
| Octobre 2026 | ChatGPT | Concevoir la carte des datacenters | La règle de n'afficher que les sites à localisation vérifiée et de garder les autres en liste | Une carte qui ne place aucun point approximatif | Règle validée par notre binôme ; la carte ne dit pas où sont traitées les requêtes d'IA |
| Octobre 2026 | ChatGPT | Développement et Git du site Astro ; ordre des étapes d'intégration des visualisations | Commandes Git pour publier DepthExperience.astro et datacenters-france.json ; proposition d'ordre de travail | Gain de temps sur la gestion du dépôt | Aide technique uniquement, sans effet sur les données ni sur l'analyse |
| Octobre 2026 | ChatGPT | Trouver un fond de carte des régions françaises pour V2 | Recommandation du fichier regions-version-simplifiee.geojson du dépôt gregoiredavid/france-geojson | Une source identifiée, avec sa licence | Fichier téléchargé et contrôlé le 20/10/2026 avec Claude : FeatureCollection de 13 régions métropolitaines ; les 18 points tombent chacun dans la région indiquée par notre fichier |
| 20/10/2026 | Claude in Chrome | « Mission Claude — reconstruction complète du notebook Observable » : structurer le notebook, charger et contrôler les trois sources, documenter les transformations, sans visualisation | Structure du notebook ; code de chargement, de contrôle et de transformation ; recherche documentaire sur les unités, les campagnes et les licences ; recalcul des chiffres de notre document de travail | Des contrôles reproductibles et le signalement de problèmes que nous n'avions pas vus : unité AI Energy Score (kWh pour 1 000 requêtes, soit Wh par requête), campagnes mélangées en génération de texte, deux doublons, mode de calcul EcoLogits non explicité | Unité corrigée partout en Wh par requête ; campagnes séparées ; doublons conservés et signalés ; point milieu retenu et présenté comme un choix de synthèse |
| 20/10/2026 | Claude | Retour critique sur notre notebook au regard des consignes de la SAE 303 et du travail d'un autre binôme | Liste de points à améliorer (structure par questions, cellules synthese et journalIA, public visé, question explicite pour l'interaction) | Une vision claire des attendus encore manquants | Choix du public visé, des quatre visualisations, de leurs questions, titres et sous-titres, et des routes d'export |
| 20/10/2026 | Claude in Chrome | « Finalisation du notebook : simplifier, corriger et préparer les quatre visualisations », puis intégration du fond de carte et de ce journal | Allègement du notebook ; réécriture condensée des cinq questions à partir de nos réponses ; tables donneesV1 à donneesV4 et exports ; contrôle du fond de carte ; mise en forme des fiches ; synthèse et journal | Un notebook plus court et lisible, des tables prêtes pour la programmation des graphiques | Contenu des fiches (questions, familles, dénominateurs, titres, sous-titres, alternatives textuelles) fourni par nous dans la demande ; choix de V4 comme fonction autonome ; entrées ChatGPT de ce journal reconstituées à partir de nos échanges avec ChatGPT |
| 20/10/2026 | Claude in Chrome | « Effectue les étapes 1 et 2 » : programmer V1 à V4 et la fonction autonome de V4 | Code des fonctions dessinerDistribution, dessinerCarte, dessinerTaches, dessinerImpact et habillerFigure ; palette de données sombre (violet #8f7cf0, bleu #4a68a6) validée par un script de contraste et de daltonisme ; test de dessinerImpact sur un sous-ensemble | Quatre visualisations conformes aux fiches, une fonction prête pour Astro | Fiches, titres, sous-titres et alternatives textuelles fournis par nous ; échelle logarithmique de V1, V3 et V4 proposée par Claude |
| 20/10/2026 | Claude in Chrome | « Refonte des 4 visualisations » : graphiques plus simples, fond clair, couleurs variées, fiches mises à jour | Nouveau code des 4 visualisations (histogramme, carte bleu et orange, barres par famille de tâches avec zoom, classement interactif animé) et réécriture des 4 fiches | Des graphiques différents les uns des autres, lisibles sans connaissance préalable | Palette, titre et type de chaque graphique, contraintes de lecture fixés par nous dans la demande ; classes de 0,25 Wh (V1) et regroupement des tâches en trois familles (V3) proposés par Claude |
| 20/10/2026 | Claude in Chrome | Refonte de « L'empreinte invisible d'une requête » (trois compteurs animés, sélecteur de modèles) et de « Une tâche, un impact » (un seul classement, bascule log / linéaire animée) | Nouveau code des deux composants, sans bibliothèque, testés sur ordinateur et sur mobile ; fichiers prêts pour Astro ; mise à jour des fiches V3 et V4 | Deux visualisations plus lisibles et immersives, réutilisables telles quelles dans le site | Concept, indicateurs, couleurs et interactions fixés par nous dans la demande ; rapport « environ 21 fois » calculé à partir des données ; bornes des anneaux (maximum de notre sélection) proposées par Claude |
| 20/10/2026 | Claude in Chrome | Refonte de « Le numérique a une adresse » : deux cartes Leaflet sur fond OpenStreetMap (France et Île-de-France), marqueurs individuels, éventail pour les points superposés | Nouveau code de la carte, fiche V2 mise à jour, fichiers Astro | Chaque installation est identifiable, y compris sur les campus | Concept, disposition et couleurs fixés par nous ; Claude a signalé qu'aucune donnée de consommation par zone n'existe dans nos fichiers : tous les points sont gris en attendant un éventuel fichier de consommations |
| 20/10/2026 | Claude in Chrome | Refonte de V1 en constellation de sphères animées ; suppression du second rendu de test sous les compteurs de V4 | Nouveau code de V1 (surface proportionnelle à la consommation, disposition sans chevauchement, fiche au clic, pause d'animation), fiche V1 mise à jour, suppression de l'ancien histogramme et du rendu de test de V4 | Une V1 plus immersive ; une V4 réduite à sa visualisation principale | Concept, palette et interactions fixés par nous ; rayon minimal de 12 px et forme des comparaisons (rang, rapport à la plus sobre et à la médiane) proposés par Claude ; le test de la fonction de V4 est conservé sous forme de tableau |
| 20/10/2026 | Claude in Chrome | Ajustements de V1 : fond identique aux autres visualisations, sphères immobiles, une couleur par modèle, noms sous les sphères | Code de V1 modifié (disposition recalculée pour placer chaque étiquette sous sa sphère sans chevauchement, suppression du flottement et du bouton pause) ; fiche V1 mise à jour | Une V1 plus stable et plus lisible | Ajustements demandés par nous ; données, surfaces et calculs inchangés |

**Textes d'accompagnement.** Les textes des sections 02 à 07, la synthèse et ce journal ont été rédigés avec Claude, à partir de nos réponses aux cinq questions et de nos choix. Le code JavaScript du notebook, y compris celui des quatre visualisations, a été écrit par Claude.`
)};

export default function define(runtime) {
  const main = runtime.module();
  const fileAttachments = new Map([
    ["image_classification.csv", {url: "./image_classification.csv", mimeType: "text/csv", lastModified: 1792402930983.468, size: 1078}],
    ["text_classification.csv", {url: "./text_classification.csv", mimeType: "text/csv", lastModified: 1792402930990.629, size: 667}],
    ["ecologits_estimations.csv", {url: "./ecologits_estimations.csv", mimeType: "text/csv", lastModified: 1792400239165.425, size: 2843}],
    ["sentence_similarity.csv", {url: "./sentence_similarity.csv", mimeType: "text/csv", lastModified: 1792402930990.701, size: 800}],
    ["object_detection.csv", {url: "./object_detection.csv", mimeType: "text/csv", lastModified: 1792402930985.612, size: 313}],
    ["text_generation.csv", {url: "./text_generation.csv", mimeType: "text/csv", lastModified: 1792402930651.425, size: 2787}],
    ["reasoning.csv", {url: "./reasoning.csv", mimeType: "text/csv", lastModified: 1792402930979.403, size: 902}],
    ["summarization.csv", {url: "./summarization.csv", mimeType: "text/csv", lastModified: 1792402930619.56, size: 473}],
    ["image_generation.csv", {url: "./image_generation.csv", mimeType: "text/csv", lastModified: 1792402930984.999, size: 546}],
    ["image_captioning.csv", {url: "./image_captioning.csv", mimeType: "text/csv", lastModified: 1792402931009.668, size: 470}],
    ["asr.csv", {url: "./asr.csv", mimeType: "text/csv", lastModified: 1792402930970.744, size: 582}],
    ["question_answering.csv", {url: "./question_answering.csv", mimeType: "text/csv", lastModified: 1792402930949.073, size: 867}],
    ["datacenters-france.csv", {url: "./datacenters-france.csv", mimeType: "text/csv", lastModified: 1792486843950, size: 18687}],
    ["datacenters-france-points-carte.csv", {url: "./datacenters-france-points-carte.csv", mimeType: "text/csv", lastModified: 1792486843951, size: 2654}],
    ["regions-version-simplifiee.geojson", {url: "./regions-version-simplifiee.geojson", mimeType: "application/octet-stream", lastModified: 1792493187882, size: 225495}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments((name) => fileAttachments.get(name)));
  main.define("cell 120", ["md"], _120);
  main.define("cell 121", ["md"], _121);
  main.define("cell 122", ["md"], _122);
  main.define("cell 123", ["md"], _123);
  main.define("cell 124", ["md"], _124);
  main.define("statsDescriptives", ["d3"], _125);
  main.define("valeursManquantes", ["d3"], _126);
  main.define("verifier", [], _127);
  main.define("tableau", [], _128);
  main.define("cell 129", ["md"], _129);
  main.define("ecologitsBrut", ["FileAttachment"], _130);
  main.define("indicateursEcoLogits", [], _131);
  main.define("controleEcoLogits", ["ecologitsBrut","indicateursEcoLogits","verifier","valeursManquantes"], _132);
  main.define("cell 133", ["tableau","controleEcoLogits"], _133);
  main.define("cell 134", ["md"], _134);
  main.define("ecologitsPropre", ["ecologitsBrut","indicateursEcoLogits"], _135);
  main.define("cell 136", ["md"], _136);
  main.define("aesTaches", [], _137);
  main.define("aesBrut", ["FileAttachment"], _138);
  main.define("aesInventaire", ["aesTaches","aesBrut"], _139);
  main.define("cell 140", ["tableau","aesInventaire"], _140);
  main.define("controleAES", ["aesTaches","aesBrut","verifier","d3","valeursManquantes"], _141);
  main.define("cell 142", ["tableau","controleAES"], _142);
  main.define("cell 143", ["md"], _143);
  main.define("aesPropre", ["aesTaches","aesBrut","d3"], _144);
  main.define("cell 145", ["md"], _145);
  main.define("datacentersBrut", ["FileAttachment"], _146);
  main.define("pointsCarteBrut", ["FileAttachment"], _147);
  main.define("controleDatacenters", ["datacentersBrut","pointsCarteBrut","verifier","d3"], _148);
  main.define("cell 149", ["tableau","controleDatacenters"], _149);
  main.define("regionsFrance", ["FileAttachment"], _150);
  main.define("controleFondDeCarte", ["regionsFrance","d3","pointsCarteBrut","verifier"], _151);
  main.define("cell 152", ["tableau","controleFondDeCarte"], _152);
  main.define("cell 153", ["md"], _153);
  main.define("datacentersPropre", ["datacentersBrut"], _154);
  main.define("datacentersNonLocalises", ["datacentersPropre"], _155);
  main.define("regroupementsCampus", ["pointsCarteBrut"], _156);
  main.define("cell 157", ["tableau","regroupementsCampus"], _157);
  main.define("cell 158", ["md"], _158);
  main.define("cell 159", ["md"], _159);
  main.define("chiffresEcoLogits", ["statsDescriptives","ecologitsPropre"], _160);
  main.define("cell 161", ["tableau","chiffresEcoLogits"], _161);
  main.define("cell 162", ["md"], _162);
  main.define("chiffresAES", ["statsDescriptives","aesPropre"], _163);
  main.define("cell 164", ["tableau","chiffresAES"], _164);
  main.define("cell 165", ["md"], _165);
  main.define("repartitionRegionale", ["datacentersPropre","d3","pointsCarteBrut"], _166);
  main.define("chiffresDatacenters", ["statsDescriptives","pointsCarteBrut","repartitionRegionale","d3","datacentersNonLocalises"], _167);
  main.define("cell 168", ["tableau","chiffresDatacenters"], _168);
  main.define("cell 169", ["md"], _169);
  main.define("donneesV1", ["ecologitsPropre","d3"], _170);
  main.define("cell 171", ["tableau","donneesV1"], _171);
  main.define("donneesV2", ["pointsCarteBrut","datacentersPropre"], _172);
  main.define("cell 173", ["tableau","verifier","donneesV2"], _173);
  main.define("cell 174", ["tableau","donneesV2"], _174);
  main.define("donneesV3", ["d3","aesPropre","statsDescriptives"], _175);
  main.define("cell 176", ["tableau","donneesV3"], _176);
  main.define("donneesV4", ["indicateursEcoLogits","ecologitsPropre","d3"], _177);
  main.define("cell 178", ["tableau","donneesV4"], _178);
  main.define("cell 179", ["md"], _179);
  main.define("cell 180", ["md"], _180);
  main.define("dessinerConstellation", [], _204);
  main.define("cell 205", ["dessinerConstellation","donneesV1","width"], _205);
  main.define("cell 181", ["md"], _181);
  main.define("dessinerCarte", ["ResizeObserver"], _201);
  main.define("cell 202", ["datacentersBrut","dessinerCarte"], _202);
  main.define("cell 182", ["md"], _182);
  main.define("dessinerTaches", [], _199);
  main.define("cell 200", ["dessinerTaches","donneesV3"], _200);
  main.define("cell 183", ["md"], _183);
  main.define("dessinerImpact", [], _192);
  main.define("cell 193", ["dessinerImpact","donneesV4"], _193);
  main.define("cell 195", ["md"], _195);
  main.define("testDessinerImpact", ["dessinerImpact","donneesV4"], _196);
  main.define("cell 197", ["tableau","testDessinerImpact"], _197);
  main.define("cell 184", ["md"], _184);
  main.define("arrondir", [], _185);
  main.define("exportsAstro", ["donneesV1","arrondir","donneesV2","donneesV3","donneesV4"], _186);
  main.define("cell 187", ["tableau","exportsAstro"], _187);
  main.define("cell 188", ["md"], _188);
  main.define("synthese", ["md"], _189);
  main.define("cell 190", ["md"], _190);
  main.define("journalIA", ["md"], _191);
  return main;
}
