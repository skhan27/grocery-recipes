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

@Component({
  selector: 'recipe-details',
  standalone: true,
  imports: [NgIf, AsyncPipe, NgFor],
  templateUrl: './recipe-details.component.html',
  styleUrl: './recipe-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeDetailsComponent implements OnInit {
  @Input() recipeId: string;
  recipeService = inject(RecipeService);
  recipeFirebaseService = inject(RecipeFirebaseService);
  recipe$: Observable<Recipe>;
  ngOnInit() {
    this.recipe$ = this.recipeFirebaseService.getRecipeById(this.recipeId);
  }
}
