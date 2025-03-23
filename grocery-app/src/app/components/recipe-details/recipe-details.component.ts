import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { RecipeService } from '../../services/recipe.service';
import { Observable } from 'rxjs';
import { Recipe } from '../../models/recipe';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { RecipeFirebaseService } from '../../services/recipe.firebase.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RecipeFormComponent } from '../recipe-form/recipe-form.component';
import { Router } from '@angular/router';

@Component({
  selector: 'recipe-details',
  standalone: true,
  imports: [NgIf, AsyncPipe, NgFor, ReactiveFormsModule, RecipeFormComponent],
  templateUrl: './recipe-details.component.html',
  styleUrl: './recipe-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeDetailsComponent implements OnInit {
  @Input() recipeId: string;
  recipeService = inject(RecipeService);
  recipeFirebaseService = inject(RecipeFirebaseService);
  recipe$: Observable<Recipe>;
  scaleControl = new FormControl(1);
  editMode = false;
  router = inject(Router);

  ngOnInit() {
    this.recipe$ = this.recipeFirebaseService.getRecipeById(this.recipeId);
  }

  onSave(recipe: Recipe): void {
    this.recipeFirebaseService.updateRecipe(recipe).subscribe(() => {
      this.editMode = false;
    });
  }

  onDelete(): void {
    this.recipeFirebaseService.deleteRecipe(this.recipeId).subscribe(() => {
      this.router.navigate(['/list']);
    });
  }
}
