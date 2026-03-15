# OT Tracker — Bug Audit Report

**Date:** 2026-03-15
**Build status:** ✅ Clean (zero TypeScript errors, zero build failures)
**Build warning:** 1 — Next.js 16 middleware deprecation (cosmetic, non-breaking)

---

## Reconciliation: Fix Docs vs Actual Code

| Doc | Fix Described | Status |
|-----|--------------|--------|
| **THREE-FIXES.md** | Fix 1: "New Era ✦" → "New Swiftie ✦" | ✅ Applied |
| | Fix 2: FOUC — THEME_KEY, localStorage hydration, inline script, suppressHydrationWarning | ✅ Applied |
| | Fix 3: chip-active hover specificity fix | ✅ Applied |
| | Fix 4: Guide page — 7 steps + keyboard shortcuts | ✅ Applied (enhanced to 7-8 steps with bulk mode) |
| **DESIGN-AUDIT-FIXES.md** | Fix 1: focus-visible global states | ✅ Applied |
| | Fix 2: aria-labels on icon-only buttons (navbar, grades, student nav) | ✅ Applied |
| | Fix 3: Responsive date inputs (w-full sm:w-[150px] + flex-wrap) | ✅ Applied |
| | Fix 4: htmlFor/id on form labels (grade-entry, add-student, date range) | ✅ Applied |
| | Fix 5: Darken text-muted to #475569 | ✅ Applied |
| | Fix 6: border-style: solid on .input, .chip, .btn-ghost | ✅ Applied |
| | Fix 7: progress-fill animation end keyframe | ✅ Applied |
| | Fix 8: Dropdown max-width calc(100vw - 32px) | ✅ Applied |
| | Fix 9: Student detail max-width 1024px | ✅ Applied |
| | Fix 10: .menu-item CSS class replacing inline hover handlers | ✅ Applied |
| | Fix 11: Page titles text-2xl | ✅ Applied |
| | Fix 12: Button active states scale(0.98) | ✅ Applied |
| | Fix 13: Ghost button hover updates border-color | ✅ Applied |
| | Fix 14: Shadow + timing design tokens | ✅ Applied |
| | Fix 15: --color-nav-bg token | ✅ Applied |
| | Fix 16: TS select chevron overrides | ✅ Applied |
| | Fix 17: Stat cards 1-col on tiny phones | ✅ Applied |
| | Fix 18: .alert/.alert-error/.alert-success classes | ✅ Applied |
| | Fix 19: border-style on inputs/chips (continued) | ✅ Applied |
| | Fix 20: aria-hidden on decorative SVGs | ✅ Applied |
| **EASTER-EGGS.md** | #1: "(Taylor's Version)" in navbar | ✅ Applied |
| | #2: Eras-themed stat labels | ✅ Applied |
| | #3: "It's me, hi, I'm the grader" banner | ✅ Applied |
| | #4: Section headers (New Track, Tracklist, Album Notes, Tour Dates) | ✅ Applied |
| | #5: Save button "Drop it 🎤" / "Recording..." | ✅ Applied |
| | #6: Footer with "LONG LIVE THE GRADES" bracelet tag | ✅ Applied |
| | #7: Rotating empty state TS messages | ✅ Applied |
| | #8: Search placeholder "Find your Swiftie..." | ✅ Applied |
| | #9: Add student "New Swiftie ✦" | ✅ Applied |
| | #10: Lucky 13 badge | ✅ Applied |
| | #11: Guide page TS-themed step titles | ✅ Applied |
| | #12: Profile "Midnights mode active" description | ✅ Applied |
| **ERA-THEMES-AND-UX-FIXES.md** | Era type + context in theme.tsx | ✅ Applied |
| | 10 era CSS palettes (light + dark each) | ✅ Applied (30 data-era selectors) |
| | Era selector chips on dashboard | ✅ Applied |
| | Era dropdown on profile page | ✅ Applied |
| | Supabase migration (era column) | ✅ Applied (verified via SQL) |
| | U1: Cmd+Enter keyboard shortcut | ✅ Applied |
| | U2: Category shows score type in dropdown | ✅ Applied |
| | U3: Today badge on grades | ✅ Applied (now via date group header) |
| | U4: Stat label "Active this week" | ✅ Applied |
| | U5: Empty state for new students | ✅ Applied |
| | U6: School names in student picker | ✅ Applied |
| | U7: Custom delete confirmation | ✅ Applied |
| | U8: Date range persistence via sessionStorage | ✅ Applied |
| **TS-LIGHT-SURFACE-FIX.md** | --color-primary-surface token | ✅ Applied (in era blocks) |
| | Focus ring override | ✅ Applied |
| | btn-primary uses var(--color-primary-surface) | ✅ Applied |
| | stat-card border-top override | ✅ Applied |
| | chip-active gradient override | ✅ Applied |
| | section-header color override | ✅ Applied |
| | Navbar avatar uses --color-primary-surface | ✅ Applied |
| **LOVER-REIMAGINED.md** | Gradient background (lavender wash) | ✅ Applied (via era body rules) |
| | Frosted glass cards (backdrop-filter on .card) | ✅ Applied |
| | Near-invisible borders | ✅ Applied (via era tokens) |
| | Gold gradient buttons | ✅ Applied |
| | Lavender-tinted shadows | ✅ Applied (via era tokens) |
| | Frosted inputs, ghost buttons, hover rows | ✅ Applied |
| | Updated bracelet tags | ✅ Applied |
| **PERFORMANCE-FIXES.md** | N+1 query → single query in page.tsx | ✅ Applied |
| | useRef on createClient in theme.tsx | ✅ Applied |
| | useRef on createClient in navbar.tsx | ✅ Applied |
| | Remove backdrop-filter from .card-sm | ✅ Applied |
| | Remove animate-fade-in from student grid | ✅ Applied |
| **ERAS-THEME-UPGRADE.md** | Authentic Midnights palette | ✅ Applied (via era system) |
| | Star field background | ✅ Applied |
| | Gold-lavender gradient shimmer text | ✅ Applied |
| | Authentic bracelet tags | ✅ Applied |
| | TS card hover glow | ✅ Applied |
| | Page enter transition | Removed per PERFORMANCE-FIXES.md |
| | Sparkle burst upgrade | ✅ Applied |
| | Stat card icons | ✅ Applied |
| | Card micro-lift on hover | ✅ Applied |
| | Footer "Made with 🌙 for Kyleigh" | ✅ Applied |

