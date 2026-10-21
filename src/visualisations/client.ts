// Montage des quatre visualisations, dans les faces du cube comme dans les pages Explorer.
// Route B (rendu chez le lecteur) pour les quatre : chacune réagit au lecteur
// (sélecteur de modèle, fiche au clic, bascule d'échelle, cartes déplaçables).
// Les données sont les JSON préfiltrés de public/data, exportés depuis donneesV1..V4 du notebook.
//
// Deux modes, choisis par data-obs-mode sur l'emplacement :
// - « carte » (défaut) : le graphique doit tenir dans le rectangle de la face ;
// - « page » : page Explorer, le graphique suit le flux de la page avec de grandes dimensions.
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { dessinerCarte, dessinerConstellation, dessinerImpact, dessinerTaches } from "./visualisations.js";

type Cle = "v1" | "v2" | "v3" | "v4";
type Fichier = { donnees: any[]; entrees_total?: number };
type Cadrage = { bounds: L.LatLngBounds; maxZoom: number; taille?: string };
type Zone = { largeur: number; hauteur: number };
type Etat = { cle: Cle; hote: HTMLElement; scene: HTMLElement; page: boolean; zone?: Zone; afficher?: () => void };

const FICHIERS: Record<Cle, string> = {
  v1: "v1-ecologits-electricite.json",
  v2: "v2-datacenters-localises.json",
  v3: "v3-ai-energy-score-taches.json",
  v4: "v4-ecologits-impacts.json",
};

const DOSSIER = `${import.meta.env.BASE_URL.replace(/\/?$/, "/")}data/`;

const HAUTEUR_MIN_SPHERES = 220;
const HAUTEUR_MIN_SPHERES_ETROIT = 340;
const HAUTEUR_MIN_CARTE = 200;
const HAUTEUR_FICHE_EMPILEE = 190;

const ajusteurs = new Map<HTMLElement, () => void>();
let cartes: L.Map[] = [];
let cadrages: Cadrage[] = [];
let demarre = false;

const dessiner: Record<Cle, (fichier: Fichier, etat: Etat) => HTMLElement> = {
  // V1 : disposition calculée pour la zone réelle des sphères, dès qu'elle est connue.
  v1: (f, etat) => dessinerConstellation(f.donnees, { largeur: Math.max(320, etat.hote.clientWidth), zone: etat.zone }),
  v2: (f) => {
    // Mêmes cadrages que dans dessinerCarte, réappliqués quand la taille des cartes change.
    const idf = f.donnees.filter((d) => d.region === "Île-de-France");
    cadrages = [
      { bounds: L.latLngBounds([[42.3, -4.8], [51.1, 8.2]]), maxZoom: 12 },
      { bounds: L.latLngBounds(idf.map((d) => [d.latitude, d.longitude] as [number, number])), maxZoom: 13 },
    ];
    const vue = dessinerCarte(f.donnees, { L, entreesTotal: f.entrees_total, cssLeaflet: null, hauteur: 300 });
    cartes = [vue.cartes.france, vue.cartes.idf];
    return vue;
  },
  v3: (f) => dessinerTaches(f.donnees, { campagne: "Février 2025", echelle: "log" }),
  v4: (f) => dessinerImpact(f.donnees, { modeleInitial: "gpt-4o" }),
};

export function monterVisualisations() {
  if (demarre) return;
  demarre = true;

  document.querySelectorAll<HTMLElement>("[data-obs-viz]").forEach((hote) => {
    const cle = hote.dataset.obsViz as Cle;
    if (cle in FICHIERS) monter(cle, hote);
  });

  // Une face qui devient visible : on recalcule l'échelle et la taille des cartes.
  addEventListener("depth:card-shown", (event) => {
    const card = (event as CustomEvent<{ card?: Element }>).detail?.card;
    for (const [hote, ajuster] of ajusteurs) {
      if (!card || card.contains(hote)) ajuster();
    }
    requestAnimationFrame(rafraichirCartes);
  });

  // Les polices de la charte modifient la hauteur des textes une fois chargées.
  document.fonts?.ready.then(() => ajusteurs.forEach((ajuster) => ajuster()));
}

