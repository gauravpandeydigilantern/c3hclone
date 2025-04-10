import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
// import "../styles/globals.css";
import "../../../app/globals.css";
import { Metadata } from "next"; 


export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin panel for job portal",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-row">
      <Sidebar />
      <div className="flex flex-col w-full">
        <Header />
        <main className="flex-grow p-5 bg-gray-100 main-content">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
