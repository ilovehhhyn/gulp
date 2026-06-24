import { useNavigate } from "react-router-dom";

const TEAL = "#78EBD2";
const ARIAL = "'Arial', sans-serif";

const btnStyle: React.CSSProperties = {
  width: "300px",
  height: "96px",
  borderRadius: "50%",
  backgroundColor: "transparent",
  color: TEAL,
  fontFamily: ARIAL,
  fontSize: "1.55rem",
  fontWeight: 700,
  border: `4px solid ${TEAL}`,
  cursor: "pointer",
  boxShadow: "none",
  transition: "opacity 0.18s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  letterSpacing: "0.04em",
};

export default function Index() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundImage: "url('/archivebackground.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2.5rem",
      }}
    >
      <div
        style={{
          fontFamily: ARIAL,
          fontSize: "5.5vw",
          fontWeight: 700,
          color: TEAL,
          letterSpacing: "0.04em",
          textAlign: "center",
          lineHeight: 1.1,
          whiteSpace: "nowrap",
        }}
      >
        GUULP: water archive
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem", alignItems: "center" }}>
        <button
          onClick={() => navigate("/entry")}
          style={btnStyle}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.7"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
        >
          entry
        </button>

        <button
          onClick={() => navigate("/archive")}
          style={btnStyle}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.7"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
        >
          archive
        </button>
      </div>
    </div>
  );
}
