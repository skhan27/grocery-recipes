import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { RecipeFirebaseService } from '../../services/recipe.firebase.service';
import { Recipe } from '../../models/recipe';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.scss',
})
export class RecipeListComponent implements OnInit {
  public recipe$ = toSignal(inject(RecipeFirebaseService).getRecipes(), {
    initialValue: [],
  });


  allColumns: (keyof Recipe)[] = ['name', 'tags', 'rating', 'notes', 'instructions', 'servings', 'prepTime', 'cookTime'];
  enabledColumns: string[] = ['name', 'tags', 'rating']; // Default enabled columns
  menuExpanded: boolean = false;
  router = inject(Router);
  
  ngOnInit(): void {}
  
  toggleMenu() {
    this.menuExpanded = !this.menuExpanded;
  }

  toggleColumn(column: string) {
    const index = this.enabledColumns.indexOf(column);
    if (index === -1) {
      this.enabledColumns.push(column);
    } else {
      this.enabledColumns.splice(index, 1);
    }
  }

  viewRecipeDetails(recipeId: string): void {
    this.router.navigate(['/recipe-details', recipeId]);
  }
}