async function monter(cle: Cle, hote: HTMLElement) {
  const etat: Etat = {
    cle,
    hote,
    scene: hote.querySelector<HTMLElement>(".obs-viz-stage")!,
    page: hote.dataset.obsMode === "page",
  };
  const statut = hote.querySelector<HTMLElement>(".obs-viz-status");
  const ajuster = ajusteur(etat);
  ajusteurs.set(hote, ajuster);
  corrigerBulles(etat.scene);

  try {
    const reponse = await fetch(DOSSIER + FICHIERS[cle]);
    if (!reponse.ok) throw new Error(`données introuvables (${FICHIERS[cle]})`);
    const fichier: Fichier = await reponse.json();

    etat.afficher = () => {
      const vue = dessiner[cle](fichier, etat);
      etat.scene.replaceChildren(vue);
      if (cle === "v1") stabiliserSpheres(vue);
      ajuster();
    };

    etat.afficher();
    hote.setAttribute("aria-busy", "false");
    hote.classList.add("is-ready");
    statut?.replaceChildren();

    // Seul un changement de taille du rectangle relance l'ajustement : un changement de contenu
    // (fiche de V1, texte d'échelle de V3) ne doit jamais modifier le cadrage du graphique.
    let taille = `${hote.clientWidth}x${hote.clientHeight}`;
    new ResizeObserver(() => {
      const nouvelle = `${hote.clientWidth}x${hote.clientHeight}`;
      if (nouvelle === taille) return;
      taille = nouvelle;
      ajuster();
    }).observe(hote);
    if (etat.page) addEventListener("resize", ajuster);
  } catch (erreur) {
    hote.setAttribute("aria-busy", "false");
    hote.classList.add("is-error");
    const message = erreur instanceof Error ? erreur.message : String(erreur);
    if (statut) statut.textContent = `VISUALISATION INDISPONIBLE — ${message}`;
    console.error(`[${cle}]`, erreur);
  }
}

// Un clic sur une sphère ne doit que la sélectionner. Le focus donné par la souris pouvait faire
// défiler la page pour « montrer » la sphère, et le défilement fait pivoter le cube : on l'évite.
// Le clavier (Tab, Entrée, Espace) garde le focus et la sélection.
function stabiliserSpheres(vue: HTMLElement) {
  vue.addEventListener("mousedown", (e) => {
    if ((e.target as Element).closest(".sphere")) e.preventDefault();
  });
}

// invalidateSize ne recadre pas : une carte créée avant que sa face ait sa taille finale
// resterait mal cadrée (France coupée au sud). On recadre donc à chaque changement de taille.
function rafraichirCartes() {
  cartes.forEach((carte, i) => {
    carte.invalidateSize({ pan: false });
    const cadrage = cadrages[i];
    const conteneur = carte.getContainer();
    const taille = `${conteneur.clientWidth}x${conteneur.clientHeight}`;
    if (cadrage && conteneur.clientWidth > 0 && cadrage.taille !== taille) {
      cadrage.taille = taille;
      carte.fitBounds(cadrage.bounds, { padding: [24, 24], maxZoom: cadrage.maxZoom });
    }
  });
}

/**
 * Ajustement d'une visualisation.
 *
 * Mode « carte » (faces du cube) :
 * - V1 : la constellation occupe toute la largeur ; la zone des sphères prend la hauteur restante ;
 * - V2 : les deux cartes prennent toute la hauteur laissée par les textes ;
 * - V4 : les compteurs se répartissent dans la hauteur disponible ;
 * - si le contenu dépasse encore (petits écrans), réduction uniforme, compensée par une largeur interne.
 *
 * Mode « page » (pages Explorer) : aucune réduction ; le graphique prend toute la largeur
 * et des hauteurs proportionnées à l'écran (zone des sphères, cartes).
 *
 * Les tailles sont lues avec offsetHeight / clientHeight, qui ignorent la rotation du cube.
 */
