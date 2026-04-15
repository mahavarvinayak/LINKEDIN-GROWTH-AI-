# Design System: The Editorial Growth Engine

## 1. Overview & Creative North Star
**Creative North Star: The Intelligent Atelier**
This design system moves beyond the "SaaS template" aesthetic to create a space that feels like a high-end editorial workspace. It is designed for the LinkedIn strategist who values precision, authority, and calm. We achieve this by rejecting rigid "box-and-line" layouts in favor of **Organic Structuralism**—a method where content is organized through tonal depth, generous whitespace, and high-contrast typography that mirrors a premium broadsheet.

### Breaking the Template
*   **Intentional Asymmetry:** Use the 12-column grid as a suggestion, not a cage. Shift primary content blocks slightly off-center or use varying column spans for metadata to create a "curated" rather than "generated" feel.
*   **Layered Surfaces:** We do not draw boxes; we stack sheets of digital paper.
*   **Typography as Architecture:** Large serif headings provide the structural "pillars," while mono-spaced text provides a "lab-like" precision to technical data.

---

## 2. Colors: Tonal Architecture
The palette is rooted in warmth and intellectual depth, moving away from sterile clinical whites to a "Gallery Bone" aesthetic.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders for sectioning or layout containment. Use background shifts to define boundaries.
*   Place a `surface` (#FFFFFF) card on a `bg` (#F8F7F4) backdrop.
*   Use `surface-2` (#F1EFE9) for recessed areas like code blocks or secondary sidebars.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack. 
1.  **Level 0 (Base):** `bg` (#F8F7F4) - The foundation.
2.  **Level 1 (Section):** `surface` (#FFFFFF) - Primary content areas.
3.  **Level 2 (Inlay):** `surface-2` (#F1EFE9) - Used for inputs, recessed data cards, or "inner" containers to create tactile depth.

### The Glass & Gradient Rule
To ensure the system feels premium, floating elements (Modals, Popovers) must use **Glassmorphism**.
*   **Background:** `surface` at 80% opacity.
*   **Effect:** 20px Backdrop Blur.
*   **Signature Texture:** Main Action buttons should utilize a subtle linear gradient: `accent` (#2563EB) to `accent-hover` (#1D4ED8) at a 145-degree angle. This provides a "jewel-like" depth that flat buttons lack.

---

## 3. Typography: Editorial Authority
We utilize a triple-font pairing to distinguish between narrative, utility, and technical data.

*   **Display & Headings (DM Serif Display):** Used for large titles and "The Big Story." It conveys confidence and legacy.
*   **UI & Body (DM Sans):** The workhorse. Clean, highly legible, and modern. Used for navigation, labels, and long-form reading.
*   **Post Previews (JetBrains Mono):** This is our "Signature Texture." By using a monospaced font for LinkedIn post drafts, we signal to the user that this is "work in progress" or "raw data" being refined by AI.

| Level | Font | Size | Case/Weight | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Display-LG** | DM Serif | 3.5rem | Regular | Hero sections |
| **Headline-SM** | DM Serif | 1.5rem | Regular | Card Titles |
| **Title-MD** | DM Sans | 1.125rem | Medium | Subsection headers |
| **Label-MD** | DM Sans | 0.75rem | Bold (All Caps) | Navigation / Small Caps |
| **Code-UI** | JetBrains | 0.875rem | Regular | Post Previews / AI Outputs |

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering**, not structural shadows.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. The 1% shift in hex value creates a "soft lift" that feels natural to the eye.
*   **Ambient Shadows:** For "Floating" elements only. 
    *   `box-shadow: 0 12px 40px rgba(26, 24, 20, 0.06);` 
    *   Notice the shadow is a tint of our `text-primary` (#1A1814), not pure black.
*   **The Ghost Border:** If a boundary is strictly required for accessibility:
    *   Use `border: 1px solid rgba(229, 226, 218, 0.4);` 
    *   Never use 100% opacity for borders.

---

## 5. Components

### Buttons: The Tactile Triggers
*   **Primary:** Gradient `accent` to `accent-hover`. 8px radius. White text. Subtle 4px blur shadow on hover.
*   **Secondary:** `surface-2` background with `text-primary`. No border. Hover: `border` (#E5E2DA) background.
*   **Destructive:** `danger-soft` background with `danger` text. Transitions to solid `danger` on hover.

### Input Fields & Textareas
*   **Base:** `surface-2` background, 8px radius. 
*   **Focus State:** Background shifts to `surface` (white) with a 2pt "Ghost Border" of `accent`.
*   **Labeling:** Labels sit *inside* the vertical rhythm but use `Label-MD` (All Caps) in `text-secondary`.

### Score Card (Growth Metrics)
*   **Style:** No borders. `surface` background.
*   **Progress Bars:** 4px height (pill-shaped). Use `success`, `warning`, or `accent` tokens.
*   **The Detail:** Include a small trend indicator in `JetBrains Mono` to emphasize the "Lab" aspect of the brand.

### Sidebar: The Dark Atelier
*   **Background:** `sidebar` (#1A1814).
*   **Active State:** No bulky backgrounds. An active item is indicated by `sidebar-active` (#2563EB) text color and a 2px vertical "needle" on the far left.
*   **User Profile Strip:** Positioned at the bottom, separated by a 15% opacity `sidebar-text` horizontal rule.

### Alert Banners
*   **Structure:** Floating, glassmorphic pills or bars. 
*   **Color:** Use the "Soft" variant tokens (e.g., `success-soft`) with 12px blur. Text must be the high-contrast variant (e.g., `success`).

### Skeleton Loaders
*   **Base:** `surface-2`.
*   **Shimmer:** A linear gradient of `surface` at 30% opacity moving at a 45-degree angle. 2-second loop.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use `JetBrains Mono` for any AI-generated text or data to differentiate it from human-authored UI.
*   **Do** use generous white space. If a section feels crowded, increase the spacing to the next tier in the 4px scale.
*   **Do** use "surface-on-surface" nesting to create hierarchy.

### Don't:
*   **Don't** use 1px solid black or dark grey borders to separate sections.
*   **Don't** use standard "Drop Shadows" (high opacity, low blur).
*   **Don't** use `DM Serif Display` for body text; it is reserved for editorial moments and impact.
*   **Don't** use "Card-in-Card" layouts without a background color shift to distinguish the levels.