# HalaSaves — Vote Widget Redesign PRD

**Date:** March 11, 2026
**Author:** Nourly
**Status:** Ready for implementation
**Priority:** High — multiple users reporting confusion

---

## Problem

Users are confused by the current upvote/downvote control on deal cards. The bare chevron arrows (∧ ∨) with a number between them are being mistaken for a quantity selector, sort toggle, or expand/collapse control. There is no label, no color feedback on interaction, and no visual distinction between voted and not-voted states.

## Goal

Replace the vote widget with a clearly identifiable voting control that eliminates ambiguity on first encounter, provides immediate visual feedback on interaction, and matches the existing HalaSaves retro/brutalist brand language.

## Solution: Labeled Pill Vote Widget

A horizontal pill with three cells — **[▲] [score] [▼]** — with a "VOTES" label underneath and full color state management.

---

## Design Spec

### Layout

The widget is a horizontal row of three cells inside a sharp-cornered (border-radius: 0) bordered container, with a monospace "VOTES" caption below.

```
┌──────┬───────┬──────┐
│  ▲   │  12   │  ▼   │
└──────┴───────┴──────┘
        VOTES
```

### Sizes

| Context       | Button size | Score font | Border    | Label font |
|---------------|-------------|------------|-----------|------------|
| List card     | 34 × 34px   | 15px       | 1.5px     | 9px        |
| Detail page   | 46 × 46px   | 20px       | 2px       | 10px       |

### Colors & States

| State        | Border    | Up arrow bg | Up arrow icon | Down arrow bg | Down arrow icon | Score color |
|--------------|-----------|-------------|---------------|---------------|-----------------|-------------|
| **Neutral**  | `#d4d4d4` | transparent | `#a3a3a3`     | transparent   | `#a3a3a3`       | `#1a1a1a`   |
| **Hover**    | `#d4d4d4` | `#f5f5f5`  | `#525252`     | `#f5f5f5`     | `#525252`       | `#1a1a1a`   |
| **Upvoted**  | `#a3e635` | `#a3e635`  | `#1a1a1a`     | transparent   | `#a3a3a3`       | `#365314`   |
| **Downvoted**| `#ef4444` | transparent | `#a3a3a3`     | `#fecaca`     | `#b91c1c`       | `#b91c1c`   |

### Typography

- **Score:** `'Courier New', Courier, monospace` — bold 700
- **Label:** `'Courier New', Courier, monospace` — bold 700, uppercase, letter-spacing 0.12em
- This matches the existing HalaSaves monospace usage for tags, badges, and labels

### Icons

Replace chevron text characters (∧ ∨) with filled SVG arrow icons:

```svg
<!-- Up arrow -->
<path d="M12 4l-8 9h5v7h6v-7h5z" />

<!-- Down arrow -->
<path d="M12 20l8-9h-5V4H9v7H4z" />
```

ViewBox: `0 0 24 24`, fill: `currentColor`. Size follows button context (13px list, 18px detail).

---

## Behavior

### Voting logic

1. **First click on ▲:** Score increments by 1, state becomes "upvoted"
2. **First click on ▼:** Score decrements by 1, state becomes "downvoted"
3. **Click same arrow again:** Undo — score reverts, state returns to "neutral"
4. **Switch vote (e.g. upvoted → click ▼):** Score changes by 2 in the new direction, state flips
5. **One vote per user per deal** — toggling is the only way to change your vote

### Transitions

- All color/background changes: `transition: all 0.12s ease`
- Border color change: `transition: border-color 0.15s ease`
- No scale transforms or bounces — keep it sharp and snappy to match brand

### Tooltips

- Up arrow: `title="Good deal — vote up"`
- Down arrow: `title="Bad deal — vote down"`

### Authentication

- If user is not signed in, clicking either arrow should trigger the sign-in flow
- After signing in, the vote should be applied automatically (don't make them click again)

---

## Placement

### Homepage / List cards

The vote widget sits to the **left** of the deal content, vertically aligned to the top of the card. Uses the **small (34px)** variant.

```
┌─────────────────────────────────────────────┐
│ [VOTE]  #1 MOST POPULAR · Entertainment     │
│ [WIDG]  Deal Title Here                     │
│         Description text...                 │
│         Free  AED-100  -100%                │
│         💬 3  🔗     7 hours ago · user     │
└─────────────────────────────────────────────┘
```

### Deal detail page — Sidebar

The vote widget is centered below the "GO TO DEAL" button and above the share icons. Uses the **large (46px)** variant.

```
┌──────────────────────┐
│       Free            │
│   AED 100   -100%    │
│                       │
│  ┌──────────────────┐ │
│  │  GO TO DEAL ↗    │ │
│  └──────────────────┘ │
│  ─────────────────── │
│      [VOTE WIDGET]    │
│         VOTES         │
│  ─────────────────── │
│   💬  📘  🔗  ↗      │
└──────────────────────┘
```

---

## Acceptance Criteria

1. Users can upvote and downvote deals on both list and detail views
2. Visual state (color, background) updates immediately on click
3. Clicking the same arrow a second time undoes the vote
4. The "VOTES" label is visible below the widget in all states
5. Unauthenticated users are redirected to sign-in on vote attempt
6. Vote persists across page navigation (API call fires on click)
7. Border-radius is 0 on all elements (matches brand)
8. Score uses monospace font so digits don't cause layout shift
9. Hover state shows subtle background change and cursor: pointer
10. Tooltips appear on hover for both arrows

---

## API Contract (suggestion)

```
POST /api/deals/:dealId/vote
Body: { "type": "up" | "down" | "none" }
Response: { "score": number, "userVote": "up" | "down" | null }
```

Sending `"none"` removes the user's vote. The response returns the updated score and the user's current vote state so the UI can confirm.

---

## Out of Scope

- Downvote requiring a comment (consider for future — OzBargain does this)
- Vote history / audit trail
- Gamification (karma system)
- Animated confetti or celebration on milestone votes

---

## Reference

Interactive prototype attached as `halasaves-voting-prototype.jsx`. Tabs include before/after comparison, list card context, detail sidebar context, and a full state reference sheet with exact hex values.