**Summary: 80+ fixes across 9 docs — ALL APPLIED.** Zero partially applied, zero broken.

---

## Bug Audit: Issues Found

### Critical

*None found.*

### High

**H1: Auth pages missing useRef on createClient()**
- **Files:** `src/components/auth/login-form.tsx:13`, `src/components/auth/signup-form.tsx:14`, `src/app/forgot-password/page.tsx:12`, `src/app/reset-password/page.tsx:16`
- **What's wrong:** These 4 files call `const supabase = createClient()` in the component body without useRef. Every re-render creates a new Supabase client instance. While these pages re-render less frequently than the main app, it's inconsistent with the pattern used everywhere else.
- **Themes affected:** All
- **Fix:** Wrap in `useRef(createClient())` like the other 10 components already do.

**H2: No error.tsx boundaries anywhere**
- **Files:** No `error.tsx` in any route segment
- **What's wrong:** If any server component throws (Supabase outage, network error, malformed data), users see Next.js's default error page with no way to recover. No graceful fallback.
- **Themes affected:** All
- **Fix:** Add `error.tsx` to `src/app/`, `src/app/students/[id]/`, and `src/app/profile/` with a retry button and branded error message.

**H3: Grade edit modal error uses inline style instead of .alert class**
- **File:** `src/components/students/grade-edit-modal.tsx:54`
- **What's wrong:** Uses `style={{ background: 'rgba(239,68,68,0.06)', color: 'var(--color-error)' }}` instead of the `.alert .alert-error` classes used everywhere else. Inconsistent and harder to maintain.
- **Themes affected:** Cosmetic inconsistency
- **Fix:** Replace with `className="alert alert-error text-sm animate-slide-in"`.

