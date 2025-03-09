import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  Firestore,
  getDoc,
} from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { Recipe } from '../models/recipe';

@Injectable({
  providedIn: 'root',
})
export class RecipeFirebaseService {
  firestore = inject(Firestore);
  recipeCollection = collection(this.firestore, 'recipes');

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
}