function ajusteur(etat: Etat) {
  const { cle, hote, scene, page } = etat;
  let attente = 0;

  const calculer = () => {
    attente = 0;
    const vue = scene.firstElementChild as HTMLElement | null;
    const largeur = hote.clientWidth;
    if (!vue || largeur <= 0) return;

    vue.style.setProperty("width", "100%", "important");
    vue.style.setProperty("max-width", "none", "important");
    vue.style.setProperty("margin", "0", "important");

    if (page) {
      scene.style.transform = "none";
      scene.style.width = "100%";
      if (cle === "v1") dimensionnerSpheres(etat, vue, Math.min(760, Math.max(380, innerHeight * 0.62)), true);
      if (cle === "v2") dimensionnerCartes(vue, Math.min(720, Math.max(320, innerHeight * 0.62)), true);
      if (cle === "v2") requestAnimationFrame(rafraichirCartes);
      return;
    }

    const hauteur = hote.clientHeight;
    if (hauteur <= 0) return;

    scene.style.transform = "none";
    scene.style.height = "auto";
    scene.style.width = `${largeur}px`;

    if (cle === "v1" && dimensionnerSpheres(etat, vue, hauteur, false)) return;
    if (cle === "v2") dimensionnerCartes(vue, hauteur, false);

    // Réduction uniforme : on élargit la scène avant de la réduire
    // pour que la largeur visible reste celle du rectangle.
    const mesurer = (w: number) => {
      scene.style.width = `${w}px`;
      return vue.offsetHeight;
    };
    let echelle = 1;
    for (let i = 0; i < 8; i++) {
      const suivante = Math.min(1, hauteur / Math.max(1, mesurer(largeur / echelle)));
      if (Math.abs(suivante - echelle) < 0.002) {
        echelle = suivante;
        break;
      }
      echelle = suivante;
    }
    scene.style.width = `${largeur / echelle}px`;
    echelle = Math.min(echelle, hauteur / Math.max(1, vue.offsetHeight));

    if (cle === "v4") {
      scene.style.height = `${hauteur / echelle}px`;
      vue.style.minHeight = "100%";
      vue.style.display = "flex";
      vue.style.flexDirection = "column";
      const compteurs = vue.querySelector<HTMLElement>(".compteurs");
      if (compteurs) {
        compteurs.style.flex = "1";
        compteurs.style.alignContent = "center";
      }
    }

    // Contenu plus court que le rectangle : centré verticalement.
    const decalage = Math.max(0, (hauteur - vue.offsetHeight * echelle) / 2);
    scene.style.transform = `translateY(${decalage.toFixed(1)}px) scale(${echelle.toFixed(4)})`;
    hote.style.setProperty("--obs-scale", echelle.toFixed(4));
    hote.classList.toggle("is-overflowing", vue.offsetHeight * echelle > hauteur + 2);

    if (cle === "v2") requestAnimationFrame(rafraichirCartes);
  };

  return () => {
    if (!attente) attente = requestAnimationFrame(calculer);
  };
}

/**
 * V1 : fixe la hauteur de la rangée « sphères + fiche » pour que la fiche, dont le texte change
 * à chaque clic, ne modifie plus la mise en page ; puis redessine la constellation pour la taille
 * réelle de sa zone (une seule fois par taille). Renvoie true si un nouveau dessin est lancé.
 *
 * En mode carte, `hauteur` est celle du rectangle ; en mode page, celle voulue pour la zone des sphères.
 */
