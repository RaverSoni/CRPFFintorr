// "use client";

// import React, { useEffect, useState } from "react";
// import dynamic from "next/dynamic";

// const OrdersContent = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Fetch order history dynamically
//     const fetchOrders = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/api/orders/");
//         const data = await response.json();

//         if (response.ok) {
//           setOrders(data.orders);
//         } else {
//           setError(data.error || "Failed to fetch orders.");
//         }
//       } catch (error) {
//         setError("Error loading orders.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//     const interval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds
//     return () => clearInterval(interval);
//   }, []);

//   // Function to cancel an order
//   const cancelOrder = async (orderId) => {
//     try {
//       const response = await fetch(`http://127.0.0.1:8000/api/cancel-order/${orderId}/`, {
//         method: "POST",
//       });

//       if (response.ok) {
//         setOrders((prevOrders) =>
//           prevOrders.map((order) =>
//             order.id === orderId ? { ...order, status: "canceled" } : order
//           )
//         );
//       } else {
//         console.error("Failed to cancel order.");
//       }
//     } catch (error) {
//       console.error("Error canceling order:", error);
//     }
//   };

//   return (
//     <div className="bg-black text-white p-6 min-h-screen">
//       <h1 className="text-2xl font-bold mb-4">Orders</h1>

//       {loading ? (
//         <p>Loading orders...</p>
//       ) : error ? (
//         <p className="text-red-400">{error}</p>
//       ) : orders.length === 0 ? (
//         <p>No orders placed.</p>
//       ) : (
//         <div className="space-y-6">
//           {/* 🔹 Orders Table */}
//           <div className="p-4 bg-gray-900 rounded-lg">
//             <h2 className="text-lg font-semibold">Order History</h2>
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-gray-700 text-left">
//                   <th className="py-2">Stock</th>
//                   <th>Type</th>
//                   <th>Order Type</th>
//                   <th>Qty</th>
//                   <th>Price</th>
//                   <th>Status</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.map((order, index) => (
//                   <tr key={index} className="border-b border-gray-800">
//                     <td className="py-2 font-bold">{order.ticker}</td>
//                     <td className={order.tradeType === "buy" ? "text-green-400" : "text-red-400"}>
//                       {order.tradeType.toUpperCase()}
//                     </td>
//                     <td>{order.orderType}</td>
//                     <td>{order.quantity}</td>
//                     <td>₹{order.price.toFixed(2)}</td>
//                     <td
//                       className={
//                         order.status === "executed"
//                           ? "text-green-400"
//                           : order.status === "canceled"
//                           ? "text-red-400"
//                           : "text-yellow-400"
//                       }
//                     >
//                       {order.status}
//                     </td>
//                     <td>
//                       {order.status === "pending" && (
//                         <button
//                           className="bg-red-500 px-3 py-1 text-xs rounded hover:bg-red-600"
//                           onClick={() => cancelOrder(order.id)}
//                         >
//                           Cancel
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* 🔹 Order Statistics */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="p-4 bg-gray-900 rounded-lg">
//               <h2 className="text-lg font-semibold">Total Executed Orders</h2>
//               <p className="text-2xl font-bold text-green-400">
//                 {orders.filter((order) => order.status === "executed").length}
//               </p>
//             </div>
//             <div className="p-4 bg-gray-900 rounded-lg">
//               <h2 className="text-lg font-semibold">Pending Orders</h2>
//               <p className="text-2xl font-bold text-yellow-400">
//                 {orders.filter((order) => order.status === "pending").length}
//               </p>
//             </div>
//             <div className="p-4 bg-gray-900 rounded-lg">
//               <h2 className="text-lg font-semibold">Canceled Orders</h2>
//               <p className="text-2xl font-bold text-red-400">
//                 {orders.filter((order) => order.status === "canceled").length}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ✅ Force client-side rendering
// const Orders = dynamic(() => Promise.resolve(OrdersContent), { ssr: false });

// export default Orders;









// "use client";

// import React, { useEffect, useState } from "react";
// import dynamic from "next/dynamic";

// const OrdersContent = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // ✅ Fetch order history dynamically
//     const fetchOrders = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/api/orders/");
//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.error || "Failed to fetch orders.");
//         }

//         setOrders(data.orders || []);
//         setError(null);
//       } catch (error) {
//         setError("Error loading orders.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//     const interval = setInterval(fetchOrders, 5000); // Refresh every 5 sec
//     return () => clearInterval(interval);
//   }, []);

//   // ✅ Cancel an order dynamically
//   const cancelOrder = async (orderId) => {
//     try {
//       const response = await fetch(`http://127.0.0.1:8000/api/cancel-order/${orderId}/`, {
//         method: "POST",
//       });

//       if (response.ok) {
//         setOrders((prevOrders) =>
//           prevOrders.map((order) =>
//             order.id === orderId ? { ...order, status: "Canceled" } : order
//           )
//         );
//       } else {
//         console.error("Failed to cancel order.");
//       }
//     } catch (error) {
//       console.error("Error canceling order:", error);
//     }
//   };

//   return (
//     <div className="bg-black text-white p-6 min-h-screen">
//       <h1 className="text-2xl font-bold mb-4">Orders</h1>

//       {error && <p className="text-red-400">{error}</p>}

