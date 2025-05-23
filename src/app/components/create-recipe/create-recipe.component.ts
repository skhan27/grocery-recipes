import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Recipe } from '../../models/recipe';
import { RecipeFirebaseService } from '../../services/recipe.firebase.service';
import { RecipeFormComponent } from '../recipe-form/recipe-form.component';

@Component({
  selector: 'app-create-recipe',
  standalone: true,
  imports: [RecipeFormComponent],
  templateUrl: './create-recipe.component.html',
  styleUrls: ['./create-recipe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRecipeComponent {
  recipeFirebaseService = inject(RecipeFirebaseService);
  router = inject(Router);

  onSubmit(recipe: Recipe): void {
    this.recipeFirebaseService.addRecipe(recipe).subscribe(() => {
      this.router.navigate(['/list']);
    });
  }
}
