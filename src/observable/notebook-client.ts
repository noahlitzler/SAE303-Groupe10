// Chargement unique du notebook Observable « SAE 303 — Gr 10 » (export runtime de 227527a47a175959).
// Le module exporté est utilisé tel quel : seules les quatre cellules de visualisation sont observées,
// les tableaux et le texte méthodologique ne sont donc jamais calculés ni affichés.
import { Runtime, Library } from "@observablehq/runtime";
import * as d3 from "d3";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import define from "./227527a47a175959.js";

type Cle = "v1" | "v2" | "v3" | "v4";

const CELLULES: Record<Cle, string> = {
  v1: "cell 205", // « Toutes les IA ne consomment pas autant » (EcoLogits)
  v2: "cell 202", // « Le numérique a une adresse » (Datacenters France)
  v3: "cell 200", // « Une tâche, un impact » (AI Energy Score)
  v4: "cell 193", // « L'empreinte invisible d'une requête » (EcoLogits)
};

// Fichiers joints du notebook, copiés sans modification dans public/observable/files.
const DOSSIER = `${import.meta.env.BASE_URL.replace(/\/?$/, "/")}observable/files/`;

// En dessous de cette échelle, le texte devient illisible : la zone défile plutôt que de rétrécir encore.
const ECHELLE_MIN = 0.55;

type Carte = { invalidateSize: (options?: object) => unknown };

const hotes = new Map<Cle, HTMLElement>();
const ajusteurs = new Map<HTMLElement, () => void>();
let cartes: Carte[] = [];
let demarre = false;

export function mountObservableNotebook() {
  if (demarre) return;
  demarre = true;
  document.querySelectorAll<HTMLElement>("[data-obs-viz]").forEach((hote) => {
    const cle = hote.dataset.obsViz as Cle;
    if (cle in CELLULES) hotes.set(cle, hote);
  });
  if (!hotes.size) return;

  const library = new Library();
  // d3 vient du paquet npm plutôt que du CDN utilisé par défaut par la bibliothèque standard.
  library.d3 = () => d3;
  // `width` suit la largeur réelle de la zone de V1 dans sa card, et non celle de la page.
  library.width = () =>
    library.Generators.observe((change: (w: number) => void) => {
      const cible = hotes.get("v1") ?? document.body;
      let courant = 0;
      const mesurer = () => {
        const w = Math.round(cible.clientWidth || document.body.clientWidth);
        if (w > 0 && w !== courant) change((courant = w));
      };
      const observateur = new ResizeObserver(mesurer);
      observateur.observe(cible);
      mesurer();
      return () => observateur.disconnect();
    });

  const runtime = new Runtime(library);
  const fileAttachments = runtime.fileAttachments;
  runtime.fileAttachments = (resolve: (name: string) => { url: string; mimeType?: string } | undefined) => {
    const fichier = fileAttachments.call(runtime, (name: string) => {
      const f = resolve(name);
      return f && { ...f, url: new URL(DOSSIER + encodeURIComponent(name), location.href).href };
    });
    return (name: string) => ajouterDsv(fichier(name));
  };

  const main = define(runtime);

  // Même sélection que la cellule d'origine ; Leaflet vient du paquet npm (au lieu d'un import CDN)
  // et la hauteur des deux cartes s'adapte à la card.
  main.redefine("cell 202", ["datacentersBrut", "dessinerCarte"], (datacentersBrut: any[], dessinerCarte: any) => {
    const installations = datacentersBrut
      .filter((d) => d.statut === "localisation_verifiee" && Number.isFinite(d.latitude) && Number.isFinite(d.longitude))
      .map((d) => ({ id: d.id, nom: d.nom, exploitant: d.exploitant, ville: d.ville, region: d.region, adresse: d.adresse, precision: d.precision, latitude: d.latitude, longitude: d.longitude }));
    return dessinerCarte(installations, { L, entreesTotal: datacentersBrut.length, cssLeaflet: null, hauteur: hauteurCartes() });
  });

  for (const [cle, hote] of hotes) {
    main.variable(observateur(cle, hote)).define([CELLULES[cle]], (vue: Element) => vue);
  }

  // Une card qui devient visible ou qui est centrée : on recalcule l'échelle et la taille des cartes.
  addEventListener("depth:card-shown", (event) => {
    const card = (event as CustomEvent<{ card?: Element }>).detail?.card;
    for (const [hote, ajuster] of ajusteurs) {
      if (!card || card.contains(hote)) ajuster();
    }
    if (!card || (hotes.get("v2") && card.contains(hotes.get("v2")!))) rafraichirCartes();
  });
}

// La bibliothèque standard npm n'a pas encore FileAttachment#dsv, que le notebook utilise
// pour les CSV séparés par « ; » : même comportement que sur observablehq.com.
function ajouterDsv(fichier: any) {
  if (fichier && typeof fichier.dsv !== "function") {
    fichier.dsv = async ({ delimiter = ",", array = false, typed = false } = {}) => {
      const format = d3.dsvFormat(delimiter);
      const texte: string = await fichier.text();
      const ligne = typed ? d3.autoType : undefined;
      return array ? format.parseRows(texte, ligne as any) : format.parse(texte, ligne as any);
    };
  }
  return fichier;
}

