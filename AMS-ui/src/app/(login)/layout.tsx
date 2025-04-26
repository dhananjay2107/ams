import React from 'react'
import "../globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "Login - AMS",
  description: "Login Page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <div>
          {children}
        </div>
        <ToastContainer />
      </body>
    </html>

  );
}