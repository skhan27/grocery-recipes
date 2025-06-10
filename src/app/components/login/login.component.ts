import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgClass, NgIf } from '@angular/common';
import { of, pipe, Subject, timer } from 'rxjs';
import { switchMap, catchError, takeWhile, map, concatMap, take, takeUntil, repeat, filter, defaultIfEmpty } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  errorMessage: string;

  destroy$ = new Subject<void>();
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  login() {
    if (this.loginForm.invalid) {
      return;
    }

    // Due to firebase authentication and our user service being out of sync with each other, 
    // we need to login and then poll for the user data to ensure the user object is available before navigating.
    this.authService.login(this.loginForm.value.email, this.loginForm.value.password)
      .pipe(
        catchError(err => { 
          // Handle error from login call
          throw { code: err.code || 'Login failed. Please try again.' };
        }),
        switchMap(() => {
          return this.userService.user$.pipe(
            repeat({
              count: 10, // Maximum of 10 repeats
              delay: () => timer(500) // 500ms delay each time
            }),
            filter(user => !!user),
            take(1),
            defaultIfEmpty(null),
            switchMap(user => {
              if (!user) {
                throw { code: 'Login failed after multiple attempts. Please try again.' };
              }
              return of(user);
            })
          );
        }),
        takeUntil(this.destroy$),
        catchError(err => { // Catch errors in the polling sequence
          throw err;
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/list']);
        },
        error: (err) => {
          this.errorMessage = err.code || 'Login failed. Please try again.';
          this.loginForm.reset();
        },
      });
  }
}
