# UI/UX Master Plan: Deep Space Expansion

**Objective:** Unify the entire application under the "Deep Space Geometry" aesthetic established in the Auth pages.

## Phase 1: Auth Pages (Completed ✅)
*   **Theme:** Deep Space Geometry.
*   **Elements:** Floating anomalies, Glassmorphism, Laser-focused inputs.

## Phase 2: Dashboard 2.0 (The Bridge)
*   **Current Status:** Good (Orbital Command v1), but flat.
*   **The Upgrade Plan:**
    1.  **Background:** Extend the "Floating Nebula" animation to the dashboard background so the transition from Login -> Dashboard is seamless.
    2.  **Glass Cards:** Replace solid grey cards with semi-transparent, blurred "Glass" panels (`backdrop-filter: blur`).
    3.  **Holographic Data:** Make the text glowing (Neon Green/Red) rather than just colored.
    4.  **Sparklines:** Replace static "Avg Latency" numbers with a mini CSS-based line graph showing performance over time.

## Phase 3: Public Status Page (The Beacon)
*   **Current Status:** Basic/Light Mode.
*   **The Upgrade Plan:**
    1.  **Dark Mode Conversion:** Invert the colors to match the brand.
    2.  **The "System Core":** A central, pulsing circle at the top. Green = Core Stable. Red = Core Unstable.
    3.  **Timeline View:** Instead of a simple list, show a "Flight Recorder" timeline for each service.

## Phase 4: The Landing Page (The Portal)
*   **Current Status:** Placeholder text.
*   **The Upgrade Plan:**
    1.  **Hero Section:** Huge, cinematic typography ("Monitor the Galaxy").
    2.  **3D Tilt Cards:** Feature cards that tilt when you hover over them.
    3.  **Live Demo:** A fake "Live Monitor" running on the landing page to show off the UI.

## Phase 5: Micro-Interactions (The Polish)
*   **Page Transitions:** Smooth fade-in/slide-up when navigating between pages.
*   **Button Physics:** Buttons that "press down" visibly (transform: scale).
*   **Loading States:** Replace the spinner with a "System Initializing..." terminal text effect.
