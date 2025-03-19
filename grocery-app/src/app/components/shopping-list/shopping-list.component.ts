import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RecipeFirebaseService } from '../../services/recipe.firebase.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgFor, NgIf } from '@angular/common';
import { Recipe } from '../../models/recipe';
import { Amount } from '../../models/amount';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './shopping-list.component.html',
  styleUrl: './shopping-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingListComponent {
  public recipe$ = toSignal(inject(RecipeFirebaseService).getRecipes(), {
    initialValue: [],
  });

  selectedRecipes: Set<string> = new Set();
  showIngredients = false;
  combinedIngredients: { name: string; amount: Amount }[] = [];

  toggleRecipeSelection(recipeId: string): void {
    if (this.selectedRecipes.has(recipeId) === false) {
      this.selectedRecipes.add(recipeId);
    } else {
      this.selectedRecipes.delete(recipeId);
    }
  }

  generateShoppingList(): void {
    // Logic to combine ingredients from selected recipes
    this.combinedIngredients = this.combineIngredients();
    this.showIngredients = true;
  }

  goBack(): void {
    this.showIngredients = false;
  }

  private combineIngredients(): { name: string; amount: Amount }[] {
    const ingredientsMap: { [key: string]: Amount } = {};
    const selectedRecipes = this.getSelectedRecipes();
    selectedRecipes.forEach((recipe) => {
      recipe.items.forEach((ingredient) => {
        if (ingredientsMap[ingredient.name]) {
          //TODO: Add logic to combine ingredients
          ingredientsMap[ingredient.name] = ingredient.amount;
        } else {
          ingredientsMap[ingredient.name] = ingredient.amount;
        }
      });
    });
    return Object.keys(ingredientsMap).map((name) => ({
      name,
      amount: ingredientsMap[name],
    }));
  }

  private getSelectedRecipes(): Recipe[] {
    // Placeholder method to get selected recipes by IDs
    return this.recipe$().filter((recipe) =>
      this.selectedRecipes.has(recipe.id)
    );
  }
}
