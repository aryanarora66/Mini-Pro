import React from "react";
import "./globals.css"; // ✅ Correct path

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// app/layout.tsx (Add this for ISR)
export const dynamic = 'force-static';


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Add any head elements here */}
      </head>
      <body>
        <Navbar />
        <main className="container">{children}</main>
        <Footer />
      </body>
    </html>
  );
}