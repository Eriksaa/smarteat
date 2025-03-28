import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Home from "./Home";
import About from "./About";
import Profile from "./Profile";
import FoodAnalysis from "./FoodAnalysis";
import RecipeRecommendations from "./RecipeRecommendations";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loginError, setLoginError] = useState(null);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Clear any login errors when navigating away from login page
    if (page !== 'login') {
      setLoginError(null);
    }
  };

  const handleLogin = (method) => {
    if (method === 'github') {
      try {
        // GitHub OAuth URL - this will redirect to GitHub's login page
        const clientId = 'Ov23liAFWdSIbhKttKd6'; // Your GitHub OAuth client ID
        const redirectUri = encodeURIComponent(window.location.origin);
        const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
        
        // Store that we're attempting GitHub login in localStorage
        localStorage.setItem('auth_pending', 'github');
        
        // Redirect to GitHub login
        window.location.href = githubUrl;
      } catch (error) {
        setLoginError("GitHub authentication failed. Please try again.");
      }
    } else if (method === 'internetIdentity') {
      try {
        // Internet Identity URL
        const canisterId = window.location.host.split('.')[0]; // Extract canister ID from URL
        const redirectUri = encodeURIComponent(window.location.origin);
        const iiUrl = `https://identity.ic0.app/#authorize?canisterId=${canisterId}&redirectUri=${redirectUri}`;
        
        // Store that we're attempting II login in localStorage
        localStorage.setItem('auth_pending', 'ii');
        
        // Redirect to Internet Identity
        window.location.href = iiUrl;
      } catch (error) {
        setLoginError("Internet Identity authentication failed. Please try again.");
      }
    }
  };

  // Add this function to check for auth redirects
  const checkAuthRedirect = () => {
    // Check URL parameters for auth code from GitHub
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const pendingAuth = localStorage.getItem('auth_pending');
    
    if (code && pendingAuth === 'github') {
      // GitHub auth successful, we have a code
      localStorage.removeItem('auth_pending');
      
      // In a real app, exchange this code for an access token on your backend
      // For now, simulate successful login
      setIsAuthenticated(true);
      const storedProfile = {
        name: "GitHub User",
        email: "user@example.com",
        provider: "github",
        preferences: {
          dietaryRestrictions: [],
          favoriteCuisines: [],
          allergies: []
        }
      };
      setUserProfile(storedProfile);
      localStorage.setItem('userProfile', JSON.stringify(storedProfile));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('delegation') && pendingAuth === 'ii') {
      // Internet Identity auth successful
      localStorage.removeItem('auth_pending');
      
      setIsAuthenticated(true);
      const storedProfile = {
        name: "IC User " + Math.floor(Math.random() * 1000),
        email: `user${Math.floor(Math.random() * 1000)}@ic.org`,
        provider: "Internet Identity",
        preferences: {
          dietaryRestrictions: [],
          favoriteCuisines: [],
          allergies: []
        }
      };
      setUserProfile(storedProfile);
      localStorage.setItem('userProfile', JSON.stringify(storedProfile));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  // Add useEffect to check for auth redirects on page load/URL changes
  useEffect(() => {
    // Check if user is already authenticated
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedProfile = localStorage.getItem('userProfile');
    
    if (storedAuth === 'true' && storedProfile) {
      setIsAuthenticated(true);
      setUserProfile(JSON.parse(storedProfile));
    } else {
      // Check for auth redirects
      checkAuthRedirect();
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    setCurrentPage("home");
  };

  // Footer component to reuse
  const Footer = () => (
    <footer className="bg-white py-8 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold">Eat</span>
            <span className="text-sm text-blue-600 font-semibold">Smart</span>
          </div>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            A blockchain-based platform with decentralized AI for personalized recipe recommendations and food nutrition analysis on the Internet Computer Protocol.
          </p>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          <div className="text-sm text-gray-500">
            © 2025 EatSmart. All rights reserved.
            <span className="mx-2 text-blue-600">•</span>
            <span>Powered by Internet Computer Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );

  // Make sure there's only ONE place where the Home component is rendered
  const renderContent = () => {
    switch (currentPage) {
      case "about":
        return <About />;
      case "login":
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-center mb-6">
                <span className="text-gray-900">Eat</span>
                <span className="text-blue-600">Smart</span> Login
              </h2>
              
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {loginError}
                </div>
              )}
              
              <div className="space-y-6">
                <div className="text-center text-sm text-gray-600 mb-4">
                  Choose your preferred authentication method to continue
                </div>
                
                <button 
                  onClick={() => handleLogin('github')} 
                  className="w-full bg-gray-800 text-white py-3 px-4 rounded-md hover:bg-gray-900 transition-colors flex items-center justify-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  Continue with GitHub
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleLogin('internetIdentity')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Continue with Internet Identity
                </button>
                
                <div className="text-center mt-6">
                  <button
                    onClick={() => handlePageChange('home')}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    ← Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case "profile":
        return isAuthenticated ? (
          <Profile 
            userProfile={userProfile} 
            setUserProfile={setUserProfile} 
          />
        ) : (
          <div className="text-center mt-10 p-4 bg-white rounded-lg shadow">
            Please log in to view your profile
          </div>
        );
      case "food-analysis":
        return isAuthenticated ? (
          <FoodAnalysis />
        ) : (
          <div className="text-center mt-10 p-4 bg-white rounded-lg shadow">
            Please log in to analyze food
          </div>
        );
      case "recipes":
        return isAuthenticated ? (
          <RecipeRecommendations userProfile={userProfile} />
        ) : (
          <div className="text-center mt-10 p-4 bg-white rounded-lg shadow">
            Please log in to see recipe recommendations
          </div>
        );
      case "home":
      default:
        // This should be the ONLY place Home is rendered
        return <Home onPageChange={handlePageChange} isAuthenticated={isAuthenticated} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 overflow-x-hidden">
      {/* Navbar */}
      <nav className="w-full bg-white shadow-sm z-10 fixed top-0 left-0 right-0">
        <Navbar 
          isAuthenticated={isAuthenticated}
          userProfile={userProfile}
          onPageChange={handlePageChange}
          onLogin={() => handlePageChange('login')}
          onLogout={handleLogout}
        />
      </nav>
      
      {/* Make sure there's only ONE main content section */}
      <main className="w-full overflow-x-hidden">
        <div className="w-full px-4 py-8 mt-16">
          {renderContent()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App; 