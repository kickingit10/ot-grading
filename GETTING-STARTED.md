# How to Build Software That Doesn't Suck

A getting started guide distilled from the OT Tracker build. Written for Scott, optimized for reuse with AI coding assistants, and eventually for onboarding engineers.

---

## Part 1: The Right Order to Build Things

Most people (including experienced developers) get the order wrong. They jump into code, then fight design, then realize the architecture is off. Here's the order that eliminates the most rework, based on what actually happened during OT Tracker.

### Phase 0: Define the Problem (1 hour)

Before touching any tool, answer three questions in plain English:

1. **Who is this for?** One sentence. ("School-based OT therapists who track fine motor skills for elementary students.")
2. **What's the one job it does?** Not five jobs. One. ("Replace the spreadsheet they use for grading and report cards.")
3. **What does 'done' look like?** The moment a user says "this is better than what I had." ("I entered a grade in 10 seconds and printed a report card without opening Excel.")

Write these down. They become your filter for every decision. When you're debating whether to add a feature, check it against #2. If it doesn't serve the one job, it waits.

### Phase 1: Map the User Journey (2-3 hours)

Before writing code, sketch the screens a user sees from first visit to "aha, this is useful." For OT Tracker, that journey was:

```
Homepage → Demo → See dashboard with students → Enter a grade → See report card update → "Oh, this replaces my spreadsheet"
```

The number of screens between "landing" and "aha" is your **time to insight**. Every extra screen is a place people drop off. The best products in the world (Notion, Linear, Figma) obsess over shortening this path.

**Action**: Write out your journey as a numbered list. Count the steps. If it's more than 5, find ways to combine or eliminate steps.

### Phase 2: Lock the Design System (2-3 hours)

This is the step that saves the most time later. Before building any UI, define:

1. **Type scale** — Every font size in your app, written down once
2. **Spacing scale** — Every gap, margin, and padding value
3. **Color tokens** — Named variables, not hex codes scattered everywhere
4. **Component sizes** — Button heights, input heights, card padding

You define these in your CSS file (like `globals.css`) and never deviate. When AI generates code, it uses these values. When you review code, you check against these values. No more "does 14px look right? maybe 13px? how about 15px?" — the system already decided.

See Part 2 below for the exact Apple HIG values we used.

### Phase 3: Build the Core Loop First (1-2 days)

The "core loop" is the thing the user does repeatedly. For OT Tracker: **enter a grade → see the average update**. For a task manager: **create a task → mark it done**. For a social app: **post something → see engagement**.

Build ONLY this loop first. Hardcode everything else. Fake the auth. Fake the data. Use a demo mode with mock data so you can iterate on the UX without fighting databases.

**Why this matters**: You spent 70% of OT Tracker's polish time on the grade entry and report card screens. If those had been built first with mock data, you could have perfected them before wiring up Supabase.

### Phase 4: Wire Up the Backend (1-2 days)

Once the core loop feels right with fake data, replace the mocks with real database calls. This is when Supabase (or whatever backend) comes in.

### Phase 5: Polish and Ship (ongoing)

Now you do the design polish pass. But because you locked your design system in Phase 2, polish is about alignment and spacing tweaks — not inventing the type scale from scratch.

---

## Part 2: Apple HIG Design Rules

Apple's Human Interface Guidelines are the closest thing to "objectively correct UI design." These are the exact values we used. Memorize them or paste them into your AI prompt.

### Type Scale

| Name         | Size  | Weight | Use for                          |
|-------------|-------|--------|----------------------------------|
| Large Title | 34px  | 700    | Page titles (sparingly)          |
| Title 1     | 28px  | 700    | Main headings (h1)               |
| Title 2     | 22px  | 700    | Section headings (h2)            |
| Title 3     | 20px  | 600    | Subsection headings (h3)         |
| Headline    | 17px  | 600    | Card titles, bold labels          |
| Body        | 17px  | 400    | Default text everywhere          |
| Callout     | 16px  | 400    | Slightly smaller body text        |
| Subhead     | 15px  | 400    | Secondary text, button labels     |
| Footnote    | 13px  | 400    | Helper text, timestamps, captions |
| Caption     | 12px  | 400    | Absolute minimum — badges only    |

**Rules**:
- Body text is 17px, not 14px or 16px. This is the most common mistake.
- Never go below 13px for any readable text. 12px is only for badges and chips.
- Never go below 11px for anything, period.

### Spacing

Apple uses a **16px base unit**. Everything is a multiple:

