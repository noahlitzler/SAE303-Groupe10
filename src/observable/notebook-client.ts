
import { Runtime, Library } from "@observablehq/runtime";
import * as d3 from "d3";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import define from "./227527a47a175959.js";

type Cle = "v1" | "v2" | "v3" | "v4";

const CELLULES: Record<Cle, string> = {
  v1: "cell 205",
  v2: "cell 202",
  v3: "cell 200",
  v4: "cell 193",
};

const DOSSIER = `${import.meta.env.BASE_URL.replace(
  /\/?$/,
  "/"
)}observable/files/`;

type Carte = {
  invalidateSize: (options?: object) => unknown;
};

const hotes = new Map<Cle, HTMLElement>();
const ajusteurs = new Map<HTMLElement, () => void>();

let cartes: Carte[] = [];
let demarre = false;

export function mountObservableNotebook() {
  if (demarre) return;

  document
    .querySelectorAll<HTMLElement>("[data-obs-viz]")
    .forEach((hote) => {
      const cle = hote.dataset.obsViz as Cle;

      if (cle in CELLULES) {
        hotes.set(cle, hote);
      }
    });

  if (!hotes.size) return;

  demarre = true;

  const library = new Library();

  library.d3 = () => d3;

  // Limite la largeur de calcul de V1 pour éviter
  // une constellation trop haute dans le carrousel.
  library.width = () =>
    library.Generators.observe(
      (change: (w: number) => void) => {
        const cible = hotes.get("v1") ?? document.body;

        let courant = 0;

        const mesurer = () => {
          const largeur = Math.round(
            cible.clientWidth || document.body.clientWidth
          );

          const w = Math.min(
            1080,
            Math.max(320, largeur)
          );

          if (w !== courant) {
            courant = w;
            change(w);
          }
        };

        const observateur = new ResizeObserver(mesurer);

        observateur.observe(cible);
        mesurer();

        return () => observateur.disconnect();
      }
    );

  const runtime = new Runtime(library);

  const fileAttachments = runtime.fileAttachments;

  runtime.fileAttachments = (
    resolve: (name: string) =>
      | { url: string; mimeType?: string }
      | undefined
  ) => {
    const fichier = fileAttachments.call(
      runtime,
      (name: string) => {
        const f = resolve(name);

        return (
          f && {
            ...f,
            url: new URL(
              DOSSIER + encodeURIComponent(name),
              location.href
            ).href,
          }
        );
      }
    );

    return (name: string) => ajouterDsv(fichier(name));
  };

  const main = define(runtime);

  main.redefine(
    "cell 202",
    ["datacentersBrut", "dessinerCarte"],
    (datacentersBrut: any[], dessinerCarte: any) => {
      const installations = datacentersBrut
        .filter(
          (d) =>
            d.statut === "localisation_verifiee" &&
            Number.isFinite(d.latitude) &&
            Number.isFinite(d.longitude)
        )
        .map((d) => ({
          id: d.id,
          nom: d.nom,
          exploitant: d.exploitant,
          ville: d.ville,
          region: d.region,
          adresse: d.adresse,
          precision: d.precision,
          latitude: d.latitude,
          longitude: d.longitude,
        }));

      return dessinerCarte(installations, {
        L,
        entreesTotal: datacentersBrut.length,
        cssLeaflet: null,
        hauteur: hauteurCartes(),
      });
    }
  );

  for (const [cle, hote] of hotes) {
    main
      .variable(observateur(cle, hote))
      .define(
        [CELLULES[cle]],
        (vue: Element) => vue
      );
  }

  addEventListener("depth:card-shown", (event) => {
    const card = (
      event as CustomEvent<{ card?: Element }>
    ).detail?.card;

    for (const [hote, ajuster] of ajusteurs) {
      if (!card || card.contains(hote)) {
        ajuster();
      }
    }

    requestAnimationFrame(() => {
      if (
        !card ||
        (
          hotes.get("v2") &&
          card.contains(hotes.get("v2")!)
        )
      ) {
        rafraichirCartes();
      }
    });
  });

  addEventListener("resize", () => {
    for (const ajuster of ajusteurs.values()) {
      ajuster();
    }

    requestAnimationFrame(rafraichirCartes);
  });
}

