import { useState } from "react";

// ─── Voting Hook ───
function useVote(initialScore = 0) {
  const [score, setScore] = useState(initialScore);
  const [vote, setVote] = useState(null); // null | 'up' | 'down'

  const handleVote = (type) => {
    if (vote === type) {
      setScore(score + (type === "up" ? -1 : 1));
      setVote(null);
    } else if (vote === null) {
      setScore(score + (type === "up" ? 1 : -1));
      setVote(type);
    } else {
      setScore(score + (type === "up" ? 2 : -2));
      setVote(type);
    }
  };

  return { score, vote, handleVote };
}

// ─── Arrow Icons (filled triangles) ───
const ArrowUp = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4l-8 9h5v7h6v-7h5z" />
  </svg>
);
const ArrowDown = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 20l8-9h-5V4H9v7H4z" />
  </svg>
);

// ═══════════════════════════════════════
// VOTE WIDGET — LIST CARD (compact)
// ═══════════════════════════════════════
function VoteWidgetList({ initialScore = 12 }) {
  const { score, vote, handleVote } = useVote(initialScore);
  const borderColor = vote === "up" ? "#a3e635" : vote === "down" ? "#ef4444" : "#d4d4d4";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: `1.5px solid ${borderColor}`,
          borderRadius: 0,
          overflow: "hidden",
          background: "white",
          transition: "border-color 0.15s ease",
        }}
      >
        <button
          onClick={() => handleVote("up")}
          title="Good deal — vote up"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 34, height: 34,
            background: vote === "up" ? "#a3e635" : "transparent",
            border: "none",
            borderRight: `1px solid ${vote === "up" ? "#84cc16" : "#e5e5e5"}`,
            cursor: "pointer",
            color: vote === "up" ? "#1a1a1a" : "#a3a3a3",
            transition: "all 0.12s ease",
          }}
          onMouseEnter={(e) => { if (vote !== "up") { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.color = "#525252"; }}}
          onMouseLeave={(e) => { if (vote !== "up") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a3a3a3"; }}}
        >
          <ArrowUp size={13} />
        </button>
        <div style={{
          minWidth: 38, height: 34,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Courier New', Courier, monospace", fontWeight: 700, fontSize: 15,
          color: vote === "up" ? "#365314" : vote === "down" ? "#b91c1c" : "#1a1a1a",
          userSelect: "none", transition: "color 0.15s ease", padding: "0 4px",
        }}>
          {score}
        </div>
        <button
          onClick={() => handleVote("down")}
          title="Bad deal — vote down"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 34, height: 34,
            background: vote === "down" ? "#fecaca" : "transparent",
            border: "none",
            borderLeft: `1px solid ${vote === "down" ? "#fca5a5" : "#e5e5e5"}`,
            cursor: "pointer",
            color: vote === "down" ? "#b91c1c" : "#a3a3a3",
            transition: "all 0.12s ease",
          }}
          onMouseEnter={(e) => { if (vote !== "down") { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.color = "#525252"; }}}
          onMouseLeave={(e) => { if (vote !== "down") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a3a3a3"; }}}
        >
          <ArrowDown size={13} />
        </button>
      </div>
      <span style={{
        fontFamily: "'Courier New', monospace", fontSize: 9, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.12em", color: "#a3a3a3",
      }}>
        votes
      </span>
    </div>
  );
}

// ═══════════════════════════════════════
// VOTE WIDGET — DETAIL PAGE (larger)
// ═══════════════════════════════════════
function VoteWidgetDetail({ initialScore = 12 }) {
  const { score, vote, handleVote } = useVote(initialScore);
  const borderColor = vote === "up" ? "#a3e635" : vote === "down" ? "#ef4444" : "#d4d4d4";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <div
        style={{
          display: "flex", alignItems: "center",
          border: `2px solid ${borderColor}`,
          borderRadius: 0, overflow: "hidden", background: "white",
          transition: "border-color 0.15s ease",
        }}
      >
        <button
          onClick={() => handleVote("up")}
          title="Good deal — vote up"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 46, height: 46,
            background: vote === "up" ? "#a3e635" : "transparent",
            border: "none",
            borderRight: `1.5px solid ${vote === "up" ? "#84cc16" : "#e5e5e5"}`,
            cursor: "pointer",
            color: vote === "up" ? "#1a1a1a" : "#a3a3a3",
            transition: "all 0.12s ease",
          }}
          onMouseEnter={(e) => { if (vote !== "up") { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.color = "#525252"; }}}
          onMouseLeave={(e) => { if (vote !== "up") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a3a3a3"; }}}
        >
          <ArrowUp size={18} />
        </button>
        <div style={{
          minWidth: 56, height: 46,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 20,
          color: vote === "up" ? "#365314" : vote === "down" ? "#b91c1c" : "#1a1a1a",
          userSelect: "none", transition: "color 0.15s ease", padding: "0 6px",
        }}>
          {score}
        </div>
        <button
          onClick={() => handleVote("down")}
          title="Bad deal — vote down"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 46, height: 46,
            background: vote === "down" ? "#fecaca" : "transparent",
            border: "none",
            borderLeft: `1.5px solid ${vote === "down" ? "#fca5a5" : "#e5e5e5"}`,
            cursor: "pointer",
            color: vote === "down" ? "#b91c1c" : "#a3a3a3",
            transition: "all 0.12s ease",
          }}
          onMouseEnter={(e) => { if (vote !== "down") { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.color = "#525252"; }}}
          onMouseLeave={(e) => { if (vote !== "down") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a3a3a3"; }}}
        >
          <ArrowDown size={18} />
        </button>
      </div>
      <span style={{
        fontFamily: "'Courier New', monospace", fontSize: 10, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.12em", color: "#a3a3a3",
      }}>
        votes
      </span>
    </div>
  );
}

