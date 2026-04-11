export interface BackgroundTheme {
  id: string;
  name: string;
  preview: string;
  full: string;
  isPro: boolean;
}

export const BACKGROUND_THEMES: BackgroundTheme[] = [
  { id: "dark",     name: "Dark",     preview: "#0a0a0a", full: "#0a0a0a", isPro: false },
  { id: "midnight", name: "Midnight", preview: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", full: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", isPro: false },
  { id: "aurora",   name: "Aurora",   preview: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #7c3aed 100%)", full: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #7c3aed 100%)", isPro: false },
  { id: "forest",   name: "Forest",   preview: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)", full: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)", isPro: false },
  { id: "sunset",   name: "Sunset",   preview: "linear-gradient(135deg, #7c2d12 0%, #431407 100%)", full: "linear-gradient(135deg, #7c2d12 0%, #431407 100%)", isPro: false },
  { id: "lattice",  name: "Lattice",  preview: "radial-gradient(circle at 30% 30%, #7f1d1d 0%, #0a0a0a 70%)", full: "radial-gradient(circle at 30% 30%, #7f1d1d 0%, #0a0a0a 70%)", isPro: false },
  { id: "gold",     name: "Gold",     preview: "linear-gradient(135deg, #78350f 0%, #000 100%)", full: "linear-gradient(135deg, #78350f 0%, #000 100%)", isPro: true },
  { id: "neon",     name: "Neon",     preview: "linear-gradient(135deg, #2e1065 0%, #4c1d95 50%, #701a75 100%)", full: "linear-gradient(135deg, #2e1065 0%, #4c1d95 50%, #701a75 100%)", isPro: true },
  { id: "ocean",    name: "Ocean",    preview: "linear-gradient(135deg, #083344 0%, #164e63 50%, #0c4a6e 100%)", full: "linear-gradient(135deg, #083344 0%, #164e63 50%, #0c4a6e 100%)", isPro: true },
  { id: "custom",   name: "カスタム",  preview: "#1a1a1a", full: "", isPro: true },
];
