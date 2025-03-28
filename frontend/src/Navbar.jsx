import React, { useState } from 'react';

const Navbar = ({ isAuthenticated, userProfile, onPageChange, onLogin, onLogout }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  
  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => onPageChange('home')}
              className="text-xl font-bold"
            >
              <span className="text-gray-900">Eat</span>
              <span className="text-blue-600">Smart</span>
            </button>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                onClick={() => onPageChange('home')}
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </button>
              <button
                onClick={() => onPageChange('about')}
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                About
              </button>
              
              {/* Show these links only when authenticated */}
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => onPageChange('recipes')}
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Recipes
                  </button>
                  <button
                    onClick={() => onPageChange('food-analysis')}
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Food Analysis
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="flex items-center text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium mr-2"
                >
                  <span className="mr-1">{userProfile?.name || 'Profile'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={profileOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                  </svg>
                </button>
                
                {/* Profile dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={() => onPageChange('profile')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={onLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onPageChange('login')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 