import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
} from '@angular/fire/auth';
import { from, Observable, of } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUser$ = signal<User | null | undefined>(undefined);

  login(email: string, password: string): Observable<void> {
    const req = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then((res) => {});
    return from(req);
  }

  register(
    email: string,
    username: string,
    password: string
  ): Observable<void> {
    const req = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then((res) =>
      updateProfile(res.user, {
        displayName: username,
      })
    );
    return from(req);
  }

  isLoggedIn(): boolean {
    return this.currentUser$() !== null && this.currentUser$() !== undefined;
  }

  logout(): Observable<void> {
    return from(signOut(this.firebaseAuth));
  }
}
