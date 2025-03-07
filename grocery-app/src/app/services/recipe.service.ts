import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Recipe } from '../models/recipe';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private recipes$ = new BehaviorSubject<Recipe[]>([]);
  constructor() {}

  createRecipe(recipe: Recipe): Observable<Recipe> {
    const recipes = this.recipes$.getValue();
    recipes.push(recipe);
    this.recipes$.next(recipes);
    return of(recipe);
  }

  getRecipes(): Observable<Recipe[]> {
    return this.recipes$.asObservable();
  }

  getRecipe(id: string): Observable<Recipe> {
    const val = this.recipes$.getValue().find((recipe) => recipe.id === id);
    if (!val) {
      throw new Error(`Recipe with id ${id} not found`);
    }
    return of(val);
  }

  deleteRecipe(index: number): void {
    const recipes = this.recipes$.getValue();
    recipes.splice(index, 1);
    this.recipes$.next(recipes);
  }

  updateRecipe(index: number, recipe: Recipe): void {
    const recipes = this.recipes$.getValue();
    recipes[index] = recipe;
    this.recipes$.next(recipes);
  }
}
