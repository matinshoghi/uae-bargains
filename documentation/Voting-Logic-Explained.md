# UAE Bargains — Voting System Logic Explained

> **Created:** February 17, 2026
> **Purpose:** Clear explanation of OzBargain voting system for UAE Bargains implementation

---

## Core Voting Logic (From OzBargain Research)

### What OzBargain Does Differently

Unlike Reddit (which only shows upvotes on deals), OzBargain has **explicit upvote AND downvote buttons** for BOTH:
- Deals (posts)
- Comments (replies to deals or other comments)

---

## Negative Vote Revocation System

### When a Negative Vote Gets "Revoked"

A post's negative vote is removed ("revoked") if it receives **9 or more dissenting opinions**.

**What counts as "dissenting"?**
Comments that point out issues like:
- Poor battery life
- Better price at Carrefour
- Product not available
- Store doesn't honor the deal
- "Sold out quickly"
- "This isn't a good deal anymore"

**Purpose:** Prevent spam, punish misinformation, reward quality content

---

## Rule of Thumb

**5x Comments Rule**
- If a user makes **5x or more comments** on a post
- They are **5x more likely** to have their negative vote revoked

**Example:** 4 comments → 90% chance of revocation; 10 comments → High risk for poster

---

## Key Design Decisions for UAE Bargains

### 1. Use Same System for Deals AND Comments

| Feature | Implementation |
|---------|---------------|
| **Upvote button** | Required on every deal |
| **Downvote button** | Required on every deal |
| **Negative vote badge** | Automatically shown if vote is revoked |
| **Comment upvotes** | Shown separately |
| **Comment downvotes** | Counted separately |

### 2. Show Downvotes Without Commenting

Users CAN downvote a deal without commenting. This doesn't hurt the deal's score.

**Why this matters:** OzBargain users report deals with poor battery life or better prices elsewhere — downvotes are legitimate user feedback, not spam.

---

## Abuse Prevention

### Revocation Safeguards

- **Can't revoke just because people disagree** — Requires 9+ genuine dissenting opinions
- **Manual review** possible if system is being abused
- **Account penalties** — Too many revoked votes = lose voting rights temporarily

---

## What This Means for Users

### Honest Feedback is Protected

When you point out legitimate issues with a deal:
- "This phone has poor battery life" (real concern)
- "Better price at Carrefour" (useful comparison)
- "Store doesn't honor this deal" (helpful warning)

These comments may receive downvotes, but they're NOT spam — they're valuable community feedback.

---

## For Your Tech Team

### What to Build

**Database Schema:**
```sql
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  post_id BIGINT NOT NULL,
  comment_id BIGINT,
  vote_type ENUM('up', 'down', 'negative'),
  is_revoked BOOLEAN DEFAULT FALSE,
  revocation_reason TEXT,
  created_at TIMESTAMP,
  UNIQUE(user_id, post_id, comment_id)
);
```

**Frontend Logic:**
```javascript
// Upvote/downvote on DEALS
onUpvote(postId) { /* upvote */ }
onDownvote(postId) { /* downvote */ }

// Upvote/downvote on COMMENTS
onUpvote(commentId) { /* upvote */ }
onDownvote(commentId) { /* downvote */ }

// Check for revocation on load
const isRevoked = votes.some(v => v.is_revoked && v.vote_type === 'negative');
```

---

## Success Metrics (Week 1-2 Tracking)

| Metric | Target |
|--------|--------|
| **Daily active users** | 200-500 |
| **Deals posted per day** | 15-30 |
| **Upvote/Downvote ratio** | Monitor > 3.5 |
| **Negative vote rate** | < 2% of total votes |
| **User retention** | Day 7 return rate > 60% |

---

## Summary

**OzBargain's system works well for Australia.** For UAE, implement the same logic with appropriate thresholds.

**Key principles:**
1. Upvote/downvote on BOTH deals and comments
2. Negative votes require 9+ dissenting opinions
3. Revocation safeguards to prevent abuse
4. Downvotes without commenting are legitimate user feedback
5. 5x comments rule for revocation threshold

**This system is about content quality, not suppression.** Dissenting opinions on bad deals SHOULD be visible and counted.

---

*Explained to tech team based on OzBargain research*
