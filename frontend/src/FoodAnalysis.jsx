import React, { useState, useRef, useEffect } from 'react';

const FoodAnalysis = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  // Animation states
  const [visibleSections, setVisibleSections] = useState({
    intro: false,
    howItWorks: false,
    upload: false,
    results: false
  });
  
  // References for observer
  const introRef = useRef(null);
  const howItWorksRef = useRef(null);
  const uploadRef = useRef(null);
  const resultsRef = useRef(null);
  
  // Set up intersection observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.15
    };
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          setVisibleSections(prev => ({
            ...prev,
            [id]: true
          }));
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    if (introRef.current) observer.observe(introRef.current);
    if (howItWorksRef.current) observer.observe(howItWorksRef.current);
    if (uploadRef.current) observer.observe(uploadRef.current);
    if (resultsRef.current) observer.observe(resultsRef.current);
    
    return () => observer.disconnect();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Reset states
    setErrorMessage('');
    setResults(null);
    
    // Check file type
    if (!file.type.match('image.*')) {
      setErrorMessage('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Please select an image smaller than 5MB');
      return;
    }
    
    setSelectedImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle image upload button click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle image analysis
  const analyzeImage = () => {
    if (!selectedImage) {
      setErrorMessage('Please select an image to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    
    // In a real app, you would upload the image to your backend here
    // For now, we'll simulate an API call with sample data
    setTimeout(() => {
      const sampleResults = {
        foodName: "Grilled Salmon with Vegetables",
        confidence: 94,
        nutritionalInfo: {
          calories: 320,
          protein: 28,
          carbs: 12,
          fat: 18,
          fiber: 4,
          sugar: 3
        },
        ingredients: [
          { name: "Salmon", confidence: 98 },
          { name: "Asparagus", confidence: 95 },
          { name: "Cherry Tomatoes", confidence: 90 },
          { name: "Olive Oil", confidence: 75 }
        ],
        healthMetrics: {
          overallScore: 88,
          proteinQuality: "High",
          fatProfile: "Good (Omega-3 rich)",
          glycemicLoad: "Low",
          micronutrients: "High in Vitamins A, D, and potassium"
        }
      };
      
      setResults(sampleResults);
      setIsAnalyzing(false);
    }, 2000); // Simulate 2 second API delay
  };
  
  // Handle retaking the photo
  const handleRetake = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResults(null);
  };
  
  return (
    <div className="w-full min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div 
          id="intro"
          ref={introRef}
          className={`transition-all duration-1500 ease-out transform ${
            visibleSections.intro ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
          }`}
        >
          <h1 className="text-4xl font-bold mb-4">Food Analysis</h1>
          <p className="text-xl text-gray-600 mb-8">
            Analyze your food photos for detailed nutritional insights.
          </p>
        </div>
        
        {/* HOW IT WORKS Section */}
        <div 
          id="howItWorks"
          ref={howItWorksRef}
          className={`mt-8 bg-blue-50 rounded-lg p-8 mb-8 transition-all duration-1500 ease-out transform ${
            visibleSections.howItWorks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
          }`}
        >
          <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`text-center transition-all duration-1200 transform ${
              visibleSections.howItWorks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`} style={{ transitionDelay: '200ms', transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)' }}>
              <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-100 text-blue-600 mx-auto mb-4">
                <span className="font-bold text-xl">1</span>
              </div>
              <h3 className="font-medium text-lg mb-2">Upload Photo</h3>
              <p className="text-gray-600">Take a photo of your meal or upload an existing image</p>
            </div>
            <div className={`text-center transition-all duration-1200 transform ${
              visibleSections.howItWorks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`} style={{ transitionDelay: '500ms', transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)' }}>
              <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-100 text-blue-600 mx-auto mb-4">
                <span className="font-bold text-xl">2</span>
              </div>
              <h3 className="font-medium text-lg mb-2">AI Analysis</h3>
              <p className="text-gray-600">Our AI analyzes the image to identify foods and ingredients</p>
            </div>
            <div className={`text-center transition-all duration-1200 transform ${
              visibleSections.howItWorks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`} style={{ transitionDelay: '800ms', transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)' }}>
              <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-100 text-blue-600 mx-auto mb-4">
                <span className="font-bold text-xl">3</span>
              </div>
              <h3 className="font-medium text-lg mb-2">Get Insights</h3>
              <p className="text-gray-600">Receive detailed nutritional information and health assessment</p>
            </div>
          </div>
        </div>
        
        <div 
          id="upload"
          ref={uploadRef}
          className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-1500 ease-out transform ${
            visibleSections.upload ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
          }`}
        >
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image Upload Section */}
              <div className="flex flex-col items-center">
                <div 
                  className={`border-2 border-dashed rounded-lg w-full ${selectedImage ? 'border-gray-300' : 'border-blue-400'} h-64 flex flex-col items-center justify-center overflow-hidden relative`}
                >
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Food preview" 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <>
                      <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600 text-center">
                        Drag & drop your image here, or
                        <button 
                          type="button" 
                          onClick={handleUploadClick}
                          className="text-blue-600 hover:text-blue-800 ml-1"
                        >
                          browse
                        </button>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG (max 5MB)</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
                </div>
                
                {errorMessage && (
                  <div className="mt-4 text-red-600 text-sm">
                    {errorMessage}
                  </div>
                )}
                
                <div className="mt-6 flex space-x-4">
                  {selectedImage ? (
                    <>
                      <button 
                        onClick={handleRetake}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                      >
                        Retake
                      </button>
                      <button 
                        onClick={analyzeImage}
                        disabled={isAnalyzing}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md ${isAnalyzing ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                      >
                        {isAnalyzing ? (
                          <>
                            <span className="inline-block animate-spin h-4 w-4 border-t-2 border-white rounded-full mr-2"></span>
                            Analyzing...
                          </>
                        ) : 'Analyze Food'}
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={handleUploadClick}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Upload Image
                    </button>
                  )}
                </div>
              </div>
              
              {/* Analysis Results Section */}
              <div 
                id="results"
                ref={resultsRef}
                className={`bg-gray-50 rounded-lg p-6 flex flex-col ${!results && 'justify-center items-center'} transition-all duration-1500 ease-out ${
                  visibleSections.results && results ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                {results ? (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">{results.foodName}</h2>
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Confidence:</span>
                        <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${results.confidence}%`}}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">{results.confidence}%</span>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Nutritional Information</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <div className="font-bold text-lg">{results.nutritionalInfo.calories}</div>
                          <div className="text-xs text-gray-500">Calories</div>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <div className="font-bold text-lg">{results.nutritionalInfo.protein}g</div>
                          <div className="text-xs text-gray-500">Protein</div>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <div className="font-bold text-lg">{results.nutritionalInfo.carbs}g</div>
                          <div className="text-xs text-gray-500">Carbs</div>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <div className="font-bold text-lg">{results.nutritionalInfo.fat}g</div>
                          <div className="text-xs text-gray-500">Fat</div>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <div className="font-bold text-lg">{results.nutritionalInfo.fiber}g</div>
                          <div className="text-xs text-gray-500">Fiber</div>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <div className="font-bold text-lg">{results.nutritionalInfo.sugar}g</div>
                          <div className="text-xs text-gray-500">Sugar</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Detected Ingredients</h3>
                      <div className="space-y-2">
                        {results.ingredients.map((ingredient, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span>{ingredient.name}</span>
                            <span className="text-sm text-gray-500">{ingredient.confidence}% match</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Health Assessment</h3>
                      <div className="bg-white p-4 rounded-md shadow-sm">
                        <div className="mb-2">
                          <span className="text-sm font-medium">Overall Health Score: </span>
                          <span className={`font-semibold ${results.healthMetrics.overallScore > 70 ? 'text-green-600' : results.healthMetrics.overallScore > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {results.healthMetrics.overallScore}/100
                          </span>
                        </div>
                        <ul className="text-sm space-y-1">
                          <li><span className="font-medium">Protein Quality:</span> {results.healthMetrics.proteinQuality}</li>
                          <li><span className="font-medium">Fat Profile:</span> {results.healthMetrics.fatProfile}</li>
                          <li><span className="font-medium">Glycemic Load:</span> {results.healthMetrics.glycemicLoad}</li>
                          <li><span className="font-medium">Micronutrients:</span> {results.healthMetrics.micronutrients}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Results</h3>
                    <p className="text-gray-600">
                      Upload and analyze a food image to see detailed nutritional information and insights.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodAnalysis; 