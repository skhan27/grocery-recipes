import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map, Observable, shareReplay } from 'rxjs';
import { User } from '../../models/user';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  user$: Observable<User | null>;
  isLoggedIn$: Observable<boolean>;

  ngOnInit(): void {
    this.user$ = this.authService.user$.pipe(
      map((user) => {
        if (user) {
          return {
            email: user.email!,
            username: user.displayName!,
            uid: user.uid,
          };
        }
        return null;
      })
    );
    this.isLoggedIn$ = this.authService.isLoggedIn().pipe(shareReplay(1));
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['login'], {
          onSameUrlNavigation: 'reload',
        });
      },
    });
  }
}
