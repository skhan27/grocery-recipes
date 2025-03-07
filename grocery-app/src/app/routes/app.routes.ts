import { Routes } from '@angular/router';
import { RecipeListComponent } from '../components/recipe-list/recipe-list.component';
import { CreateRecipeComponent } from '../components/create-recipe/create-recipe.component';
import { RecipeDetailsComponent } from '../components/recipe-details/recipe-details.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    title: 'Recipe List',
    component: RecipeListComponent,
  },
  {
    path: 'create-recipe',
    title: 'Create Recipe',
    component: CreateRecipeComponent,
  },
  {
    path: 'recipe-details/:recipeId',
    component: RecipeDetailsComponent,
  },
  {
    path: '**',
    redirectTo: 'list',
  },
];
