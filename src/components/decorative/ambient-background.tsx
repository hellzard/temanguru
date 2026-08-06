/**
 * Purely decorative, theme-aware ambient background.
 * Uses --tg-primary / --tg-ring so it automatically matches whichever of the
 * 16 theme presets (or custom wallpaper) the user has picked — no props,
 * no JS, safe to drop into any layout.
 */
export function AmbientBackground({ variant = "app" }: { variant?: "app" | "hero" }) {
  const dense = variant === "hero";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="tg-blob"
        style={{
          top: "-10%",
          left: "-8%",
          width: dense ? "42rem" : "32rem",
          height: dense ? "42rem" : "32rem",
          background: "radial-gradient(circle at 30% 30%, var(--tg-primary), transparent 70%)",
          animationDuration: "18s",
        }}
      />
      <div
        className="tg-blob"
        style={{
          top: dense ? "-4%" : "10%",
          right: "-10%",
          width: dense ? "36rem" : "26rem",
          height: dense ? "36rem" : "26rem",
          background: "radial-gradient(circle at 60% 40%, var(--tg-ring), transparent 70%)",
          animationDuration: "22s",
          animationDelay: "-4s",
        }}
      />
      {dense ? (
        <div
          className="tg-blob"
          style={{
            bottom: "-14%",
            left: "22%",
            width: "30rem",
            height: "30rem",
            background: "radial-gradient(circle at 50% 50%, var(--tg-accent), transparent 70%)",
            animationDuration: "26s",
            animationDelay: "-9s",
          }}
        />
      ) : null}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, var(--tg-primary) 10%, transparent), transparent)",
        }}
      />
    </div>
  );
}
