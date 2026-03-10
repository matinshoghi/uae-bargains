import { useState, useEffect, useRef } from "react";

const DEALS = [
  { id: 1, title: "Free Entry to Aquaventure Waterpark until 22nd March", category: "Entertainment", tags: ["#1 Most Popular", "Staff Pick"], votes: 47, comments: 12, price: "FREE", user: "sarah_dxb", time: "2h ago", hot: true, desc: "Just saw this on TimeOut Dubai! Seems like every day at midnight they drop the next days tickets and it's first come first served. You can get maximum 4 tickets per transaction." },
  { id: 2, title: "PureVPN: 130% Cashback for New Customers @ TopCashback US", category: "Computing & Software", tags: ["Staff Pick"], votes: 11, comments: 3, price: "130% CB", user: "matin", time: "4 days ago", hot: false, desc: "Purchase via TopCashback in the USA. Get the 2-year Max plan as that's where you'll make the most money (only the 1 and 2-year plans qualify)." },
  { id: 3, title: "Du offers free 15GB data, unlimited outgoing calls for UAE residents stranded abroad", category: "Services & Finance", tags: ["Staff Pick"], votes: 10, comments: 0, price: "FREE", user: "matin", time: "4 days ago", hot: false, desc: "Just saw this on Khaleej Times. States valid until 8th of March." },
  { id: 4, title: "Free Travel eSIM $0 — 7 Days Validity, 15GB Data @ Maya Mobile", category: "Travel", tags: ["Staff Pick"], votes: 12, comments: 4, price: "FREE", user: "laythemagnificent", time: "8 days ago", hot: false, desc: "Just scan to install the eSIM (no personal info, card or registration required). Works for 50+ countries (including UAE)." },
  { id: 5, title: "50% off all sushi at Sumo Sushi & Bento — Ramadan special", category: "Dining", tags: ["Staff Pick"], votes: 33, comments: 8, price: "50% OFF", user: "ali.deals", time: "10h ago", hot: true, desc: "Valid at all UAE branches during Ramadan. Show this page at checkout. Dine-in and takeaway both eligible." },
];

const CATEGORIES = [
  { name: "All", icon: null, active: true },
  { name: "Electronics", icon: "💻" },
  { name: "Fashion", icon: "👗" },
  { name: "Groceries", icon: "🛒" },
  { name: "Dining", icon: "🍽️" },
  { name: "Travel", icon: "✈️" },
  { name: "Home & Living", icon: "🏠" },
  { name: "Gaming", icon: "🎮" },
  { name: "Health & Beauty", icon: "💆" },
];

const ACTIVITY = [
  "sarah_dxb posted a new deal",
  "techbargain upvoted 'AirPods Pro 2'",
  "ali.deals commented on 'Aquaventure'",
  "matin shared a deal from Amazon.ae",
  "savvy_mum upvoted 'Sushi 50% off'",
  "dubai_saver joined the community",
];

function ActivityTicker() {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => { setIdx(i => (i + 1) % ACTIVITY.length); setShow(true); }, 250);
    }, 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="ticker">
      <span className="ticker-dot" />
      <span className="ticker-text" style={{ opacity: show ? 1 : 0 }}>{ACTIVITY[idx]}</span>
    </div>
  );
}

function VoteBox({ initial }) {
  const [votes, setVotes] = useState(initial);
  const [voted, setVoted] = useState(null);
  return (
    <div className="vote-box">
      <button className={`vote-btn ${voted === 'up' ? 'voted-up' : ''}`}
        onClick={() => { setVoted(voted === 'up' ? null : 'up'); setVotes(voted === 'up' ? initial : initial + 1); }}>▲</button>
      <span className={`vote-count ${voted === 'up' ? 'count-up' : voted === 'down' ? 'count-down' : ''}`}>{votes}</span>
      <button className={`vote-btn ${voted === 'down' ? 'voted-down' : ''}`}
        onClick={() => { setVoted(voted === 'down' ? null : 'down'); setVotes(voted === 'down' ? initial : initial - 1); }}>▼</button>
    </div>
  );
}

