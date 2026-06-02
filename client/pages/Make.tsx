import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { submitWaterEntry } from "@/lib/waterRatings";
import { useToast } from "@/hooks/use-toast";

export default function Make() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    waterLocation: "",
    description: "",
    rating: "",
    date: today,
    name: "",
    city: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.waterLocation.trim()) {
      toast({ title: "missing location", description: "please enter a water location.", variant: "destructive" });
      return;
    }
    if (!formData.name.trim()) {
      toast({ title: "missing name", description: "please enter your name.", variant: "destructive" });
      return;
    }
    const ratingNum = parseFloat(formData.rating);
    if (formData.rating === "" || isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
      toast({ title: "invalid rating", description: "rating must be between 0 and 10.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitWaterEntry({
        date: formData.date || today,
        waterLocation: formData.waterLocation.trim(),
        city: formData.city.trim(),
        name: formData.name.trim(),
        rating: ratingNum,
        description: formData.description.trim(),
      });
      toast({ title: "saved!", description: "your water entry has been recorded." });
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

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "'Calibri', 'Gill Sans', 'Trebuchet MS', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#111111",
    marginBottom: "0.4rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.65rem 0.75rem",
    background: "#ffffff",
    border: "1px solid #999999",
    borderRadius: "5px",
    fontFamily: "'Calibri', 'Gill Sans', 'Trebuchet MS', sans-serif",
    fontSize: "1rem",
    color: "#111111",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/entrybackground.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "scroll",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        padding: "2rem 0",
      }}
    >
      {/* Card */}
      <div
        style={{
          marginLeft: "clamp(1rem, 6vw, 6vw)",
          marginRight: "clamp(1rem, 6vw, 6vw)",
          width: "min(680px, 88vw)",
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          borderRadius: "0",
          border: "none",
          padding: "2.5rem 2.8rem",
          boxSizing: "border-box",
        }}
      >
        {/* Fields */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>

            <div>
              <label style={labelStyle}>location</label>
              <input
                type="text"
                name="waterLocation"
                value={formData.waterLocation}
                onChange={handleChange}
                style={inputStyle}
                placeholder="where is this water?"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label style={labelStyle}>description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                style={{ ...inputStyle, resize: "none" }}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label style={labelStyle}>rating</label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min={0}
                max={10}
                step={0.5}
                style={inputStyle}
                placeholder="e.g., 8.5"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label style={labelStyle}>date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                style={inputStyle}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label style={labelStyle}>your name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={inputStyle}
                placeholder="yours or water's name"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label style={labelStyle}>city</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                style={inputStyle}
                placeholder="city"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-start", gap: "1rem", alignItems: "center" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "0.55rem 2.2rem",
                border: "1px solid #111111",
                borderRadius: "4px",
                background: "#111111",
                color: "#ffffff",
                fontFamily: "'Calibri', 'Gill Sans', 'Trebuchet MS', sans-serif",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.5 : 1,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {isSubmitting ? "sending..." : "submit"}
            </button>

            <Link
              to="/"
              style={{
                fontFamily: "'Calibri', 'Gill Sans', 'Trebuchet MS', sans-serif",
                fontSize: "0.85rem",
                color: "#555555",
                textDecoration: "none",
              }}
            >
              ← home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
