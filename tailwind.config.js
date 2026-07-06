const colorVar = (name) => `rgb(var(${name}) / <alpha-value>)`;

module.exports = {
  content: ["./crates/app/src/**/*.rs"],
  theme: {
    extend: {
      colors: {
        shell: {
          bg: colorVar("--shell-bg"),
          panel: colorVar("--shell-panel"),
          editor: colorVar("--shell-editor"),
          chrome: colorVar("--shell-chrome"),
          border: colorVar("--shell-border")
        },
        theme: {
          text: colorVar("--theme-text"),
          muted: colorVar("--theme-muted"),
          subtle: colorVar("--theme-subtle"),
          surface: colorVar("--theme-surface"),
          surfaceAlt: colorVar("--theme-surface-alt"),
          accent: colorVar("--theme-accent"),
          accentSoft: colorVar("--theme-accent-soft"),
          warn: colorVar("--theme-warn")
        }
      },
      fontFamily: {
        sans: [
          "Inter Nerd Font",
          "Inter Nerd Font Propo",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ],
        mono: [
          "JetBrainsMono Nerd Font",
          "JetBrainsMono Nerd Font Mono",
          "BerkeleyMono Nerd Font",
          "BerkeleyMono Nerd Font Mono",
          "Berkeley Mono",
          "JetBrains Mono",
          "IBM Plex Mono",
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "monospace"
        ],
        icon: [
          "Symbols Nerd Font Mono",
          "Symbols Nerd Font",
          "JetBrainsMono Nerd Font",
          "monospace"
        ]
      },
      fontSize: {
        ui: ["12px", { lineHeight: "1.4" }]
      },
      boxShadow: {
        none: "none"
      }
    }
  },
  plugins: []
};
