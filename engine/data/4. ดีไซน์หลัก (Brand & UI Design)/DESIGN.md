# Design System Strategy: Kinetic Velocity

## 1. Overview & Creative North Star
The Creative North Star for this system is **"The Midnight Apex."** 

This isn't a standard dark-mode interface; it is a high-performance cockpit designed for professional motorcycle enthusiasts. It captures the tension between a machine's cold metal and the kinetic energy of a night race. We break the traditional grid-bound "template" look by utilizing **intentional asymmetry** and **overlapping kinetic elements**. 

Inspired by the provided imagery—specifically the sharp angles of the motorcycle frame and the glowing light streaks—this system prioritizes "Visual Speed." Headlines should feel like they are moving, and containers should feel like they are floating above a dark, wet asphalt road.

## 2. Colors
Our palette is a high-contrast interplay between the deep voids of the night and the electric "pulse" of performance machinery.

*   **Primary (Neon Blue):** `#69daff` (Primary) and `#00cffc` (Container). This represents the digital heart and electric accents of the logo.
*   **Secondary (Racing Red/Orange):** `#ff7350` (Secondary) and `#b42800` (Container). Taken from the motorcycle frame and sunset, used for critical actions and high-energy alerts.
*   **Neutrals (The Deep):** `#0e0e0e` (Surface/Background) provides the foundation, with `#1a1a1a` to `#2c2c2c` (Surface Containers) providing the structural depth.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or layout. Boundaries must be defined through:
1.  **Background Shifts:** Transitioning from `surface` to `surface-container-low` (`#131313`).
2.  **Tonal Depth:** Placing a `surface-container-high` (`#20201f`) element against a `surface` background.
3.  **Neon Termination:** Using a subtle glow or a gradient fade rather than a hard stroke.

### Surface Hierarchy & Nesting
Treat the UI as a physical assembly of parts. Use the `surface-container` tiers (Lowest to Highest) to create nested importance.
*   **Hero Sections:** Use `surface` (`#0e0e0e`).
*   **Main Content Cards:** Use `surface-container-low` (`#131313`).
*   **Interactive Overlays:** Use `surface-bright` (`#2c2c2c`) with Glassmorphism.

### The "Glass & Gradient" Rule
To mimic the reflective quality of rain-slicked asphalt and polished chrome:
*   **Glassmorphism:** Use `surface-container-high` at 60% opacity with a `20px` backdrop-blur for floating navbars or tooltips.
*   **Signature Textures:** Apply a linear gradient from `primary` (`#69daff`) to `primary_container` (`#00cffc`) at a 135-degree angle for CTA buttons to give them a "metallic glow" rather than a flat fill.

## 3. Typography
The type scale is built to feel mechanical yet sophisticated, using high-performance sans-serifs that echo automotive instrument clusters.

*   **Display & Headlines (Space Grotesk):** A tech-forward, high-personality typeface. Use `display-lg` (3.5rem) with `-0.04em` letter spacing to create a compact, aggressive "racing" look.
*   **Body & Titles (Manrope):** A clean, modern sans-serif that balances the aggression of Space Grotesk. `body-lg` (1rem) provides high legibility against the dark background.
*   **The Hierarchical Soul:** Headlines should use uppercase styling sparingly to denote "Power Labels," while `label-md` is used for technical specs and telemetry data.

## 4. Elevation & Depth
In this system, elevation is conveyed through **Tonal Layering** rather than traditional drop shadows.

*   **The Layering Principle:** Stack `surface-container-lowest` cards on `surface-container-low` sections to create a soft, natural lift. This mimics how different materials (carbon fiber, matte plastic, gloss metal) sit on a motorcycle.
*   **Ambient Shadows:** If a "floating" effect is mandatory, use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6)`. The shadow must never be pure black; it should feel like a deep charcoal pool.
*   **The "Ghost Border":** If a container requires a border for accessibility, use the `outline-variant` (`#484847`) at 15% opacity. High-contrast, 100% opaque borders are strictly forbidden.
*   **Glowing Edges:** To emphasize premium interaction, use a `1px` inner-shadow or top-border with `primary_dim` (`#00c0ea`) at 30% opacity to simulate light hitting a metallic edge.

## 5. Components

### Buttons (The Ignition Points)
*   **Primary:** Gradient fill (`primary` to `primary_container`), `0.25rem` (DEFAULT) roundedness, and a subtle external glow (`primary` at 20% opacity) on hover.
*   **Secondary:** Ghost style. Transparent background, `outline` token at 40% opacity, with a high-energy `on_surface` white text.
*   **Tertiary:** Text-only with an underline that only spans 40% of the text width, mimicking a racing stripe.

### Cards & Lists (The Chassis)
*   **Forbid Divider Lines.** Use `spacing-6` (1.3rem) of vertical white space or a subtle shift from `surface-container` to `surface-container-high` to separate items.
*   **Asymmetric Corners:** Occasionally use `none` for the top-left and bottom-right corners while keeping `xl` (0.75rem) on the opposites to create a "slanted" kinetic feel.

### Telemetry Chips
*   Used for motorcycle specs (e.g., "1200cc", "Slick Tires"). 
*   Style: `surface-container-highest` background, `label-sm` typography, and a `2px` left-accent bar in `secondary` (Racing Red).

### Input Fields
*   Underline-only or subtle "glass" backgrounds. 
*   **State:** When active, the "Ghost Border" becomes a vibrant `primary` glow.

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts. For example, a hero image that breaks out of its container and overlaps a headline.
*   **Do** use "Motion Blurs" in background imagery to reinforce the racing lifestyle.
*   **Do** prioritize high-contrast typography. If the background is `surface`, the text MUST be `on_surface` (pure white) for maximum "Neon" impact.
*   **Do** use the `secondary` (Racing Red) as a "Heat Map" for the most critical user actions.

### Don't:
*   **Don't** use standard Material Design "Elevated" shadows. They look too corporate.
*   **Don't** use 1px solid borders to define boxes. Let the color blocks do the work.
*   **Don't** use rounded corners above `xl` (0.75rem) for main UI containers; excessive roundness dilutes the "edgy" racing aesthetic.
*   **Don't** use generic icons. Every icon should have a consistent line weight that matches the `outline` token.