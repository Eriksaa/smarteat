import React, { useState } from 'react';

const Profile = ({ userProfile, setUserProfile }) => {
  // State for editable preferences
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState(userProfile?.preferences || {
    dietaryRestrictions: [],
    favoriteCuisines: [],
    allergies: []
  });
  
  // Temporary state for form inputs
  const [dietaryInput, setDietaryInput] = useState('');
  const [cuisineInput, setCuisineInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');

  // Handle save preferences
  const savePreferences = () => {
    const updatedProfile = {
      ...userProfile,
      preferences
    };
    
    // Update profile in parent component
    setUserProfile(updatedProfile);
    
    // Update profile in localStorage
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    // Exit edit mode
    setIsEditing(false);
  };

  // Add item to a preference array
  const addItem = (type, value) => {
    if (!value.trim()) return;
    
    setPreferences(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), value.trim()]
    }));
    
    // Clear input
    if (type === 'dietaryRestrictions') setDietaryInput('');
    else if (type === 'favoriteCuisines') setCuisineInput('');
    else if (type === 'allergies') setAllergyInput('');
  };

  // Remove item from a preference array
  const removeItem = (type, index) => {
    setPreferences(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{userProfile?.name}</h2>
            <p className="text-gray-600">{userProfile?.email}</p>
            <p className="text-sm text-gray-500">Logged in with {userProfile?.provider}</p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Preferences</h3>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit Preferences
              </button>
            ) : (
              <button 
                onClick={savePreferences}
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-6">
              {/* Dietary Restrictions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Restrictions
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={dietaryInput}
                    onChange={(e) => setDietaryInput(e.target.value)}
                    className="flex-1 border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Vegetarian, Vegan, Gluten-free"
                  />
                  <button
                    onClick={() => addItem('dietaryRestrictions', dietaryInput)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-r-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {preferences.dietaryRestrictions?.map((item, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item}
                      <button onClick={() => removeItem('dietaryRestrictions', index)} className="ml-1.5 text-blue-500 hover:text-blue-700">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Favorite Cuisines */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favorite Cuisines
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={cuisineInput}
                    onChange={(e) => setCuisineInput(e.target.value)}
                    className="flex-1 border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Italian, Mexican, Thai"
                  />
                  <button
                    onClick={() => addItem('favoriteCuisines', cuisineInput)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-r-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {preferences.favoriteCuisines?.map((item, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {item}
                      <button onClick={() => removeItem('favoriteCuisines', index)} className="ml-1.5 text-green-500 hover:text-green-700">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    className="flex-1 border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Peanuts, Lactose, Shellfish"
                  />
                  <button
                    onClick={() => addItem('allergies', allergyInput)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-r-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {preferences.allergies?.map((item, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {item}
                      <button onClick={() => removeItem('allergies', index)} className="ml-1.5 text-red-500 hover:text-red-700">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Dietary Restrictions</h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  {preferences.dietaryRestrictions?.length > 0 ? (
                    preferences.dietaryRestrictions.map((item, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">None specified</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Favorite Cuisines</h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  {preferences.favoriteCuisines?.length > 0 ? (
                    preferences.favoriteCuisines.map((item, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">None specified</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Allergies</h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  {preferences.allergies?.length > 0 ? (
                    preferences.allergies.map((item, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">None specified</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 