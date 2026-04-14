export const appConfig = {
  name: "Radar Domače",
  supportEmail: "support@radardomace.local",
  defaultLocale: "sl" as const,
  defaultRadiusKm: 15,
  supportedLocales: ["sl", "en", "de", "it"] as const,
};

export const theme = {
  colors: {
    ink: "#142013",
    forest: "#2e5b2c",
    moss: "#759b62",
    cream: "#f7f3e8",
    sand: "#e6d7b8",
    tomato: "#d6643b",
    gold: "#d7a954",
    border: "#d8d0c0",
    panel: "#fffdf7",
    muted: "#627063",
  },
  radius: {
    sm: 10,
    md: 18,
    lg: 28,
  },
};
