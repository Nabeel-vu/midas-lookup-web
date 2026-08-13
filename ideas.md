# MidasLookup Design Direction

## Three possible approaches

### Theme Name: Tactical Signal Console
Very dark gaming-intelligence interface with restrained violet signal accents, scanline geometry, player-data rails, and an engineered command-center mood.

**Probability:** 0.07

### Theme Name: Field Manual Light
A bright editorial verification tool inspired by printed player dossiers, warm paper, redacted labels, and utilitarian green confirmation marks.

**Probability:** 0.04

### Theme Name: Tournament Broadcast
A high-energy competition interface with scoreboard framing, broadcast typography, electric cyan markers, and compact match-telemetry modules.

**Probability:** 0.08

## Selected approach: Tactical Signal Console

### Design Movement
Neo-utilitarian gaming intelligence: a restrained fusion of tactical interfaces, premium developer tooling, and competitive player-data systems.

### Core Principles
The interface must feel **precise**, **quietly technical**, **game-aware**, and **operational**. Every decorative element should suggest a signal, a data route, or a verification state rather than generic decoration. Large type establishes mission hierarchy, while compact labels make the system feel instrumented.

### Color Philosophy
Deep navy-black creates the visual field of a command console. Electric violet marks the active signal and brand identity, emerald confirms a successful lookup, and blue-grey text keeps the tool readable for repeated use. Color is reserved for state and routing, not sprayed across every surface.

### Layout Paradigm
Use an asymmetric command layout: a large mission statement and telemetry rail on the left, a focused lookup console on the right, and a low horizontal status band beneath. Avoid a centered landing-page stack whenever the viewport permits. On smaller screens the composition collapses into one clear operational sequence.

### Signature Elements
The page uses a tactical micro-grid, scanline glow, bracket-like console framing, small signal dots, and compact telemetry labels. These motifs should support the lookup task and remain quiet behind the input and result states.

### Interaction Philosophy
Actions should feel like issuing a precise command. The primary button responds immediately, the active lookup state shows a live signal, cached results are explicitly labeled, and validation happens before any network request. Errors should read as operational feedback, never as vague marketing language.

### Animation
Keep motion short and purposeful: pulsing signal dots, a subtle scanline drift, 160–220ms button response, and a restrained result reveal. Respect reduced-motion preferences and never animate layout dimensions. The result state should appear as a confirmed system response, not a celebratory modal.

### Typography System
Use **Barlow Condensed** for display headings and **DM Sans** for readable body and interface copy. Display type is tight, bold, and engineered; labels use uppercase tracking and compact line height; body copy remains calm at 15–16px. Avoid default Inter-like product typography.

### Brand Essence
MidasLookup is a hosted PUBG Mobile player-identity gateway for developers and operators who need a clean, browser-facing lookup without running a local service. Personality: **precise, discreet, field-ready**.

### Brand Voice
Headlines are concise and mission-oriented. CTAs are direct verbs. Microcopy explains what the system is doing without exposing implementation details or sounding like generic SaaS copy.

Example lines:

> Verify player identity through the hosted lookup gateway.

> One ID in. A confirmed player profile out.

### Wordmark & Logo
The mark is a shield intersected by a single signal notch: part verification badge, part telemetry pulse. The wordmark keeps “Midas” compact and “Lookup” clear, with a small uppercase operational descriptor beneath it.

### Signature Brand Color
**Signal Violet — `#7C5CFF`**. It owns the active lookup state, primary action, and small routing marks without becoming a blanket gradient.

## Style Decisions

- The page is a dark gaming-intelligence API console, not a generic dark SaaS dashboard.
- Violet is the active signal; emerald is reserved for successful verification.
- Tactical grids, scanlines, and telemetry rails must remain restrained and never compete with the lookup form.
- Headlines should be condensed and engineered; body copy should be neutral and highly readable.
- Public copy should describe the user outcome and hosted gateway, not expose reverse-engineering implementation details.