| Relationship              | Spacing    |
|--------------------------|------------|
| Related items (label→input) | 8px        |
| Grouped items (input→input) | 12px       |
| Sections                    | 24-32px    |
| Major page sections         | 48-80px    |
| Page edge padding           | 16-24px    |

**Rules**:
- Touch targets must be at least **44×44px**. This means buttons, links, inputs — anything a human taps.
- Cards get **16px padding** minimum.
- Border radius: 8-12px for cards, 6-8px for buttons, 4px for small elements.

### Color

Don't invent colors. Use a system:

- `--color-text`: Primary text (near-black, like #1d1d1f)
- `--color-text-muted`: Secondary text (gray, like #86868b)
- `--color-bg`: Page background
- `--color-bg-card`: Card/surface background
- `--color-border`: Subtle borders (like rgba(0,0,0,0.06))
- `--color-primary`: Your brand/accent color

Define these as CSS custom properties. Reference them everywhere. Swap them for themes.

---

## Part 3: Tailwind v4 — The Gotchas That Will Waste Your Time

### The #1 Problem: Classes That Silently Don't Generate

Tailwind v4 uses a new engine that scans your code for class names and generates only the CSS it finds. **The problem**: some utility classes don't reliably generate. We discovered this the hard way — changes would "deploy" but nothing visually changed.

**Classes that failed us**: `gap-*`, `mb-*`, `space-y-*`, `max-w-*`, `mx-auto`, `text-sm`, `text-xs`, `text-2xl`, `p-*`, `text-[10px]` (arbitrary values).

### The Fix: Inline Styles for Spacing and Typography

Every spacing and font-size value should use inline `style={{}}` instead of Tailwind classes:

```tsx
// ❌ DON'T — may silently not render
<div className="flex gap-4 mb-8 text-sm">

// ✅ DO — always works
<div className="flex" style={{ gap: 16, marginBottom: 32, fontSize: 15 }}>
```

**What's still safe to use as Tailwind classes**: `flex`, `grid`, `hidden`, `block`, `relative`, `absolute`, `sticky`, `z-50`, `overflow-hidden`, `min-h-screen`, `w-full`, `rounded-*` (sometimes). Basically: display, position, and overflow are fine. Spacing and typography are not.

### How to Verify a Fix Actually Rendered

1. Deploy the change
2. Hard refresh the page (Cmd+Shift+R)
3. Right-click the element → Inspect → check the computed styles
4. If the CSS value isn't in "Computed" tab, Tailwind didn't generate it

---

## Part 4: Architecture Patterns

### Stack: Next.js + Supabase + Tailwind + Vercel

This is the stack we used and it's a solid, scalable choice for any SaaS product. Here's what each piece does:

- **Next.js** (App Router): React framework. Handles routing, server-side rendering, API routes. The "app" folder = your pages.
- **Supabase**: Database (PostgreSQL) + authentication + real-time subscriptions. Like Firebase but with SQL.
- **Tailwind CSS**: Utility-first CSS framework. Write styles as class names instead of separate CSS files.
- **Vercel**: Hosting + deployment. Push to GitHub, it deploys automatically.

### Demo Mode Pattern

When you want people to try your app without signing up, build a self-contained demo:

1. Create a `/demo` route with its own layout
2. Create a `mock-data.ts` file with hardcoded fake data
3. **Zero imports from your database layer** — grep for "supabase" in your demo folder. If you find any, you have a leak.
4. State changes save to React state only (disappear on refresh — that's fine)
5. Demo navbar links back to homepage, not into the real app

### Theme System Pattern

OT Tracker supports 4 theme combos × 10 era sub-themes:

- `data-theme` attribute on `<html>`: "default" or "taylorSwift"
- `data-mode` attribute: "light" or "dark"
- `data-era` attribute: "fearless", "midnights", etc.
- CSS custom properties change based on these attributes
- Components read `var(--color-*)` — they never hardcode colors

**Gotcha**: Transparent backgrounds in themes. If `--color-bg-card` is `rgba(255,255,255,0.75)`, dropdowns will be see-through. Fix: use `background: var(--color-bg, #ffffff)` with `backdropFilter: blur(20px)` as a fallback.

### ETH Zurich Prompt Philosophy

A [February 2026 study from ETH Zurich](https://www.marktechpost.com/2026/02/25/new-eth-zurich-study-proves-your-ai-coding-agents-are-failing-because-your-agents-md-files-are-too-detailed/) found that detailed AGENTS.md / CLAUDE.md files actually **reduce task success rates by ~3%** while **increasing inference costs by 20%+**. The more verbose your context file, the worse the AI performs — because it gets bogged down in redundant instructions and unnecessary requirements.

**What this means in practice:**
- Don't write a 500-line CLAUDE.md explaining your whole codebase
- Don't include "why" explanations — just state the rule
- Don't repeat what the AI already knows (like "use TypeScript")
- DO include only rules the AI will violate without the reminder
- DO use short, exact, code-diff style prompts when asking for fixes

**The prompt format that works best:**

```
File: src/components/navbar.tsx
Line 45
Old: className="text-sm p-2"
New: style={{ fontSize: 15, padding: '10px 16px', minHeight: 44 }}
```

Keep your CLAUDE.md under 50 lines. If you find yourself writing paragraphs of explanation, you're hurting performance, not helping it.

> **Key insight from OT Tracker**: When we switched from verbose "please update the spacing and make it look better" prompts to exact file-path-and-line-number diffs, fixes started landing on the first try instead of the third.

---

## Part 5: Development Workflow

### The Build-Deploy-Verify Loop

```
1. Make changes in code
2. Run: npx next build (catches compile errors)
3. Run: git add [files] && git commit -m "description" && git push
4. Vercel auto-deploys from GitHub (takes ~60 seconds)
5. Hard refresh the live site (Cmd+Shift+R)
6. Inspect the element to verify CSS actually applied
```

**Critical**: Step 6 is not optional. "I pushed the code" does not mean "the CSS rendered." Tailwind v4 can silently drop classes.

### Debugging Tips

- **"Nothing changed"**: Check if you used a Tailwind class that didn't generate. Switch to inline style.
- **"It works locally but not deployed"**: Clear the `.next` folder (`rm -rf .next`) and rebuild. The cache lies.
- **"The build fails with EPERM"**: The `.next` folder has stale lock files (common on iCloud-synced folders). Delete `.next` and rebuild.
- **"My changes are deployed but the page looks the same"**: Hard refresh. Check if you're looking at the right URL. Check if auth is redirecting you.

### Environment Gotchas

- Supabase environment variables must be set in Vercel dashboard (Settings → Environment Variables), not just in `.env.local`
- The `.next` folder should be in `.gitignore` — never commit it
- If you're on iCloud, the sync can create duplicate files (like `routes.d 2.ts`). These break TypeScript. Solution: add iCloud exclusion for `.next` and `node_modules`

---

## Part 6: What Top SaaS Companies Do That You Probably Aren't

This is the "blindspots" section. These are things Figma, Linear, Notion, Vercel, and Stripe all do that separate amateur products from professional ones.

### 1. Loading States (Priority: High)

Every screen that fetches data should show a skeleton/placeholder while loading — not a blank screen or a spinner. Users perceive skeleton screens as 30-40% faster than spinners. *Effort: 2-4 hours.*

### 2. Error States (Priority: High)

What happens when the database is down? When the user has no students? When a grade fails to save? Right now, most of these show nothing or crash. *Effort: 3-5 hours.*

### 3. Optimistic Updates (Priority: Medium)

When a user saves a grade, the UI should update instantly — before the server confirms. If the save fails, roll back. This makes the app feel instant. *Effort: 3-4 hours.*

### 4. Keyboard Navigation (Priority: Medium)

Power users (like OTs entering 30 grades in a row) want to never touch the mouse. Tab between fields, Enter to save, arrow keys to navigate. *Effort: 4-6 hours.*

### 5. Accessibility (Priority: High)

Screen readers, color contrast, focus indicators, ARIA labels. If Kyleigh's school district requires ADA compliance, this becomes a blocker. *Effort: 4-8 hours.*

### 6. Performance / Core Web Vitals (Priority: Medium)

Google measures three things: how fast content appears (LCP), how quickly the page responds to input (INP), and how much the layout shifts around (CLS). Target 90+ Lighthouse scores. *Effort: 2-4 hours.*

### 7. Analytics (Priority: Medium)

You should know: how many people visit the homepage, how many click "Try the demo," how many enter a grade in the demo. Add Vercel Analytics (free) or PostHog (free tier). *Effort: 30 minutes.*

### 8. SEO & Open Graph (Priority: Low-Medium)

When someone shares your link on Slack/Twitter/iMessage, what shows up? Custom OG images and descriptions for every page. *Effort: 1-2 hours.*

### 9. Onboarding / First-Run Experience (Priority: Medium)

The first time a real user signs in, what do they see? An empty dashboard is demoralizing. Show a checklist or guided walkthrough instead. *Effort: 4-6 hours.*

### 10. Data Export (Priority: Low)

CSV export of grades, PDF export of report cards. Builds trust — users aren't locked in. *Effort: 2-3 hours.*

---

## Part 7: How to Scope and Budget a Software Project

This section is for when someone says "we need a portal" and you need to figure out what that costs.

### The Framework: Jobs, Screens, Complexity

1. **List the jobs** the software does. A "portal" might be: login, view dashboard, submit a form, download a report, manage users. That's 5 jobs.
2. **Count the screens**. Each job usually = 1-3 screens. 5 jobs × 2 screens = ~10 screens.
3. **Rate the complexity** of each screen:
   - **Simple** (static content, forms, lists): 4-8 hours each
   - **Medium** (data tables, filtering, charts): 8-16 hours each
   - **Complex** (real-time updates, file uploads, integrations): 16-40 hours each
4. **Add infrastructure**: Auth, database setup, deployment, email. Usually 20-40 hours for a standard web app.
5. **Add the multiplier**:
   - If built by you + AI: multiply hours by 1.5× (for learning and debugging)
   - If built by a junior engineer: multiply by 1.3×
   - If built by a senior engineer: use the hours as-is
   - If built by an agency: multiply by 2× (communication overhead)

### Example: OT Tracker Budget

| Component             | Complexity | Hours |
|----------------------|-----------|-------|
| Auth (login/signup)   | Medium    | 12    |
| Dashboard             | Medium    | 16    |
| Student detail + grading | Complex | 32    |
| Reports               | Medium    | 16    |
| Profile/settings      | Simple    | 6     |
| Demo mode             | Medium    | 12    |
| Homepage              | Medium    | 8     |
| Design system + theming | Complex | 24    |
| Infrastructure        | —         | 30    |
| **Total**             |           | **156 hours** |

At a freelance rate of $100-150/hr, that's $15,600-$23,400. At an agency, probably $30,000-$50,000.

### The Claude Code Multiplier: What Actually Happened

The budget table above shows 156 hours at traditional engineering rates. Here's what actually happened with OT Tracker:

| Metric               | Traditional Estimate | With Claude Code    |
|----------------------|---------------------|---------------------|
| Total hours          | 156 hours           | ~20 hours           |
| Calendar time        | 4-6 weeks           | < 24 hours          |
| Cost (at $150/hr)    | $23,400             | ~$200 (API costs)   |
| Features shipped     | MVP only            | MVP + demo + themes + reports + Apple HIG polish |

**That's roughly an 8× speed improvement and 99% cost reduction.** But there are important caveats:

1. **You still need to know what to build.** Claude Code writes the code, but you decide the product. The user journey, the design system, the core loop — those are human decisions.
2. **Debugging takes longer than building.** The Tailwind v4 silent failures cost more time than writing the actual components. Knowing the gotchas in advance (this doc) eliminates most of that.
3. **Polish is where AI struggles most.** AI can generate a dashboard in minutes. Getting the spacing, alignment, and typography to feel "Apple-quality" took multiple iteration loops. Locking the design system first (Phase 2) is the fix.
4. **The ETH Zurich study applies here.** Short, exact prompts got fixes right on the first try. Vague prompts like "make it look better" led to 3-4 rounds of back-and-forth.

**Bottom line for scoping**: If someone asks you to estimate a project, use the traditional hours for budgeting (that's what engineers and agencies will quote). But know that with Claude Code + a locked design system + the ETH prompt format, you can personally build it in roughly 1/8th the time.

### What Questions to Ask When Scoping

- What are the distinct user roles? (Each role often doubles the work)
- Does it need to integrate with existing systems? (APIs = complexity)
- What's the data sensitivity? (HIPAA, SOC2 = weeks of compliance work)
- What's the deployment model? (SaaS vs. self-hosted vs. on-prem)
- What's the expected user count? (10 users and 10,000 users are different architectures)

---

## Part 8: Reusable CLAUDE.md

Paste this into any new Next.js + Supabase project as `CLAUDE.md` in the root:

```markdown
# Project Rules

## Stack
Next.js (App Router), TypeScript, Tailwind CSS v4, Supabase, Vercel.

## Tailwind v4: Inline Styles Required
Tailwind v4 does NOT reliably generate: gap-*, mb-*, space-y-*, max-w-*, text-sm, text-xs, text-2xl, p-*, arbitrary values.
USE inline style={{}} for ALL spacing and typography.
SAFE classes: flex, grid, hidden, block, relative, absolute, sticky, z-*, overflow-*, min-h-screen, w-full.

## Apple HIG Type Scale
Title 1: 28px/700. Title 2: 22px/700. Title 3: 20px/600.
Headline: 17px/600. Body: 17px/400. Subhead: 15px/400.
Footnote: 13px/400. Caption: 12px/400.
MINIMUM readable: 13px. Absolute minimum: 11px.

## Apple HIG Spacing
Base: 16px. Related: 8px. Grouped: 12px. Sections: 24-32px.
Touch targets: 44px minimum. Card padding: 16px. Border radius: 8-12px.

## Colors
Use var(--color-text), var(--color-text-muted), var(--color-bg), var(--color-bg-card), var(--color-border), var(--color-primary).
Never hardcode hex in components.

## Code Style
Short, exact edits. File path, old → new. One fix per message when debugging.
```

---

## Part 9: Step-by-Step Checklist (Start to Launch)

The complete sequence from idea to live product. Check each box as you go.

### Week 0: Foundation (Day 1)
- [ ] Answer the 3 questions from Phase 0 (who, what job, what's done)
- [ ] Write the user journey in 5 steps or fewer
- [ ] Choose your stack (Next.js + Supabase + Tailwind + Vercel recommended)
- [ ] Create the GitHub repo and connect to Vercel
- [ ] Create the Supabase project and add env vars to Vercel
- [ ] Drop the CLAUDE.md from Part 8 into the project root

### Week 0: Design System (Day 1)
- [ ] Define your type scale (copy Apple HIG from Part 2)
- [ ] Define your spacing scale (8/12/16/24/32px)
- [ ] Define your color tokens as CSS custom properties in globals.css
- [ ] Set button min-height to 44px, card padding to 16px, border-radius to 8-12px
- [ ] Commit this as your first PR: "feat: design system foundation"

### Week 1: Core Loop (Days 2-3)
- [ ] Build the core loop screen(s) with hardcoded mock data — no database
- [ ] Get the UX right: can a user complete the core action in under 10 seconds?
- [ ] Add a /demo route with self-contained mock data (zero Supabase imports)
- [ ] Test on mobile (touch targets, font sizes, layout)
- [ ] Show someone who isn't you and watch them use it without guidance

### Week 1: Backend (Days 3-4)
- [ ] Define your database schema in Supabase
- [ ] Set up authentication (Supabase Auth)
- [ ] Replace mock data with real Supabase queries
- [ ] Add Row Level Security policies (every table needs them)
- [ ] Test: create account → add data → see it persist on refresh

### Week 2: Supporting Pages (Days 5-6)
- [ ] Dashboard / home screen
- [ ] Settings / profile page
- [ ] Any secondary features (reports, exports, etc.)
- [ ] Navigation between all pages works
- [ ] Loading states on every page that fetches data (skeletons, not spinners)
- [ ] Error states: what does the user see when something breaks?
- [ ] Empty states: what does a new user with zero data see?

### Week 2: Polish (Day 7)
- [ ] Run through every screen and check against Apple HIG type scale
- [ ] Verify all touch targets are 44px+
- [ ] Check all spacing against the design system (no ad-hoc values)
- [ ] Test in dark mode if applicable
- [ ] Run Lighthouse audit — target 90+ on Performance, Accessibility, Best Practices
- [ ] Add meta tags and OG image for link sharing

### Week 3: Launch Prep
- [ ] Build the landing page (homepage) with product visuals and one CTA
- [ ] Make sure the demo is fully functional and isolated from production data
- [ ] Add Vercel Analytics or PostHog (takes 30 minutes)
- [ ] Test the full journey: homepage → demo → signup → first real action
- [ ] Have 2-3 real users try it and watch for confusion
- [ ] Fix what confused them

### Go-to-Market (GTM)
- [ ] **Positioning**: One sentence that explains what it does and who it's for
- [ ] **Channel**: Where do your target users already hang out? (Facebook groups, Slack channels, conferences, Instagram)
- [ ] **First 10 users**: Personal outreach. Message people directly. Don't launch publicly until 10 people are actively using it
- [ ] **Social proof**: Get a quote or metric from early users ("347 grades tracked. Zero spreadsheets.")
- [ ] **Landing page CTA**: Point to the demo, not a signup wall. Let people experience value before asking for commitment
- [ ] **Iterate based on usage**: Watch what people actually do (analytics). Build more of what they use, cut what they don't

> **The single most important GTM rule**: Get the product in front of real users as fast as possible. Everything you think you know about what they want is a guess until they use it.

---

## Changelog

- **March 2026**: Initial version, distilled from OT Tracker build.

## Sources

- [ETH Zurich Study: AI Coding Agents Fail Because AGENTS.md Files Are Too Detailed](https://www.marktechpost.com/2026/02/25/new-eth-zurich-study-proves-your-ai-coding-agents-are-failing-because-your-agents-md-files-are-too-detailed/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
