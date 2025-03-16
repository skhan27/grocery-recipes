import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
} from '@angular/fire/auth';
import { from, map, Observable, of } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);

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

  isLoggedIn(): Observable<boolean> {
    return this.user$.pipe(map((user) => user !== null && user !== undefined));
  }

  logout(): Observable<void> {
    return from(signOut(this.firebaseAuth));
  }
}
