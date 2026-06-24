import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllWaterEntries, WaterEntry } from "@/lib/waterRatings";

const ARIAL = "'Arial', sans-serif";
const CARD_BORDER = "1.5px solid #000";
const TEAL_HEADER = "rgba(120, 235, 210, 0.28)";

const fieldLabelStyle: React.CSSProperties = {
  fontFamily: ARIAL,
  fontSize: "0.68rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#000",
  marginBottom: "0.2rem",
};

const fieldValueStyle: React.CSSProperties = {
  fontFamily: ARIAL,
  fontSize: "1.05rem",
  color: "#000",
  lineHeight: 1.35,
};

function TaxCard({ entry }: { entry: WaterEntry }) {
  return (
    <div style={{ border: "2px solid #000", backgroundColor: "#fff", fontFamily: ARIAL, boxSizing: "border-box" }}>

      {/* Card header — turquoise tint */}
      <div style={{
        background: TEAL_HEADER,
        padding: "0.5rem 0.8rem 0.4rem",
        borderBottom: "2px solid #000",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}>
        <div>
          <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: ARIAL }}>
            Dept. of Water Affairs
          </div>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, fontFamily: ARIAL, marginTop: "0.15rem" }}>
            Individual Water Archive Contribution
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "0.75rem" }}>
          <div style={{ fontSize: "3rem", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", fontFamily: ARIAL }}>
            {entry.rating}
          </div>
          <div style={{ fontSize: "0.6rem", fontWeight: 700, fontFamily: ARIAL, textAlign: "center" }}>/ 10</div>
        </div>
      </div>

      {/* Name | Date */}
      <div style={{ display: "flex", borderBottom: CARD_BORDER }}>
        <div style={{ flex: 1.5, padding: "0.4rem 0.8rem 0.45rem", borderRight: CARD_BORDER }}>
          <div style={fieldLabelStyle}>1a Name</div>
          <div style={fieldValueStyle}>{entry.name || "—"}</div>
        </div>
        <div style={{ flex: 1, padding: "0.4rem 0.8rem 0.45rem" }}>
          <div style={fieldLabelStyle}>4 Date</div>
          <div style={fieldValueStyle}>{entry.date || "—"}</div>
        </div>
      </div>

      {/* Water's address */}
      <div style={{ borderBottom: CARD_BORDER, padding: "0.4rem 0.8rem 0.45rem" }}>
        <div style={fieldLabelStyle}>2 Water's Address</div>
        <div style={{ ...fieldValueStyle, fontWeight: 700 }}>{entry.waterLocation || "—"}</div>
      </div>

      {/* City */}
      <div style={{ borderBottom: entry.description ? CARD_BORDER : "none", padding: "0.4rem 0.8rem 0.45rem" }}>
        <div style={fieldLabelStyle}>3 City or Town</div>
        <div style={fieldValueStyle}>{entry.city || "—"}</div>
      </div>

      {/* Description */}
      {entry.description && (
        <div style={{ padding: "0.4rem 0.8rem 0.5rem" }}>
          <div style={fieldLabelStyle}>6 Description</div>
          <div style={{ ...fieldValueStyle, lineHeight: 1.5 }}>{entry.description}</div>
        </div>
      )}
    </div>
  );
}

export default function Archive() {
  const [entries, setEntries] = useState<WaterEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllWaterEntries();
        const sorted = [...data].sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return (b.date ?? "").localeCompare(a.date ?? "");
        });
        setEntries(sorted);
      } catch (err) {
        console.error(err);
        setError("couldn't load entries. please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        paddingBottom: "4rem",
      }}
    >
      {/* Top bar */}
      <div style={{ padding: "1rem 2rem" }}>
        <Link
          to="/"
          style={{
            fontFamily: ARIAL,
            fontSize: "0.85rem",
            color: "#3A3A3A",
            textDecoration: "none",
          }}
        >
          ← home
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 3rem" }}>
        {isLoading && (
          <div style={{ textAlign: "center", paddingTop: "4rem", fontFamily: ARIAL, color: "#fff" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 1rem",
              }}
            />
            loading waters...
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", paddingTop: "4rem", fontFamily: ARIAL, color: "#fff" }}>
            <p style={{ marginBottom: "1rem" }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.4rem 1.2rem",
                border: "1px solid #fff",
                background: "transparent",
                fontFamily: ARIAL,
                cursor: "pointer",
                color: "#fff",
              }}
            >
              try again
            </button>
          </div>
        )}

        {!isLoading && !error && entries.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: "4rem", fontFamily: ARIAL, color: "#fff" }}>
            <p style={{ marginBottom: "1rem" }}>no waters yet.</p>
            <Link
              to="/entry"
              style={{
                padding: "0.4rem 1.2rem",
                background: "rgba(208,223,214,0.7)",
                fontFamily: ARIAL,
                color: "#3A3A3A",
                textDecoration: "none",
              }}
            >
              be the first to make an entry
            </Link>
          </div>
        )}

        {!isLoading && !error && entries.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "2rem",
            }}
          >
            {entries.map((entry) => (
              <TaxCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
