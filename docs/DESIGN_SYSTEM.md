Design Philosophy & Visual DNA
This design system blends the technical, high-contrast clarity of Linear, the spatial utility of Vercel, and the typographic precision of Stripe. We prioritize extreme snappiness, command-line efficiency, and an invisible interface that lets data and AI insights breathe.

1. Foundations
Color Palette (Sub-pixel Grayscale & Accents)
We use a high-fidelity, neutral-heavy palette with selective, high-chroma semantic accents to keep the focus entirely on candidate profiles and pipeline metrics.

Token,Hex Value,Purpose / Application
bg-app,#030303,Pure dark mode base canvas
bg-surface,#0A0A0B,"Default card, container, and sidebar background"
bg-elevated,#121214,"Dropdowns, dialogs, floating tooltips"
border-subtle,#1D1D20,"Subtle element separations, internal lines"
border-muted,#2A2A2E,"Focus indicators, primary container outlines"
text-primary,#F4F4F5,"High-contrast headers, primary text data"
text-secondary,#A1A1AA,"Labels, metadata, sub-headings"
text-muted,#52525B,"Timestamps, secondary hints, disabled states"
accent-primary,#5E6AD2,"Linear Purple – primary actions, high-intent focus"
accent-glow,#A3AED0,Vercel Silver – subtle interactive states
brand-ai,#00DF89,"TalentHub Mint – AI features, match ratings, automated highlights"

Typography
Primary Sans: Geist Sans, system fallback (-apple-system, BlinkMacSystemFont, Segoe UI)

Data & Monospace: Geist Mono, system fallback (SFMono-Regular, Consolas)

Display Large  ── 32px / line-height: 38px (Bold, -0.03em tracking)
Heading Medium ── 20px / line-height: 26px (Medium, -0.02em tracking)
Body Standard  ── 14px / line-height: 20px (Regular, -0.01em tracking)
Meta / Monospc ── 12px / line-height: 16px (Regular, 0em tracking)

Spacing System (4px Grid)
Every padding, margin, and layout gap derives strictly from an 8-point base grid, with a 4px step reserved for ultra-dense data clusters.

space-1: 4px (Label to input gap)

space-2: 8px (Internal button padding, inline element spacing)

space-4: 16px (Standard card padding, list item gaps)

space-6: 24px (Dashboard layout margins, container gutter)

space-8: 32px (Section breaks, hero spacing layouts)

2. Global Component Architectures
Design Tokens Checklist
┌────────────────────────────────────────────────────────┐
│  Radius: Small [4px] (Inputs, inner items)             │
│  Radius: Medium [8px] (Buttons, default standard tags) │
│  Radius: Large [12px] (Cards, Modals, Canvas areas)    │
│  Shadow: 0 0 0 1px border-subtle, 0 8px 32px bg-app     │
└────────────────────────────────────────────────────────┘
Sidebar & Command Engine
The sidebar is locked at a fixed width of 240px, rendering inline border separators rather than heavy background fills.
+----------------────────────────────+
| [⚡] TalentHub AI (Enterprise)  [v] |  <-- Org Switcher (Stripe style)
+----------------─────────────────────+
| 🔍 Search or press ⌘K               |  <-- Raycast Inline Omni-Bar
|                                      |
|  FAVORITES                          |
|  ↳ ⚡ Senior AI Engineer Pipeline   |
|  ↳ 📂 Active Requisitions           |
|                                     |
|  WORKSPACE                          |
|  ■ Dashboard              [⌥1]      |
|  □ Candidates             [⌥2]      |
|  □ Postings               [⌥3]      |
|  □ Analytics              [⌥4]      |
|                                     |
|  SETTINGS                           |
|  ⚙️ Platform Admin                   |
+----------------────────────────────

Navigation & Segmented Controls
Directly inspired by Vercel’s flat interface navigation. Tabs sit cleanly on a single horizontal row with an animated gray capsule backdrop shifting on hover or focus.
[ All Candidates ]  [ Shortlisted (14) ]  [ Sourced via AI ]  [ Archived ]

Buttons & States
Buttons leverage micro-borders and subtle gradients to appear crisp against pitch-black backgrounds.

Primary Action: Solid white text on #5E6AD2 (Linear Purple). On hover, it shifts to a slightly brighter indigo tint with a 0 0 12px rgba(94, 106, 210, 0.4) outer glow.

