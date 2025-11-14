import React from "react";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* navbar */}
      <header className="h-16 flex-none">
        <NavBar />
      </header>

      {/* body */}
      <div className="flex flex-1 overflow-hidden">
        <SideBar />

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
