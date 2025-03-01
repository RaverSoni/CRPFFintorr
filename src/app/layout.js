import "./globals.css";
import Navbar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";

export const metadata = {
  title: "FinTorr",
  description: "Your Finance Mentor",
};

export default function RootLayout({ children }) {
  return (
<html lang="en">
  <head>
    <link
      href="https://fonts.googleapis.com/css2?family=Outfit:wght@100;300;400;500;600;700;800;900&display=swap"
      rel="stylesheet"
    />
  </head>
  <body className="font-outfit m-0 antialiased">
    <div className="flex flex-col h-screen">
      <div className="bg-black sticky top-0 z-[1000]">
        <Navbar />
      </div>
      <div className="flex flex-row">
        <div>
          <Sidebar />
        </div> 
        <div className="flex-1 p-5">
          {children}
        </div>
      </div>
    </div>
  </body>
</html>

  );
}
