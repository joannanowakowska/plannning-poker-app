# Design System — The Fellowship Estimates

Planning Poker web application. A custom design system following GDS principles with a heavy Lord of the Rings theme.

---

## 1. Design Principles

Drawn from the GDS design principles, applied to this product:

1. **Start with user needs** — participants are engineers in a time-pressured meeting. The UI must be immediately usable.
2. **Do less** — MVP only. No decoration that doesn't serve a function.
3. **Make it accessible** — WCAG 2.1 AA is the non-negotiable floor on every component.
4. **Make it simple** — functional copy, clear hierarchy. The LOTR theme lives in visuals and voice, not in obscuring navigation.
5. **Iterate** — this is a living document. Decisions here should be revisited as the product evolves.

> **Implementation note:** This system uses GDS *principles* only. The `govuk-frontend` package is not a dependency. Components are built custom.

---

## 2. Colour Palette

### Shire palette — light mode only

| Token | Hex | Usage |
|---|---|---|
| `--color-parchment` | `#FAF6ED` | Page background |
| `--color-surface` | `#EDE8DA` | Card and panel backgrounds |
| `--color-border` | `#9B8B7A` | Borders, dividers |
| `--color-text-primary` | `#2C1810` | Body copy, labels |
| `--color-text-secondary` | `#5C4A3A` | Supporting text, captions |
| `--color-gold` | `#B8860B` | Primary action colour, accents |
| `--color-gold-hover` | `#9A6F09` | Hover state on gold elements |
| `--color-gold-focus` | `#C9A227` | Focus ring |
| `--color-green` | `#4A6741` | Success states, "voted" indicators |
| `--color-red` | `#8B1A1A` | Error states, destructive actions |
| `--color-text-on-gold` | `#1A0F00` | Text placed on gold backgrounds |

### GDS semantic mapping

| GDS role | This system |
|---|---|
| Primary blue | `--color-gold` |
| Focus yellow | `--color-gold-focus` |
| Error red | `--color-red` |
| Success green | `--color-green` |
| Page background | `--color-parchment` |
| Component background | `--color-surface` |

### Contrast compliance (WCAG 2.1 AA)

- `--color-text-primary` on `--color-parchment`: **11.2:1** ✓
- `--color-text-on-gold` on `--color-gold`: **5.1:1** ✓
- `--color-text-primary` on `--color-surface`: **9.8:1** ✓
- `--color-border` must not carry meaning alone — always pair with text or icon.

---

## 3. Typography

### Typefaces

| Role | Font | Source |
|---|---|---|
| Headings | IM Fell English | Google Fonts |
| Body, UI labels, buttons | Source Sans 3 | Google Fonts |

### Type scale

| Name | Font | Size | Weight | Line height | Usage |
|---|---|---|---|---|---|
| `display` | IM Fell English | 40px | 400 | 1.2 | Page titles, room name |
| `heading-l` | IM Fell English | 32px | 400 | 1.25 | Section headings |
| `heading-m` | IM Fell English | 24px | 400 | 1.3 | Card titles, panel headings |
| `heading-s` | IM Fell English | 20px | 400 | 1.35 | Sub-section labels |
| `body` | Source Sans 3 | 18px | 400 | 1.6 | All body copy |
| `body-s` | Source Sans 3 | 16px | 400 | 1.5 | Supporting text |
| `label` | Source Sans 3 | 16px | 600 | 1.4 | Form labels, button text |
| `caption` | Source Sans 3 | 14px | 400 | 1.4 | Timestamps, meta info |

> **Accessibility note:** IM Fell English is an atmospheric face with reduced legibility at small sizes. It is permitted for headings only (`heading-s` and above). Body copy **must** use Source Sans 3 at 18px minimum.

---

## 4. Spacing Tokens

Base unit: **8px**. Tokens are named by increasing scale using Middle-earth peoples ordered by stature.

| Token | Value | Notes |
|---|---|---|
| `--space-hobbit` | `4px` | Tight internal padding, icon gaps |
| `--space-dwarf` | `8px` | Default internal component padding |
| `--space-man` | `16px` | Component gaps, form field spacing |
| `--space-elf` | `24px` | Section padding, card internal spacing |
| `--space-ent` | `32px` | Between major sections |
| `--space-wizard` | `48px` | Page-level vertical rhythm |
| `--space-eagle` | `64px` | Hero areas, top/bottom page padding |

> **Reference:** Hobbit (smallest) → Dwarf → Man → Elf → Ent → Wizard → Eagle (largest). When in doubt, use the table — do not guess.