function hauteurCartes() {
  const hote = hotes.get("v2");
  const h = hote?.clientHeight || innerHeight * 0.6;
  // Les deux cartes s'empilent sous 760 px de large (règle du composant).
  if (innerWidth <= 760) return Math.round(Math.min(260, Math.max(170, (h - 380) / 2)));
  return Math.round(Math.min(460, Math.max(220, h - 330)));
}

function rafraichirCartes() {
  for (const carte of cartes) carte.invalidateSize({ pan: false });
}

function observateur(cle: Cle, hote: HTMLElement) {
  const scene = hote.querySelector<HTMLElement>(".obs-viz-stage")!;
  const statut = hote.querySelector<HTMLElement>(".obs-viz-status");
  const ajuster = ajusteur(hote, scene);
  ajusteurs.set(hote, ajuster);
  new ResizeObserver(ajuster).observe(hote);
  corrigerBulles(scene);
  return {
    pending() {
      hote.setAttribute("aria-busy", "true");
    },
    fulfilled(vue: Element) {
      if (!(vue instanceof Element)) return;
      scene.replaceChildren(vue);
      hote.setAttribute("aria-busy", "false");
      hote.classList.add("is-ready");
      hote.classList.remove("is-error");
      statut?.replaceChildren();
      new ResizeObserver(ajuster).observe(vue);
      if (cle === "v2") {
        const { france, idf } = (vue as any).cartes ?? {};
        cartes = [france, idf].filter(Boolean);
        requestAnimationFrame(rafraichirCartes);
      }
      ajuster();
    },
    rejected(erreur: unknown) {
      hote.setAttribute("aria-busy", "false");
      hote.classList.add("is-error");
      const message = erreur instanceof Error ? erreur.message : String(erreur);
      if (statut) statut.textContent = `VISUALISATION INDISPONIBLE — ${message}`;
      console.error(`[Observable ${cle}]`, erreur);
    },
  };
}

// Mise à l'échelle de la visualisation pour qu'elle tienne dans la card sans être coupée.
// La scène est élargie de 1/échelle puis réduite : la mise en page du composant reste celle d'origine.
function ajusteur(hote: HTMLElement, scene: HTMLElement) {
  let dernier = "";
  let attente = 0;
  const calculer = () => {
    attente = 0;
    const vue = scene.firstElementChild as HTMLElement | null;
    const lw = hote.clientWidth;
    const lh = hote.clientHeight;
    if (!vue || !lw || !lh) return;
    const hauteurA = (largeur: number) => {
      scene.style.width = `${largeur}px`;
      return vue.offsetHeight;
    };
    let echelle = 1;
    let h = hauteurA(lw);
    for (let i = 0; i < 4; i++) {
      const suivante = Math.max(ECHELLE_MIN, Math.min(1, lh / h));
      if (Math.abs(suivante - echelle) < 0.004) break;
      echelle = suivante;
      h = hauteurA(lw / echelle);
    }
    const cle = `${lw}x${lh}x${h}`;
    if (cle === dernier) return;
    dernier = cle;
    const decalage = Math.max(0, (lh - h * echelle) / 2);
    scene.style.transform = `translate3d(0, ${decalage.toFixed(1)}px, 0) scale(${echelle.toFixed(4)})`;
    hote.classList.toggle("is-overflowing", h * echelle > lh + 1);
    hote.style.setProperty("--obs-scale", echelle.toFixed(4));
  };
  return () => {
    if (!attente) attente = requestAnimationFrame(calculer);
  };
}

// Les infobulles des composants sont placées à partir de getBoundingClientRect (pixels écran).
// Dans une card réduite ou vue en perspective, on ramène cette position dans le repère du composant.
function corrigerBulles(scene: HTMLElement) {
  new MutationObserver((mutations) => {
    for (const { target } of mutations) {
      const bulle = target as HTMLElement;
      if (!bulle.classList?.contains("bulle")) continue;
      const position = `${bulle.style.left}|${bulle.style.top}`;
      if (bulle.dataset.obsPosition === position) continue;
      const vue = scene.firstElementChild as HTMLElement | null;
      const k = vue ? vue.getBoundingClientRect().width / vue.offsetWidth : 1;
      if (!Number.isFinite(k) || Math.abs(k - 1) < 0.01) {
        bulle.dataset.obsPosition = position;
        continue;
      }
      const left = parseFloat(bulle.style.left);
      const top = parseFloat(bulle.style.top);
      if (Number.isFinite(left)) bulle.style.left = `${(left / k).toFixed(1)}px`;
      if (Number.isFinite(top)) bulle.style.top = `${(top / k).toFixed(1)}px`;
      bulle.dataset.obsPosition = `${bulle.style.left}|${bulle.style.top}`;
    }
  }).observe(scene, { subtree: true, attributes: true, attributeFilter: ["style"] });
}