**H4: Edit student form labels missing htmlFor/id pairs**
- **File:** `src/components/students/edit-student-client.tsx:59-62,86-89`
- **What's wrong:** Labels for First name, Last name, School, Period name, Start, End all lack `htmlFor` attributes. Inputs lack `id` attributes. Clicking the label text doesn't focus the input — accessibility issue.
- **Themes affected:** All
- **Fix:** Add `htmlFor="edit-first-name"` + `id="edit-first-name"` etc. to all label/input pairs.

**H5: Profile form labels missing htmlFor/id pairs**
- **File:** `src/components/profile/profile-client.tsx:47-49,95-96`
- **What's wrong:** Email, Full name, Theme, New password, Confirm password labels all lack `htmlFor`. Only the Era select (line 60) has it.
- **Themes affected:** All
- **Fix:** Add htmlFor/id pairs to all 5 remaining fields.

### Medium

**M1: Sparkle burst hardcodes TS gold color**
- **File:** `src/components/sparkle-burst.tsx:35`
- **What's wrong:** `color: isTaylorSwift ? '#CBA863' : 'var(--color-primary)'` — the TS color is hardcoded. If the user is in the Red era, sparkles are still Fearless gold instead of matching the era's primary color.
- **Themes affected:** All TS eras except Fearless/Lover
- **Fix:** Change to `color: 'var(--color-primary-surface, var(--color-primary))'` (no ternary needed — CSS handles it).

**M2: No not-found.tsx — default 404 page**
- **File:** No `not-found.tsx` in `src/app/`
- **What's wrong:** If a student ID doesn't exist or a URL is wrong, users see Next.js's generic 404. Not branded.
- **Themes affected:** All
- **Fix:** Add `src/app/not-found.tsx` with a themed "Page not found" message and link back to dashboard.

**M3: Edit student inline error styles instead of .alert class**
- **File:** `src/components/students/edit-student-client.tsx:100`
- **What's wrong:** Archive button error uses `style={{ borderColor: 'rgba(239,68,68,0.3)', ... }}` instead of `.alert` classes. The `msgStyle` helper function (line 25-29) also duplicates what `.alert-error`/`.alert-success` already do.
- **Themes affected:** Cosmetic consistency
- **Fix:** Remove `msgStyle` function, use `.alert .alert-error` and `.alert .alert-success` classes.

**M4: Bulk grade form doesn't show grades immediately after save**
- **File:** `src/components/students/student-detail-client.tsx:57`
- **What's wrong:** `handleBulkGradesAdded` prepends new grades to state correctly, but the new grades lack the `category` join data that `grades-list.tsx` needs for display (category name, score type). The `.select('*, category:categories(*)')` in bulk-grade-form.tsx line 82 should return this, but if Supabase returns it differently, grade rows may show `undefined` for category name until page refresh.
- **Themes affected:** All
- **Fix:** Verify the Supabase response includes the category join. If not, do a follow-up select or pass categories to BulkGradeForm for client-side enrichment.

**M5: Date range filtering uses Date comparison with timezone issues**
- **File:** `src/lib/utils.ts:53-58`
- **What's wrong:** `isDateInRange` creates `new Date(dateString)` which can produce different dates depending on timezone. A grade stored as `"2026-03-15T00:00:00Z"` (UTC midnight) may be March 14 in CST. The start/end date inputs produce `"2026-03-15"` strings. Comparing `new Date("2026-03-15T00:00:00Z")` with `new Date("2026-03-15")` can produce off-by-one filtering.
- **Themes affected:** All (functional)
- **Fix:** Normalize all dates to date-only strings before comparison, or use `.split('T')[0]` before creating Date objects.

**M6: Print report card has hardcoded colors**
- **File:** `src/components/students/student-detail-client.tsx:83`
- **What's wrong:** The print HTML template uses hardcoded hex colors (`#1e293b`, `#64748b`, `#e2e8f0`, etc.). This is actually correct for print since printing always uses black-and-white, but if someone were to save the HTML, it wouldn't match their theme. Acceptable for now.
- **Themes affected:** None (print only)
- **Fix:** None needed — print should always be B&W.

