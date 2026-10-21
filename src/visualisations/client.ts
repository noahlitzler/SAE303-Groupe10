// Montage des quatre visualisations dans les faces du cube.
// Route B (rendu chez le lecteur) pour les quatre : chacune réagit au lecteur
// (sélecteur de modèle, fiche au clic, bascule d'échelle, cartes déplaçables).
// Les données sont les JSON préfiltrés de public/data, exportés depuis donneesV1..V4 du notebook.
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { dessinerCarte, dessinerConstellation, dessinerImpact, dessinerTaches } from "./visualisations.js";

type Cle = "v1" | "v2" | "v3" | "v4";
type Fichier = { donnees: any[]; entrees_total?: number };
type Cadrage = { bounds: L.LatLngBounds; maxZoom: number; taille?: string };

const FICHIERS: Record<Cle, string> = {
  v1: "v1-ecologits-electricite.json",
  v2: "v2-datacenters-localises.json",
  v3: "v3-ai-energy-score-taches.json",
  v4: "v4-ecologits-impacts.json",
};

const DOSSIER = `${import.meta.env.BASE_URL.replace(/\/?$/, "/")}data/`;

const HAUTEUR_MIN_SPHERES = 200;
const HAUTEUR_MIN_CARTE = 200;

const ajusteurs = new Map<HTMLElement, () => void>();
let cartes: L.Map[] = [];
let cadrages: Cadrage[] = [];
let demarre = false;

const dessiner: Record<Cle, (fichier: Fichier, hote: HTMLElement) => HTMLElement> = {
  // V1 calcule sa disposition pour la largeur réelle du rectangle.
  v1: (f, hote) => dessinerConstellation(f.donnees, { largeur: Math.max(320, hote.clientWidth) }),
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
}

async function monter(cle: Cle, hote: HTMLElement) {
  const scene = hote.querySelector<HTMLElement>(".obs-viz-stage")!;
  const statut = hote.querySelector<HTMLElement>(".obs-viz-status");
  const ajuster = ajusteur(hote, scene, cle);
  ajusteurs.set(hote, ajuster);
  corrigerBulles(scene);

  try {
    const reponse = await fetch(DOSSIER + FICHIERS[cle]);
    if (!reponse.ok) throw new Error(`données introuvables (${FICHIERS[cle]})`);
    const fichier: Fichier = await reponse.json();

    const afficher = () => {
      const vue = dessiner[cle](fichier, hote);
      scene.replaceChildren(vue);
      new ResizeObserver(ajuster).observe(vue);
      ajuster();
    };

    afficher();
    hote.setAttribute("aria-busy", "false");
    hote.classList.add("is-ready");
    statut?.replaceChildren();

    // V1 recalcule sa disposition quand la largeur change ; les autres sont seulement remis à l'échelle.
    let largeur = hote.clientWidth;
    let attente = 0;
    new ResizeObserver(() => {
      ajuster();
      if (cle !== "v1" || Math.abs(hote.clientWidth - largeur) < 2) return;
      clearTimeout(attente);
      attente = window.setTimeout(() => {
        largeur = hote.clientWidth;
        afficher();
      }, 150);
    }).observe(hote);
  } catch (erreur) {
    hote.setAttribute("aria-busy", "false");
    hote.classList.add("is-error");
    const message = erreur instanceof Error ? erreur.message : String(erreur);
    if (statut) statut.textContent = `VISUALISATION INDISPONIBLE — ${message}`;
    console.error(`[${cle}]`, erreur);
  }
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
 * Ajustement des visualisations dans leur rectangle.
 *
 * - V1 : la constellation occupe toute la largeur ; la zone des sphères prend la hauteur restante.
 * - V2 : les deux cartes prennent toute la hauteur laissée par les textes.
 * - V4 : les compteurs se répartissent dans la hauteur disponible.
 * - Si le contenu dépasse encore (petits écrans), réduction uniforme, compensée par une largeur interne.
 *
 * Les tailles sont lues avec offsetHeight / clientHeight, qui ignorent la rotation du cube.
 */
function ajusteur(hote: HTMLElement, scene: HTMLElement, cle: Cle) {
  let attente = 0;

  const calculer = () => {
    attente = 0;
    const vue = scene.firstElementChild as HTMLElement | null;
    const largeur = hote.clientWidth;
    const hauteur = hote.clientHeight;
    if (!vue || largeur <= 0 || hauteur <= 0) return;

    scene.style.transform = "none";
    scene.style.height = "auto";
    scene.style.width = `${largeur}px`;
    vue.style.setProperty("width", "100%", "important");
    vue.style.setProperty("max-width", "none", "important");
    vue.style.setProperty("margin", "0", "important");

    if (cle === "v1") ajusterConstellation(vue, hauteur);
    if (cle === "v2") ajusterCartes(vue, hauteur);

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

// La zone SVG prend la hauteur laissée par le titre, la légende et les notes.
function ajusterConstellation(vue: HTMLElement, hauteur: number) {
  const svg = vue.querySelector<SVGSVGElement>(".scene svg");
  if (!svg) return;

  svg.style.height = "";
  const autres = vue.offsetHeight - svg.clientHeight;
  svg.style.height = `${Math.max(HAUTEUR_MIN_SPHERES, hauteur - autres)}px`;

  // Le viewBox d'origine réserve toute la largeur de calcul, alors que les sphères sont
  // regroupées au centre : on le resserre sur les sphères et leurs étiquettes, au format
  // de la zone. Le zoom est uniforme, les surfaces restent proportionnelles.
  const boites = [...svg.querySelectorAll<SVGGElement>(".sphere")].map((g) => {
    const b = g.getBBox();
    const m = g.transform.baseVal.consolidate()?.matrix;
    return { x: b.x + (m?.e ?? 0), y: b.y + (m?.f ?? 0), w: b.width, h: b.height };
  });
  if (!boites.length || !svg.clientWidth || !svg.clientHeight) return;

  const marge = 14;
  let x0 = Math.min(...boites.map((b) => b.x)) - marge;
  let y0 = Math.min(...boites.map((b) => b.y)) - marge;
  let w = Math.max(...boites.map((b) => b.x + b.w)) + marge - x0;
  let h = Math.max(...boites.map((b) => b.y + b.h)) + marge - y0;
  const format = svg.clientWidth / svg.clientHeight;
  if (w / h < format) {
    x0 -= (h * format - w) / 2;
    w = h * format;
  } else {
    y0 -= (w / format - h) / 2;
    h = w / format;
  }
  svg.setAttribute("viewBox", `${x0.toFixed(1)} ${y0.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
  // Les particules décoratives hors du nouveau cadre ne débordent pas sur la fiche.
  svg.style.overflow = "hidden";
}

// Les cartes prennent la hauteur laissée par les textes (côte à côte, ou empilées sur mobile).
function ajusterCartes(vue: HTMLElement, hauteur: number) {
  const fonds = [...vue.querySelectorAll<HTMLElement>(".fond")];
  if (!fonds.length) return;

  const empilees = fonds.length > 1 && fonds[1].offsetTop > fonds[0].offsetTop + 10;
  const nbRangees = empilees ? fonds.length : 1;
  const autres = vue.offsetHeight - fonds[0].offsetHeight * nbRangees;
  const cible = Math.max(HAUTEUR_MIN_CARTE, Math.floor((hauteur - autres) / nbRangees));
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
