import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RecipeFirebaseService } from '../../services/recipe.firebase.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgFor, NgIf } from '@angular/common';
import { Recipe } from '../../models/recipe';
import { Amount } from '../../models/amount';
import { ShoppingListService } from '../../services/shopping-list.service';
import { Subject, takeUntil } from 'rxjs';
import { ShoppingListIngredient } from '../../models/shopping-list';
import { debounceTime, switchMap } from 'rxjs';
import { IngredientListPipe } from '../../utils/ingredient-list.pipe';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [NgFor, NgIf, IngredientListPipe],
  templateUrl: './shopping-list.component.html',
  styleUrl: './shopping-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingListComponent implements OnDestroy, OnInit {
  public recipe$ = toSignal(inject(RecipeFirebaseService).getRecipes(), {
    initialValue: [],
  });

  selectedRecipes: Set<string> = new Set();
  showIngredients = signal(false);
  combinedIngredients: ShoppingListIngredient[] = [];
  shoppingList: string[] = [];
  isInitialized = signal(false);
  recipeScales: { [recipeId: string]: number } = {}; // Track scale for each recipe

  private shoppingListService = inject(ShoppingListService);
  private destroy$ = new Subject<void>();
  private ingredientOrderChange$ = new Subject<ShoppingListIngredient[]>(); // Subject to track order changes

  ngOnInit(): void {
    this.fetchShoppingList();

    // Debounce ingredient order changes and call the service
    this.ingredientOrderChange$
      .pipe(
        debounceTime(1000), // Wait for 1 second after the last change
        switchMap((updatedIngredients) =>
          this.shoppingListService.updateIngredientOrder({
            recipes: this.shoppingList,
            ingredients: updatedIngredients,
          })
        ),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleRecipeSelection(recipeId: string): void {
    if (this.selectedRecipes.has(recipeId)) {
      this.selectedRecipes.delete(recipeId);
    } else {
      this.selectedRecipes.add(recipeId);
      if (!this.recipeScales[recipeId]) {
        this.recipeScales[recipeId] = 1;
      }
    }
  }

  setRecipeScale(recipeId: string, scale: number): void {
    if (scale < 0.1) {scale = 0.1;}
    this.recipeScales[recipeId] = scale;
  }

  moveIngredientUp(index: number): void {
    if (index > 0) {
      const temp = this.combinedIngredients[index];
      this.combinedIngredients[index] = this.combinedIngredients[index - 1];
      this.combinedIngredients[index - 1] = temp;

      // Emit the updated order
      this.ingredientOrderChange$.next(this.combinedIngredients);
    }
  }

  moveIngredientDown(index: number): void {
    if (index < this.combinedIngredients.length - 1) {
      const temp = this.combinedIngredients[index];
      this.combinedIngredients[index] = this.combinedIngredients[index + 1];
      this.combinedIngredients[index + 1] = temp;

      // Emit the updated order
      this.ingredientOrderChange$.next(this.combinedIngredients);
    }
  }

  toggleIngredientChecked(ingredientName: string): void {
    const ingredient = this.combinedIngredients.find((i) => i.name === ingredientName);
    const checked = ingredient ? !ingredient.checked : false;
    this.shoppingListService.updateIngredient(ingredientName, checked).subscribe(() => {
      const ingredient = this.combinedIngredients.find((i) => i.name === ingredientName);
      if (ingredient) {
        ingredient.checked = checked;
      }
    });
  }

  generateShoppingList(): void {
    const selectedRecipeIds = Array.from(this.selectedRecipes);
    const combinedIngredients = this.combineIngredients();
    const ingredients = combinedIngredients.map((ingredient) => ({
      name: ingredient.name,
      amount: ingredient.amount,
      checked: false, // Default to unchecked when generating the list
    }));
    this.shoppingListService.saveShoppingList(selectedRecipeIds, ingredients).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.combinedIngredients = ingredients;
      this.recipeScales = {}; // Reset scales after generating the list
      this.showIngredients.set(true);
    });
  }

  clearShoppingList(): void {
    this.shoppingListService.clearShoppingList().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.shoppingList = [];
      this.selectedRecipes.clear();
      this.showIngredients.set(false);
    });
  }

  private fetchShoppingList(): void {
    this.shoppingListService.getShoppingList().pipe(takeUntil(this.destroy$)).subscribe((list) => {
      this.isInitialized.set(true);
      if (!list) {
        this.showIngredients.set(false);
      } else {
        this.showIngredients.set(true);
        this.shoppingList = list.recipes;
        this.selectedRecipes = new Set(this.shoppingList);
        this.combinedIngredients = list.ingredients;
        // Set default scales for loaded recipes
        this.shoppingList.forEach(id => {
          if (!this.recipeScales[id]) this.recipeScales[id] = 1;
        });
      }
    });
  }

  private combineIngredients(): ShoppingListIngredient[] {
    const ingredientsMap: { [key: string]: Amount[] } = {};
    const selectedRecipes = this.getSelectedRecipes();
    selectedRecipes.forEach((recipe) => {
      const scale = this.recipeScales[recipe.id] || 1;
      recipe.items.forEach((ingredient) => {
        // Scale the ingredient amount
        const scaledAmount = { ...ingredient.amount, amount: ingredient.amount.amount * scale };
        if (ingredientsMap[ingredient.name]) {
          // Combine ingredient amounts
          const existingAmountWithSameUnit = ingredientsMap[ingredient.name].find(
            (a) => a.unit === scaledAmount.unit
          );
          if (existingAmountWithSameUnit) {
            existingAmountWithSameUnit.amount = existingAmountWithSameUnit.amount + scaledAmount.amount;
          } else {
            ingredientsMap[ingredient.name].push(scaledAmount);
          }
        } else {
          ingredientsMap[ingredient.name] = [scaledAmount];
        }
      });
    });
    return Object.keys(ingredientsMap).map((name) => ({
      name,
      amount: ingredientsMap[name],
      checked: false, // Default to unchecked
    }));
  }

  private getSelectedRecipes(): Recipe[] {
    return this.recipe$().filter((recipe) =>
      this.selectedRecipes.has(recipe.id)
    );
  }
}
