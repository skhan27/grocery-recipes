import { Component, inject, OnInit } from '@angular/core';
import { RecipeService } from '../../services/recipe.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { RecipeFirebaseService } from '../../services/recipe.firebase.service';

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

  router = inject(Router);
  ngOnInit(): void {}

  viewRecipeDetails(recipeId: string): void {
    this.router.navigate(['/recipe-details', recipeId]);
  }
}
