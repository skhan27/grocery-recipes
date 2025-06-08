import { inject, Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { RecipeFirebaseService } from './recipe.firebase.service';
import { UserService } from './user.service';
import { Observable, forkJoin, from, of, switchMap, take } from 'rxjs';
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

    private shoppingListCache: ShoppingList | null = null;

    constructor() {
        // Clear cache on logout
        this.userService.user$.subscribe(user => {
            if (!user) {
                this.shoppingListCache = null;
            }
        });
    }

    getShoppingList(): Observable<ShoppingList | null> {
        if (this.shoppingListCache) {
            return of(this.shoppingListCache);
        }
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
                            const data = docSnap.data() as ShoppingList;
                            this.shoppingListCache = data;
                            return of(data);
                        } else {
                            this.shoppingListCache = { recipes: [], ingredients: [] };
                            return of(null);
                        }
                    })
                );
            })
        );
    }

    clearShoppingList(): Observable<void> {
        this.shoppingListCache = null;
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
        // Update cache
        this.shoppingListCache = { recipes, ingredients };
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

                // Update cache if available
                if (this.shoppingListCache) {
                    const ingredient = this.shoppingListCache.ingredients.find((i) => i.name === ingredientName);
                    if (ingredient) {
                        ingredient.checked = checked;
                    }
                }

                // Use updateDoc to update only the checked field of the ingredient
                // Firestore doesn't support updating array elements by value, so we need to update the whole array
                // But we can avoid reading the doc again
                const updatedIngredients = this.shoppingListCache
                    ? this.shoppingListCache.ingredients
                    : undefined;

                if (!updatedIngredients) {
                    // fallback to old behavior if cache is not available
                    return from(getDoc(shoppingListDoc)).pipe(
                        switchMap((docSnap) => {
                            if (docSnap.exists()) {
                                const shoppingList = docSnap.data() as ShoppingList;
                                const ingredient = shoppingList.ingredients.find((i) => i.name === ingredientName);
                                if (ingredient) {
                                    ingredient.checked = checked;
                                }
                                this.shoppingListCache = shoppingList;
                                return from(setDoc(shoppingListDoc, shoppingList));
                            } else {
                                throw new Error('Shopping list not found');
                            }
                        })
                    );
                }

                return from(updateDoc(shoppingListDoc, { ingredients: updatedIngredients }));
            })
        );
    }

    updateIngredientOrder(orderedShoppingList: ShoppingList): Observable<void> {
        return this.userService.user$.pipe(
            take(1),
            switchMap((user) => {
                if (!user) {
                    throw new Error('User not logged in');
                }
                const householdId = user.householdId || user.uid;
                const shoppingListDoc = doc(this.shoppingListCollection, householdId);

                // Update cache if available
                if (this.shoppingListCache) {
                    this.shoppingListCache.ingredients = [...orderedShoppingList.ingredients];
                }

                // No need to read the doc, just update the ingredients array
                return from(updateDoc(shoppingListDoc, { ingredients: orderedShoppingList.ingredients }));
            })
        );
    }
}