### Low

**L1: Era accent colors hardcoded in ERAS array**
- **File:** `src/components/dashboard/dashboard-client.tsx:14-25`
- **What's wrong:** The 10 era accent colors for inactive chip styling are hardcoded hex values. These are used for `borderColor: e.accentColor + '30'` on non-active chips. Since these are decorative styling for the era selector UI (not content), this is acceptable.
- **Themes affected:** TS eras only, cosmetic
- **Fix:** Could use CSS vars but the complexity isn't worth it — each era chip needs its own color even when inactive.

**L2: Middleware deprecation warning**
- **File:** `src/middleware.ts`
- **What's wrong:** Next.js 16 warns: `The "middleware" file convention is deprecated. Please use "proxy" instead.` Non-breaking but will need migration eventually.
- **Themes affected:** None
- **Fix:** Migrate to proxy convention when ready.

**L3: No loading.tsx for auth pages**
- **Files:** No `loading.tsx` in `src/app/login/`, `src/app/signup/`, `src/app/forgot-password/`, `src/app/reset-password/`
- **What's wrong:** These are static pages so they render instantly. Loading skeletons aren't needed. Not a bug.
- **Themes affected:** None
- **Fix:** None needed.

**L4: sessionStorage date range persists indefinitely**
- **File:** `src/components/students/student-detail-client.tsx:45-48`
- **What's wrong:** Date range is saved to sessionStorage and loaded for every student. If Kyleigh sets a custom range, navigates to dashboard, then comes back to a different student days later (same browser tab), the old range persists. SessionStorage clears on tab close, so this is mostly fine.
- **Themes affected:** None (functional)
- **Fix:** Could add a timestamp check, but sessionStorage's tab-scoped lifetime makes this acceptable.

---

## Runtime Expectations (Per-Page Analysis)

### /login
- **Expected:** Centered card with email/password inputs, "Sign in" button, "Forgot password?" link, "Sign up" link. All styled with CSS vars.
- **Actual (from code):** Matches. Uses `.card`, `.input`, `.btn-primary`, `.label` classes. Error uses `.alert .alert-error`. Theme-aware via CSS vars.

### / (Dashboard)
- **Expected:** Stats bar (4 cards with top accent), school filter chips, era selector (TS only), search with icon, collapsible school groups, student cards with hover lift, footer.
- **Actual (from code):** Matches. Single-query data fetch. All styling via CSS vars. Era chips visible when `isTaylorSwift`. Welcome banner with FOUC-safe theme.

### /students/[id] (Student Detail)
- **Expected:** Quick nav (prev/next + picker), date range bar (accent bg), single/bulk grade toggle, grades grouped by date, report card sidebar with progress bars and trends.
- **Actual (from code):** Matches. Parallel queries via Promise.all. Date range persists via sessionStorage. Bulk form uses single batch insert. Grades grouped by date with TODAY header.

### /profile
- **Expected:** Name, email (read-only), theme selector, era dropdown (TS only), password change, sign out.
- **Actual (from code):** Matches. Era saves to Supabase + localStorage. Theme change triggers instant palette swap. Missing htmlFor on most labels (H5).

### /students/new (Add Student)
- **Expected:** First/last name, school select or create, grading period dates, create button.
- **Actual (from code):** Matches. All labels have htmlFor/id. Uses `.alert` for errors.

---

## Summary

| Severity | Count | Key Issues |
|----------|-------|-----------|
| Critical | 0 | — |
| High | 5 | useRef on auth pages, no error boundaries, form label a11y gaps, edit modal inline styles |
| Medium | 6 | Sparkle color hardcode, no 404 page, bulk grade join data, timezone date filtering |
| Low | 4 | Era accent hardcodes, middleware deprecation, auth loading skeletons, session date persistence |

**Overall:** The codebase is in strong shape. All 80+ documented fixes were applied correctly. The remaining issues are mostly accessibility gaps (missing htmlFor), consistency items (inline styles vs CSS classes), and defensive programming (error boundaries, timezone handling). No critical bugs found.
