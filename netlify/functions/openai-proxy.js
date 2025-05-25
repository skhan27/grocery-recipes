const { OpenAI } = require('openai');

const RATE_LIMIT = 5; // Max requests per minute
const requestCounts = {};

function isRateLimited(ip) {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute ago

    if (!requestCounts[ip]) {
        requestCounts[ip] = [];
    }

    // Filter out old requests
    requestCounts[ip] = requestCounts[ip].filter(timestamp => timestamp > windowStart);

    // Check if over limit
    if (requestCounts[ip].length >= RATE_LIMIT) {
        return true;
    }

    // Add current request
    requestCounts[ip].push(now);
    return false;
}

// Valid units enum
const VALID_UNITS = [
    'Cups',
    'Teaspoons',
    'Tablespoons',
    'Pinch',
    'Item',
    'Grams',
    'Kilograms',
    'Liters',
    'Milliliters'
];

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Create the system prompt for ingredient extraction
function createIngredientExtractionPrompt(recipeText) {
    return `You are a recipe ingredient extractor. Your task is to extract ONLY the ingredients from the given recipe text and return them in a specific JSON format.

IMPORTANT INSTRUCTIONS:
1. Extract only ingredients, not cooking instructions or methods
2. Convert all measurements to the closest appropriate unit from the allowed units
3. If no amount is specified, use amount: 1 and unit: "Item"
4. If amount is unclear, make your best estimate
5. Return ONLY valid JSON, no other text

ALLOWED UNITS (use exactly these strings):
- Cups
- Teaspoons
- Tablespoons
- Pinch
- Item
- Grams
- Kilograms
- Liters
- Milliliters

REQUIRED JSON FORMAT:
[
  {
    "name": "ingredient name",
    "amount": {
      "amount": number,
      "unit": "one of the allowed units"
    }
  }
]

CONVERSION GUIDELINES:
- 1 cup = 16 tablespoons = 48 teaspoons
- 1 tablespoon = 3 teaspoons
- 1 pound = 453.592 grams
- 1 ounce = 28.35 grams
- 1 quart = 4 cups
- 1 pint = 2 cups
- Use "Item" for whole items (eggs, onions, etc.)
- Use "Pinch" for very small amounts of spices

Recipe text to extract ingredients from:
${recipeText}

Return only the JSON array:`;
}

// Create the system prompt for full recipe extraction
function createRecipeExtractionPrompt(recipeText) {
    return `You are a recipe parser. Extract the following information from the recipe text and return it in JSON format:
1. Recipe name
2. Number of servings
3. List of ingredients with amounts
4. Cooking instructions as an array of steps
5. Additional notes (if any)

ALLOWED UNITS for ingredients (use exactly these strings):
${VALID_UNITS.join(', ')}

REQUIRED JSON FORMAT:
{
  "name": "Recipe Name",
  "servings": number,
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": {
        "amount": number,
        "unit": "one of the allowed units"
      }
    }
  ],
  "instructions": ["step 1", "step 2", ...],
  "notes": "additional notes" (optional)
}

Recipe text to parse:
${recipeText}

Return only the JSON object:`;
}

// Validate the response format
function validateIngredientsResponse(ingredients) {
    if (!Array.isArray(ingredients)) {
        throw new Error('Response must be an array');
    }

    return ingredients.map((ingredient, index) => {
        // Validate structure
        if (!ingredient.name || typeof ingredient.name !== 'string') {
            throw new Error(`Ingredient at index ${index} missing or invalid name`);
        }

        if (!ingredient.amount || typeof ingredient.amount !== 'object') {
            throw new Error(`Ingredient at index ${index} missing or invalid amount object`);
        }

        if (typeof ingredient.amount.amount !== 'number' || ingredient.amount.amount <= 0) {
            throw new Error(`Ingredient at index ${index} has invalid amount value`);
        }

        if (!VALID_UNITS.includes(ingredient.amount.unit)) {
            throw new Error(`Ingredient at index ${index} has invalid unit: ${ingredient.amount.unit}`);
        }

        // Return cleaned ingredient
        return {
            name: ingredient.name.trim(),
            amount: {
                amount: Number(ingredient.amount.amount),
                unit: ingredient.amount.unit
            }
        };
    });
}

