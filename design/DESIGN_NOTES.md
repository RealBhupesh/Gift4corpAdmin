# Liquid Glass Redesign Notes

## Token decisions
- **Core color tokens** live in `src/index.css` under `:root` and `@media (prefers-color-scheme: dark)`. They define `--bg`, `--surface`, `--text`, `--muted`, and semantic accents (`--accent`, `--danger`, `--success`, `--warning`) aligned to Apple's neutral grays and system blue.
- **Glass tokens** include `--glass-bg`, `--glass-stroke`, `--glass-blur`, and `--glass-highlight` to keep translucency consistent.
- **Elevation** relies on `--shadow-soft` and `--shadow-float` for calm depth.
- **Radii + spacing** tokens (`--r-*`, `--space-*`) align layout rhythm with Apple-like proportions.

## Component recipes
- **Glass Surface / Card**: `.glass-surface` and `.glass-card` apply translucent fills, blur, subtle strokes, and a top highlight gradient.
- **Buttons**: `.btn` base + variants (`.btn-primary`, `.btn-secondary`, `.btn-danger`) for consistent motion and tone.
- **Inputs**: `.glass-input` provides blur, soft border, and a gentle focus glow; base `input/select/textarea` styles now inherit glass defaults.
- **Tables**: `.glass-table` provides lighter header styling, minimal dividers, and subtle hover tones.
- **Auth UI**: `.auth-shell` and `.auth-card` create a centered glass panel over a soft gradient.

## How to extend
- Add new tokens in `src/index.css` rather than hardcoding colors in components.
- Use `.glass-card` and `.glass-surface` for any new panels or navigation shells.
- Combine Tailwind layout utilities with the design system classes for spacing and alignment.
