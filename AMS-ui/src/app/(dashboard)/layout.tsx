import Header from "@/components/Header/Header";
import "../globals.css";
import Sidebar from "@/components/Sidebar/Sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
    title: "AMS",
    description: "Attendance Management System",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang="en">
            <body className="">
                <Header />
                <Sidebar />
                <main className="md:ml-52 p-4 mt-16 h-full">
                    {children}
                </main>
                <ToastContainer />
            </body>
        </html>
    );
}