// Validate the full recipe response
function validateFullRecipeResponse(recipe) {
    // Validate structure
    if (!recipe.name || typeof recipe.name !== 'string') {
        throw new Error('Missing or invalid recipe name');
    }

    if (typeof recipe.servings !== 'number' || recipe.servings <= 0) {
        throw new Error('Invalid number of servings');
    }

    if (!Array.isArray(recipe.ingredients)) {
        throw new Error('Ingredients must be an array');
    }

    if (!Array.isArray(recipe.instructions)) {
        throw new Error('Instructions must be an array');
    }

    // Validate each ingredient
    recipe.ingredients.forEach((ingredient, index) => {
        if (!ingredient.name || typeof ingredient.name !== 'string') {
            throw new Error(`Ingredient at index ${index} missing or invalid name`);
        }

        if (!ingredient.amount || typeof ingredient.amount !== 'object') {
            throw new Error(`Ingredient at index ${index} missing or invalid amount object`);
        }

        if (typeof ingredient.amount.amount !== 'number' || ingredient.amount.amount <= 0) {
            throw new Error(`Ingredient at index ${index} has invalid amount value`);
        }

        if (!VALID_UNITS.includes(ingredient.amount.unit)) {
            throw new Error(`Ingredient at index ${index} has invalid unit: ${ingredient.amount.unit}`);
        }
    });

    // Return cleaned recipe
    return {
        name: recipe.name.trim(),
        servings: recipe.servings,
        ingredients: recipe.ingredients.map(ingredient => ({
            name: ingredient.name.trim(),
            amount: {
                amount: Number(ingredient.amount.amount),
                unit: ingredient.amount.unit
            }
        })),
        instructions: recipe.instructions.map(step => step.trim()),
        notes: recipe.notes ? recipe.notes.trim() : undefined
    };
}

exports.handler = async function (event, context) {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // Parse request body
        const body = JSON.parse(event.body);
        const { recipeText } = body;

        // Validate input
        if (!recipeText || typeof recipeText !== 'string' || recipeText.trim().length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Recipe text is required and must be a non-empty string'
                })
            };
        }

        // Check if recipe text is too long (OpenAI has token limits)
        if (recipeText.length > 8000) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Recipe text is too long. Please provide a shorter recipe.'
                })
            };
        }

        const clientIP = event.headers['client-ip'] || event.headers['x-forwarded-for'];
        if (isRateLimited(clientIP)) {
            return {
                statusCode: 429,
                body: JSON.stringify({ error: "Too many requests" })
            };
        }

        // Create the prompt
        const prompt = createRecipeExtractionPrompt(recipeText);

        // Make request to OpenAI
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Using gpt-4o-mini as it's more cost-effective for structured tasks
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0, // Low temperature for consistent, structured output
            max_tokens: 2000,
            response_format: { type: "json_object" } // Ensure JSON response
        });

        const aiResponse = response.choices[0].message.content;
        console.log('OpenAI response:', aiResponse);

        // Parse the AI response
        let extractedRecipe;
        try {
            extractedRecipe = JSON.parse(aiResponse);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', parseError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: 'Failed to parse recipe from AI response',
                    details: 'The AI returned invalid JSON format'
                })
            };
        }

        // Validate and clean the response
        const validatedRecipe = validateFullRecipeResponse(extractedRecipe);

        // Return successful response
        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                recipe: validatedRecipe
            })
        };

    } catch (error) {
        console.error('Error processing recipe:', error);

        // Handle specific OpenAI errors
        if (error.code === 'insufficient_quota') {
            return {
                statusCode: 503,
                headers,
                body: JSON.stringify({
                    error: 'Service temporarily unavailable due to quota limits'
                })
            };
        }

        if (error.code === 'rate_limit_exceeded') {
            return {
                statusCode: 429,
                headers: {
                    ...headers,
                    'Retry-After': '60'
                },
                body: JSON.stringify({
                    error: 'Rate limit exceeded. Please try again in a minute.'
                })
            };
        }

        // Generic error response
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};