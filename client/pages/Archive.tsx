import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllWaterEntries, WaterEntry } from "@/lib/waterRatings";

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

  const CALIBRI = "'Calibri', 'Gill Sans', 'Trebuchet MS', sans-serif";

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#D0DFD6",
    borderRadius: "0",
    border: "none",
    padding: "1.4rem 1.6rem",
    fontFamily: CALIBRI,
    color: "#000000",
    opacity: 0.6,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/archivebackground.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        paddingBottom: "4rem",
      }}
    >
      {/* Tagline */}
      <div
        style={{
          fontFamily: CALIBRI,
          fontSize: "1rem",
          color: "#000000",
          textAlign: "center",
          padding: "1.4rem 2rem 0.2rem",
          letterSpacing: "0.02em",
        }}
      >
        waters from high to low ratings. hope you drink good water!
      </div>

      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.6rem 2rem 1rem",
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: '"Source Sans Pro", sans-serif',
            fontSize: "0.85rem",
            color: "#3A3A3A",
            textDecoration: "none",
            background: "rgba(208,223,214,0.7)",
            padding: "0.35rem 0.9rem",
            borderRadius: "0",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLElement).style.background = "rgba(208,223,214,0.95)")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLElement).style.background = "rgba(208,223,214,0.7)")
          }
        >
          ← home
        </Link>

        <div
          style={{
            fontFamily: '"Source Sans Pro", sans-serif',
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            color: "#3A3A3A",
            textTransform: "uppercase",
            background: "rgba(208,223,214,0.5)",
            padding: "0.3rem 0.8rem",
            borderRadius: "0",
          }}
        >
          archive
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 3rem" }}>
        {isLoading && (
          <div style={{ textAlign: "center", paddingTop: "4rem", fontFamily: '"Source Sans Pro", sans-serif', color: "#fff" }}>
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
          <div style={{ textAlign: "center", paddingTop: "4rem", fontFamily: '"Source Sans Pro", sans-serif', color: "#fff" }}>
            <p style={{ marginBottom: "1rem" }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.4rem 1.2rem",
                borderRadius: "0",
                border: "1px solid #fff",
                background: "transparent",
                fontFamily: '"Source Sans Pro", sans-serif',
                cursor: "pointer",
                color: "#fff",
              }}
            >
              try again
            </button>
          </div>
        )}

        {!isLoading && !error && entries.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: "4rem", fontFamily: '"Source Sans Pro", sans-serif', color: "#fff" }}>
            <p style={{ marginBottom: "1rem" }}>no waters yet.</p>
            <Link
              to="/entry"
              style={{
                padding: "0.4rem 1.2rem",
                background: "rgba(208,223,214,0.7)",
                fontFamily: '"Source Sans Pro", sans-serif',
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
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "3rem",
            }}
          >
            {entries.map((entry) => (
              <div key={entry.id} style={cardStyle}>
                {/* Header strip */}
                <div
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    color: "#000000",
                    fontFamily: CALIBRI,
                    textTransform: "uppercase",
                    marginBottom: "0.9rem",
                    paddingBottom: "0.5rem",
                    borderBottom: "1px solid rgba(0,0,0,0.15)",
                  }}
                >
                  GUULP // water entry
                </div>

                {/* Water location (bold) + rating badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.35rem" }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      color: "#000000",
                      fontFamily: CALIBRI,
                      lineHeight: 1.25,
                      flex: 1,
                      marginRight: "0.5rem",
                    }}
                  >
                    {entry.waterLocation || "—"}
                  </div>
                  <div
                    style={{
                      backgroundColor: "rgba(0,0,0,0.08)",
                      padding: "0.25rem 0.65rem",
                      fontFamily: CALIBRI,
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "#000000",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {entry.rating} / 10
                  </div>
                </div>

                {/* City */}
                {entry.city && (
                  <div style={{ fontSize: "0.78rem", color: "#000000", fontFamily: CALIBRI, marginBottom: "0.2rem" }}>
                    {entry.city}
                  </div>
                )}

                {/* Creator name */}
                <div style={{ fontSize: "0.82rem", color: "#000000", fontFamily: CALIBRI, marginBottom: "0.6rem" }}>
                  {entry.name || "—"}
                </div>

                {/* Date */}
                <div style={{ fontSize: "0.78rem", color: "#000000", fontFamily: CALIBRI, marginBottom: entry.description ? "0.65rem" : 0 }}>
                  {entry.date || "—"}
                </div>

                {/* Description (bold) */}
                {entry.description && (
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#000000", fontFamily: CALIBRI, lineHeight: 1.4 }}>
                    {entry.description}
                  </div>
                )}
              </div>
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
