import { RedirectCommand, ResolveFn, Router, Routes } from '@angular/router';
import { RecipeListComponent } from '../components/recipe-list/recipe-list.component';
import { CreateRecipeComponent } from '../components/create-recipe/create-recipe.component';
import { RecipeDetailsComponent } from '../components/recipe-details/recipe-details.component';
import { LoginComponent } from '../components/login/login.component';
import { RegisterComponent } from '../components/register/register.component';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';
import { ShoppingListComponent } from '../components/shopping-list/shopping-list.component';

const AuthGuard: ResolveFn<boolean> = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isLoggedIn().pipe(
    map((isLoggedIn) => {
      if (isLoggedIn) {
        return true;
      }
      return new RedirectCommand(router.parseUrl('/login'));
    })
  );
};

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
    canActivate: [AuthGuard],
  },
  {
    path: 'create-recipe',
    title: 'Create Recipe',
    component: CreateRecipeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'recipe-details/:recipeId',
    component: RecipeDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'shopping-list',
    component: ShoppingListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    title: 'Login',
    component: LoginComponent,
  },
  {
    path: 'register',
    title: 'Register',
    component: RegisterComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