function DealCard({ deal }) {
  return (
    <div className="deal-card">
      <VoteBox initial={deal.votes} />
      <div className="deal-body">
        <div className="deal-tags">
          {deal.hot && <span className="tag tag-hot">🔥 Hot</span>}
          <span className="tag tag-cat">{deal.category}</span>
          {deal.tags.map(t => (
            <span key={t} className={`tag ${t.includes('Popular') ? 'tag-popular' : 'tag-pick'}`}>{t}</span>
          ))}
        </div>
        <h3 className="deal-title">{deal.title}</h3>
        <p className="deal-desc">{deal.desc}</p>
        <div className="deal-footer">
          <span className="deal-price">{deal.price}</span>
          <span className="deal-meta">💬 {deal.comments}</span>
          <span className="deal-meta">{deal.time}</span>
          <span className="deal-meta">by <strong>{deal.user}</strong></span>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="how-strip">
      <button className="how-dismiss" onClick={() => setDismissed(true)} title="Dismiss">✕</button>
      <div className="how-items">
        <div className="how-item">
          <span className="how-num">1</span>
          <div><strong>Spot a deal</strong><span className="how-desc">Found something good? Share it with the community.</span></div>
        </div>
        <span className="how-arrow">→</span>
        <div className="how-item">
          <span className="how-num">2</span>
          <div><strong>Vote on it</strong><span className="how-desc">Upvote the bangers, downvote the duds.</span></div>
        </div>
        <span className="how-arrow">→</span>
        <div className="how-item">
          <span className="how-num">3</span>
          <div><strong>Everyone saves</strong><span className="how-desc">Best deals rise to the top. Never overpay.</span></div>
        </div>
      </div>
    </div>
  );
}