function dimensionnerSpheres(etat: Etat, vue: HTMLElement, hauteur: number, page: boolean) {
  const rangee = vue.querySelector<HTMLElement>(".scene");
  const svg = rangee?.querySelector<SVGSVGElement>("svg");
  const fiche = rangee?.querySelector<HTMLElement>(".fiche");
  if (!rangee || !svg || !fiche) return false;

  rangee.style.height = "";
  svg.style.height = "";
  fiche.style.maxHeight = "";
  fiche.style.minHeight = "";

  // Sur écran étroit, la fiche passe sous les sphères : on lui réserve une hauteur fixe.
  const empilee = getComputedStyle(rangee).gridTemplateColumns.trim().split(/\s+/).length < 2;
  const reserveFiche = empilee ? HAUTEUR_FICHE_EMPILEE + 12 : 0;
  // Zone étroite (mobile) : huit sphères étiquetées ne tiennent pas sans chevauchement sous 340 px de haut ;
  // le contenu dépasse alors du rectangle et la réduction uniforme du mode carte prend le relais.
  const hauteurMin = svg.clientWidth < 520 ? HAUTEUR_MIN_SPHERES_ETROIT : HAUTEUR_MIN_SPHERES;
  const zoneH = page
    ? Math.max(hauteurMin, hauteur)
    : Math.max(hauteurMin, hauteur - (vue.offsetHeight - rangee.offsetHeight) - reserveFiche);

  svg.style.height = `${Math.round(zoneH)}px`;
  if (empilee) {
    fiche.style.minHeight = `${HAUTEUR_FICHE_EMPILEE}px`;
    fiche.style.maxHeight = `${HAUTEUR_FICHE_EMPILEE}px`;
  } else {
    rangee.style.height = `${Math.round(zoneH)}px`;
    fiche.style.maxHeight = `${Math.round(zoneH)}px`;
  }
  fiche.style.overflowY = "auto";

  const zone = { largeur: Math.round(svg.clientWidth), hauteur: Math.round(zoneH) };
  const ecart = !etat.zone || Math.abs(etat.zone.largeur - zone.largeur) > 8 || Math.abs(etat.zone.hauteur - zone.hauteur) > 8;
  if (ecart && etat.afficher) {
    etat.zone = zone;
    etat.afficher();
    return true;
  }

  // La constellation est dessinée dans le repère exact de sa zone (viewBox = zone, 1 unité = 1 px) :
  // pas de recadrage a posteriori. L'ancien recadrage lisait getBBox() pendant l'animation d'entrée
  // des sphères (échelle 0 → 1) et pouvait zoomer ou dézoomer la scène de façon imprévisible.
  return false;
}

// V2 : en mode carte, les cartes prennent la hauteur laissée par les textes ; en mode page,
// elles reçoivent directement la hauteur voulue (divisée en deux si elles s'empilent).
function dimensionnerCartes(vue: HTMLElement, hauteur: number, page: boolean) {
  const fonds = [...vue.querySelectorAll<HTMLElement>(".fond")];
  if (!fonds.length) return;

  const empilees = fonds.length > 1 && fonds[1].offsetTop > fonds[0].offsetTop + 10;
  const nbRangees = empilees ? fonds.length : 1;
  const cible = page
    ? Math.round(empilees ? Math.max(280, hauteur * 0.75) : hauteur)
    : Math.max(HAUTEUR_MIN_CARTE, Math.floor((hauteur - (vue.offsetHeight - fonds[0].offsetHeight * nbRangees)) / nbRangees));
  for (const fond of fonds) fond.style.height = `${cible}px`;
}

// Les infobulles des composants sont placées à partir de getBoundingClientRect (pixels écran).
// Dans un rectangle réduit ou vu en perspective, on ramène cette position dans le repère du composant.
function corrigerBulles(scene: HTMLElement) {
  new MutationObserver((mutations) => {
    for (const { target } of mutations) {
      const bulle = target as HTMLElement;
      if (!bulle.classList?.contains("bulle")) continue;

      const position = `${bulle.style.left}|${bulle.style.top}`;
      if (bulle.dataset.obsPosition === position) continue;

      const vue = scene.firstElementChild as HTMLElement | null;
      const k = vue ? vue.getBoundingClientRect().width / vue.offsetWidth : 1;
      if (Number.isFinite(k) && Math.abs(k - 1) >= 0.01) {
        const left = parseFloat(bulle.style.left);
        const top = parseFloat(bulle.style.top);
        if (Number.isFinite(left)) bulle.style.left = `${(left / k).toFixed(1)}px`;
        if (Number.isFinite(top)) bulle.style.top = `${(top / k).toFixed(1)}px`;
      }
      bulle.dataset.obsPosition = `${bulle.style.left}|${bulle.style.top}`;
    }
  }).observe(scene, { subtree: true, attributes: true, attributeFilter: ["style"] });
}
