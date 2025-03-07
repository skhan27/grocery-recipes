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
  recipe$: Observable<Recipe>;
  ngOnInit() {
    this.recipe$ = this.recipeService.getRecipe(this.recipeId);
  }
}
