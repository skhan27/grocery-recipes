import { Routes } from '@angular/router';
import { RecipeListComponent } from '../components/recipe-list/recipe-list.component';

export const routes: Routes = [
    {
        title: "Grocery",
        path: "",
        children: [
            {
                path: "list",
                title: "Recipe List",
                component: RecipeListComponent    
            }
        ],
    },
    { 
        path: "**",
        redirectTo: "list"
    }
];
