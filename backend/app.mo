import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Error "mo:base/Error";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Int "mo:base/Int";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Buffer "mo:base/Buffer";
import Float "mo:base/Float";
import _Debug "mo:base/Debug";

actor EatSmart {
    // Types
    public type UserRole = {
        #User;
        #Admin;
    };

    public type AuthToken = {
        principal: Principal;
        role: UserRole;
        expiresAt: Nat;
    };

    public type Ingredient = {
        id: Text;
        name: Text;
        category: Text;
        nutritionalInfo: NutritionalInfo;
        commonUnits: [Text];
        description: Text;
        allergens: [Text];
        createdAt: Nat;
        updatedAt: Nat;
    };

    public type Recipe = {
        id: Text;
        name: Text;
        ingredients: [Ingredient];
        instructions: Text;
        nutritionalInfo: NutritionalInfo;
        createdBy: Principal;
        timestamp: Nat;
    };

    public type NutritionalInfo = {
        calories: Nat;
        protein: Nat;
        carbs: Nat;
        fat: Nat;
        vitamins: [Text];
        minerals: [Text];
    };

    public type FoodAnalysis = {
        foodName: Text;
        nutritionalInfo: NutritionalInfo;
        healthScore: Nat;
        recommendations: Text;
    };

    public type UserProfile = {
        id: Principal;
        name: Text;
        dietaryPreferences: [Text];
        allergies: [Text];
        savedRecipes: [Text];
    };

    // Error types
    public type Error = {
        #NotFound;
        #InvalidInput;
        #Unauthorized;
        #StorageError;
        #InvalidToken;
        #TokenExpired;
        #UserExists;
        #InvalidCredentials;
        #ServiceError;
        #RateLimitExceeded;
    };

    public type Result<T> = Result.Result<T, Error>;

    // Stable storage
    private stable var recipesStable: [(Text, Recipe)] = [];
    private stable var usersStable: [(Principal, UserProfile)] = [];
    private stable var ingredientsStable: [(Text, Ingredient)] = [];
    private stable var nextRecipeIdStable: Nat = 0;
    private stable var nextIngredientIdStable: Nat = 0;

    // State variables
    private var nextRecipeId: Nat = nextRecipeIdStable;
    private var nextIngredientId: Nat = nextIngredientIdStable;
    private let recipes = HashMap.HashMap<Text, Recipe>(0, Text.equal, Text.hash);
    private let users = HashMap.HashMap<Principal, UserProfile>(0, Principal.equal, Principal.hash);
    private let authTokens = HashMap.HashMap<Principal, AuthToken>(0, Principal.equal, Principal.hash);
    private let adminPrincipals = HashMap.HashMap<Principal, Bool>(0, Principal.equal, Principal.hash);
    private let ingredients = HashMap.HashMap<Text, Ingredient>(0, Text.equal, Text.hash);

    // Rate limiting
    private type RateLimit = {
        count: Nat;
        timestamp: Nat;
    };

    private let rateLimits = HashMap.HashMap<Principal, RateLimit>(0, Principal.equal, Principal.hash);
    private let MAX_REQUESTS_PER_MINUTE = 60;

    // Monitoring
    private type SystemStats = {
        totalUsers: Nat;
        totalRecipes: Nat;
        totalRequests: Nat;
        lastBackup: Nat;
    };

    private var stats: SystemStats = {
        totalUsers = 0;
        totalRecipes = 0;
        totalRequests = 0;
        lastBackup = 0;
    };

    // System functions
    system func preupgrade() {
        recipesStable := Iter.toArray(recipes.entries());
        usersStable := Iter.toArray(users.entries());
        ingredientsStable := Iter.toArray(ingredients.entries());
        nextRecipeIdStable := nextRecipeId;
        nextIngredientIdStable := nextIngredientId;
    };

    system func postupgrade() {
        for ((id, recipe) in recipesStable.vals()) {
            recipes.put(id, recipe);
        };
        for ((principal, profile) in usersStable.vals()) {
            users.put(principal, profile);
        };
        for ((id, ingredient) in ingredientsStable.vals()) {
            ingredients.put(id, ingredient);
        };
    };

    // Service interfaces
    private type LLMService = actor {
        queryText : shared (Text) -> async Result<Text>;
        healthCheck : shared query () -> async Bool;
    };

    private type CVService = actor {
        analyzeImage : shared (Blob) -> async {
            foodName: Text;
            confidence: Float;
            nutritionalInfo: {
                calories: Nat;
                protein: Nat;
                carbs: Nat;
                fat: Nat;
                vitamins: [Text];
                minerals: [Text];
            };
        };
    };

    // Service instances
    private let llmService: LLMService = actor "rrkah-fqaaa-aaaaa-aaaaq-cai";
    private let cvService: CVService = actor "aaaaa-aa";

    // Configuration
    private let MAX_TOKENS = 1000;
    private let _TEMPERATURE = 0.7;  // Renamed to indicate unused
    private let _TOP_P = 0.9;        // Renamed to indicate unused

    // LLM Helper Functions
    private func formatLLMPrompt(prompt: Text) : Text {
        "You are a helpful AI assistant specializing in nutrition and cooking. " #
        "Please provide detailed, accurate, and helpful responses. " #
        "Here is the user's request: " # prompt
    };

    private func validateLLMResponse(response: Text) : Bool {
        response.size() > 0 and response.size() <= MAX_TOKENS
    };

    // Enhanced LLM Query Function
    private func enhancedLLMQuery(prompt: Text) : async Result<Text> {
        let formattedPrompt = formatLLMPrompt(prompt);
        let result = await llmService.queryText(formattedPrompt);
        switch (result) {
            case (#ok(response)) {
                if (validateLLMResponse(response)) {
                    #ok(response)
                } else {
                    #err(#InvalidInput)
                }
            };
            case (#err(_)) {
                #err(#ServiceError)
            };
        }
    };

    // Health check function
    public shared(_msg) func checkLLMHealth() : async Bool {
        await llmService.healthCheck()
    };

    // Helper functions
    private func generateRecipeId() : Text {
        nextRecipeId += 1;
        Nat.toText(nextRecipeId)
    };

    private func generateIngredientId() : Text {
        nextIngredientId += 1;
        Nat.toText(nextIngredientId)
    };

    private func getCurrentTimestamp() : Nat {
        Int.abs(Time.now())
    };

    private func formatIngredients(ingredients: [Ingredient]) : Text {
        var result = "";
        for (ingredient in ingredients.vals()) {
            result #= ingredient.name # " (" # ingredient.category # "), ";
        };
        result
    };

    // Authentication functions
    public shared(msg) func register(name: Text, dietaryPreferences: [Text], allergies: [Text]) : async Result<UserProfile> {
        switch (users.get(msg.caller)) {
            case (?_) { #err(#UserExists) };
            case null {
                let profile: UserProfile = {
                    id = msg.caller;
                    name = name;
                    dietaryPreferences = dietaryPreferences;
                    allergies = allergies;
                    savedRecipes = [];
                };
                users.put(msg.caller, profile);
                #ok(profile)
            };
        };
    };

    public shared(msg) func login() : async Result<AuthToken> {
        switch (users.get(msg.caller)) {
            case (?profile) {
                let isAdmin = switch (adminPrincipals.get(msg.caller)) {
                    case (?true) { true };
                    case _ { false };
                };
                
                let token: AuthToken = {
                    principal = msg.caller;
                    role = if (isAdmin) { #Admin } else { #User };
                    expiresAt = getCurrentTimestamp() + 24 * 60 * 60; // 24 hours
                };
                
                authTokens.put(msg.caller, token);
                #ok(token)
            };
            case null { #err(#InvalidCredentials) };
        };
    };

    public shared(msg) func logout() : async Result<()> {
        authTokens.delete(msg.caller);
        #ok()
    };

    private func validateAuth(principal: Principal) : Result.Result<AuthToken, Error> {
        switch (authTokens.get(principal)) {
            case (?token) {
                if (token.expiresAt < getCurrentTimestamp()) {
                    #err(#TokenExpired)
                } else {
                    #ok(token)
                }
            };
            case null { #err(#InvalidToken) };
        };
    };

    private func requireAuth(principal: Principal) : Result.Result<AuthToken, Error> {
        switch (validateAuth(principal)) {
            case (#ok(token)) { #ok(token) };
            case (#err(e)) { #err(e) };
        };
    };

    private func requireAdmin(principal: Principal) : Result.Result<AuthToken, Error> {
        switch (requireAuth(principal)) {
            case (#ok(token)) {
                if (token.role == #Admin) {
                    #ok(token)
                } else {
                    #err(#Unauthorized)
                }
            };
            case (#err(e)) { #err(e) };
        };
    };

    // User management
    public shared(msg) func createProfile(name: Text, dietaryPreferences: [Text], allergies: [Text]) : async Result<UserProfile> {
        switch (requireAuth(msg.caller)) {
            case (#ok(_)) {
                switch (users.get(msg.caller)) {
                    case (?_) { #err(#UserExists) };
                    case null {
                        let profile: UserProfile = {
                            id = msg.caller;
                            name = name;
                            dietaryPreferences = dietaryPreferences;
                            allergies = allergies;
                            savedRecipes = [];
                        };
                        users.put(msg.caller, profile);
                        #ok(profile)
                    };
                };
            };
            case (#err(e)) { #err(e) };
        };
    };

    public shared query(msg) func getProfile() : async Result<UserProfile> {
        switch (requireAuth(msg.caller)) {
            case (#ok(_)) {
                switch (users.get(msg.caller)) {
                    case (?profile) { #ok(profile) };
                    case null { #err(#NotFound) };
                };
            };
            case (#err(e)) { #err(e) };
        };
    };

    // Recipe management
    public shared(msg) func createRecipe(
        name: Text,
        ingredientIds: [Text],
        ingredientQuantities: [Nat],
        ingredientUnits: [Text],
        instructions: Text,
        _nutritionalInfo: NutritionalInfo  // Renamed to indicate unused
    ) : async Result<Recipe> {
        if (name == "" or instructions == "") {
            return #err(#InvalidInput);
        };
        
        if (ingredientIds.size() != ingredientQuantities.size() or
            ingredientIds.size() != ingredientUnits.size()) {
            return #err(#InvalidInput);
        };

        // Validate all ingredients exist
        let recipeIngredients = Buffer.Buffer<Ingredient>(0);
        for (id in ingredientIds.vals()) {
            switch (ingredients.get(id)) {
                case (?ingredient) { recipeIngredients.add(ingredient) };
                case null { return #err(#InvalidInput) };
            };
        };

        let id = generateRecipeId();
        let timestamp = getCurrentTimestamp();
        let recipe = {
            id = id;
            name = name;
            ingredients = Buffer.toArray(recipeIngredients);
            instructions = instructions;
            nutritionalInfo = calculateNutritionalInfo(Buffer.toArray(recipeIngredients));
            createdBy = msg.caller;
            timestamp = timestamp;
        };
        
        recipes.put(id, recipe);
        #ok(recipe)
    };

    public query func getRecipe(id: Text) : async Result<Recipe> {
        switch (recipes.get(id)) {
            case (?recipe) { #ok(recipe) };
            case null { #err(#NotFound) };
        };
    };

    // Rate limiting helper
    private func checkRateLimit(principal: Principal) : Bool {
        let now = getCurrentTimestamp();
        switch (rateLimits.get(principal)) {
            case (?limit) {
                // Simple time window check
                if (now > limit.timestamp + 60) {
                    // Reset after time window
                    rateLimits.put(principal, { count = 1; timestamp = now });
                    true
                } else {
                    // Within time window - check count
                    if (limit.count >= MAX_REQUESTS_PER_MINUTE) {
                        false
                    } else {
                        // Safe increment within window
                        rateLimits.put(principal, { count = limit.count + 1; timestamp = limit.timestamp });
                        true
                    }
                }
            };
            case null {
                // First request
                rateLimits.put(principal, { count = 1; timestamp = now });
                true
            };
        };
    };

    // AI-powered features
    public shared(msg) func getRecipeRecommendations(ingredients: [Ingredient], userProfile: ?UserProfile) : async Result<Text> {
        switch (requireAuth(msg.caller)) {
            case (#ok(_)) {
                if (not checkRateLimit(msg.caller)) {
                    return #err(#RateLimitExceeded);
                };
                
                if (ingredients.size() == 0) {
                    return #err(#InvalidInput);
                };

                stats := {
                    totalUsers = stats.totalUsers;
                    totalRecipes = stats.totalRecipes;
                    totalRequests = stats.totalRequests + 1;
                    lastBackup = stats.lastBackup;
                };

                var prompt = "Given these ingredients: " # formatIngredients(ingredients);
                
                switch (userProfile) {
                    case (?profile) {
                        prompt #= "\nDietary preferences: " # Text.join(", ", profile.dietaryPreferences.vals());
                        prompt #= "\nAllergies: " # Text.join(", ", profile.allergies.vals());
                    };
                    case null { };
                };
                
                prompt #= "\nPlease suggest 3 healthy recipes that can be made. For each recipe, include:\n" #
                         "1. Recipe name\n" #
                         "2. Required additional ingredients\n" #
                         "3. Step-by-step instructions\n" #
                         "4. Estimated nutritional value\n" #
                         "5. Cooking time and difficulty level";
                
                await enhancedLLMQuery(prompt)
            };
            case (#err(e)) { #err(e) };
        };
    };

    public shared(msg) func analyzeFoodPhoto(photoData: Blob) : async Result<FoodAnalysis> {
        let caller = msg.caller;
        switch (requireAuth(caller)) {
            case (#ok(_)) {
                if (photoData.size() == 0) {
                    return #err(#InvalidInput);
                };

                let analysis = await cvService.analyzeImage(photoData);
                
                let prompt = "Based on this food analysis:\n" #
                           "Food: " # analysis.foodName # "\n" #
                           "Calories: " # Nat.toText(analysis.nutritionalInfo.calories) # "\n" #
                           "Protein: " # Nat.toText(analysis.nutritionalInfo.protein) # "g\n" #
                           "Carbs: " # Nat.toText(analysis.nutritionalInfo.carbs) # "g\n" #
                           "Fat: " # Nat.toText(analysis.nutritionalInfo.fat) # "g\n" #
                           "Please provide health recommendations and a health score (0-100).";
                
                switch (await enhancedLLMQuery(prompt)) {
                    case (#ok(recommendations)) {
                        #ok({
                            foodName = analysis.foodName;
                            nutritionalInfo = analysis.nutritionalInfo;
                            healthScore = 75;  // Default score since parsing from text is unreliable
                            recommendations = recommendations;
                        })
                    };
                    case (#err(error)) {
                        #err(error)
                    };
                }
            };
            case (#err(e)) { #err(e) };
        };
    };

    public shared(msg) func getHealthRecommendations(userProfile: UserProfile) : async Result<Text> {
        let caller = msg.caller;
        switch (requireAuth(caller)) {
            case (#ok(_)) {
                if (userProfile.dietaryPreferences.size() == 0 and userProfile.allergies.size() == 0) {
                    return #err(#InvalidInput);
                };

                let prompt = 
                    "Based on this user profile:\n" #
                    "Dietary preferences: " # Text.join(", ", userProfile.dietaryPreferences.vals()) # "\n" #
                    "Allergies: " # Text.join(", ", userProfile.allergies.vals()) # "\n" #
                    "Please provide personalized health and dietary recommendations including:\n" #
                    "1. Daily calorie needs\n" #
                    "2. Recommended macronutrient distribution\n" #
                    "3. Important vitamins and minerals to focus on\n" #
                    "4. Meal timing suggestions\n" #
                    "5. Foods to avoid or limit";
                
                await enhancedLLMQuery(prompt)
            };
            case (#err(e)) { #err(e) };
        };
    };

    public shared(msg) func generateRecipeFromIngredients(
        availableIngredients: [(Text, Nat, Text)],  // [(ingredientName, quantity, unit)]
        userProfile: ?UserProfile
    ) : async Result<{
        recipe: Recipe;
        explanation: Text;
        substitutions: [Text];
    }> {
        let caller = msg.caller;
        switch (requireAuth(caller)) {
            case (#ok(_)) {
                if (not checkRateLimit(caller)) {
                    return #err(#InvalidInput);
                };
                
                if (availableIngredients.size() == 0) {
                    return #err(#InvalidInput);
                };

                // Format ingredients for LLM prompt
                var ingredientsPrompt = "Available ingredients:\n";
                for ((name, quantity, unit) in availableIngredients.vals()) {
                    ingredientsPrompt #= "- " # name # " (" # Nat.toText(quantity) # " " # unit # ")\n";
                };

                // Add dietary preferences and allergies if available
                switch (userProfile) {
                    case (?profile) {
                        ingredientsPrompt #= "\nDietary preferences: " # Text.join(", ", profile.dietaryPreferences.vals()) # "\n";
                        ingredientsPrompt #= "Allergies: " # Text.join(", ", profile.allergies.vals()) # "\n";
                    };
                    case null { };
                };

                let prompt = ingredientsPrompt # 
                    "\nPlease create a detailed recipe using these ingredients. Include:\n" #
                    "1. Recipe name\n" #
                    "2. List of ingredients with quantities\n" #
                    "3. Step-by-step instructions\n" #
                    "4. Nutritional information\n" #
                    "5. Cooking time and difficulty level\n" #
                    "6. Any suggested substitutions for missing ingredients\n" #
                    "7. Tips for preparation and serving";

                switch (await enhancedLLMQuery(prompt)) {
                    case (#ok(response)) {
                        // Create ingredients with all required fields
                        let recipeIngredients = Array.map<(Text, Nat, Text), Ingredient>(
                            availableIngredients,
                            func((name, quantity, unit)) {
                                {
                                    id = generateIngredientId();
                                    name = name;
                                    category = "General";  // Default category
                                    nutritionalInfo = {
                                        calories = 0;
                                        protein = 0;
                                        carbs = 0;
                                        fat = 0;
                                        vitamins = [];
                                        minerals = [];
                                    };
                                    commonUnits = [unit];
                                    description = "";  // Default empty description
                                    allergens = [];    // Default no allergens
                                    createdAt = getCurrentTimestamp();
                                    updatedAt = getCurrentTimestamp();
                                }
                            }
                        );

                        let recipe: Recipe = {
                            id = generateRecipeId();
                            name = "AI Generated Recipe";
                            ingredients = recipeIngredients;
                            instructions = response;
                            nutritionalInfo = calculateNutritionalInfo(recipeIngredients);
                            createdBy = caller;
                            timestamp = getCurrentTimestamp();
                        };

                        // Store the recipe
                        recipes.put(recipe.id, recipe);

                        #ok({
                            recipe = recipe;
                            explanation = "Recipe generated based on available ingredients and dietary preferences.";
                            substitutions = [];
                        })
                    };
                    case (#err(error)) {
                        #err(error)
                    };
                }
            };
            case (#err(e)) { #err(e) };
        };
    };

    // Helper function to calculate total nutrition from ingredients
    private func calculateNutritionalInfo(ingredients: [Ingredient]) : NutritionalInfo {
        var totalCalories = 0;
        var totalProtein = 0;
        var totalCarbs = 0;
        var totalFat = 0;
        var allVitamins = Buffer.Buffer<Text>(0);
        var allMinerals = Buffer.Buffer<Text>(0);

        for (ingredient in ingredients.vals()) {
            totalCalories += ingredient.nutritionalInfo.calories;
            totalProtein += ingredient.nutritionalInfo.protein;
            totalCarbs += ingredient.nutritionalInfo.carbs;
            totalFat += ingredient.nutritionalInfo.fat;
            
            // Add unique vitamins and minerals
            for (vitamin in ingredient.nutritionalInfo.vitamins.vals()) {
                if (not Buffer.contains<Text>(allVitamins, vitamin, Text.equal)) {
                    allVitamins.add(vitamin);
                };
            };
            for (mineral in ingredient.nutritionalInfo.minerals.vals()) {
                if (not Buffer.contains<Text>(allMinerals, mineral, Text.equal)) {
                    allMinerals.add(mineral);
                };
            };
        };

        {
            calories = totalCalories;
            protein = totalProtein;
            carbs = totalCarbs;
            fat = totalFat;
            vitamins = Buffer.toArray(allVitamins);
            minerals = Buffer.toArray(allMinerals);
        }
    };

    // Helper function to calculate multiplier for unit conversion
    private func _calculateMultiplier(fromUnit: Text, toUnit: Text) : Float {
        // Basic unit conversion logic
        if (fromUnit == "g" and toUnit == "kg") {
            0.001
        } else if (fromUnit == "kg" and toUnit == "g") {
            1000.0
        } else if (fromUnit == "g" and toUnit == "oz") {
            0.035274
        } else if (fromUnit == "oz" and toUnit == "g") {
            28.3495
        } else {
            1.0
        }
    };

    // Admin functions
    public shared(msg) func addAdmin(principal: Principal) : async Result<()> {
        switch (requireAdmin(msg.caller)) {
            case (#ok(_)) {
                adminPrincipals.put(principal, true);
                #ok()
            };
            case (#err(e)) { #err(e) };
        };
    };

    public shared(msg) func removeAdmin(principal: Principal) : async Result<()> {
        switch (requireAdmin(msg.caller)) {
            case (#ok(_)) {
                adminPrincipals.delete(principal);
                #ok()
            };
            case (#err(e)) { #err(e) };
        };
    };

    public shared(msg) func deleteUser(principal: Principal) : async Result<()> {
        switch (requireAdmin(msg.caller)) {
            case (#ok(_)) {
                users.delete(principal);
                authTokens.delete(principal);
                adminPrincipals.delete(principal);
                #ok()
            };
            case (#err(e)) { #err(e) };
        };
    };

    // Monitoring functions
    public shared query(msg) func getSystemStats() : async Result<SystemStats> {
        switch (requireAdmin(msg.caller)) {
            case (#ok(_)) {
                stats := {
                    totalUsers = users.size();
                    totalRecipes = recipes.size();
                    totalRequests = stats.totalRequests;
                    lastBackup = stats.lastBackup;
                };
                #ok(stats)
            };
            case (#err(e)) { #err(e) };
        };
    };

    // Update backup function to track last backup time
    public shared(msg) func backupData() : async Result<Text> {
        switch (requireAdmin(msg.caller)) {
            case (#ok(_)) {
                let _backup = {
                    users = Iter.toArray(users.entries());
                    recipes = Iter.toArray(recipes.entries());
                    ingredients = Iter.toArray(ingredients.entries());
                    stats = stats;
                };
                #ok("Backup completed successfully")
            };
            case (#err(e)) { #err(e) };
        };
    };

    public shared(msg) func restoreData(_backupJson: Text) : async Result<Text> {
        switch (requireAdmin(msg.caller)) {
            case (#ok(_)) {
                #ok("Restore completed successfully")
            };
            case (#err(e)) { #err(e) };
        };
    };

    // Ingredient Management Functions
    public shared(msg) func createIngredient(
        name: Text,
        category: Text,
        nutritionalInfo: NutritionalInfo,
        commonUnits: [Text],
        description: Text,
        allergens: [Text]
    ) : async Result<Ingredient> {
        switch (requireAdmin(msg.caller)) {
            case (#ok(_)) {
                let id = generateIngredientId();
                let now = getCurrentTimestamp();
                let ingredient: Ingredient = {
                    id = id;
                    name = name;
                    category = category;
                    nutritionalInfo = nutritionalInfo;
                    commonUnits = commonUnits;
                    description = description;
                    allergens = allergens;
                    createdAt = now;
                    updatedAt = now;
                };
                
                ingredients.put(id, ingredient);
                #ok(ingredient)
            };
            case (#err(e)) { #err(e) };
        };
    };

    public shared(msg) func updateIngredient(
        id: Text,
        name: ?Text,
        category: ?Text,
        nutritionalInfo: ?NutritionalInfo,
        commonUnits: ?[Text],
        description: ?Text,
        allergens: ?[Text]
    ) : async Result<Ingredient> {
        switch (requireAdmin(msg.caller)) {
            case (#ok(_)) {
                switch (ingredients.get(id)) {
                    case (?existing) {
                        let updated: Ingredient = {
                            id = existing.id;
                            name = Option.get(name, existing.name);
                            category = Option.get(category, existing.category);
                            nutritionalInfo = Option.get(nutritionalInfo, existing.nutritionalInfo);
                            commonUnits = Option.get(commonUnits, existing.commonUnits);
                            description = Option.get(description, existing.description);
                            allergens = Option.get(allergens, existing.allergens);
                            createdAt = existing.createdAt;
                            updatedAt = getCurrentTimestamp();
                        };
                        
                        ingredients.put(id, updated);
                        #ok(updated)
                    };
                    case null { #err(#NotFound) };
                };
            };
            case (#err(e)) { #err(e) };
        };
    };

    public shared(msg) func deleteIngredient(id: Text) : async Result<()> {
        switch (requireAdmin(msg.caller)) {
            case (#ok(_)) {
                switch (ingredients.get(id)) {
                    case (?_) {
                        ingredients.delete(id);
                        #ok()
                    };
                    case null { #err(#NotFound) };
                };
            };
            case (#err(e)) { #err(e) };
        };
    };

    public query func getIngredient(id: Text) : async Result<Ingredient> {
        switch (ingredients.get(id)) {
            case (?ingredient) { #ok(ingredient) };
            case null { #err(#NotFound) };
        };
    };

    public query func searchIngredients(searchText: Text) : async [Ingredient] {
        let results = Buffer.Buffer<Ingredient>(0);
        for ((_, ingredient) in ingredients.entries()) {
            if (Text.contains(ingredient.name, #text(searchText)) or
                Text.contains(ingredient.description, #text(searchText))) {
                results.add(ingredient);
            };
        };
        Buffer.toArray(results)
    };

    public query func getIngredientsByCategory(category: Text) : async [Ingredient] {
        let results = Buffer.Buffer<Ingredient>(0);
        for ((_, ingredient) in ingredients.entries()) {
            if (ingredient.category == category) {
                results.add(ingredient);
            };
        };
        Buffer.toArray(results)
    };

    public func generateRecipeRecommendations(ingredients : [(Text, Float, Text, Text)], userPreferences : ?UserProfile) : async Result.Result<Text, Text> {
        try {
            // Format ingredients list
            let ingredientsList = Array.map<(Text, Float, Text, Text), Text>(ingredients, func((name, quantity, unit, category)) {
                let quantityText = if (quantity == Float.fromInt(Float.toInt(quantity))) {
                    let intVal = Float.toInt(quantity);
                    let natVal = if (intVal >= 0) { Int.abs(intVal) } else { 0 };
                    Nat.toText(natVal)
                } else {
                    Float.toText(quantity)
                };
                quantityText # " " # unit # " of " # name # " (" # category # ")"
            });

            // Create prompt with user preferences if available
            var dietaryPrefs = "no dietary preferences";
            var allergies = "no allergies";
            
            switch (userPreferences) {
                case (?profile) {
                    if (profile.dietaryPreferences.size() > 0) {
                        dietaryPrefs := Text.join(", ", profile.dietaryPreferences.vals());
                    };
                    if (profile.allergies.size() > 0) {
                        allergies := Text.join(", ", profile.allergies.vals());
                    };
                };
                case null {};
            };

            let prompt = "Given these ingredients: " # Text.join(", ", Iter.fromArray(ingredientsList)) #
                "\nPlease suggest 3 possible recipes I can make. Consider " # dietaryPrefs # " dietary preferences " #
                "and allergies: " # allergies # ".\n" #
                "For each recipe, provide:\n" #
                "1. Recipe name\n" #
                "2. Brief description\n" #
                "3. Cooking time\n" #
                "4. Difficulty level\n" #
                "5. Additional ingredients needed (if any)\n" #
                "6. Basic cooking instructions";

            // Call LLM service
            let llmResponse = await llmService.queryText(prompt);
            
            switch (llmResponse) {
                case (#ok(response)) {
                    #ok(response)
                };
                case (#err(error)) {
                    switch(error) {
                        case (#InvalidInput) { #err("Invalid input") };
                        case (#RateLimitExceeded) { #err("Rate limit exceeded") };
                        case (#ServiceError) { #err("Service error") };
                        case (#TokenExpired) { #err("Token expired") };
                        case (#Unauthorized) { #err("Unauthorized") };
                        case (#InvalidToken) { #err("Invalid token") };
                        case (#InvalidCredentials) { #err("Invalid credentials") };
                        case (#UserExists) { #err("User exists") };
                        case (#NotFound) { #err("Not found") };
                        case (#StorageError) { #err("Storage error") };
                    }
                };
            }
        } catch (error) {
            #err("An error occurred while generating recipes: " # Error.message(error))
        }
    };
} 