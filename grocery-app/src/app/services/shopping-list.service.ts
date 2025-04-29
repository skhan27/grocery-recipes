import { inject, Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, deleteDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { RecipeFirebaseService } from './recipe.firebase.service';
import { UserService } from './user.service';
import { Observable, forkJoin, from, switchMap, take } from 'rxjs';
import { ShoppingList, ShoppingListIngredient } from '../models/shopping-list';

@Injectable({
    providedIn: 'root',
})
export class ShoppingListService {
    private firestore = inject(Firestore);
    private auth = inject(Auth);
    private recipeService = inject(RecipeFirebaseService);
    private userService = inject(UserService);

    private shoppingListCollection = collection(this.firestore, 'shoppingLists');

    getShoppingList(): Observable<string[]> {
        return this.userService.user$.pipe(
            take(1),
            switchMap((user) => {
                if (!user) {
                    throw new Error('User not logged in');
                }
                const householdId = user.householdId || user.uid;
                const shoppingListDoc = doc(this.shoppingListCollection, householdId);
                return from(getDoc(shoppingListDoc)).pipe(
                    switchMap((docSnap) => {
                        if (docSnap.exists()) {
                            return [docSnap.data()['recipes'] as string[]];
                        } else {
                            return [[]];
                        }
                    })
                );
            })
        );
    }

    clearShoppingList(): Observable<void> {
        return this.userService.user$.pipe(
            take(1),
            switchMap((user) => {
                if (!user) {
                    throw new Error('User not logged in');
                }
                const householdId = user.householdId || user.uid;
                const shoppingListDoc = doc(this.shoppingListCollection, householdId);
                return from(deleteDoc(shoppingListDoc));
            })
        );
    }

    private updateRecipesUsage(recipeIds: string[]): Observable<void[]> {
        return forkJoin(
            recipeIds.map((recipeId) =>
                from(this.recipeService.incrementRecipeUsage(recipeId))
            ));
    }

    saveShoppingList(recipes: string[], ingredients: ShoppingListIngredient[]): Observable<void[]> {
        return this.userService.user$.pipe(
            take(1),
            switchMap((user) => {
                if (!user) {
                    throw new Error('User not logged in');
                }
                const householdId = user.householdId || user.uid; // Use householdId if available, otherwise userId
                const shoppingListDoc = doc(this.shoppingListCollection, householdId);
                return from(setDoc(shoppingListDoc, { recipes, ingredients }));
            }),
            switchMap(() => {
                return this.updateRecipesUsage(recipes);
            }),
        );
    }

    updateIngredient(ingredientName: string, checked: boolean): Observable<void> {
        return this.userService.user$.pipe(
            take(1),
            switchMap((user) => {
                if (!user) {
                    throw new Error('User not logged in');
                }
                const householdId = user.householdId || user.uid;
                const shoppingListDoc = doc(this.shoppingListCollection, householdId);
                return from(getDoc(shoppingListDoc)).pipe(
                    switchMap((docSnap) => {
                        if (docSnap.exists()) {
                            const shoppingList = docSnap.data() as ShoppingList;
                            const ingredient = shoppingList.ingredients.find((i) => i.name === ingredientName);
                            if (ingredient) {
                                ingredient.checked = checked;
                            }
                            return from(setDoc(shoppingListDoc, shoppingList));
                        } else {
                            throw new Error('Shopping list not found');
                        }
                    })
                );
            })
        );
    }
}