import React from "react";
import "./Preloader.css"; // Import the CSS file for styling & animations

const Preloader = () => {
  const text = "Loading..."; // The text used for sectors
  const rings = 2; // Number of rings
  const ringSectors = 30; // Number of sectors per ring

  return (
    <div className="preloader">
      {[...Array(rings)].map((_, ringIndex) => (
        <div key={ringIndex} className="preloader__ring">
          {[...Array(ringSectors)].map((_, sectorIndex) => (
            <div key={sectorIndex} className="preloader__sector">
              {text[sectorIndex] || ""}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Preloader;