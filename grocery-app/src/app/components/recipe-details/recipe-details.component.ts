import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { Observable } from 'rxjs';
import { Recipe } from '../../models/recipe';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { RecipeFirebaseService } from '../../services/recipe.firebase.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'recipe-details',
  standalone: true,
  imports: [NgIf, AsyncPipe, NgFor, ReactiveFormsModule],
  templateUrl: './recipe-details.component.html',
  styleUrl: './recipe-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeDetailsComponent implements OnInit {
  @Input() recipeId: string;
  recipeFirebaseService = inject(RecipeFirebaseService);
  recipe$: Observable<Recipe>;
  scaleControl = new FormControl(1);
  ngOnInit() {
    this.recipe$ = this.recipeFirebaseService.getRecipeById(this.recipeId);
  }
}
