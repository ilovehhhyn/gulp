import { useNavigate } from "react-router-dom";

const TEAL = "#78EBD2";
const CALIBRI = "'Calibri', 'Gill Sans', 'Trebuchet MS', sans-serif";

const btnStyle: React.CSSProperties = {
  width: "300px",
  height: "96px",
  borderRadius: "50%",
  backgroundColor: "transparent",
  color: TEAL,
  fontFamily: CALIBRI,
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
        backgroundImage: "url('/coverwithwords.png?v=2')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
    >
      {/* Both buttons stacked on the right, shifted up */}
      <div
        style={{
          position: "absolute",
          right: "8%",
          top: "38%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "1.6rem",
          alignItems: "center",
        }}
      >
        {/* Label above buttons */}
        <div
          style={{
            fontFamily: CALIBRI,
            fontSize: "1.2rem",
            fontWeight: 700,
            color: TEAL,
            letterSpacing: "0.08em",
            textAlign: "center",
            marginBottom: "0.4rem",
          }}
        >
          GUULP: water archive
        </div>
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
