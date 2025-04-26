import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  query,
  where,
  updateDoc,
} from '@angular/fire/firestore';
import { from, Observable, of, switchMap, take } from 'rxjs';
import { Recipe } from '../models/recipe';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class RecipeFirebaseService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  recipeCollection = collection(this.firestore, 'recipes');
  userCollection = collection(this.firestore, 'users');
  householdCollection = collection(this.firestore, 'households');

  getRecipeById(id: string): Observable<Recipe> {
    return from(
      getDoc(doc(this.firestore, `recipes/${id}`)).then((val) => ({
        ...val.data(),
        id: val.id,
      }))
    ) as Observable<Recipe>;
  }

  addRecipe(recipe: Recipe): Observable<string> {
    return this.userService.user$.pipe(take(1), switchMap(user => {
      const userData = {
        createdBy: user?.uid,
        householdId: user?.householdId ?? null,
      }
      const promise = addDoc(this.recipeCollection, { ...recipe, ...userData }).then(
        (res) => res.id
      );
      return from(promise);
    }))
  }



  public getRecipes(): Observable<Recipe[]> {
    return this.userService.user$.pipe(
      switchMap((user) => {
        if (!user) {
          throw new Error('User not logged in');
        }
        let recipesQuery;
        if (user.householdId) {
          recipesQuery = query(
            this.recipeCollection,
            where('householdId', '==', user.householdId)
          );
        } else {
          recipesQuery = query(
            this.recipeCollection,
            where('createdBy', '==', user.uid)
          );
        }
        return (collectionData(recipesQuery, { idField: 'id' }) as Observable<Recipe[]>).pipe(take(1));
      }));
  }


  //TODO: Update doesnt work due to no doc error for some reason. Also need to test out the update of user data.
  updateRecipe(recipe: Recipe): Observable<void> {
    return this.userService.user$.pipe(take(1), switchMap(user => {
      const userData = {
        createdBy: user?.uid,
        householdId: user?.householdId ?? null,
      }
      const docRef = doc(this.firestore, `recipes/${recipe.id}`);
      return from(
        updateDoc(docRef, {
          items: recipe.items,
          name: recipe.name,
          notes: recipe.notes,
          instructions: recipe.instructions,
          servings: recipe.servings,
          rating: recipe.rating,
          tags: recipe.tags,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          createdBy: recipe.createdBy,
          householdId: recipe.householdId,
        })
      );
    }));

  }

  deleteRecipe(id: string): Observable<void> {
    const docRef = doc(this.firestore, `recipes/${id}`);
    return from(deleteDoc(docRef));
  }

  incrementRecipeUsage(recipeId: string): Promise<void> {
    const recipeDoc = doc(this.recipeCollection, recipeId);
    return getDoc(recipeDoc).then((docSnap) => {
      if (docSnap.exists()) {
        const currentCount = docSnap.data()['numOfTimesAddedToShoppingList'] || 0;
        return updateDoc(recipeDoc, {
          numOfTimesAddedToShoppingList: currentCount + 1,
        });
      } else {
        throw new Error('Recipe not found');
      }
    });
  }
}
