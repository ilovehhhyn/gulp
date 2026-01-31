import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllWaterRatings, WaterRating } from "@/lib/waterRatings";

export default function Map() {
  const [submissions, setSubmissions] = useState<WaterRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<WaterRating | null>(null);

  useEffect(() => {
    async function fetchRatings() {
      try {
        setIsLoading(true);
        setError(null);
        const ratings = await getAllWaterRatings();
        // Sort by rating from high to low
        const sortedRatings = [...ratings].sort((a, b) => {
          const ratingA = parseFloat(a.rating) || 0;
          const ratingB = parseFloat(b.rating) || 0;
          return ratingB - ratingA;
        });
        setSubmissions(sortedRatings);
      } catch (err) {
        console.error("Error fetching ratings:", err);
        setError("Failed to load water ratings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRatings();
  }, []);

  return (
    <div className="min-h-screen bg-white p-8 lg:p-16">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-block mb-12 text-sm font-medium hover:underline"
      >
        ← back
      </Link>

      {/* Title */}
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-6xl lg:text-7xl font-light">water map</h1>
        <div className="text-gray-600 mt-4">
          <p>All gulp submissions. Click to view ID.</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-6xl mx-auto text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading water ratings...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-6xl mx-auto text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 border border-black hover:bg-gray-100 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && submissions.length === 0 && (
        <div className="max-w-6xl mx-auto text-center py-12">
          <div className="text-6xl mb-4">🌊</div>
          <p className="text-gray-600 mb-4">No water ratings yet!</p>
          <Link
            to="/make"
            className="inline-block px-6 py-2 bg-black text-white hover:bg-gray-900 transition"
          >
            Be the first to rate
          </Link>
        </div>
      )}

      {/* Submissions Grid */}
      {!isLoading && !error && submissions.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((submission) => (
              <button
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                className="block text-left border-2 border-black p-4 hover:bg-gray-50 transition"
              >
                {/* Canvas/Drawing Display */}
                <div className="w-full aspect-square bg-gray-200 border border-black mb-4 flex items-center justify-center overflow-hidden">
                  {submission.drawing ? (
                    <img
                      src={submission.drawing}
                      alt={`Drawing by ${submission.name}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl mb-2">🌊</div>
                      <span className="text-xs text-gray-600">No drawing</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">{submission.location}</h3>
                  <p className="text-xs text-gray-600">{submission.name}</p>
                  <p className="text-xs font-medium">Rating: {submission.rating}/10</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal - ID Card Popup */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="bg-white border-4 border-black p-8 lg:p-12 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedSubmission(null)}
              className="float-right text-2xl font-light hover:text-gray-600 mb-4"
            >
              ✕
            </button>

            {/* Title */}
            <h2 className="text-3xl font-light mb-8 clear-both">
              {selectedSubmission.location}
            </h2>

            {/* ID Card Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {/* Canvas/Drawing */}
              <div className="md:col-span-1 flex flex-col items-center">
                <div className="text-xs font-semibold mb-3 uppercase tracking-wide">
                  drawing
                </div>
                <div className="w-full aspect-square bg-gray-200 border-2 border-black flex items-center justify-center overflow-hidden">
                  {selectedSubmission.drawing ? (
                    <img
                      src={selectedSubmission.drawing}
                      alt={`Drawing by ${selectedSubmission.name}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-4xl">🌊</span>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="md:col-span-2 space-y-4">
                {/* Top Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold mb-1 uppercase tracking-wide">
                      location
                    </div>
                    <p className="text-sm">{selectedSubmission.location}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-1 uppercase tracking-wide">
                      rating
                    </div>
                    <p className="text-sm">{selectedSubmission.rating}/10</p>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <div className="text-xs font-semibold mb-1 uppercase tracking-wide">
                    gulp mbti
                  </div>
                  <p className="text-sm">{selectedSubmission.comment || "—"}</p>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold mb-1 uppercase tracking-wide">
                      name
                    </div>
                    <p className="text-sm">{selectedSubmission.name}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-1 uppercase tracking-wide">
                      date
                    </div>
                    <p className="text-sm">{selectedSubmission.date || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
