import Text "mo:base/Text";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import Error "mo:base/Error";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Int "mo:base/Int";

actor LLMService {
    // Types
    public type Error = {
        #InvalidInput;
        #ServiceError;
        #RateLimitExceeded;
    };

    public type Result<T> = Result.Result<T, Error>;

    // Configuration
    private let MAX_TOKENS = 1000;
    private let TEMPERATURE = 0.7;
    private let TOP_P = 0.9;
    private let MAX_REQUESTS_PER_MINUTE = 60;

    // Rate limiting
    private type RateLimit = {
        count: Nat;
        timestamp: Nat;
    };

    private let rateLimits = HashMap.HashMap<Principal, RateLimit>(0, Principal.equal, Principal.hash);

    // Helper functions
    private func getCurrentTimestamp() : Nat {
        Int.abs(Time.now())
    };

    private func checkRateLimit(principal: Principal) : Bool {
        let now = getCurrentTimestamp();
        switch (rateLimits.get(principal)) {
            case (?limit) {
                if (now - limit.timestamp > 60) {
                    rateLimits.put(principal, { count = 1; timestamp = now });
                    true
                } else if (limit.count >= MAX_REQUESTS_PER_MINUTE) {
                    false
                } else {
                    rateLimits.put(principal, { count = limit.count + 1; timestamp = limit.timestamp });
                    true
                }
            };
            case null {
                rateLimits.put(principal, { count = 1; timestamp = now });
                true
            };
        };
    };

    private func validateInput(prompt: Text) : Bool {
        prompt.size() > 0 and prompt.size() <= MAX_TOKENS
    };

    private func formatPrompt(prompt: Text) : Text {
        "You are a helpful AI assistant specializing in nutrition and cooking. " #
        "Please provide detailed, accurate, and helpful responses. " #
        "Here is the user's request: " # prompt
    };

    // Main query function
    public shared(msg) func queryText(prompt: Text) : async Result<Text> {
        if (not checkRateLimit(msg.caller)) {
            return #err(#RateLimitExceeded);
        };

        if (not validateInput(prompt)) {
            return #err(#InvalidInput);
        };

        let formattedPrompt = formatPrompt(prompt);
        
        // Here we would integrate with a real LLM API
        // For now, we'll return a mock response
        let mockResponse = generateMockResponse(formattedPrompt);
        
        #ok(mockResponse)
    };

    // Mock response generation for testing
    private func generateMockResponse(prompt: Text) : Text {
        if (Text.contains(prompt, #text("recipe"))) {
            "Here's a recipe based on your ingredients:\n\n" #
            "1. First, gather all ingredients\n" #
            "2. Follow the cooking instructions\n" #
            "3. Serve and enjoy!\n\n" #
            "Nutritional Information:\n" #
            "- Calories: 500\n" #
            "- Protein: 30g\n" #
            "- Carbs: 45g\n" #
            "- Fat: 20g"
        } else if (Text.contains(prompt, #text("nutrition"))) {
            "Here are some nutritional recommendations:\n\n" #
            "1. Eat a balanced diet\n" #
            "2. Include plenty of vegetables\n" #
            "3. Stay hydrated\n" #
            "4. Watch portion sizes"
        } else {
            "I understand your request. Here's a helpful response based on your input."
        }
    };

    // Health check endpoint
    public shared(msg) func healthCheck() : async Bool {
        true
    };
} 