export default function HalaSaves() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("hot");
  const [hideExpired, setHideExpired] = useState(false);

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&family=Archivo:wght@400;500;600;700;800;900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .app {
          background: #f5f4f0;
          min-height: 100vh;
          font-family: 'Space Grotesk', sans-serif;
          color: #1a1a1a;
        }

        /* ---- NAV ---- */
        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 24px;
          background: #fff;
          border-bottom: 2px solid #1a1a1a;
          position: sticky; top: 0; z-index: 100;
        }
        .nav-logo {
          font-family: 'Archivo', sans-serif;
          font-weight: 900; font-size: 22px;
          display: flex; align-items: center; gap: 6px;
          letter-spacing: -0.02em;
        }
        .nav-logo-star { color: #1a1a1a; font-size: 24px; }
        .nav-right { display: flex; align-items: center; gap: 16px; }
        .nav-link {
          font-size: 14px; font-weight: 500; color: #555;
          text-decoration: none; cursor: pointer;
        }
        .nav-link:hover { color: #1a1a1a; }
        .btn-post {
          background: #1a1a1a; color: #c8f547; border: 2px solid #1a1a1a;
          padding: 8px 18px; font-weight: 700; font-size: 14px;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer; transition: all 0.15s;
        }
        .btn-post:hover { background: #c8f547; color: #1a1a1a; }

        /* ---- HERO (compact) ---- */
        .hero {
          background: #1a1a1a;
          border-bottom: 3px solid #c8f547;
          padding: 28px 24px 24px;
          text-align: center;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(200,245,71,0.12);
          border: 1px solid rgba(200,245,71,0.25);
          padding: 6px 16px; border-radius: 2px;
          font-family: 'DM Mono', monospace;
          font-size: 12px; color: #c8f547;
          margin-bottom: 14px; letter-spacing: 0.04em;
          opacity: 0; animation: fadeUp 0.4s ease 0.05s forwards;
        }
        .badge-heart {
          display: inline-flex; align-items: center;
          animation: heartbeat 1.8s ease-in-out infinite;
          transform-origin: center center;
        }
        .heart-svg {
          filter: drop-shadow(0 0 4px rgba(255, 51, 85, 0.5));
        }
        .badge-flag {
          display: inline-block;
          font-size: 16px;
          animation: flagPop 3s ease-in-out infinite;
          transform-origin: center bottom;
        }
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.2); }
          56% { transform: scale(1); }
          100% { transform: scale(1); }
        }
        @keyframes flagPop {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.2) rotate(3deg); }
          50% { transform: scale(1) rotate(0deg); }
          75% { transform: scale(1.15) rotate(-2deg); }
        }
        .hero h1 {
          font-family: 'Archivo', sans-serif;
          font-weight: 900; font-size: 36px;
          color: #fff; letter-spacing: -0.03em;
          line-height: 1.1; margin-bottom: 8px;
        }
        .hero h1 .accent {
          position: relative;
          color: #c8f547;
          display: inline-block;
          background: linear-gradient(
            90deg,
            #c8f547 0%,
            #c8f547 35%,
            #f0ffaa 50%,
            #c8f547 65%,
            #c8f547 100%
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s ease-in-out 1.2s infinite;
          text-shadow: none;
        }
        .hero-h1 {
          opacity: 0;
          animation: heroEntrance 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.15s forwards;
        }
        @keyframes heroEntrance {
          0% { opacity: 0; transform: translateY(24px) scale(0.97); letter-spacing: 0.02em; }
          100% { opacity: 1; transform: translateY(0) scale(1); letter-spacing: -0.03em; }
        }
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          50% { background-position: -100% 0; }
          100% { background-position: -100% 0; }
        }
        /* Glow pulse behind accent text via pseudo-element workaround */
        .hero h1 .accent::after {
          content: 'Your neighbours';
          position: absolute;
          left: 0; top: 0;
          color: #c8f547;
          -webkit-text-fill-color: #c8f547;
          filter: blur(16px);
          opacity: 0;
          animation: glowPulse 3s ease-in-out 1.5s infinite;
          pointer-events: none;
          z-index: -1;
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0; }
          40%, 60% { opacity: 0.4; }
        }
        .hero-sub {
          font-size: 15px; color: rgba(255,255,255,0.55);
          margin-bottom: 20px; line-height: 1.5;
          max-width: 520px; margin-left: auto; margin-right: auto;
          opacity: 0; animation: fadeUp 0.5s ease 0.7s forwards;
        }
        .hero-ctas {
          display: flex; gap: 10px; justify-content: center;
          flex-wrap: wrap; margin-bottom: 20px;
          opacity: 0; animation: fadeUp 0.5s ease 0.85s forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .btn-hero-primary {
          background: #c8f547; color: #1a1a1a; border: 2px solid #c8f547;
          padding: 10px 28px; font-weight: 700; font-size: 15px;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer; transition: all 0.15s;
        }
        .btn-hero-primary:hover { background: #d8ff6a; border-color: #d8ff6a; }
        .btn-hero-secondary {
          background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.25);
          padding: 10px 28px; font-weight: 600; font-size: 15px;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer; transition: all 0.15s;
        }
        .btn-hero-secondary:hover { border-color: #c8f547; color: #c8f547; }
        .hero-stats {
          display: flex; gap: 32px; justify-content: center;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 16px;
          opacity: 0; animation: fadeUp 0.5s ease 0.95s forwards;
        }
        .stat { text-align: center; }
        .stat-num {
          font-family: 'DM Mono', monospace;
          font-weight: 500; font-size: 20px; color: #c8f547;
        }
        .stat-label {
          font-family: 'DM Mono', monospace;
          font-size: 11px; color: rgba(255,255,255,0.35);
          letter-spacing: 0.04em;
        }

        /* ---- HOW IT WORKS STRIP ---- */
        .how-strip {
          background: #fff;
          border-bottom: 2px solid #1a1a1a;
          padding: 14px 24px;
          position: relative;
        }
        .how-dismiss {
          position: absolute; top: 8px; right: 12px;
          background: none; border: none; cursor: pointer;
          font-size: 14px; color: #aaa; padding: 4px;
        }
        .how-dismiss:hover { color: #1a1a1a; }
        .how-items {
          display: flex; align-items: center; justify-content: center;
          gap: 16px; flex-wrap: wrap;
        }
        .how-item {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px;
        }
        .how-num {
          display: flex; align-items: center; justify-content: center;
          width: 26px; height: 26px; min-width: 26px;
          background: #1a1a1a; color: #c8f547;
          font-family: 'DM Mono', monospace; font-weight: 500;
          font-size: 13px;
        }
        .how-item strong { font-weight: 700; }
        .how-desc {
          display: block; font-size: 12px; color: #888; line-height: 1.3;
          max-width: 200px;
        }
        .how-arrow {
          font-size: 16px; color: #ccc; font-weight: 500;
        }

        /* ---- TICKER ---- */
        .ticker-bar {
          background: #fafaf6; border-bottom: 1px solid #e4e3dd;
          padding: 8px 24px; display: flex; justify-content: center;
        }
        .ticker {
          display: flex; align-items: center; gap: 8px;
        }
        .ticker-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #7ab800;
          animation: pulse 2s ease infinite;
        }
        .ticker-text {
          font-family: 'DM Mono', monospace; font-size: 12px; color: #777;
          transition: opacity 0.25s;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
        }

        /* ---- MAIN LAYOUT ---- */
        .main {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 220px 1fr;
          gap: 0; padding: 0;
        }

        /* ---- SIDEBAR ---- */
        .sidebar {
          padding: 24px 20px 24px 24px;
          border-right: 1px solid #e4e3dd;
          background: #fafaf6;
          position: sticky; top: 52px; height: fit-content;
          max-height: calc(100vh - 52px); overflow-y: auto;
        }
        .sidebar-title {
          font-family: 'DM Mono', monospace;
          font-size: 11px; font-weight: 500;
          color: #999; letter-spacing: 0.08em;
          margin-bottom: 12px; text-transform: uppercase;
        }
        .cat-btn {
          display: flex; align-items: center; gap: 8px;
          width: 100%; padding: 7px 10px; margin-bottom: 3px;
          background: none; border: 1.5px solid transparent;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px; font-weight: 500; color: #555;
          cursor: pointer; transition: all 0.12s; text-align: left;
        }
        .cat-btn:hover { border-color: #ddd; color: #1a1a1a; }
        .cat-btn.active {
          background: #1a1a1a; color: #c8f547;
          border-color: #1a1a1a; font-weight: 700;
        }
        .sidebar-divider {
          height: 1px; background: #e4e3dd; margin: 18px 0;
        }
        .sort-select {
          width: 100%; padding: 8px 10px;
          border: 1.5px solid #ddd; background: #fff;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px; font-weight: 600; color: #1a1a1a;
          cursor: pointer;
        }
        .checkbox-row {
          display: flex; align-items: center; gap: 8px;
          margin-top: 10px; cursor: pointer;
          font-size: 13px; color: #666;
          font-family: 'Space Grotesk', sans-serif;
        }
        .checkbox-row input[type="checkbox"] {
          width: 16px; height: 16px; cursor: pointer;
          accent-color: #1a1a1a;
        }
        .sidebar-about {
          font-size: 12px; color: #999; line-height: 1.5;
        }
        .share-icons {
          display: flex; gap: 8px; margin-top: 10px;
        }
        .share-icon {
          width: 34px; height: 34px; border: 1.5px solid #ddd;
          background: #fff; display: flex; align-items: center;
          justify-content: center; cursor: pointer;
          font-size: 14px; transition: all 0.12s;
        }
        .share-icon:hover { border-color: #1a1a1a; }

        /* ---- DEALS FEED ---- */
        .feed {
          padding: 20px 24px;
        }
        .feed-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .feed-title {
          font-family: 'Archivo', sans-serif;
          font-weight: 900; font-size: 22px;
          letter-spacing: -0.02em;
        }

        /* ---- DEAL CARD ---- */
        .deal-card {
          display: flex; gap: 14px;
          background: #fff;
          border: 1.5px solid #e4e3dd;
          padding: 16px;
          margin-bottom: 10px;
          transition: all 0.15s;
        }
        .deal-card:hover {
          border-color: #c8f547;
          box-shadow: 3px 3px 0 #c8f547;
          transform: translate(-1px, -1px);
        }

        /* Vote box */
        .vote-box {
          display: flex; flex-direction: column;
          align-items: center; gap: 1px; min-width: 44px;
        }
        .vote-btn {
          background: none; border: none; cursor: pointer;
          font-size: 14px; color: #bbb; padding: 2px 6px;
          transition: all 0.12s;
        }
        .vote-btn:hover { color: #1a1a1a; }
        .vote-btn.voted-up { color: #7ab800; transform: scale(1.15); }
        .vote-btn.voted-down { color: #e44; }
        .vote-count {
          font-family: 'DM Mono', monospace;
          font-weight: 500; font-size: 16px; color: #1a1a1a;
          min-width: 28px; text-align: center;
        }
        .vote-count.count-up { color: #7ab800; }
        .vote-count.count-down { color: #e44; }

        .deal-body { flex: 1; min-width: 0; }
        .deal-tags {
          display: flex; gap: 6px; flex-wrap: wrap;
          margin-bottom: 6px;
        }
        .tag {
          font-family: 'DM Mono', monospace;
          font-size: 11px; padding: 2px 8px;
          font-weight: 500; letter-spacing: 0.02em;
        }
        .tag-cat { background: #f0efeb; color: #666; }
        .tag-popular { background: #c8f547; color: #1a1a1a; font-weight: 700; }
        .tag-pick { background: #1a1a1a; color: #c8f547; }
        .tag-hot { background: #ff4444; color: #fff; font-weight: 700; }

        .deal-title {
          font-family: 'Archivo', sans-serif;
          font-size: 17px; font-weight: 700;
          line-height: 1.3; margin-bottom: 6px;
          letter-spacing: -0.01em; color: #1a1a1a;
          cursor: pointer;
        }
        .deal-title:hover { color: #5a8500; }
        .deal-desc {
          font-size: 13px; color: #888; line-height: 1.5;
          margin-bottom: 10px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .deal-footer {
          display: flex; align-items: center; gap: 12px;
          flex-wrap: wrap;
        }
        .deal-price {
          font-family: 'DM Mono', monospace;
          font-weight: 700; font-size: 13px;
          background: #c8f547; color: #1a1a1a;
          padding: 3px 10px;
        }
        .deal-meta {
          font-family: 'DM Mono', monospace;
          font-size: 12px; color: #aaa;
        }
        .deal-meta strong { color: #777; font-weight: 500; }

        /* ---- MOBILE ---- */
        @media (max-width: 768px) {
          .nav { padding: 10px 16px; }
          .nav-logo { font-size: 18px; }
          .nav-link { display: none; }
          .btn-post { padding: 7px 14px; font-size: 13px; }

          .hero { padding: 22px 16px 20px; }
          .hero h1 { font-size: 26px; }
          .hero-sub { font-size: 14px; margin-bottom: 16px; }
          .hero-ctas { gap: 8px; }
          .btn-hero-primary, .btn-hero-secondary {
            padding: 9px 20px; font-size: 14px;
          }
          .hero-stats { gap: 20px; }
          .stat-num { font-size: 17px; }

          .how-items { flex-direction: column; gap: 10px; align-items: flex-start; padding-right: 24px; }
          .how-arrow { display: none; }
          .how-desc { max-width: none; }

          .main {
            grid-template-columns: 1fr;
          }
          .sidebar {
            position: static; border-right: none;
            border-bottom: 1px solid #e4e3dd;
            padding: 16px;
            max-height: none;
          }
          .cats-grid {
            display: flex; flex-wrap: wrap; gap: 6px;
          }
          .cat-btn {
            width: auto; padding: 5px 12px;
            border: 1.5px solid #ddd; font-size: 12px;
          }
          .sidebar-section-desktop { display: none; }

          .feed { padding: 16px; }
          .deal-card { padding: 12px; gap: 10px; }
          .deal-title { font-size: 15px; }
          .deal-desc { font-size: 12px; -webkit-line-clamp: 2; }

          .ticker-bar { padding: 6px 16px; }
          .ticker-text { font-size: 11px; }
        }

        @media (max-width: 420px) {
          .hero h1 { font-size: 22px; }
          .hero-sub { font-size: 13px; }
          .hero-stats { gap: 16px; flex-wrap: wrap; }
          .btn-hero-primary, .btn-hero-secondary {
            padding: 9px 16px; font-size: 13px; flex: 1; text-align: center;
          }
          .vote-box { min-width: 36px; }
          .vote-count { font-size: 14px; }
          .deal-footer { gap: 8px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <span className="nav-logo-star">✱</span> halasaves
        </div>
        <div className="nav-right">
          <span className="nav-link">Coupons</span>
          <button className="btn-post">+ Post Deal</button>
        </div>
      </nav>

      {/* HERO — compact */}
      <section className="hero">
        <div className="hero-badge">
          Made with{" "}
          <span className="badge-heart">
            <svg viewBox="0 0 24 24" width="16" height="16" className="heart-svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff3355"/>
            </svg>
          </span>
          {" "}from the{" "}
          <span className="badge-flag">🇦🇪</span>
        </div>
        <h1 className="hero-h1">
          Don't overpay. <span className="accent">Your neighbours</span> found it cheaper.
        </h1>
        <p className="hero-sub">
          Post deals, vote on the best ones, and never pay full price in the UAE again. 
          Built by locals, for locals.
        </p>
        <div className="hero-ctas">
          <button className="btn-hero-primary">Join the Community →</button>
        </div>
        <div className="hero-stats">
          <div className="stat"><div className="stat-num">127</div><div className="stat-label">deals shared</div></div>
          <div className="stat"><div className="stat-num">842</div><div className="stat-label">votes cast</div></div>
          <div className="stat"><div className="stat-num">54</div><div className="stat-label">comments</div></div>
        </div>
      </section>

      {/* HOW IT WORKS — dismissable */}
      <HowItWorks />

      {/* LIVE TICKER */}
      <div className="ticker-bar">
        <ActivityTicker />
      </div>

      {/* MAIN: Sidebar + Feed */}
      <div className="main">
        <aside className="sidebar">
          <div className="sidebar-title">Categories</div>
          <div className="cats-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                className={`cat-btn ${activeCategory === cat.name ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.name)}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>

          <div className="sidebar-section-desktop">
            <div className="sidebar-divider" />
            <div className="sidebar-title">Sort By</div>
            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="hot">🔥 Hot Deals</option>
              <option value="new">🆕 Newest</option>
              <option value="top">⬆️ Top Voted</option>
            </select>
            <label className="checkbox-row">
              <input type="checkbox" checked={hideExpired} onChange={(e) => setHideExpired(e.target.checked)} />
              <span>Hide expired deals</span>
            </label>

            <div className="sidebar-divider" />
            <div className="sidebar-title">About HalaSaves</div>
            <p className="sidebar-about">
              Your community-driven platform for discovering and sharing the best deals across the UAE. Let's save more, together.
            </p>

            <div className="sidebar-divider" />
            <div className="sidebar-title">Share & Spread the Word</div>
            <div className="share-icons">
              <button className="share-icon">📱</button>
              <button className="share-icon">📘</button>
              <button className="share-icon">🔗</button>
              <button className="share-icon">📤</button>
            </div>
          </div>
        </aside>

        <main className="feed">
          <div className="feed-header">
            <div className="feed-title">🔥 Hot Deals</div>
          </div>
          {DEALS.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </main>
      </div>
    </div>
  );
}
