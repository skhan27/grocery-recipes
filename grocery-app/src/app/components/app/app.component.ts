import { NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      console.log(user);

      if (user) {
        this.authService.currentUser$.set({
          email: user.email!,
          username: user.displayName!,
          uid: user.uid,
        });
      } else {
        this.authService.currentUser$.set(null);
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
    });
  }
}