// ═══════════════════════════════════════
// STATIC DISPLAY HELPERS (for state ref)
// ═══════════════════════════════════════
function StaticVote({ vote, score, size = "sm" }) {
  const isSm = size === "sm";
  const bw = isSm ? 34 : 46;
  const sw = isSm ? 38 : 56;
  const fs = isSm ? 15 : 20;
  const as = isSm ? 13 : 18;
  const bdr = isSm ? "1.5px" : "2px";
  const borderColor = vote === "up" ? "#a3e635" : vote === "down" ? "#ef4444" : "#d4d4d4";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: isSm ? 3 : 5 }}>
      <div style={{
        display: "flex", alignItems: "center",
        border: `${bdr} solid ${borderColor}`, borderRadius: 0, overflow: "hidden", background: "white",
      }}>
        <div style={{
          width: bw, height: bw,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: vote === "up" ? "#a3e635" : "transparent",
          borderRight: `1px solid ${vote === "up" ? "#84cc16" : "#e5e5e5"}`,
          color: vote === "up" ? "#1a1a1a" : "#a3a3a3",
        }}>
          <ArrowUp size={as} />
        </div>
        <div style={{
          minWidth: sw, height: bw,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: fs,
          color: vote === "up" ? "#365314" : vote === "down" ? "#b91c1c" : "#1a1a1a",
        }}>
          {score}
        </div>
        <div style={{
          width: bw, height: bw,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: vote === "down" ? "#fecaca" : "transparent",
          borderLeft: `1px solid ${vote === "down" ? "#fca5a5" : "#e5e5e5"}`,
          color: vote === "down" ? "#b91c1c" : "#a3a3a3",
        }}>
          <ArrowDown size={as} />
        </div>
      </div>
      <span style={{
        fontFamily: "'Courier New', monospace", fontSize: isSm ? 9 : 10, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.12em", color: "#a3a3a3",
      }}>votes</span>
    </div>
  );
}

