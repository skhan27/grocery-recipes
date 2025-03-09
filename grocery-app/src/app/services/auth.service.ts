import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;

  login(email: string, password: string): Observable<boolean> {
    // Mock login logic
    this.isAuthenticated = email === 'test@test.com' && password === 'password';
    return of(this.isAuthenticated);
  }

  register(email: string, password: string): Observable<boolean> {
    // Mock registration logic
    return of(true);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }
}
