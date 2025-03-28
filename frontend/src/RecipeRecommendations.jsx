import React, { useState, useEffect, useRef } from 'react';

const INGREDIENT_CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Meats', 
  'Seafood',
  'Dairy',
  'Grains',
  'Spices',
  'Herbs',
  'Condiments',
  'Others'
];

const INGREDIENTS_BY_CATEGORY = {
  'Fruits': [
    'Apple', 'Banana', 'Orange', 'Strawberry', 'Blueberry', 'Mango', 'Pineapple', 'Grape', 
    'Lemon', 'Lime', 'Peach', 'Pear', 'Watermelon', 'Cantaloupe', 'Kiwi', 'Raspberry',
    'Blackberry', 'Pomegranate', 'Plum', 'Apricot', 'Cherry', 'Fig', 'Guava', 'Passion Fruit'
  ],
  'Vegetables': [
    'Carrot', 'Broccoli', 'Spinach', 'Tomato', 'Potato', 'Onion', 'Garlic', 'Bell Pepper',
    'Cucumber', 'Lettuce', 'Mushroom', 'Zucchini', 'Eggplant', 'Cauliflower', 'Asparagus',
    'Green Beans', 'Peas', 'Corn', 'Sweet Potato', 'Cabbage', 'Kale', 'Celery'
  ],
  'Meats': [
    'Chicken Breast', 'Chicken Thigh', 'Ground Beef', 'Beef Steak', 'Pork Chop', 'Bacon',
    'Turkey', 'Lamb Chop', 'Ground Lamb', 'Ham', 'Sausage', 'Ground Turkey', 'Veal'
  ],
  'Seafood': [
    'Salmon', 'Tuna', 'Shrimp', 'Cod', 'Tilapia', 'Crab', 'Lobster', 'Mussels',
    'Scallops', 'Sardines', 'Halibut', 'Sea Bass', 'Trout', 'Mackerel'
  ],
  'Dairy': [
    'Milk', 'Cheese', 'Yogurt', 'Butter', 'Cream', 'Sour Cream', 'Cream Cheese',
    'Mozzarella', 'Cheddar', 'Parmesan', 'Ricotta', 'Cottage Cheese', 'Feta'
  ],
  'Grains': [
    'Rice', 'White Rice', 'Brown Rice', 'Pasta', 'Spaghetti', 'Penne', 'Bread',
    'Quinoa', 'Oats', 'Flour', 'Cornmeal', 'Cereal', 'Couscous', 'Barley'
  ],
  'Spices': [
    'Black Pepper', 'Salt', 'Cumin', 'Paprika', 'Cinnamon', 'Turmeric', 'Oregano',
    'Basil', 'Thyme', 'Rosemary', 'Cayenne Pepper', 'Chili Powder', 'Garlic Powder'
  ],
  'Herbs': [
    'Parsley', 'Cilantro', 'Mint', 'Dill', 'Sage', 'Chives', 'Bay Leaves',
    'Tarragon', 'Marjoram', 'Lemongrass', 'Thai Basil', 'Oregano', 'Thyme'
  ],
  'Condiments': [
    'Ketchup', 'Mustard', 'Mayonnaise', 'Soy Sauce', 'Hot Sauce', 'Olive Oil',
    'Vinegar', 'Honey', 'Maple Syrup', 'BBQ Sauce', 'Worcestershire Sauce'
  ],
  'Others': [
    'Nuts', 'Almonds', 'Walnuts', 'Cashews', 'Pistachios', 'Pine Nuts',
    'Seeds', 'Sunflower Seeds', 'Pumpkin Seeds', 'Chia Seeds', 'Flax Seeds',
    'Dried Fruits', 'Raisins', 'Dried Cranberries', 'Chocolate', 'Tofu'
  ]
};

// Dietary preferences options
const DIETARY_PREFERENCES = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
  'Keto', 'Paleo', 'Low-Carb', 'Low-Fat', 'High-Protein', 'Pescatarian'
];

// Cuisine preferences options
const CUISINE_PREFERENCES = [
  'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 
  'Mediterranean', 'Middle Eastern', 'French', 'American', 
  'Korean', 'Spanish', 'Greek', 'Vietnamese'
];

// Meal type options
const MEAL_TYPES = [
  'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'
];

// Cooking methods
const COOKING_METHODS = [
  'Baked', 'Grilled', 'Fried', 'Steamed', 'Slow-Cooked', 
  'Air-Fried', 'Pressure-Cooked', 'Raw', 'Stir-Fried', 'Boiled'
];