// ═══════════════════════════════════════
// DEAL CARD MOCK
// ═══════════════════════════════════════
function DealCardDemo({ idx = 1 }) {
  const titles = [
    "Free Entry to Dubai Miracle Garden for UAE Residents until 31st March",
    "Free Entry to Aquaventure Waterpark until 22nd March",
  ];
  const descs = [
    "Show Emirates ID at entrance for FREE entry. Starts March 15th. World's largest flower garden, 150M+ flowers in Dubailand.",
    "Saw this on TimeOut Dubai! Midnight ticket drops, first come first served. Max 4 tickets per transaction.",
  ];
  const cats = [
    ["Entertainment"],
    ["Entertainment"],
  ];
  const i = idx - 1;

  return (
    <div style={{
      display: "flex", gap: 20, padding: "20px 24px",
      background: "white", border: "1px solid #e5e5e5", borderRadius: 0, alignItems: "flex-start",
      borderBottom: "none",
    }}>
      <div style={{ flexShrink: 0, paddingTop: 4 }}>
        <VoteWidgetList initialScore={12} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          {idx === 1 && (
            <span style={{
              background: "#1a1a1a", color: "#a3e635", fontSize: 10, fontWeight: 700,
              padding: "3px 8px", borderRadius: 0,
              fontFamily: "'Courier New', monospace", letterSpacing: "0.06em", textTransform: "uppercase",
            }}>#1 Most Popular</span>
          )}
          <span style={{
            border: "1px solid #d4d4d4", color: "#525252", fontSize: 10, fontWeight: 600,
            padding: "3px 8px", borderRadius: 0, fontFamily: "system-ui, sans-serif",
          }}>{cats[i]}</span>
          <span style={{
            border: "1.5px solid #a3e635", color: "#365314", fontSize: 10, fontWeight: 700,
            padding: "3px 8px", borderRadius: 0,
            fontFamily: "'Courier New', monospace", letterSpacing: "0.04em", textTransform: "uppercase",
          }}>★ Staff Pick</span>
        </div>
        <h3 style={{
          fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 18, fontWeight: 800,
          color: "#0a0a0a", margin: 0, lineHeight: 1.3,
        }}>{titles[i]}</h3>
        <p style={{
          fontFamily: "system-ui, sans-serif", fontSize: 13, color: "#737373",
          margin: "8px 0 0", lineHeight: 1.55,
        }}>{descs[i]}</p>
        <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
          <span style={{
            fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 14,
            background: "#1a1a1a", color: "#a3e635", padding: "2px 10px", borderRadius: 0,
          }}>Free</span>
          <span style={{
            fontFamily: "'Courier New', monospace", fontSize: 13, color: "#a3a3a3", textDecoration: "line-through",
          }}>AED 100</span>
          <span style={{
            fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 12,
            color: "#ef4444", border: "1px solid #fecaca", padding: "1px 6px", borderRadius: 0,
          }}>-100%</span>
        </div>
        <div style={{
          display: "flex", gap: 14, marginTop: 12, alignItems: "center",
          color: "#a3a3a3", fontSize: 12, fontFamily: "'Courier New', monospace",
        }}>
          <span>💬 3</span>
          <span>🔗</span>
          <span style={{ marginLeft: "auto" }}>about 7 hours ago · alikhan99</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// DETAIL SIDEBAR MOCK
// ═══════════════════════════════════════
function DetailSidebarDemo() {
  return (
    <div style={{
      background: "white", border: "1px solid #e5e5e5", borderRadius: 0, padding: 24, width: 300,
    }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span style={{
          fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 28,
          background: "#1a1a1a", color: "#a3e635", padding: "4px 20px", borderRadius: 0,
        }}>Free</span>
        <div style={{ marginTop: 8 }}>
          <span style={{
            fontFamily: "'Courier New', monospace", fontSize: 15, color: "#a3a3a3", textDecoration: "line-through",
          }}>AED 100.00</span>
          <span style={{
            fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 14,
            color: "#ef4444", border: "1px solid #fecaca", padding: "1px 8px", borderRadius: 0, marginLeft: 10,
          }}>-100%</span>
        </div>
      </div>
      <button style={{
        width: "100%", padding: "13px 0",
        background: "#1a1a1a", color: "white", border: "none", borderRadius: 0,
        fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 14,
        cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20,
      }}>Go to Deal ↗</button>
      <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: 20, display: "flex", justifyContent: "center" }}>
        <VoteWidgetDetail initialScore={12} />
      </div>
      <div style={{
        display: "flex", justifyContent: "center", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid #e5e5e5",
      }}>
        {["WhatsApp", "Facebook", "Link", "Share"].map((label, i) => (
          <button key={i} style={{
            width: 38, height: 38, border: "1.5px solid #d4d4d4", borderRadius: 0,
            background: "white", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#737373",
          }} title={label}>
            {["💬", "📘", "🔗", "↗"][i]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// CURRENT (before) widget
// ═══════════════════════════════════════
function CurrentWidget() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <div style={{
        display: "flex", alignItems: "center",
        border: "1.5px solid #d4d4d4", borderRadius: 0, overflow: "hidden", background: "white",
      }}>
        <button style={{
          width: 32, height: 34, background: "transparent", border: "none",
          color: "#a3a3a3", fontSize: 16, fontFamily: "system-ui", cursor: "default",
        }}>∧</button>
        <span style={{
          fontFamily: "system-ui", fontSize: 15, fontWeight: 600, color: "#262626",
          minWidth: 28, textAlign: "center",
        }}>12</span>
        <button style={{
          width: 32, height: 34, background: "transparent", border: "none",
          color: "#a3a3a3", fontSize: 16, fontFamily: "system-ui", cursor: "default",
        }}>∨</button>
      </div>
      <span style={{
        fontFamily: "'Courier New', monospace", fontSize: 9, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.12em", color: "transparent",
      }}>votes</span>
    </div>
  );
}

// ═══════════════════════════════════════
// STATE ROW
// ═══════════════════════════════════════
function StateRow({ label, desc, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 28,
      padding: "18px 24px", background: "white", border: "1px solid #e5e5e5", borderRadius: 0,
    }}>
      <div style={{ flexShrink: 0 }}>{children}</div>
      <div>
        <p style={{
          fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 12,
          color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em",
        }}>{label}</p>
        <p style={{ fontSize: 12, color: "#737373", marginTop: 4, lineHeight: 1.5, fontFamily: "system-ui" }}>{desc}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("compare");

  const tabs = [
    { id: "compare", label: "Before / After" },
    { id: "list", label: "List Card" },
    { id: "detail", label: "Detail Sidebar" },
    { id: "states", label: "All States" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #f5f5f5; }`}</style>

      {/* Nav */}
      <div style={{
        background: "#1a1a1a", padding: "14px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#a3e635", fontSize: 20, fontWeight: 700 }}>✱</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: "white", letterSpacing: "-0.01em" }}>halasaves</span>
        </div>
        <span style={{
          fontFamily: "'Courier New', monospace", fontSize: 11, color: "#737373",
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>Vote Widget Spec</span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "white", borderBottom: "2px solid #1a1a1a" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "12px 22px",
            background: tab === t.id ? "#1a1a1a" : "white",
            color: tab === t.id ? "#a3e635" : "#737373",
            border: "none", borderRight: "1px solid #e5e5e5",
            fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 12,
            cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 20px" }}>

        {/* ── COMPARE ── */}
        {tab === "compare" && (
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{
              background: "white", border: "2px solid #e5e5e5", borderRadius: 0,
              padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, minWidth: 220,
            }}>
              <span style={{
                fontFamily: "'Courier New', monospace", fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.12em",
                color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", padding: "4px 12px",
              }}>Before</span>
              <CurrentWidget />
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>Current</p>
                <p style={{ fontSize: 12, color: "#a3a3a3", marginTop: 6, lineHeight: 1.5, maxWidth: 180 }}>
                  Chevrons (∧∨). No label. No color feedback. Looks like a quantity picker.
                </p>
              </div>
            </div>
            <div style={{
              background: "white", border: "2px solid #a3e635", borderRadius: 0,
              padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, minWidth: 220,
            }}>
              <span style={{
                fontFamily: "'Courier New', monospace", fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.12em",
                color: "#365314", background: "#ecfccb", border: "1px solid #a3e635", padding: "4px 12px",
              }}>After — Click to test ↓</span>
              <VoteWidgetList initialScore={12} />
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>New</p>
                <p style={{ fontSize: 12, color: "#a3a3a3", marginTop: 6, lineHeight: 1.5, maxWidth: 180 }}>
                  Filled arrows. "VOTES" label. Green/red color states. Hover tooltips. Click again to undo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── LIST CARD ── */}
        {tab === "list" && (
          <div>
            <p style={{
              fontFamily: "'Courier New', monospace", fontSize: 11, color: "#a3a3a3",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16,
            }}>Homepage — Deal Cards</p>
            <DealCardDemo idx={1} />
            <DealCardDemo idx={2} />
            <div style={{ borderTop: "1px solid #e5e5e5" }} />
          </div>
        )}

        {/* ── DETAIL SIDEBAR ── */}
        {tab === "detail" && (
          <div>
            <p style={{
              fontFamily: "'Courier New', monospace", fontSize: 11, color: "#a3a3a3",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16,
            }}>Deal Detail — Sidebar</p>
            <DetailSidebarDemo />
          </div>
        )}

        {/* ── ALL STATES ── */}
        {tab === "states" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{
              fontFamily: "'Courier New', monospace", fontSize: 11, color: "#a3a3a3",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
            }}>Visual states reference</p>

            <StateRow label="Neutral (default)" desc="Arrows: #a3a3a3. Border: #d4d4d4. Score: #1a1a1a. No background.">
              <StaticVote vote={null} score={12} />
            </StateRow>
            <StateRow label="Upvoted" desc="Up arrow bg: #a3e635, icon: #1a1a1a. Border: #a3e635. Score: #365314.">
              <StaticVote vote="up" score={13} />
            </StateRow>
            <StateRow label="Downvoted" desc="Down arrow bg: #fecaca, icon: #b91c1c. Border: #ef4444. Score: #b91c1c.">
              <StaticVote vote="down" score={11} />
            </StateRow>
            <StateRow label="Detail size" desc="46×46px buttons, 20px score font. Used on deal detail sidebar.">
              <StaticVote vote={null} score={12} size="lg" />
            </StateRow>
            <StateRow label="Interactive (test it)" desc="Click arrows to cycle through states. Click same arrow again to undo.">
              <VoteWidgetList initialScore={12} />
            </StateRow>
          </div>
        )}
      </div>
    </div>
  );
}
