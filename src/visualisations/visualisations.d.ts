// Types des fonctions de visualisation (visualisations.js, recopiées du notebook).
type Vue = HTMLElement;

export function dessinerConstellation(donnees: object[], options?: { largeur?: number; rayonMax?: number; rayonMin?: number }): Vue & { choisir(modele: string): void };

export function dessinerCarte(
  installations: object[],
  options: { L: unknown; consommationsZones?: unknown; entreesTotal?: number | null; cssLeaflet?: string | null; hauteur?: number },
): Vue & { cartes: { france: import("leaflet").Map; idf: import("leaflet").Map } };

export function dessinerTaches(donnees: object[], options?: { campagne?: string; echelle?: "log" | "lin"; comparaison?: string[] }): Vue & { appliquer(echelle: "log" | "lin"): void };

export function dessinerImpact(donnees: object[], options?: { modeleInitial?: string; animation?: boolean; indicateurs?: object[] }): Vue & { choisir(modele: string): void };
