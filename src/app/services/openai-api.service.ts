import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { RecipeItem } from '../models/recipe-item';


export interface RecipeExtractionRequest {
    recipeText: string;
}

export interface RecipeExtractionResponse {
    success: boolean;
    recipe: {
        name: string;
        ingredients: RecipeItem[];
        servings: number;
        instructions: string[];
        notes?: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class OpenAiService {
    private apiUrl = environment.apiUrl + '/openai-proxy';

    httpClient = inject(HttpClient);

    generateCompletion(prompt: string): Observable<any> {
        return this.httpClient.post(this.apiUrl, { prompt });
    }

    /**
   * Extract ingredients from recipe text using OpenAI
   * @param recipeText The raw recipe text to extract ingredients from
   * @returns Observable<RecipeItem[]> Array of extracted ingredients
   */
    extractIngredients(recipeText: string): Observable<RecipeItem[]> {
        // Validate input
        if (!recipeText || recipeText.trim().length === 0) {
            return throwError(() => new Error('Recipe text cannot be empty'));
        }

        if (recipeText.length > 8000) {
            return throwError(() => new Error('Recipe text is too long. Please provide a shorter recipe.'));
        }

        const request: RecipeExtractionRequest = {
            recipeText: recipeText.trim()
        };

        return this.httpClient.post<RecipeExtractionResponse>(this.apiUrl, request)
            .pipe(
                map(response => {
                    if (!response.success || !response.recipe || !response.recipe.ingredients) {
                        throw new Error('Invalid response format from server');
                    }
                    return response.recipe.ingredients;
                }),
                catchError(this.handleError)
            );
    }

    /**
     * Extract full recipe details from recipe text using OpenAI
     * @param recipeText The raw recipe text to extract the recipe from
     * @returns Observable<RecipeExtractionResponse> The extracted recipe details
     */
    extractRecipe(recipeText: string): Observable<RecipeExtractionResponse> {
        if (!recipeText || recipeText.trim().length === 0) {
            return throwError(() => new Error('Recipe text cannot be empty'));
        }

        if (recipeText.length > 8000) {
            return throwError(() => new Error('Recipe text is too long. Please provide a shorter recipe.'));
        }

        const request: RecipeExtractionRequest = {
            recipeText: recipeText.trim()
        };

        return this.httpClient.post<RecipeExtractionResponse>(this.apiUrl, request)
            .pipe(
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unexpected error occurred';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Client Error: ${error.error.message}`;
        } else {
            // Server-side error
            switch (error.status) {
                case 400:
                    errorMessage = error.error?.error || 'Invalid recipe text provided';
                    break;
                case 429:
                    errorMessage = 'Too many requests. Please try again later.';
                    break;
                case 500:
                    errorMessage = error.error?.error || 'Server error occurred while processing recipe';
                    break;
                case 503:
                    errorMessage = 'Service temporarily unavailable. Please try again later.';
                    break;
                default:
                    errorMessage = `Server Error: ${error.status} - ${error.error?.error || error.message}`;
            }
        }

        console.error('Recipe extraction error:', error);
        return throwError(() => new Error(errorMessage));
    }
}