import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { submitWaterRating } from "@/lib/waterRatings";
import { useToast } from "@/hooks/use-toast";

export default function Make() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    location: "",
    rating: "",
    comment: "",
    name: "",
    date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getCanvasCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const handleCanvasMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    setIsDrawing(true);
    const pos = getCanvasCoordinates(e);
    lastPosRef.current = pos;
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const handleCanvasMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentPos = getCanvasCoordinates(e);
    if (!currentPos) return;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (lastPosRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    }

    lastPosRef.current = currentPos;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getDrawingDataUrl = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return "";
    return canvas.toDataURL("image/png");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Missing name",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.location.trim()) {
      toast({
        title: "Missing location",
        description: "Please enter the water location.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.rating.trim()) {
      toast({
        title: "Missing rating",
        description: "Please enter a rating.",
        variant: "destructive",
      });
      return;
    }

    console.log("Starting submission...");
    setIsSubmitting(true);

    try {
      console.log("Getting drawing data...");
      const drawingDataUrl = getDrawingDataUrl();
      console.log("Drawing data obtained:", drawingDataUrl ? "yes" : "no");

      console.log("Submitting to Firebase...");
      const result = await submitWaterRating({
        location: formData.location.trim(),
        rating: formData.rating.trim(),
        comment: formData.comment.trim(),
        name: formData.name.trim(),
        date: formData.date || new Date().toISOString().split("T")[0],
        drawing: drawingDataUrl,
      });
      console.log("Submission successful! ID:", result);

      toast({
        title: "Success!",
        description: "Your water rating has been submitted.",
      });

      // Navigate to map page after successful submission
      setTimeout(() => {
        navigate("/map");
      }, 1000);
    } catch (error) {
      console.error("Error submitting rating:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit your rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log("Setting isSubmitting to false");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 lg:p-16">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-block mb-12 text-sm font-medium hover:underline"
      >
        ← back
      </Link>

      {/* ID Card Container */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-100 border-4 border-black p-8 lg:p-12">
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-light">GULP ID</h2>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Main ID Card Layout - 2 columns on web */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Text Fields */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide">
                    name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    placeholder="yours or water's name"
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide">
                    location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide">
                    rating
                  </label>
                  <input
                    type="text"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    placeholder="e.g., 8.5"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Comment - with "gulp mbti" label */}
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide">
                    gulp mbti
                  </label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black text-sm resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide">
                    date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black text-sm"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Right Column - Drawing Canvas (smaller on web) */}
              <div className="flex flex-col items-center lg:items-start">
                <label className="block text-xs font-semibold mb-3 uppercase tracking-wide">
                  drawing
                </label>
                <canvas
                  ref={canvasRef}
                  width={180}
                  height={180}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={handleCanvasMouseUp}
                  onTouchStart={handleCanvasMouseDown}
                  onTouchEnd={handleCanvasMouseUp}
                  onTouchMove={handleCanvasMouseMove}
                  className="border-2 border-black bg-white cursor-crosshair touch-none"
                  style={{ width: "180px", height: "180px" }}
                />
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="mt-2 text-xs text-gray-600 hover:text-black underline"
                  disabled={isSubmitting}
                >
                  clear drawing
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-12 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-12 py-3 bg-black text-white font-medium text-lg hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "submitting..." : "submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