//       {loading ? (
//         <p>Loading orders...</p>
//       ) : orders.length === 0 ? (
//         <p>No orders placed.</p>
//       ) : (
//         <div className="space-y-6">
//           {/* 🔹 Orders Table */}
//           <div className="p-4 bg-gray-900 rounded-lg">
//             <h2 className="text-lg font-semibold">Order History</h2>
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-gray-700 text-left">
//                   <th className="py-2">Stock</th>
//                   <th>Type</th>
//                   <th>Order Type</th>
//                   <th>Qty</th>
//                   <th>Price</th>
//                   <th>Status</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.map((order, index) => (
//                   <tr key={index} className="border-b border-gray-800">
//                     <td className="py-2 font-bold">{order.ticker}</td>
//                     <td className={order.tradeType === "buy" ? "text-green-400" : "text-red-400"}>
//                       {order.tradeType.toUpperCase()}
//                     </td>
//                     <td>{order.orderType}</td>
//                     <td>{order.quantity}</td>
//                     <td>₹{order.price.toFixed(2)}</td>
//                     <td
//                       className={
//                         order.status === "Executed"
//                           ? "text-green-400"
//                           : order.status === "Canceled"
//                           ? "text-red-400"
//                           : "text-yellow-400"
//                       }
//                     >
//                       {order.status}
//                     </td>
//                     <td>
//                       {order.status === "Pending" && (
//                         <button
//                           className="bg-red-500 px-3 py-1 text-xs rounded hover:bg-red-600"
//                           onClick={() => cancelOrder(order.id)}
//                         >
//                           Cancel
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* 🔹 Order Statistics */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="p-4 bg-gray-900 rounded-lg">
//               <h2 className="text-lg font-semibold">Total Executed Orders</h2>
//               <p className="text-2xl font-bold text-green-400">
//                 {orders.filter((order) => order.status === "Executed").length}
//               </p>
//             </div>
//             <div className="p-4 bg-gray-900 rounded-lg">
//               <h2 className="text-lg font-semibold">Pending Orders</h2>
//               <p className="text-2xl font-bold text-yellow-400">
//                 {orders.filter((order) => order.status === "Pending").length}
//               </p>
//             </div>
//             <div className="p-4 bg-gray-900 rounded-lg">
//               <h2 className="text-lg font-semibold">Canceled Orders</h2>
//               <p className="text-2xl font-bold text-red-400">
//                 {orders.filter((order) => order.status === "Canceled").length}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ✅ Force client-side rendering
// const Orders = dynamic(() => Promise.resolve(OrdersContent), { ssr: false });

// export default Orders;

"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/Loaders/loader2"; // ✅ Updated Loader Component

const OrdersContent = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ✅ Fetch order history dynamically
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/orders/");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch orders.");
        }

        setOrders(data.orders || []);
        setError(null);
      } catch (error) {
        setError("⚠️ Error loading orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  // ✅ Cancel an order dynamically
  const cancelOrder = async (orderId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/cancel-order/${orderId}/`, {
        method: "POST",
      });

      if (response.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: "Canceled" } : order
          )
        );
      } else {
        console.error("⚠️ Failed to cancel order.");
      }
    } catch (error) {
      console.error("❌ Error canceling order:", error);
    }
  };

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">📜 Orders Overview</h1>

      {error && <p className="text-red-400">{error}</p>}

      {loading ? (
        <Loader />
      ) : orders.length === 0 ? (
        <p>No orders placed.</p>
      ) : (
        <div className="space-y-6">
          {/* 🔹 Orders Table */}
          <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold">📊 Order History</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-left">
                  <th className="py-2">📌 Stock</th>
                  <th>📈 Type</th>
                  <th>📋 Order Type</th>
                  <th>🔢 Qty</th>
                  <th>💲 Price</th>
                  <th>🔄 Status</th>
                  <th>🛠 Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="py-2 font-bold">{order.ticker}</td>
                    <td className={order.tradeType === "buy" ? "text-green-400" : "text-red-400"}>
                      {order.tradeType.toUpperCase()}
                    </td>
                    <td>{order.orderType}</td>
                    <td>{order.quantity}</td>
                    <td>₹{order.price.toFixed(2)}</td>
                    <td
                      className={
                        order.status === "Executed"
                          ? "text-green-400"
                          : order.status === "Canceled"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }
                    >
                      {order.status}
                    </td>
                    <td>
                      {order.status === "Pending" && (
                        <button
                          className="bg-red-500 px-3 py-1 text-xs rounded hover:bg-red-600"
                          onClick={() => cancelOrder(order.id)}
                        >
                          ❌ Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🔹 Order Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">✅ Total Executed Orders</h2>
              <p className="text-2xl font-bold text-green-400">
                {orders.filter((order) => order.status === "Executed").length}
              </p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">⏳ Pending Orders</h2>
              <p className="text-2xl font-bold text-yellow-400">
                {orders.filter((order) => order.status === "Pending").length}
              </p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">❌ Canceled Orders</h2>
              <p className="text-2xl font-bold text-red-400">
                {orders.filter((order) => order.status === "Canceled").length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Force client-side rendering
const Orders = dynamic(() => Promise.resolve(OrdersContent), { ssr: false });

export default Orders;