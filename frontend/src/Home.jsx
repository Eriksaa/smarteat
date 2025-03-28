import React, { useRef, useState, useEffect } from 'react';

const Home = ({ onPageChange, isAuthenticated }) => {
  const featuresRef = useRef(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  
  // Animation states
  const [scrollY, setScrollY] = useState(0);
  const [animatedElements, setAnimatedElements] = useState({
    hero: false,
    features: false,
    mobileApp: false,
    footer: false
  });
  
  // Handle scroll for parallax and animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Check for elements in viewport with a higher threshold for more deliberate animations
      const hero = document.getElementById('hero-section');
      const features = document.getElementById('features-section');
      const mobileApp = document.getElementById('mobile-app');
      const footer = document.querySelector('footer');
      
      if (hero && isInViewport(hero, 0.2) && !animatedElements.hero) {
        setAnimatedElements(prev => ({ ...prev, hero: true }));
      }
      
      if (features && isInViewport(features, 0.2) && !animatedElements.features) {
        setAnimatedElements(prev => ({ ...prev, features: true }));
      }
      
      if (mobileApp && isInViewport(mobileApp, 0.2) && !animatedElements.mobileApp) {
        setAnimatedElements(prev => ({ ...prev, mobileApp: true }));
      }
      
      if (footer && isInViewport(footer, 0.2) && !animatedElements.footer) {
        setAnimatedElements(prev => ({ ...prev, footer: true }));
      }
    };
    
    // Updated viewport checker with adjustable threshold
    const isInViewport = (element, threshold = 0.2) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * (1 - threshold) &&
        rect.bottom >= 0
      );
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial render
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [animatedElements]);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavigation = (targetPage) => {
    if (!isAuthenticated && (targetPage === 'recipes' || targetPage === 'food-analysis')) {
      onPageChange('signup');
    } else {
      onPageChange(targetPage);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError(null);
  };

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    
    // Simple email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Store email in localStorage (in a real app, you'd send this to your backend)
    try {
      // Get existing waitlist emails or initialize empty array
      const existingEmails = JSON.parse(localStorage.getItem('waitlistEmails') || '[]');
      
      // Check if email already exists
      if (!existingEmails.includes(email)) {
        existingEmails.push(email);
        localStorage.setItem('waitlistEmails', JSON.stringify(existingEmails));
      }
      
      setSubmitted(true);
      setEmail('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error saving to waitlist:', error);
      setError('Could not join waitlist. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Parallax Background with slower movement */}
      <div 
        className="fixed inset-0 bg-gradient-to-b from-blue-50 to-white opacity-70 z-0"
        style={{ transform: `translateY(${scrollY * 0.25}px)` }}
      />
      
      {/* Hero Section with slower animations */}
      <section 
        id="hero-section"
        className="relative min-h-screen w-full flex items-center justify-center text-center px-4 z-10"
      >
        <div className={`transition-all duration-2000 ease-out ${animatedElements.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
          <h1 className="mb-8">
            <span className="block text-6xl font-bold text-blue-600 mb-2">Smart Eating.</span>
            <span className="block text-6xl font-bold text-gray-900">Smart Living.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your AI-powered companion for personalized recipe recommendations and nutritional insights
          </p>
          <div className="space-x-4">
            {isAuthenticated ? (
              <div className="space-x-4">
                <button
                  onClick={() => onPageChange('recipes')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  View Recipes
                </button>
                <button
                  onClick={() => onPageChange('food-analysis')}
                  className="bg-white text-gray-600 border-2 border-gray-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Analyze Food
                </button>
              </div>
            ) : (
              <button
                onClick={() => onPageChange('login')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button
            onClick={() => scrollToSection(featuresRef)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
        
        {/* Floating elements for parallax effect - slower, more subtle movement */}
        <div 
          className="absolute right-10 top-1/4 w-24 h-24 rounded-full bg-blue-200 opacity-20 z-0"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        ></div>
        <div 
          className="absolute left-10 bottom-1/4 w-32 h-32 rounded-full bg-green-200 opacity-30 z-0"
          style={{ transform: `translateY(${-scrollY * 0.1}px)` }}
        ></div>
      </section>

      {/* Features Section with slower animations */}
      <section
        id="features-section"
        ref={featuresRef}
        className="relative py-20 w-full bg-white z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1500 ease-out ${animatedElements.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
            <span className="text-sm text-blue-600 font-semibold tracking-wide uppercase">Features</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Powered by blockchain & decentralized AI</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              EatSmart leverages cutting-edge technology to provide secure, private, and accurate services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>,
                title: "Decentralized AI",
                description: "Our AI models run on the Internet Computer Protocol, ensuring your data stays private and secure while providing accurate recommendations.",
                action: () => handleNavigation('recipes'),
                actionText: "Try Recipes →"
              },
              {
                icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>,
                title: "Photo Analysis",
                description: "Instantly analyze the nutritional content of your food with just a photo, powered by our advanced AI image recognition.",
                action: () => handleNavigation('food-analysis'),
                actionText: "Try Food Analysis →"
              },
              {
                icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>,
                title: "Blockchain Security",
                description: "All data and transactions are secured by blockchain technology, giving you complete control over your information.",
                action: null,
                actionText: null
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition duration-1000 ease-out transform ${
                  animatedElements.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                }`}
                style={{ transitionDelay: `${index * 300}ms` }}
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-center">
                  {feature.description}
                </p>
                {feature.action && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={feature.action}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {feature.actionText}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Why Choose EatSmartly Section */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Why choose EatSmartly?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                "Privacy-first approach with blockchain technology",
                "Personalized recipe recommendations",
                "Accurate nutrition analysis",
                "Sustainable and energy-efficient AI processing"
              ].map((item, index) => (
                <div 
                  key={index} 
                  className={`flex items-start transition-all duration-500 ${animatedElements.features ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                  style={{ transitionDelay: `${300 + index * 150}ms` }}
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600">✓</div>
                  </div>
                  <div className="ml-4">
                    <p className="text-lg text-gray-700">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile App Section with Waitlist */}
          <section 
            id="mobile-app" 
            className={`py-16 bg-blue-50 rounded-lg my-20 transition-all duration-700 ${animatedElements.mobileApp ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          >
            <div className="max-w-4xl mx-auto text-center px-4">
              <h2 className="text-3xl font-bold text-center mb-2">COMING SOON</h2>
              <h3 className="text-4xl font-bold text-primary-800 mb-4">EatSmart Mobile App</h3>
              <p className="text-xl text-gray-700 mb-8">
                Take EatSmart with you everywhere. Our mobile app will be available soon for iOS and Android.
              </p>
              
              {/* Waitlist Form */}
              <div className="max-w-md mx-auto">
                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Your email address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Join Waitlist
                  </button>
                </form>
                
                {/* Success Message */}
                {submitted && (
                  <div className="mt-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md">
                    Thank you! You've been added to our waitlist.
                  </div>
                )}
                
                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default Home;
