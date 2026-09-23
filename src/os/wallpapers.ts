/** Desktop wallpaper presets — shared between Desktop.tsx (renders the
 * chosen one) and CI Admin Center (lets a user pick one). Keyed by a
 * stable id stored in AppState.uiPreferences.wallpaper, not the CSS
 * itself, so changing a preset's look later doesn't require a data
 * migration for anyone who already picked it. */
export const WALLPAPERS: Record<string, { label: string; css: string }> = {
  default: { label: "Default", css: "radial-gradient(circle at 20% -10%, #e9edf9 0%, #f4f5f8 45%, #f4f5f8 100%)" },
  midnight: { label: "Midnight", css: "radial-gradient(circle at 20% -10%, #1a1f3d 0%, #0b0d18 45%, #0b0d18 100%)" },
  ocean: { label: "Ocean", css: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 55%, #f4f5f8 100%)" },
  sunrise: { label: "Sunrise", css: "linear-gradient(135deg, #fff1e6 0%, #fef3f2 55%, #f4f5f8 100%)" },
  mono: { label: "Plain", css: "#f4f5f8" },
};

export const DEFAULT_WALLPAPER = "default";
