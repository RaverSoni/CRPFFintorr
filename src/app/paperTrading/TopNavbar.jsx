"use client";
import React from "react";

const TopNavbar = () => {
  return (
    <nav className="bg-gray-900 p-4 shadow-md flex justify-between items-center text-white">
      {/* Left: Branding */}
      <div className="text-xl font-bold">FINTORR</div>

      {/* Center: Navigation Links */}
      <div className="space-x-6">
        <button className="hover:text-green-400 transition duration-200">Dashboard</button>
        <button className="text-green-400 font-semibold border-b-2 border-green-400">Paper Trading</button>
        <button className="hover:text-green-400 transition duration-200">Prediction</button>
      </div>

      {/* Right: User/Profile (Placeholder for Future) */}
      <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
    </nav>
  );
};

export default TopNavbar;
