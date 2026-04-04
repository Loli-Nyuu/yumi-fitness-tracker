# Design System: The Sugared Kineticism 🎀✨

## 1. Creative North Star
**"The Sugared Kineticism"** is a maximalist, Sweet Lolita-inspired design system that treats fitness data like high-end couture. It rejects the sterile "bio-hacking" aesthetic in favor of warmth, asymmetry, and "digital physicalness."

### Core Principles
*   **Intentional Asymmetry:** UI elements lean into the fluid nature of ribbons and bows.
*   **The "No-Line" Rule:** Structural boundaries are defined by background color shifts, not borders.
*   **Glass & Gradients:** Interactive elements use linear gradients and frosted glass effects ("frosted candy").
*   **Tonal Layering:** Depth is achieved by stacking surfaces of varying pink tones rather than using drop shadows.

## 2. Color Palette: The Pink Spectrum
In this system, pink is the foundation. There are no greys or pure blacks.

| Token | Hex Code | Usage |
| :--- | :--- | :--- |
| `background` | `#fff4f7` | The main canvas base. |
| `surface` | `#fff4f7` | Primary surface color. |
| `surface-container-lowest` | `#ffffff` | "The Card" – used for primary content blocks. |
| `surface-container-low` | `#fdedf2` | "The Section" – used for background differentiation. |
| `surface-container` | `#f4e4ea` | "The Inset" – used for input tracks or secondary layers. |
| `primary` | `#b30065` | Primary actions, headlines, and high-contrast text. |
| `primary-fixed` | `#ff6ea9` | Accents, icons, and "magical" glows. |
| `on-surface` | `#352c30` | Body text (a deep rose-brown, never pure black). |
| `tertiary-container` | `#ffb6c1` | Decorative elements and progress fills. |

## 3. Typography: Playful Authority
**Font Family:** `Plus Jakarta Sans` (Rounded terminals for the "kawaii" aesthetic).

*   **Display:** Massive, celebratory, used for big metrics (e.g., "Workout Complete").
*   **Headline:** Navigation and card headers. High contrast with body text to create an "Editorial" look.
*   **Body:** Set in `on-surface` (#352c30). Warm and readable.

## 4. Elevation & Depth
*   **Tonal Layering:** A `surface-container-highest` element on a `surface` background provides elevation.
*   **Ambient Shadows:** Primary floating actions use a pink-tinted shadow: `box-shadow: 0 12px 32px rgba(255, 20, 147, 0.15);`.
*   **Ghost Borders:** If a divider is mandatory, use `outline-variant` (#b7aaae) at 15% opacity.

## 5. Component Patterns

### Buttons (The "Jewel" Variant)
*   **Primary:** Pill-shaped (`rounded-full`). Gradient from `primary` to `primary-container`.
*   **Secondary:** `secondary-container` background with `on-secondary-container` text.
*   **Decorative:** Use SVG bows or stars at the end of text labels.

### Cards & Sections
*   **No Dividers:** Separate items with `8px` gaps and tonal shifts.
*   **Roundedness:** Avoid sharp corners. Use `md` (1.5rem) or `full` (9999px).
*   **Icons:** Enclosed in circular or heart-shaped `secondary-container` backgrounds.

### Progress & Data
*   **The Heartbeat:** Use stylized heart SVG paths for progress rings.
*   **Strawberry Tracker:** Use animated icons (like strawberries or cups) that "bounce" when filled.

### Navigation
*   **The Ribbon Bar:** Bottom navigation should have a "scalloped" top edge or a central "ribbon tie" visual.
*   **Glassmorphism:** Floating modals and nav bars use 70% opacity with a `20px` backdrop-blur.

## 6. Do's and Don'ts

| Do | Don't |
| :--- | :--- |
| **Embrace Maximalism:** Use "sparkles" and "smiling stars" to fill negative space. | **No Neutrals:** Never use #000000 or standard greys. |
| **Layer with Intent:** Ensure nested containers are at least one tonal step apart. | **No Sharp Corners:** Avoid `none` or `sm` roundedness. |
| **Use High Contrast:** Pair deep pinks with soft creams for critical info. | **No Flat UI:** Always use at least one "Signature Texture" (gradient or glass) per screen. |
