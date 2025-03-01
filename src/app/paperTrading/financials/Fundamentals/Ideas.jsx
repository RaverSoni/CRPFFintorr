"use client";
import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  AiOutlineBulb,
  AiOutlineStock,
  AiOutlineLineChart,
  AiOutlineRise,
  AiOutlineFall,
} from "react-icons/ai";

// ✅ Register Chart.js Components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Ideas = () => {
  const [ideas, setIdeas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/fundamentals/MSFT/");
        if (!response.ok) {
          throw new Error("Failed to fetch investment ideas.");
        }

        const data = await response.json();
        if (!data.ideas || Object.keys(data.ideas).length === 0) {
          throw new Error("No investment ideas available.");
        }

        setIdeas(data.ideas);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching investment ideas:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchIdeas();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">⚠️ {error}</p>;
  }

  // ✅ Extract data for visualization
  const recommendationCounts = ideas?.recommendationCount || {};
  const recommendationTrends = ideas?.trend || [];
  
  // ✅ Data for Bar Chart (Trends)
  const barChartData = {
    labels: recommendationTrends.map((item) => item.period),
    datasets: [
      {
        label: "Buy",
        data: recommendationTrends.map((item) => item.strongBuy),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
      },
      {
        label: "Hold",
        data: recommendationTrends.map((item) => item.hold),
        backgroundColor: "rgba(255, 206, 86, 0.7)",
      },
      {
        label: "Sell",
        data: recommendationTrends.map((item) => item.strongSell),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
      },
    ],
  };

  // ✅ Data for Pie Chart (Overall Recommendations)
  const pieChartData = {
    labels: ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"],
    datasets: [
      {
        data: [
          recommendationCounts.strongBuy || 0,
          recommendationCounts.buy || 0,
          recommendationCounts.hold || 0,
          recommendationCounts.sell || 0,
          recommendationCounts.strongSell || 0,
        ],
        backgroundColor: ["#00FF7F", "#007BFF", "#FFD700", "#FF4500", "#DC143C"],
      },
    ],
  };

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      <h1 className="text-3xl font-bold flex items-center mb-6">
        <AiOutlineBulb className="mr-2 text-yellow-400" />
        Investment Ideas & Reports
      </h1>

      {/* 🔹 Stock Recommendation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            <AiOutlineStock className="mr-2 text-blue-400" />
            Strong Buy
          </h2>
          <p className="text-2xl font-bold text-green-400">
            {recommendationCounts.strongBuy || 0}
          </p>
        </div>
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            <AiOutlineRise className="mr-2 text-green-400" />
            Buy
          </h2>
          <p className="text-2xl font-bold text-green-300">
            {recommendationCounts.buy || 0}
          </p>
        </div>
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            <AiOutlineLineChart className="mr-2 text-yellow-400" />
            Hold
          </h2>
          <p className="text-2xl font-bold text-yellow-300">
            {recommendationCounts.hold || 0}
          </p>
        </div>
      </div>

      {/* 📊 Recommendation Charts */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 🔹 Bar Chart for Trends */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            <AiOutlineLineChart className="mr-2 text-green-400" /> 
            Recommendation Trends
          </h2>
          {recommendationTrends.length > 0 ? (
            <Bar data={barChartData} options={{ responsive: true }} />
          ) : (
            <p className="text-gray-400 mt-4">No trend data available.</p>
          )}
        </div>

        {/* 🔹 Pie Chart for Overall Recommendations */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            <AiOutlineStock className="mr-2 text-blue-400" />
            Recommendation Distribution
          </h2>
          <Pie data={pieChartData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
};

export default Ideas;