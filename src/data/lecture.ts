// Lecture, au moment de la génération des pages, des JSON préfiltrés de public/data
// (les mêmes fichiers que ceux chargés par les visualisations). Les chiffres cités dans les récits
// des pages « Voir plus » sont ainsi calculés à partir des données, jamais recopiés à la main.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export function lireDonnees<T = any>(fichier: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), "public", "data", fichier), "utf-8"));
}

export const fmt = (v: number, chiffres = 3) => new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: chiffres }).format(v);
export const fmtRapport = (r: number) =>
  r >= 10
    ? new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: 2 }).format(r)
    : new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(r);

export const nomsFournisseurs: Record<string, string> = { openai: "OpenAI", anthropic: "Anthropic", google_genai: "Google", mistralai: "Mistral AI" };
// Couleurs des fournisseurs : identiques à celles des visualisations.
export const couleursFournisseurs: Record<string, string> = { google_genai: "#2878D0", anthropic: "#D46E15", openai: "#269A77", mistralai: "#C2408F" };
