import { Link } from "react-router-dom";

interface WaterDropletProps {
  label: string;
  to: string;
  animationClass: string;
  imageUrl?: string; // Optional: replace SVG with custom image
  labelImageUrl?: string; // Optional: replace text label with image
}

export default function WaterDroplet({
  label,
  to,
  animationClass,
  imageUrl,
  labelImageUrl,
}: WaterDropletProps) {
  return (
    <Link
      to={to}
      className={`group relative inline-flex items-center justify-center hover:opacity-80 transition-opacity ${animationClass}`}
      style={{ width: "120px", height: "150px" }}
    >
      {/* Droplet Shape Container */}
      <div className="group-hover:scale-110 transition-transform duration-300 absolute inset-0 flex items-center justify-center">
        {imageUrl ? (
          // Custom image upload path
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          // Default SVG Water Droplet Shape
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 160 200"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Hand-drawn style water droplet using path */}
            <defs>
              <filter id={`roughen-${label}`}>
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.05"
                  numOctaves="3"
                  result="noise"
                  seed="2"
                />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
              </filter>
            </defs>

            {/* Main droplet shape */}
            <path
              d="M 80 15 C 115 30, 155 70, 155 120 C 155 165, 125 195, 80 195 C 35 195, 5 165, 5 120 C 5 70, 45 30, 80 15 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-black"
              filter={`url(#roughen-${label})`}
            />

            {/* Inner accent line for depth */}
            <path
              d="M 85 40 Q 88 100, 85 150"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-300 opacity-60"
              filter={`url(#roughen-${label})`}
            />
          </svg>
        )}
      </div>

      {/* Label - Centered inside droplet */}
      {labelImageUrl ? (
        <img
          src={labelImageUrl}
          alt={label}
          className="relative w-12 md:w-14 h-auto pointer-events-none z-10 invert"
        />
      ) : (
        <span className="relative text-xl md:text-2xl font-semibold text-black pointer-events-none text-center z-10">
          {label}
        </span>
      )}
    </Link>
  );
}
