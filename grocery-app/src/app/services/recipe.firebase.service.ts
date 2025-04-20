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
import { from, Observable, of } from 'rxjs';
import { Recipe } from '../models/recipe';

@Injectable({
  providedIn: 'root',
})
export class RecipeFirebaseService {
  firestore = inject(Firestore);
  recipeCollection = collection(this.firestore, 'recipes');
  userCollection = collection(this.firestore, 'users');
  householdCollection = collection(this.firestore, 'households');

  getRecipes(): Observable<Recipe[]> {
    return collectionData(this.recipeCollection, {
      idField: 'id',
    }) as Observable<Recipe[]>;
  }

  getRecipeById(id: string): Observable<Recipe> {
    return from(
      getDoc(doc(this.firestore, `recipes/${id}`)).then((val) => ({
        ...val.data(),
        id: val.id,
      }))
    ) as Observable<Recipe>;
  }

  addRecipe(recipe: Recipe): Observable<string> {
    const promise = addDoc(this.recipeCollection, { ...recipe }).then(
      (res) => res.id
    );
    return from(promise);
  }

  /***********TO TEST */

  // getRecipesForUser(userId: string): Observable<Recipe[]> {
  //   return from(
  //     this.getUserHouseholdId(userId).then((householdId) => {
  //       const recipesQuery = householdId
  //         ? query(
  //             this.recipeCollection,
  //             where('householdId', '==', householdId)
  //           )
  //         : query(this.recipeCollection, where('createdBy', '==', userId));
  //       return collectionData(recipesQuery, { idField: 'id' }) as Observable<Recipe[]>;
  //     })
  //   );
  // }

  // private async getUserHouseholdId(userId: string): Promise<string | null> {
  //   const userDoc = doc(this.firestore, `users/${userId}`);
  //   const userSnapshot = await getDoc(userDoc);
  //   return userSnapshot.exists() ? userSnapshot.data()['householdId'] : null;
  // }
  //TODO: Update doesnt work due to no doc error for some reason.
  updateRecipe(recipe: Recipe): Observable<void> {
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
      })
    );
  }

  deleteRecipe(id: string): Observable<void> {
    const docRef = doc(this.firestore, `recipes/${id}`);
    return from(deleteDoc(docRef));
  }
}