function ajouterDsv(fichier: any) {
  if (
    fichier &&
    typeof fichier.dsv !== "function"
  ) {
    fichier.dsv = async ({
      delimiter = ",",
      array = false,
      typed = false,
    } = {}) => {
      const format = d3.dsvFormat(delimiter);
      const texte: string = await fichier.text();

      const ligne = typed
        ? d3.autoType
        : undefined;

      return array
        ? format.parseRows(texte, ligne as any)
        : format.parse(texte, ligne as any);
    };
  }

  return fichier;
}

function hauteurCartes() {
  const hote = hotes.get("v2");

  const hauteur =
    hote?.clientHeight || innerHeight * 0.6;

  const largeur =
    hote?.clientWidth || innerWidth;

  // Réserver de la place pour le titre,
  // la légende et les notes des cartes.
  if (largeur <= 760) {
    return Math.round(
      Math.max(
        160,
        Math.min(
          320,
          (hauteur - 250) / 2
        )
      )
    );
  }

  return Math.round(
    Math.max(
      240,
      Math.min(550, hauteur - 265)
    )
  );
}

function rafraichirCartes() {
  for (const carte of cartes) {
    carte.invalidateSize({
      pan: false,
    });
  }
}

function observateur(
  cle: Cle,
  hote: HTMLElement
) {
  const scene =
    hote.querySelector<HTMLElement>(
      ".obs-viz-stage"
    )!;

  const statut =
    hote.querySelector<HTMLElement>(
      ".obs-viz-status"
    );

  const ajuster = ajusteur(
    hote,
    scene,
    cle
  );

  ajusteurs.set(hote, ajuster);

  new ResizeObserver(ajuster).observe(hote);

  corrigerBulles(scene);

  return {
    pending() {
      hote.setAttribute(
        "aria-busy",
        "true"
      );
    },

    fulfilled(vue: Element) {
      if (!(vue instanceof Element)) {
        return;
      }

      scene.replaceChildren(vue);

      hote.setAttribute(
        "aria-busy",
        "false"
      );

      hote.classList.add("is-ready");
      hote.classList.remove("is-error");

      statut?.replaceChildren();

      new ResizeObserver(ajuster).observe(vue);

      if (cle === "v2") {
        const { france, idf } =
          (vue as any).cartes ?? {};

        cartes = [
          france,
          idf,
        ].filter(Boolean);

        requestAnimationFrame(
          rafraichirCartes
        );
      }

      ajuster();
    },

    rejected(erreur: unknown) {
      hote.setAttribute(
        "aria-busy",
        "false"
      );

      hote.classList.add("is-error");

      const message =
        erreur instanceof Error
          ? erreur.message
          : String(erreur);

      if (statut) {
        statut.textContent =
          `VISUALISATION INDISPONIBLE — ${message}`;
      }

      console.error(
        `[Observable ${cle}]`,
        erreur
      );
    },
  };
}

/**
 * Ajustement des quatre visualisations.
 *
 * - Conserve les proportions.
 * - Calcule la réduction selon la hauteur réelle.
 * - Compense la réduction par une largeur interne.
 * - Remplit la hauteur de V4 sans étirer les SVG.
 */
