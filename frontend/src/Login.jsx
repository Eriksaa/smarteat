import React from 'react';

const Login = ({ onPageChange }) => {
  const handleGithubLogin = async () => {
    try {
      // Get the current canister ID from the window location
      const currentUrl = window.location.href;
      const baseUrl = currentUrl.split('?')[0];
      
      // GitHub OAuth configuration
      const githubConfig = {
        identityProvider: 'https://github.com/login/oauth/authorize',
        clientId: 'Ov23liAFWdSIbhKttKd6', // Your GitHub Client ID
        redirectUri: baseUrl,
        scope: 'user:email',
        state: Math.random().toString(36).substring(7),
      };

      // Store the state for verification
      window.localStorage.setItem('githubOAuthState', githubConfig.state);

      // Redirect to GitHub OAuth
      const authUrl = `${githubConfig.identityProvider}?client_id=${githubConfig.clientId}&redirect_uri=${encodeURIComponent(githubConfig.redirectUri)}&scope=${githubConfig.scope}&state=${githubConfig.state}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('GitHub login failed:', error);
    }
  };

  const handleInternetIdentityLogin = async () => {
    try {
      const canisterId = window.location.host.split('.')[0];
      const iiUrl = `https://identity.ic0.app/#authorize?canisterId=${canisterId}&successUrl=${encodeURIComponent(window.location.href)}`;
      window.location.href = iiUrl;
    } catch (error) {
      console.error('Internet Identity login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <span className="text-4xl font-bold">
              <span className="text-gray-900">Eat</span>
              <span className="text-blue-600">Smart</span>
            </span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose your preferred authentication method
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          {/* GitHub Login Button */}
          <button
            onClick={handleGithubLogin}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </span>
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or</span>
            </div>
          </div>

          {/* Internet Identity Button */}
          <button
            onClick={handleInternetIdentityLogin}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            Continue with Internet Identity
          </button>
        </div>

        <div className="mt-4">
          <p className="text-center text-sm text-gray-600">
            Choose Internet Identity for enhanced security on the Internet Computer
          </p>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => onPageChange('home')}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 