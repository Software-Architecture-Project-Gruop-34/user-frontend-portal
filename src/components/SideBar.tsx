import React from 'react';
import { Link } from 'react-router-dom';

const SideBar: React.FC = () => {
  const rawRole = localStorage.getItem('userRole') || '';
  const role = rawRole.toUpperCase();
  const isAdmin = role === 'ADMIN';

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <aside className="hidden md:block md:w-64 bg-white border-r border-gray-200">
      <div className="h-full px-4 py-6 overflow-y-auto">
        <div className="mb-6">
          <div className="text-sm font-semibold text-gray-700">Navigation</div>
          <div className="mt-2 text-xs text-gray-500">Role: <span className="font-medium text-gray-700">{role || 'GUEST'}</span></div>
        </div>

        <nav className="space-y-1">
          <Link to="/dashboard" className="flex items-center px-3 py-2 text-gray-700 rounded hover:bg-gray-100">
            <span className="ml-2">Dashboard</span>
          </Link>

          <Link to="/stalls" className="flex items-center px-3 py-2 text-gray-700 rounded hover:bg-gray-100">
            <span className="ml-2">Stalls</span>
          </Link>

          <Link to="/reservations" className="flex items-center px-3 py-2 text-gray-700 rounded hover:bg-gray-100">
            <span className="ml-2">Reservations</span>
          </Link>

          {isAdmin && (
            <>
              <Link to="/users" className="flex items-center px-3 py-2 text-gray-700 rounded hover:bg-gray-100">
                <span className="ml-2">Users</span>
              </Link>

              <Link to="/reports" className="flex items-center px-3 py-2 text-gray-700 rounded hover:bg-gray-100">
                <span className="ml-2">Reports</span>
              </Link>
            </>
          )}

          <Link to="/settings" className="flex items-center px-3 py-2 text-gray-700 rounded hover:bg-gray-100">
            <span className="ml-2">Settings</span>
          </Link>

          <button type="button" onClick={handleLogout} className="w-full text-left flex items-center px-3 py-2 text-red-600 rounded hover:bg-red-50">
            <span className="ml-2">Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default SideBar;