---

## 5. Components

### 5.1 Buttons

Three variants. All buttons use Source Sans 3, `label` size, with `4px` border radius.

#### Primary
- Background: `--color-gold`
- Text: `--color-text-on-gold`
- Border: none
- Hover: `--color-gold-hover` background
- Focus: `3px solid --color-gold-focus` outline, `2px` offset

#### Secondary
- Background: transparent
- Text: `--color-text-primary`
- Border: `2px solid --color-border`
- Hover: `--color-surface` background
- Focus: `3px solid --color-gold-focus` outline

#### Destructive (e.g. leave room)
- Background: `--color-red`
- Text: `#FFFFFF`
- Hover: darken `--color-red` by 10%
- Focus: `3px solid --color-gold-focus` outline

#### States
- **Disabled:** 40% opacity on all variants, `cursor: not-allowed`
- **Loading:** replace label with an animated ellipsis, keep dimensions fixed

---

### 5.2 Vote Cards

The centrepiece component. Each card represents one LOTR character vote option.

| Property | Value |
|---|---|
| Background | `--color-surface` |
| Border | `2px solid --color-border` |
| Border radius | `8px` |
| Padding | `--space-elf` |
| Image | Film still (placeholder silhouette during development) |
| Character name | `heading-s`, IM Fell English, `--color-text-primary` |
| Vote value | `body-s`, Source Sans 3, `--color-text-secondary` |

**Selected state:**
- Border: `3px solid --color-gold`
- Box shadow: `0 0 0 2px --color-gold-focus`
- Background: `--color-parchment`

**Hover state:**
- Border: `2px solid --color-gold`
- Transform: `translateY(-2px)` with `transition: 100ms ease`

#### Character deck

| Character | Vote value | Image |
|---|---|---|
| Pippin | `Pippin` | `assets/characters/pippin.jpg` |
| Gimli | `Gimli` | `assets/characters/gimli.jpg` |
| Aragorn | `Aragorn` | `assets/characters/aragorn.jpg` |
| Legolas | `Legolas` | `assets/characters/legolas.jpg` |
| Gandalf | `Gandalf` | `assets/characters/gandalf.jpg` |
| Sauron | `Sauron` | `assets/characters/sauron.webp` |

> **Licensing:** Film stills are from the Peter Jackson Lord of the Rings trilogy. Usage rights must be confirmed before any public release. During development, use placeholder silhouettes at the same dimensions. See epic AIA-56.

---

### 5.3 Participant List

Displays all connected participants and their voting status.

- Each row: participant name (`body`, Source Sans 3) + status indicator
- **Voted:** filled circle, `--color-green`, aria-label `"Stone pledged"`
- **Not yet voted:** empty circle, `--color-border`, aria-label `"Yet to pledge"`
- Host: append a gold crown icon (SVG) after the name, aria-label `"Ringbearer"`
- You (current user): append `(thee)` in `--color-text-secondary`

---

### 5.4 Notification / Status Banner

Replaces the GDS notification banner. Full-width, sits below the page header.

| Variant | Background | Border-left | Usage |
|---|---|---|---|
| Info | `--color-surface` | `4px solid --color-gold` | General status messages |
| Success | `#E8F5E5` | `4px solid --color-green` | Votes revealed, room created |
| Error | `#F5E8E8` | `4px solid --color-red` | Connection lost, room not found |

---

### 5.5 Form Inputs

Used on the join room and create room flows.

- Border: `2px solid --color-border`
- Border radius: `4px`
- Padding: `--space-dwarf` vertical, `--space-man` horizontal
- Font: Source Sans 3, `body` size
- Focus: border colour `--color-gold`, `3px solid --color-gold-focus` outline
- Error: border colour `--color-red`, error message below in `--color-red`, `caption` size
- Label: above input, `label` style, `--space-dwarf` gap

---

## 6. Imagery

### Character images
- Aspect ratio: `3:4` (portrait)
- Dimensions (desktop): `180px × 240px`
- Dimensions (mobile): `120px × 160px`
- Object fit: `cover`, anchored top-centre
- Alt text: `"[Character name], vote option"` — e.g. `"Gandalf, vote option"`

### Development placeholders
Use a dark grey rectangle (`#3D2B1F`) with the character name centred in IM Fell English, white, at the appropriate dimensions. Store in `assets/characters/placeholders/`.

---

## 7. Responsive Strategy

**Approach:** Desktop-first. The primary use case is a laptop in a meeting room. Mobile receives a functional layout that is not broken but is not optimised.