function RecipeRecommendations({ userProfile }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    category: ''
  });
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Food preferences state
  const [dietaryPreferences, setDietaryPreferences] = useState([]);
  const [cuisinePreferences, setCuisinePreferences] = useState([]);
  const [mealType, setMealType] = useState('');
  const [cookingMethod, setCookingMethod] = useState('');
  const [maxCookingTime, setMaxCookingTime] = useState(60); // in minutes
  
  // User preferences from profile
  const profilePreferences = userProfile?.preferences || {
    dietaryRestrictions: [],
    favoriteCuisines: [],
    allergies: []
  };

  // Load preferences from profile
  useEffect(() => {
    if (profilePreferences) {
      setDietaryPreferences(profilePreferences.dietaryRestrictions || []);
      setCuisinePreferences(profilePreferences.favoriteCuisines || []);
    }
  }, [profilePreferences]);

  // Animation states
  const [visibleSections, setVisibleSections] = useState({
    howItWorks: false,
    preferences: false,
    ingredients: false,
    results: false
  });
  
  // References for intersection observer
  const howItWorksRef = useRef(null);
  const preferencesRef = useRef(null);
  const ingredientsRef = useRef(null);
  const resultsRef = useRef(null);
  
  // Set up intersection observer for animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
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
    
    if (howItWorksRef.current) observer.observe(howItWorksRef.current);
    if (preferencesRef.current) observer.observe(preferencesRef.current);
    if (ingredientsRef.current) observer.observe(ingredientsRef.current);
    if (resultsRef.current) observer.observe(resultsRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setNewIngredient({
      name: '',
      category: category
    });
  };

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (!newIngredient.name) {
      setError('Please select an ingredient');
      return;
    }

    // Check if ingredient already exists
    const existingIngredient = ingredients.find(ing => ing.name === newIngredient.name);
    if (existingIngredient) {
      setError('This ingredient is already in your list');
      return;
    }

    setError(null);
    setIngredients([...ingredients, { 
      ...newIngredient, 
      id: Date.now()
    }]);
    setNewIngredient({
      name: '',
      category: selectedCategory
    });
  };

  const handleRemoveIngredient = (id) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const handleToggleDietaryPreference = (preference) => {
    if (dietaryPreferences.includes(preference)) {
      setDietaryPreferences(dietaryPreferences.filter(p => p !== preference));
    } else {
      setDietaryPreferences([...dietaryPreferences, preference]);
    }
  };

  const handleToggleCuisinePreference = (cuisine) => {
    if (cuisinePreferences.includes(cuisine)) {
      setCuisinePreferences(cuisinePreferences.filter(c => c !== cuisine));
    } else {
      setCuisinePreferences([...cuisinePreferences, cuisine]);
    }
  };

  const handleGetRecipes = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Format ingredients for the backend
      const ingredientsList = ingredients.map(ing => ing.name).join(', ');

      // Create preferences string
      const preferencesString = [
        ...dietaryPreferences.map(pref => `${pref} diet`),
        ...cuisinePreferences.map(cuisine => `${cuisine} style`),
        mealType ? `for ${mealType}` : '',
        cookingMethod ? `${cookingMethod}` : '',
        `under ${maxCookingTime} minutes`
      ].filter(Boolean).join(', ');

      console.log("Sending ingredients:", ingredientsList);
      console.log("Preferences:", preferencesString);

      // Show loading state with placeholder images
      setRecipes([{
        name: "Analyzing ingredients...",
        description: "Creating personalized recipes based on your ingredients and preferences...",
        cookingTime: "...",
        difficulty: "...",
        servings: "...",
        calories: "...",
        ingredients: [],
        instructions: [],
        tips: [],
        nutritionalInfo: {},
        imageUrl: "https://source.unsplash.com/featured/?cooking,preparation"
      }]);

      // Generate sample recipes for now (this would be replaced with actual backend call)
      setTimeout(() => {
        const sampleRecipes = generateSampleRecipes(ingredients, dietaryPreferences, cuisinePreferences, mealType, cookingMethod);
        setRecipes(sampleRecipes);
        setLoading(false);
      }, 2000);

    } catch (error) {
      console.error('Error generating recipes:', error);
      setError('Failed to generate recipes. Please try again.');
      setRecipes([]);
      setLoading(false);
    }
  };

  // Helper function to generate sample recipes
  const generateSampleRecipes = (ingredients, dietaryPrefs, cuisinePrefs, mealType, cookingMethod) => {
    const mainIngredients = ingredients.map(ing => ing.name).join(', ');
    const dietaryText = dietaryPrefs.length ? dietaryPrefs.join(', ') : 'Standard';
    const cuisineText = cuisinePrefs.length ? cuisinePrefs[0] : 'Global';
    
    const recipes = [
      {
        name: `${cuisineText} ${cookingMethod || ''} ${ingredients[0]?.name || 'Dish'}`,
        description: `A delicious ${dietaryText.toLowerCase()} dish featuring ${mainIngredients}.`,
        cookingTime: `${Math.floor(Math.random() * maxCookingTime) + 10} minutes`,
        difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
        servings: `${Math.floor(Math.random() * 4) + 2}`,
        calories: `${Math.floor(Math.random() * 300) + 200} per serving`,
        ingredients: [
          ...ingredients.map(ing => ing.name),
          'Salt and pepper to taste',
          'Olive oil',
          'Fresh herbs'
        ],
        instructions: [
          'Prepare all ingredients by washing and chopping as needed',
          `Heat oil in a ${cookingMethod === 'Baked' ? 'oven-safe dish' : 'pan'} over medium heat`,
          'Add main ingredients and cook until tender',
          'Season with salt, pepper, and herbs',
          'Serve hot and enjoy'
        ],
        tips: [
          'For best results, use fresh ingredients',
          'Adjust seasoning to your taste preferences',
          'Leftovers can be stored in the refrigerator for up to 3 days'
        ],
        nutritionalInfo: {
          protein: `${Math.floor(Math.random() * 30) + 10}g`,
          carbs: `${Math.floor(Math.random() * 50) + 10}g`,
          fat: `${Math.floor(Math.random() * 20) + 5}g`,
          fiber: `${Math.floor(Math.random() * 10) + 2}g`,
          sodium: `${Math.floor(Math.random() * 200) + 100}mg`
        },
        imageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(ingredients[0]?.name || 'food')},${encodeURIComponent(cuisineText)}`
      },
      {
        name: `Quick ${ingredients.length > 1 ? ingredients[1]?.name : ingredients[0]?.name || 'Recipe'}`,
        description: `A simple and quick dish perfect for ${mealType || 'any meal'}.`,
        cookingTime: `${Math.floor(Math.random() * (maxCookingTime/2)) + 10} minutes`,
        difficulty: 'Easy',
        servings: `${Math.floor(Math.random() * 2) + 2}`,
        calories: `${Math.floor(Math.random() * 200) + 150} per serving`,
        ingredients: [
          ...ingredients.map(ing => ing.name).slice(0, 5),
          'Basic seasonings',
          'Your favorite sauce'
        ],
        instructions: [
          'Prepare all ingredients quickly',
          'Combine in a bowl or pan',
          'Cook using your preferred method',
          'Season to taste',
          'Enjoy your quick meal'
        ],
        tips: [
          'This recipe is very flexible - substitute ingredients as needed',
          'Add your favorite spices to enhance the flavor',
          'Perfect for busy weeknights'
        ],
        nutritionalInfo: {
          protein: `${Math.floor(Math.random() * 20) + 5}g`,
          carbs: `${Math.floor(Math.random() * 30) + 5}g`,
          fat: `${Math.floor(Math.random() * 15) + 3}g`,
          fiber: `${Math.floor(Math.random() * 5) + 1}g`,
          sodium: `${Math.floor(Math.random() * 150) + 50}mg`
        },
        imageUrl: `https://source.unsplash.com/featured/?quick,${encodeURIComponent(ingredients[0]?.name || 'meal')}`
      },
      {
        name: `${cuisineText} Inspired Healthy Bowl`,
        description: `A nutritious ${dietaryText.toLowerCase()} bowl featuring a variety of flavors and textures.`,
        cookingTime: `${Math.floor(Math.random() * maxCookingTime) + 15} minutes`,
        difficulty: 'Medium',
        servings: '2',
        calories: `${Math.floor(Math.random() * 250) + 300} per serving`,
        ingredients: [
          ...ingredients.map(ing => ing.name).slice(0, 7),
          'Mixed greens',
          'Whole grains',
          'Healthy dressing'
        ],
        instructions: [
          'Prepare all components separately',
          'Cook grains according to package instructions',
          'Assemble bowl with grains as base',
          'Top with cooked and raw ingredients',
          'Drizzle with dressing and serve'
        ],
        tips: [
          'Meal-prep the components for quick assembly during the week',
          'Customize with your favorite toppings',
          'Eat immediately for best texture'
        ],
        nutritionalInfo: {
          protein: `${Math.floor(Math.random() * 25) + 15}g`,
          carbs: `${Math.floor(Math.random() * 40) + 20}g`,
          fat: `${Math.floor(Math.random() * 15) + 10}g`,
          fiber: `${Math.floor(Math.random() * 8) + 5}g`,
          sodium: `${Math.floor(Math.random() * 100) + 200}mg`
        },
        imageUrl: `https://source.unsplash.com/featured/?bowl,healthy,${encodeURIComponent(cuisineText)}`
      }
    ];

    return recipes;
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-primary-900 mb-6 fade-in">Recipe Recommendations</h1>
        
        {/* HOW IT WORKS Section with smoother animations */}
        <div 
          id="howItWorks"
          ref={howItWorksRef}
          className={`mt-8 bg-blue-50 rounded-lg p-8 transition-all duration-1500 ease-out transform ${
            visibleSections.howItWorks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
          }`}
        >
          <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 - slow staggered animation */}
            <div className={`text-center transition-all duration-1200 transform ${
              visibleSections.howItWorks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`} style={{ transitionDelay: '200ms', transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)' }}>
              <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-100 text-blue-600 mx-auto mb-4">
                <span className="font-bold text-xl">1</span>
              </div>
              <h3 className="font-medium text-lg mb-2">Select Preferences</h3>
              <p className="text-gray-600">Choose dietary needs, cuisine styles, meal types, and cooking methods that match your requirements</p>
            </div>
            
            {/* Step 2 - more delay */}
            <div className={`text-center transition-all duration-1200 transform ${
              visibleSections.howItWorks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`} style={{ transitionDelay: '500ms', transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)' }}>
              <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-100 text-blue-600 mx-auto mb-4">
                <span className="font-bold text-xl">2</span>
              </div>
              <h3 className="font-medium text-lg mb-2">Add ingredients</h3>
              <p className="text-gray-600">Select ingredients you have available or want to use in your recipes.</p>
            </div>
            
            {/* Step 3 - even more delay */}
            <div className={`text-center transition-all duration-1200 transform ${
              visibleSections.howItWorks ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            }`} style={{ transitionDelay: '800ms', transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)' }}>
              <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-100 text-blue-600 mx-auto mb-4">
                <span className="font-bold text-xl">3</span>
              </div>
              <h3 className="font-medium text-lg mb-2">Get Personalized Recipes</h3>
              <p className="text-gray-600">Receive customized recipe suggestions based on your preferences and ingredients</p>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div 
          id="preferences"
          ref={preferencesRef}
          className={`bg-white rounded-lg shadow-md p-8 my-8 transition-all duration-1500 ease-out transform ${
            visibleSections.preferences ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
          }`}
        >
          <h2 className="text-2xl font-semibold text-primary-800 mb-6">Your Food Preferences</h2>
          
          {/* Dietary Preferences */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-secondary-700 mb-3">Dietary Preferences</h3>
            <div className="flex flex-wrap gap-3">
              {DIETARY_PREFERENCES.map((preference, index) => (
                <button
                  key={preference}
                  onClick={() => handleToggleDietaryPreference(preference)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform ${
                    visibleSections.preferences ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  } ${
                    dietaryPreferences.includes(preference)
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {preference}
                </button>
              ))}
            </div>
          </div>
          
          {/* Cuisine Preferences */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-secondary-700 mb-3">Cuisine Preferences</h3>
            <div className="flex flex-wrap gap-3">
              {CUISINE_PREFERENCES.map((cuisine, index) => (
                <button
                  key={cuisine}
                  onClick={() => handleToggleCuisinePreference(cuisine)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform ${
                    visibleSections.preferences ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  } ${
                    cuisinePreferences.includes(cuisine)
                      ? 'bg-green-600 text-white'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
          
          {/* Meal Type */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-secondary-700 mb-3">Meal Type</h3>
            <div className="flex flex-wrap gap-3">
              {MEAL_TYPES.map((type, index) => (
                <button
                  key={type}
                  onClick={() => setMealType(mealType === type ? '' : type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform ${
                    visibleSections.preferences ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  } ${
                    mealType === type
                      ? 'bg-yellow-600 text-white'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {/* Cooking Method */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-secondary-700 mb-3">Cooking Method</h3>
            <div className="flex flex-wrap gap-3">
              {COOKING_METHODS.map((method, index) => (
                <button
                  key={method}
                  onClick={() => setCookingMethod(cookingMethod === method ? '' : method)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform ${
                    visibleSections.preferences ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  } ${
                    cookingMethod === method
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
          
          {/* Max Cooking Time */}
          <div className="mb-2">
            <h3 className="text-md font-medium text-secondary-700 mb-2">
              Max Cooking Time: {maxCookingTime} minutes
            </h3>
            <input
              type="range"
              min="10"
              max="120"
              step="5"
              value={maxCookingTime}
              onChange={(e) => setMaxCookingTime(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10 min</span>
              <span>45 min</span>
              <span>90 min</span>
              <span>120 min</span>
            </div>
          </div>
        </div>

        {/* Category Selection */}
        <div 
          id="ingredients"
          ref={ingredientsRef}
          className={`bg-white rounded-lg shadow-md p-8 my-8 transition-all duration-700 transform ${
            visibleSections.ingredients ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-xl font-semibold text-primary-800 mb-4">Select Ingredients by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {INGREDIENT_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors
                  ${selectedCategory === category 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredient Selection */}
        {selectedCategory && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-primary-800 mb-4">
              Select {selectedCategory}
            </h2>
            <form onSubmit={handleAddIngredient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Choose {selectedCategory}
                </label>
                <select
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select an ingredient</option>
                  {INGREDIENTS_BY_CATEGORY[selectedCategory].map(ingredient => (
                    <option key={ingredient} value={ingredient}>{ingredient}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Add Ingredient
              </button>
            </form>
          </div>
        )}

        {/* Ingredients List */}
        {ingredients.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-primary-800 mb-4">Your Selected Ingredients</h2>
            <div className="space-y-2">
              {ingredients.map(ing => (
                <div key={ing.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-md">
                  <span className="text-secondary-800">
                    {ing.name} ({ing.category})
                  </span>
                  <button
                    onClick={() => handleRemoveIngredient(ing.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleGetRecipes}
              className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-medium"
              disabled={loading}
            >
              {loading ? 'Generating Recipes...' : 'Get Recipe Suggestions'}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Recipe Results */}
        {recipes.length > 0 && (
          <div 
            id="results"
            ref={resultsRef}
            className={`space-y-8 transition-all duration-700 transform ${
              visibleSections.results ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl font-semibold text-primary-800 mb-6">Suggested Recipes</h2>
            {recipes.map((recipe, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-500 transform ${
                  visibleSections.results ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative h-64">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-primary-700 mb-2">{recipe.name}</h3>
                  <p className="text-secondary-600 mb-4">{recipe.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <span className="font-medium text-secondary-700">Cooking Time:</span>
                      <span className="ml-2 text-secondary-600">{recipe.cookingTime}</span>
                    </div>
                    <div>
                      <span className="font-medium text-secondary-700">Difficulty:</span>
                      <span className="ml-2 text-secondary-600">{recipe.difficulty}</span>
                    </div>
                    <div>
                      <span className="font-medium text-secondary-700">Servings:</span>
                      <span className="ml-2 text-secondary-600">{recipe.servings}</span>
                    </div>
                    <div>
                      <span className="font-medium text-secondary-700">Calories:</span>
                      <span className="ml-2 text-secondary-600">{recipe.calories}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-secondary-700 mb-2">Ingredients Needed:</h4>
                    <ul className="list-disc list-inside text-secondary-600 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-secondary-700 mb-2">Cooking Instructions:</h4>
                    <ol className="list-decimal list-inside text-secondary-600 space-y-2">
                      {recipe.instructions.map((step, i) => (
                        <li key={i} className="pl-2">{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-secondary-700 mb-2">Tips for Best Results:</h4>
                    <ul className="list-disc list-inside text-secondary-600 space-y-1">
                      {recipe.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-secondary-700 mb-2">Nutritional Information:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-secondary-600">
                      {Object.entries(recipe.nutritionalInfo).map(([key, value]) => (
                        <div key={key}>
                          <span className="capitalize">{key}:</span>
                          <span className="ml-2">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeRecommendations; 