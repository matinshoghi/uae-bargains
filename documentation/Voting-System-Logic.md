# UAE Bargains — Voting System Logic

> **Created:** February 17, 2026
> **Purpose:** Document OzBargain's voting logic for UAE Bargains implementation

---

## How OzBargain Voting Works

### Core Mechanism

- **Upvote/Downvote** on both deals AND comments
- Users can upvote deals without commenting
- Downvoting requires writing a comment explaining why

### Negative Vote Revocation

A negative vote can be **revoked (removed)** if:
- The post receives **9+ dissenting opinions** (comments saying why this is a bad deal)
- Algorithm considers community feedback

**Rule of Thumb:**
- If a user makes 5x comments on a post, they're **5x more likely** to have their negative vote revoked
- Dissenting opinions = comments pointing out issues (poor battery life, better price elsewhere, product not available, etc.)

---

## What This Means for UAE Bargains

### Similar System for Deals

**Upvotes (deals):**
- Show deal quality
- Number of upvotes = positive signal
- Community validates good deals

**Downvotes (deals):**
- Must have comments explaining WHY
- Without comment, downvotes don't impact deal score
- Users can flag issues with products/services

**Upvotes/Downvotes (comments):**
- Reward helpful community members
- Punish spam or misinformation
- Balance discussion quality

### Comment Quality Checks

**What counts as a negative/downvote on comments:**
- "This phone has poor battery life" — legitimate concern
- "Better price at Carrefour" — useful comparison
- "Store doesn't honor this deal" — warning to others
- "Sold out quickly" — helpful info
- "This isn't a good deal anymore" — outdated info warning

### Abuse Prevention

**Negative vote revocation safeguards:**
- Can't revoke just because people disagree
- Needs genuine dissent (9+ opposing comments)
- If too many negatives revoked: user loses voting rights for 90 days
- Moderator intervention: can manually revoke if system is being abused

---

## Key Differences from Reddit

| Aspect | OzBargain | Reddit |
|--------|-----------|--------|
| **Vote visibility** | Separate counts for posts/comments | Single net score |
| **Negative handling** | Revokes negative votes after 9+ dissents | Downvotes impact net score immediately |
| **Transparency** | Negative votes highlighted | No easy way to see revoked status |
| **Abuse threshold** | 9+ dissents for revocation | No clear threshold, manual moderation |

---

## Implementation Notes

**Initial MVP approach:**
- Use upvote/downvote on both deals and comments (same as OzBargain)
- Track user negative vote history (prevent abuse)
- **Don't auto-revoke** — let dissent accumulate naturally
- Manual review of revocation appeals

**Technical considerations:**
- Database schema needs `votes` table with `vote_type` (up/down/negative)
- Store `revocation_status` for each vote
- UI should show neg vote badge when active
- Allow "challenge" feature if user disputes revocation

---

## Why This Matters

1. **Deal quality control:** Prevents spam deals from rising
2. **Comment quality control:** Rewards useful feedback, punishes useless complaints
3. **Accountability:** Users can't just downvote everything without explanation
4. **Community trust:** When bad deals are caught and removed, platform credibility grows

---

*Documented from OzBargain forums and Wiki*
