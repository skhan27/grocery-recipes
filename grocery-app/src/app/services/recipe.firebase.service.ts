import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  Firestore,
  getDoc,
  query,
  where,
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
      getDoc(doc(this.firestore, `recipes/${id}`)).then((val) => val.data())
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
}