function ajusteur(
  hote: HTMLElement,
  scene: HTMLElement,
  cle: Cle
) {
  let attente = 0;
  let enCalcul = false;

  const calculer = () => {
    attente = 0;

    if (enCalcul) return;

    const vue =
      scene.firstElementChild as HTMLElement | null;

    const largeur = hote.clientWidth;
    const hauteur = hote.clientHeight;

    if (
      !vue ||
      largeur <= 0 ||
      hauteur <= 0
    ) {
      return;
    }

    enCalcul = true;

    try {
      // Réinitialiser les transformations.
      scene.style.transform = "none";
      scene.style.left = "0";
      scene.style.top = "0";
      scene.style.height = "auto";

      scene.style.transformOrigin =
        "top left";

      scene.style.width =
        `${largeur}px`;

      vue.style.width = "100%";
      vue.style.maxWidth = "none";
      vue.style.margin = "0";

      // Retirer les limites de largeur
      // des composants Observable.
      scene
        .querySelectorAll<HTMLElement>(
          ".dlp-constellation, " +
          ".dlp-carte, " +
          ".dlp-taches, " +
          ".dlp-impact"
        )
        .forEach((element) => {
          element.style.setProperty(
            "width",
            "100%",
            "important"
          );

          element.style.setProperty(
            "max-width",
            "none",
            "important"
          );

          element.style.setProperty(
            "margin-inline",
            "0",
            "important"
          );
        });

      // Mesurer la hauteur réelle
      // à une largeur donnée.
      const mesurer = (w: number) => {
        scene.style.width = `${w}px`;

        return Math.max(
          vue.scrollHeight,
          vue.offsetHeight,
          scene.scrollHeight
        );
      };

      let echelle = 1;

      // Ajustement itératif :
      // on élargit avant de réduire
      // pour conserver la largeur visible.
      for (let i = 0; i < 8; i++) {
        const hauteurNaturelle = mesurer(
          largeur / echelle
        );

        const suivante = Math.min(
          1,
          hauteur /
            Math.max(
              1,
              hauteurNaturelle
            )
        );

        if (
          Math.abs(
            suivante - echelle
          ) < 0.002
        ) {
          echelle = suivante;
          break;
        }

        echelle = suivante;
      }

      scene.style.width =
        `${largeur / echelle}px`;

      // V4 : occuper également
      // la hauteur disponible.
      if (cle === "v4") {
        scene.style.height =
          `${hauteur / echelle}px`;

        vue.style.minHeight = "100%";
        vue.style.display = "flex";
        vue.style.flexDirection =
          "column";

        const compteurs =
          vue.querySelector<HTMLElement>(
            ".compteurs"
          );

        if (compteurs) {
          compteurs.style.flex = "1";
          compteurs.style.alignContent =
            "center";
        }
      } else {
        vue.style.minHeight = "0";
      }

      // Réduction uniforme :
      // aucun étirement horizontal ou vertical.
      scene.style.transform =
        `scale(${echelle.toFixed(4)})`;

      hote.style.setProperty(
        "--obs-scale",
        echelle.toFixed(4)
      );

      // V1 : ajustement independant de la constellation.
      // Conserver les proportions et afficher toute la hauteur.
      if (cle === "v1") {
        scene.style.transform = "none";
        scene.style.width = `${largeur}px`;

        const hauteurNaturelle = Math.max(
          vue.scrollHeight,
          vue.offsetHeight,
          scene.scrollHeight
        );

        const zoom = Math.min(
          1,
          (hauteur - 12) / Math.max(1, hauteurNaturelle)
        );

        echelle = zoom;

        scene.style.width = `${largeur}px`;
        scene.style.transformOrigin = "top left";
        scene.style.left = `${(largeur - largeur * zoom) / 2}px`;
        scene.style.transform = `scale(${zoom})`;

        hote.style.setProperty(
          "--obs-scale",
          zoom.toFixed(4)
        );
      }
      const hauteurFinale =
        Math.max(
          vue.scrollHeight,
          vue.offsetHeight,
          scene.scrollHeight
        ) * echelle;

      hote.classList.toggle(
        "is-overflowing",
        hauteurFinale > hauteur + 2
      );
    } finally {
      enCalcul = false;
    }
  };

  return () => {
    if (!attente) {
      attente = requestAnimationFrame(
        calculer
      );
    }
  };
}

/**
 * Corriger les positions des infobulles
 * lorsque la visualisation est réduite.
 */
function corrigerBulles(
  scene: HTMLElement
) {
  new MutationObserver((mutations) => {
    for (const { target } of mutations) {
      const bulle =
        target as HTMLElement;

      if (
        !bulle.classList?.contains(
          "bulle"
        )
      ) {
        continue;
      }

      const position =
        `${bulle.style.left}|${bulle.style.top}`;

      if (
        bulle.dataset.obsPosition ===
        position
      ) {
        continue;
      }

      const vue =
        scene.firstElementChild as HTMLElement | null;

      const k = vue
        ? vue.getBoundingClientRect().width /
          vue.offsetWidth
        : 1;

      if (
        !Number.isFinite(k) ||
        Math.abs(k - 1) < 0.01
      ) {
        bulle.dataset.obsPosition =
          position;
        continue;
      }

      const left = parseFloat(
        bulle.style.left
      );

      const top = parseFloat(
        bulle.style.top
      );

      if (Number.isFinite(left)) {
        bulle.style.left =
          `${(left / k).toFixed(1)}px`;
      }

      if (Number.isFinite(top)) {
        bulle.style.top =
          `${(top / k).toFixed(1)}px`;
      }

      bulle.dataset.obsPosition =
        `${bulle.style.left}|${bulle.style.top}`;
    }
  }).observe(scene, {
    subtree: true,
    attributes: true,
    attributeFilter: ["style"],
  });
}
