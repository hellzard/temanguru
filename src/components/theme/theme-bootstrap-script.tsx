

const code = `
(() => {
  try {
    const raw = localStorage.getItem("temanguru:theme:v1");
    const value = raw ? JSON.parse(raw) : {};
    const requested = ["light","dark","system"].includes(value.mode) ? value.mode : "system";
    const mode = requested === "system"
      ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : requested;
    document.documentElement.dataset.themeMode = mode;
    document.documentElement.style.colorScheme = mode;
  } catch {
    document.documentElement.dataset.themeMode =
      matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
})();
`;

export function ThemeBootstrapScript() {
  return (
    <script
      id="temanguru-theme-bootstrap"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
