import React from 'react';
import { Link } from 'react-router-dom';

const NavBar: React.FC = () => {

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };


  return (
    <nav className="bg-blue-600 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-lg font-semibold hover:opacity-90">
              Bookfair stall reservation system
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-6">
            
            <Link to="/dashboard" className="hover:bg-blue-500 px-3 py-2 rounded">Dashboard</Link>
            <Link to="/profile" className="hover:bg-blue-500 px-3 py-2 rounded">Profile</Link>
            <Link to="/settings" className="hover:bg-blue-500 px-3 py-2 rounded">Settings</Link>
            <button type="button" onClick={handleLogout} className="hover:bg-blue-500 px-3 py-2 rounded">
            <span className="ml-2">Logout</span>
          </button>
          </div>

          
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
