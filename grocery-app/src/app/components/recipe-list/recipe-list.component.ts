import { Component, inject, OnInit } from '@angular/core';
import { RecipeService } from '../../services/recipe.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.scss',
})
export class RecipeListComponent implements OnInit {
  public recipe$ = toSignal(inject(RecipeService).getRecipes(), {
    initialValue: [],
  });

  router = inject(Router);
  ngOnInit(): void {}

  viewRecipeDetails(recipeId: string): void {
    this.router.navigate(['/recipe-details', recipeId]);
  }
}
