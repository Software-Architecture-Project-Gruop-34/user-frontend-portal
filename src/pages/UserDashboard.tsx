import React from 'react';

const UserDashboard: React.FC = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-4xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center">User Dashboard</h1>
        <p className="text-center">Welcome, User!</p>
        {/* Add user-specific components and features here */}
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 mt-4 font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Logout
      </button>
    </div>
  );
};

export default UserDashboard;
