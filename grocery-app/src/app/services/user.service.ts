import { inject, Injectable } from "@angular/core";
import { User } from "../models/user";
import { from, Observable, of, shareReplay, switchMap, take, throwError } from "rxjs";
import { addDoc, collection, collectionData, doc, Firestore, query, updateDoc, where, writeBatch } from "@angular/fire/firestore";
import { uuidv7 } from "uuidv7";
import { AuthService } from "./auth.service";
import { toObservable } from "@angular/core/rxjs-interop";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private firestore = inject(Firestore);
    private authService = inject(AuthService);
    private userCollection = collection(this.firestore, 'users');
    public readonly user$: Observable<User | null>;
    constructor() {
        this.user$ = toObservable(this.authService.userCredential$).pipe(
            switchMap((val) => {
                if (val) {
                    const user = val.user;
                    const userQuery = query(
                        this.userCollection,
                        where('uid', '==', user.uid)
                    )
                    return collectionData(userQuery).pipe(switchMap((doc) => {
                        if (doc.length > 0) {
                            return of(doc[0] as User);
                        } else {
                            return addDoc(this.userCollection, {
                                email: user.email,
                                username: user.displayName,
                                uid: user.uid,
                                householdId: null,
                            }).then(() => ({
                                email: user.email,
                                username: user.displayName,
                                uid: user.uid,
                                householdId: null,
                            }));
                        }
                    }));
                } else {
                    return of(null);
                }
            }), shareReplay(1));
    }

    private updateUserAndMigrateRecipes(user: User, householdId: string): Observable<unknown> {
        const userQuery = query(this.userCollection, where('uid', '==', user.uid));
        return collectionData(userQuery, { idField: 'id' }).pipe(
            take(1),
            switchMap((results) => {
                if (results.length > 0) {
                    const docRef = doc(this.firestore, `users/${results[0].id}`);
                    return from(updateDoc(docRef, { householdId })).pipe(
                        switchMap(() => {
                            // Query all recipes created by the user
                            const recipesQuery = query(
                                collection(this.firestore, 'recipes'),
                                where('createdBy', '==', user.uid)
                            );
                            return collectionData(recipesQuery, { idField: 'id' }).pipe(
                                take(1),
                                switchMap((recipes) => {
                                    // Batch update recipes
                                    const batch = writeBatch(this.firestore);
                                    recipes.forEach((recipe: any) => {
                                        const recipeRef = doc(this.firestore, `recipes/${recipe.id}`);
                                        batch.update(recipeRef, { householdId });
                                    });
                                    return from(batch.commit());
                                })
                            );
                        })
                    );
                } else {
                    throw new Error('User not found');
                }
            })
        );
    }

    public createHouseholdForCurrentUser(): Observable<unknown> {
        return this.user$.pipe(
            take(1),
            switchMap((user) => {
                if (!user) {
                    return throwError(() => new Error('User not logged in'));
                }
                const householdId = uuidv7(); // Generate a new household ID
                return this.updateUserAndMigrateRecipes(user, householdId);
            })
        );
    }

    public joinHousehold(householdId: string): Observable<unknown> {
        return this.user$.pipe(
            take(1),
            switchMap((user) => {
                if (!user) {
                    return throwError(() => new Error('User not logged in'));
                }
                return this.updateUserAndMigrateRecipes(user, householdId);
            })
        );
    }
}