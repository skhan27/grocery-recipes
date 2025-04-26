import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RecipeFirebaseService } from '../../services/recipe.firebase.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgFor, NgIf } from '@angular/common';
import { Recipe } from '../../models/recipe';
import { Amount } from '../../models/amount';
import { ShoppingListService } from '../../services/shopping-list.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './shopping-list.component.html',
  styleUrl: './shopping-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingListComponent implements OnDestroy, OnInit {
  public recipe$ = toSignal(inject(RecipeFirebaseService).getRecipes(), {
    initialValue: [],
  });

  selectedRecipes: Set<string> = new Set();
  showIngredients = false;
  combinedIngredients: { name: string; amount: Amount }[] = [];
  shoppingList: string[] = [];

  private shoppingListService = inject(ShoppingListService);

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.fetchShoppingList();
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
    }
  }

  generateShoppingList(): void {
    const selectedRecipeIds = Array.from(this.selectedRecipes);
    this.shoppingListService.saveShoppingList(selectedRecipeIds).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.combinedIngredients = this.combineIngredients();
      this.showIngredients = true;
    });
  }

  clearShoppingList(): void {
    this.shoppingListService.clearShoppingList().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.shoppingList = [];
      this.selectedRecipes.clear();
      this.showIngredients = false;
    });
  }

  private fetchShoppingList(): void {
    this.shoppingListService.getShoppingList().pipe(takeUntil(this.destroy$)).subscribe((list) => {
      this.shoppingList = list;
      this.selectedRecipes = new Set(list);
    });
  }

  private combineIngredients(): { name: string; amount: Amount }[] {
    const ingredientsMap: { [key: string]: Amount } = {};
    const selectedRecipes = this.getSelectedRecipes();
    selectedRecipes.forEach((recipe) => {
      recipe.items.forEach((ingredient) => {
        if (ingredientsMap[ingredient.name]) {
          // Combine ingredient amounts
          ingredientsMap[ingredient.name] = ingredient.amount;
        } else {
          ingredientsMap[ingredient.name] = { ...ingredient.amount };
        }
      });
    });
    return Object.keys(ingredientsMap).map((name) => ({
      name,
      amount: ingredientsMap[name],
    }));
  }

  private getSelectedRecipes(): Recipe[] {
    return this.recipe$().filter((recipe) =>
      this.selectedRecipes.has(recipe.id)
    );
  }
}