Secondary / Ghost: Transparent background with an internal outline of border-subtle (#1D1D20). Text matches text-secondary. On hover, the background transitions softly to bg-elevated (#121214).

Monochromatic Data Charts
Instead of multi-colored charts, we use single-hue data visualizations modeled after GitHub's commit graphs and Stripe's dashboard readouts.

Pipeline Velocity Sparkline: A crisp 1.5px vector path drawn in brand-ai (#00DF89) against an invisible background, showing an organic trend line. A trailing glow marks the latest value.

Volume Over Time Histograms: Vertical data bars styled in text-muted (#52525B). High-volume peaks organically shift into bright white variants to display performance spikes clearly without relying on rainbow color charts.

3. Layout Specs & Component States
Dashboard Layout (Three-Column Layout Matrix)
+-----------------------------------------------------------------------------------------+
| Sidebar (240px) | Main Pipeline Canvas (Fluid Width)               | AI Inspector (380px) |
|                 |                                                  |                      |
| • Workspace     | [Heading: Active Requisitions]                   | [Candidate Card]     |
| • Candidates    |                                                  | Alex Rivera          |
| • Analytics     | +----------------------------------------------+ | 98% Match (Mint)     |
|                 | | [Kanban: Sourced]  [Kanban: Screened]  [More]| |                      |
|                 | | • Alex Rivera      | • Jordan Lee      |     | Key Insight:           |
|                 | | • Taylor Swift     | • Casey Jones     |     | Expert in Next.js edge |
|                 | +----------------------------------------------+ | routing systems.     |
+-----------------------------------------------------------------------------------------+

Landing Page Layout (The Vercel Matrix)
Hero Section: Pure dark background (#000000). Large display text centered on the screen with tracking set tightly to -0.03em. A subtle gradient transitions text from absolute white down to a dim slate-gray at the bottom.

CTA Block: A minimal email input field paired with an execution shortcut prompt: Press Enter ↵.

The Feature Grid: Highly defined, border-isolated grid sections mimicking Notion's clean layouts. Each module uses thin, 1px separation lines to showcase interactive feature previews on hover.

Component Cards
Cards use a subtle #1D1D20 outline. The header contains essential metrics, while the background shifts instantly to a deep charcoal hue whenever hovered.
┌────────────────────────────────────────────────────────┐
│  Alex Rivera • Senior Full-Stack Engineer   [ 98% AI ] │ <-- Mint Tag
├────────────────────────────────────────────────────────┤
│  Stack: Next.js, Go, AWS, Supabase, Postgres            │
│  Last Role: Staff Engineer at Stripe (3 Years)         │
├────────────────────────────────────────────────────────┤
│  💬 Matched automatically via natural language profile │
└────────────────────────────────────────────────────────┘
Skeleton Loaders & Empty States
Skeleton Loading Paradigm
Avoid bright flashing animations. Use a subtle linear gradient that cycles gently between #0A0A0B and #121214 over a 2-second loop. Match layout cards exactly to prevent unexpected structural shifting when data populates.
┌────────────────────────────────────────────────────────┐
│  █████████████████                           [ ████ ]  │ <-- Soft Pulse
├────────────────────────────────────────────────────────┤
│  ████████████████████████████████████████████████████  │
└────────────────────────────────────────────────────────┘

High-Intent Empty State
When a view contains no entries, display a clean layout inspired by Raycast. Skip giant, generic illustrations and center a clean, functional prompt instead.
┌───────────┐
                     │ 📥 No App │
                     └───────────┘
          No pending candidates found in this stage.
       Press ⌘N to source new matches using AI Copilot.

4. Interaction, Mobile & Accessibility
Micro-Animations & Interface Transitions
Command Bar Transition (Raycast Style): Pressing ⌘K slides the central command window downward from the top of the interface by 20px while scaling it from 95% to 100%. This transition uses a precise cubic-bezier easing curve: cubic-bezier(0.16, 1, 0.3, 1) over a snappy 180ms window.

List Sorting Motion: When updating lists or shifting pipeline candidates across board columns, use layout-preserving transitions. Avoid jarring jumps by animating layout reordering smoothly over 200ms.

Interactive Hover Scaling: Interactive elements like buttons and navigation tabs do not grow larger on hover. Instead, they trigger a crisp transition of their internal background colors and subtle border outlines over 80ms.

Mobile UX Adaptation
Sidebar Transition: The full desktop sidebar transforms into a bottom navigation shelf that slides into view only when tapping the menu icon.

Data Presentation: Complex multi-column data views consolidate dynamically into a single-column card list optimized for vertical touch gestures.

Action Sheets: Desktop context menus open via right-click or keyboard commands transform into clean, swipeable bottom sheets on mobile devices.

Accessibility Enhancements (WCAG 2.2 AA)
High Contrast Elements: Text elements marked as text-muted (#52525B) are restricted to non-essential metadata and timestamps. Critical interactive options use a minimum contrast ratio of 4.5:1 against the dark application canvas.

Keyboard Focus Rings: We avoid default system focus styles. All custom interactive items display a clear 2px solid #5E6AD2 focus ring paired with a 2px absolute offset whenever navigated via keyboard.

Screen Reader Integrity: Interactive status symbols, color-coded tags, and metric indicators include explicit screen reader labels (aria-label), ensuring visual data highlights translate accurately to assistive technologies.