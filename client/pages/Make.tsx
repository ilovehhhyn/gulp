import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { submitWaterEntry } from "@/lib/waterRatings";
import { useToast } from "@/hooks/use-toast";

const ARIAL = "'Arial', sans-serif";
const BORDER = "1.5px solid #000";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  outline: "none",
  fontFamily: ARIAL,
  fontSize: "1rem",
  color: "#000",
  padding: "0.15rem 0",
  boxSizing: "border-box",
};

function FieldLabel({ num, text }: { num: string; text: string }) {
  return (
    <div style={{ fontFamily: ARIAL, fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.2rem", color: "#000" }}>
      <span style={{ marginRight: "0.4em", fontWeight: 400 }}>{num}</span>{text}
    </div>
  );
}

function CheckBox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: "14px",
        height: "14px",
        border: BORDER,
        background: checked ? "#000" : "#fff",
        cursor: "pointer",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {checked && (
        <div style={{ width: "8px", height: "8px", background: "#fff" }} />
      )}
    </div>
  );
}

function CheckRow({ num, question, value, onChange }: {
  num: string;
  question: string;
  value: "yes" | "no" | null;
  onChange: (v: "yes" | "no") => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", fontFamily: ARIAL, fontSize: "0.88rem", padding: "0.5rem 0.8rem" }}>
      <span style={{ fontSize: "0.58rem", fontWeight: 700, width: "1.2em", flexShrink: 0 }}>{num}</span>
      <span style={{ flex: 1 }}>{question}</span>
      <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", userSelect: "none" }}>
        <CheckBox checked={value === "yes"} onClick={() => onChange("yes")} />
        Yes
      </label>
      <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", userSelect: "none" }}>
        <CheckBox checked={value === "no"} onClick={() => onChange("no")} />
        No
      </label>
    </div>
  );
}

