import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Recipe } from '../models/recipe';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private recipes$ = new BehaviorSubject<Recipe[]>([]);
  constructor() {}

  createRecipe(recipe: Recipe): void {
    const recipes = this.recipes$.getValue();
    recipes.push(recipe);
    this.recipes$.next(recipes);
  }

  getRecipes(): Observable<Recipe[]> {
    return this.recipes$.asObservable();
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
