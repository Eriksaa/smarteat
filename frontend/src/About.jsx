import React from 'react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">About EatSmart</h1>
      
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <p className="text-lg text-center text-gray-700 mb-6 leading-relaxed">
          EatSmart is an AI-powered nutrition assistant built on the Internet Computer Protocol,
          providing personalized recipe recommendations and nutritional insights while keeping 
          your data secure and private.
        </p>
        
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Our Mission</h2>
          <p className="text-lg text-center text-gray-700 mb-6 leading-relaxed">
            We believe that healthy eating should be accessible to everyone. Our mission is to leverage
            the power of decentralized AI to help people make informed decisions about their nutrition
            without compromising on taste or convenience.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-6 transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
          <p className="text-gray-600">Your data stays encrypted and secure on the blockchain</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          <h3 className="text-xl font-semibold mb-2">Smart Recommendations</h3>
          <p className="text-gray-600">AI-powered recipes tailored to your preferences</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          <h3 className="text-xl font-semibold mb-2">Decentralized AI</h3>
          <p className="text-gray-600">Built on the Internet Computer Protocol</p>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Ready to transform your eating habits?</h2>
        <p className="text-lg text-gray-700 mb-6">
          Join EatSmart today and discover a world of personalized nutrition.
        </p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default About; 