export default function Make() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];
  const year = new Date().getFullYear();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    waterAddress: "",
    city: "",
    description: "",
    rating: "",
    date: today,
  });
  const [happyAnswer, setHappyAnswer] = useState<"yes" | "no" | null>(null);
  const [drinksAnswer, setDrinksAnswer] = useState<"yes" | "no" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = [formData.firstName.trim(), formData.lastName.trim()].filter(Boolean).join(" ");
    if (!name) {
      toast({ title: "missing name", description: "please enter your name.", variant: "destructive" });
      return;
    }
    if (!formData.waterAddress.trim()) {
      toast({ title: "missing location", description: "please enter a water location.", variant: "destructive" });
      return;
    }
    const ratingNum = parseFloat(formData.rating);
    if (formData.rating === "" || isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
      toast({ title: "invalid rating", description: "rating must be between 0 and 10.", variant: "destructive" });
      return;
    }

    const extras = [
      happyAnswer ? `Did the water make you happy? ${happyAnswer === "yes" ? "Yes" : "No"}` : "",
      drinksAnswer ? `Do you drink water a lot? ${drinksAnswer === "yes" ? "Yes" : "No"}` : "",
    ].filter(Boolean).join("  ·  ");

    const description = [formData.description.trim(), extras].filter(Boolean).join("\n");

    setIsSubmitting(true);
    try {
      await submitWaterEntry({
        date: formData.date || today,
        waterLocation: formData.waterAddress.trim(),
        city: formData.city.trim(),
        name,
        rating: ratingNum,
        description,
      });
      toast({ title: "filed!", description: "your water entry has been recorded." });
      setTimeout(() => navigate("/archive"), 900);
    } catch (err) {
      toast({
        title: "error",
        description: err instanceof Error ? err.message : "failed to submit. please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#fff", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", padding: "1.5rem", boxSizing: "border-box", fontFamily: ARIAL }}>
      <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", border: "2.5px solid #000", boxSizing: "border-box", overflow: "hidden" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "0.6rem 1rem 0.5rem", borderBottom: "2.5px solid #000", background: "rgba(120, 235, 210, 0.28)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.15rem" }}>
              Department of Water Affairs — Internal Water Service
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>Individual Water Archive Contribution</div>
            <div style={{ fontSize: "0.6rem", marginTop: "0.15rem", color: "#444" }}>
              ▶ Go to <em>wateraffairs.gov</em> for instructions and the latest information.
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "1rem" }}>
            <div style={{ fontSize: "3.2rem", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", fontFamily: ARIAL }}>H-1042</div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textAlign: "center" }}>Form {year}</div>
          </div>
        </div>

        {/* ── Row 1: First name | Last name ── */}
        <div style={{ display: "flex", borderBottom: BORDER, flexShrink: 0 }}>
          <div style={{ flex: 1, padding: "0.25rem 0.7rem 0.3rem", borderRight: BORDER }}>
            <FieldLabel num="1a" text="Your first name" />
            <input name="firstName" value={formData.firstName} onChange={handleChange} style={inputStyle} disabled={isSubmitting} />
          </div>
          <div style={{ flex: 1, padding: "0.25rem 0.7rem 0.3rem" }}>
            <FieldLabel num="1b" text="Last name" />
            <input name="lastName" value={formData.lastName} onChange={handleChange} style={inputStyle} disabled={isSubmitting} />
          </div>
        </div>

        {/* ── Row 2: Water's address ── */}
        <div style={{ borderBottom: BORDER, padding: "0.25rem 0.7rem 0.3rem", flexShrink: 0 }}>
          <FieldLabel num="2" text="Water's address (body of water, fountain, tap, river, lake, etc.)" />
          <input name="waterAddress" value={formData.waterAddress} onChange={handleChange} style={inputStyle} disabled={isSubmitting} />
        </div>

        {/* ── Row 3: City | Date ── */}
        <div style={{ display: "flex", borderBottom: BORDER, flexShrink: 0 }}>
          <div style={{ flex: 2, padding: "0.25rem 0.7rem 0.3rem", borderRight: BORDER }}>
            <FieldLabel num="3" text="City or town" />
            <input name="city" value={formData.city} onChange={handleChange} style={inputStyle} disabled={isSubmitting} />
          </div>
          <div style={{ flex: 1, padding: "0.25rem 0.7rem 0.3rem" }}>
            <FieldLabel num="4" text="Date of water encounter" />
            <input type="date" name="date" value={formData.date} onChange={handleChange} style={inputStyle} disabled={isSubmitting} />
          </div>
        </div>

        {/* ── Row 4: Rating ── */}
        <div style={{ borderBottom: BORDER, padding: "0.25rem 0.7rem 0.3rem", display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
          <div>
            <FieldLabel num="5" text="Water rating (0–10)" />
            <div style={{ border: BORDER, width: "90px", padding: "0.15rem 0.5rem" }}>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min={0}
                max={10}
                step={0.5}
                style={{ ...inputStyle, textAlign: "center" }}
                placeholder="0 – 10"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div style={{ fontSize: "0.62rem", color: "#666", marginTop: "0.8rem" }}>
            0 = undrinkable &nbsp;·&nbsp; 10 = life-changing
          </div>
        </div>

        {/* ── Row 5: Description — grows to fill remaining space ── */}
        <div style={{ borderBottom: BORDER, padding: "0.25rem 0.7rem 0.3rem", flex: 1, display: "flex", flexDirection: "column" }}>
          <FieldLabel num="6" text="Description of water experience" />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.6, flex: 1 }}
            disabled={isSubmitting}
          />
        </div>

        {/* ── Part II header ── */}
        <div style={{ background: "#000", color: "#fff", padding: "0.25rem 0.8rem", fontFamily: ARIAL, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", flexShrink: 0 }}>
          Part II — Water Wellness Questionnaire
        </div>

        {/* ── Checkboxes ── */}
        <div style={{ borderBottom: BORDER, flexShrink: 0 }}>
          <CheckRow num="7" question="Did the water make you happy?" value={happyAnswer} onChange={setHappyAnswer} />
        </div>
        <div style={{ borderBottom: BORDER, flexShrink: 0 }}>
          <CheckRow num="8" question="Do you drink water a lot?" value={drinksAnswer} onChange={setDrinksAnswer} />
        </div>

        {/* ── Signature / Submit ── */}
        <div style={{ padding: "0.6rem 1rem 0.7rem", flexShrink: 0 }}>
          <div style={{ fontSize: "0.62rem", fontStyle: "italic", color: "#333", marginBottom: "0.6rem", lineHeight: 1.5 }}>
            Under penalty of dehydration, I declare that I have examined this water report and, to the best of my knowledge and thirst, it is true, correct, and complete.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "0.45rem 2.2rem",
                background: "#000",
                color: "#fff",
                border: "2px solid #000",
                fontFamily: ARIAL,
                fontSize: "0.82rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.5 : 1,
              }}
            >
              {isSubmitting ? "Filing…" : "File Form H-1042"}
            </button>
            <Link to="/" style={{ fontFamily: ARIAL, fontSize: "0.85rem", color: "#555", textDecoration: "none" }}>
              ← home
            </Link>
          </div>
        </div>

      </form>
    </div>
  );
}