### Breakpoints

| Name | Min-width | Layout behaviour |
|---|---|---|
| Mobile | `320px` | Single column, stacked cards (2 per row max) |
| Tablet | `641px` | Two-column layout where applicable |
| Desktop | `1024px` | Full layout, 3-column vote card grid |

### Vote card grid
- Desktop: 3 columns, `--space-elf` gap
- Tablet: 2 columns
- Mobile: 2 columns, reduced card padding

### Participant list
- Desktop: sidebar alongside vote cards
- Mobile/Tablet: collapsible panel above vote cards, collapsed by default

---

## 8. Copy & Tone of Voice — Middle-earth Glossary

All UI copy uses a full Middle-earth voice. Every string must be drawn from this glossary. If a new string is needed, add it here before implementing it.

> **Principle:** The voice should feel like a narrator from the books, not a theme park. Formal, ancient, never silly.

### Actions

| Functional meaning | Middle-earth copy |
|---|---|
| Create room | "Summon the Fellowship" |
| Join room | "Answer the Call" |
| Enter your name | "Name thyself" |
| Copy invite link | "Forge the Invitation" |
| Cast vote | "Pledge your stone" |
| Change vote | "Reconsider thy pledge" |
| Reveal votes | "Let the stones be shown" |
| Reset for next ticket | "A new quest begins" |
| Leave room | "Depart the council" |

### Status messages

| Functional meaning | Middle-earth copy |
|---|---|
| Waiting for others to vote | "The council deliberates…" |
| All votes cast | "The Fellowship has spoken" |
| Votes revealed | "The stones are revealed" |
| You are the host | "Thou art the Ringbearer" |
| Host has left | "The Ringbearer has departed" |
| You are now host | "The Ring passes to thee" |
| Participant joined | "[Name] has joined the council" |
| Participant left | "[Name] has departed" |
| You have voted | "Thy stone is pledged" |
| Participant voted | "[Name] has pledged" |
| Participant not voted | "[Name] has yet to pledge" |

### Errors

| Functional meaning | Middle-earth copy |
|---|---|
| Connection lost | "The Palantír has gone dark. Attempting to reconnect…" |
| Room not found | "No fellowship was found upon this path." |
| Failed to create room | "The summons could not be sent. Pray, try again." |
| Failed to join room | "The council doors would not open. Pray, try again." |
| Name required | "Thou must name thyself before entering." |

### Labels & UI chrome

| Functional meaning | Middle-earth copy |
|---|---|
| Participants | "The Fellowship" |
| Votes (hidden) | "Stones pledged" |
| Votes (revealed) | "The council's wisdom" |
| Host | "Ringbearer" |
| You (current user) | "thee" |
| Voted indicator | "Stone pledged" |
| Not voted indicator | "Yet to pledge" |
| Room link | "The Invitation" |

---

## 9. Accessibility Checklist

All components must satisfy the following before shipping:

- [ ] WCAG 2.1 AA contrast ratio on all text and UI elements
- [ ] All interactive elements reachable and operable by keyboard
- [ ] Focus indicators visible at `3px solid --color-gold-focus`
- [ ] All images have descriptive `alt` text
- [ ] Status changes announced via `aria-live` regions (vote cast, votes revealed, participant joined/left)
- [ ] Vote cards use `<button>` elements with `aria-pressed` to reflect selected state
- [ ] Participant voting status uses `aria-label` on status indicators, not colour alone
- [ ] IM Fell English not used below `20px`
- [ ] Form errors associated to inputs via `aria-describedby`

---

## 10. Design Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-07-08 | GDS principles only, no govuk-frontend package | Internal tool; govuk-frontend is too opinionated for heavy theming |
| 2026-07-08 | Light/Shire palette | Earthy, readable, coheres with illustrated/parchment aesthetic |
| 2026-07-08 | IM Fell English + Source Sans 3 | Atmospheric headings; practical accessible body copy |
| 2026-07-08 | Thematic spacing tokens | Consistency with Middle-earth voice throughout the codebase |
| 2026-07-08 | Peter Jackson film stills | High recognisability; licensing required before public release |
| 2026-07-08 | WCAG 2.1 AA minimum | GDS-aligned accessibility floor |
| 2026-07-08 | Full Middle-earth voice | Immersive theme; governed by glossary in §8 to ensure consistency |
| 2026-07-08 | Conventional component names in code | Developer experience; thematic names in code obscure meaning |
| 2026-07-08 | Desktop-first responsive | Primary use case is meeting-room laptop; mobile functional not optimised |
