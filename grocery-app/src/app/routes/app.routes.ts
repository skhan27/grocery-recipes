import { RedirectCommand, ResolveFn, Router, Routes } from '@angular/router';
import { RecipeListComponent } from '../components/recipe-list/recipe-list.component';
import { LoginComponent } from '../components/login/login.component';
import { RegisterComponent } from '../components/register/register.component';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';
import { AccountSettingsComponent } from '../components/account-settings/account-settings.component';

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
    loadComponent: () =>
      import('../components/create-recipe/create-recipe.component').then(m => m.CreateRecipeComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'recipe-details/:recipeId',
    loadComponent: () =>
      import('../components/recipe-details/recipe-details.component').then(m => m.RecipeDetailsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'shopping-list',
    loadComponent: () =>
      import('../components/shopping-list/shopping-list.component').then(m => m.ShoppingListComponent),
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
    path: 'account-settings',
    title: 'Account Settings',
    component: AccountSettingsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
