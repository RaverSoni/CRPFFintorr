"use client";
import React from "react";
import { Home, BarChart, PieChart, FileText, TrendingUp, Newspaper } from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { icon: <Home />, label: "Home" },
    { icon: <BarChart />, label: "Chart" },
    { icon: <TrendingUp />, label: "Options" },
    { icon: <Newspaper />, label: "News" }, // ✅ Replaced News with Newspaper
    { icon: <FileText />, label: "Financials" },
    { icon: <PieChart />, label: "Risk Analysis" },
  ];

  return (
    <div className="w-16 h-screen bg-gray-800 flex flex-col items-center py-6">
      {menuItems.map((item, index) => (
        <div key={index} className="p-4 hover:bg-gray-700 rounded-lg cursor-pointer" title={item.label}>
          {item.icon}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
