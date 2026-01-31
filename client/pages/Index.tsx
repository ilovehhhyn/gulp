import { useState } from "react";
import WaterDroplet from "@/components/WaterDroplet";

const poetryText = `sip                                                                                                                                         gulp

          welcome to gulp,                                                                                   where you rank                                                            sip
                                   the waters                                    gulp           
                                                                                                for all to sip                                             gulp
           and gulp                                                                                              and enjoy.
                    sip                              gulp                                                                             gulp`;

export default function Index() {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleMobileClick = () => {
    // Only trigger modal on touch devices
    if (window.matchMedia("(max-width: 768px)").matches) {
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
      {/* Background Poetry Text - Desktop (hover to show) */}
      <div
        className={`hidden md:block fixed top-0 left-0 w-screen h-screen text-gray-400 whitespace-pre pointer-events-none select-none overflow-hidden font-mono p-4 transition-opacity duration-300 z-50 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{ fontSize: "18px", lineHeight: "2.5" }}
      >
        {poetryText}
      </div>

      {/* Mobile Modal */}
      {showModal && (
        <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[80vh] overflow-auto p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
            <div className="text-gray-500 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
              {poetryText}
            </div>
          </div>
        </div>
      )}

      {/* Title Image */}
      <div
        className="mb-6 cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleMobileClick}
      >
        <img
          src="/gulp-title.png"
          alt="Gulp"
          className={`w-80 md:w-96 lg:w-[650px] h-auto transition-transform duration-200 ${
            isHovered ? "scale-95" : "scale-100"
          }`}
        />
      </div>

      {/* Subtitle Image */}
      <div
        className="mb-10 cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleMobileClick}
      >
        <img
          src="/subtitle.png"
          alt="Subtitle"
          className={`w-32 md:w-40 lg:w-48 h-auto transition-transform duration-200 ${
            isHovered ? "scale-95" : "scale-100"
          }`}
        />
      </div>

      {/* Floating Water Droplets Container */}
      <div className="relative w-full flex items-center justify-center gap-8 sm:gap-16 md:gap-24 lg:gap-32 h-96">
        {/* Make Droplet - Left */}
        <div
          className="w-24 sm:w-32 md:w-40 flex items-center justify-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="animate-float"
            style={{ animationDelay: "0s" }}
          >
            <WaterDroplet
              label="make"
              to="/make"
              animationClass="block"
              imageUrl="/droplet-custom.png"
              labelImageUrl="/make-label.png"
            />
          </div>
        </div>

        {/* Map Droplet - Right */}
        <div
          className="w-24 sm:w-32 md:w-40 flex items-center justify-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="animate-float-slow"
            style={{ animationDelay: "0.5s" }}
          >
            <WaterDroplet
              label="map"
              to="/map"
              animationClass="block"
              imageUrl="/droplet-custom.png"
              labelImageUrl="/map-label.png"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
