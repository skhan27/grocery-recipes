import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { User } from '../../models/user';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  standalone: true,
  imports: [AsyncPipe, FormsModule],
})
export class AccountSettingsComponent implements OnInit, OnDestroy {
  user$: Observable<User | null>;
  userService = inject(UserService);
  householdId: string;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.user$ = this.userService.user$;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createHousehold(): void {
    this.userService.createHouseholdForCurrentUser().pipe(takeUntil(this.destroy$)).subscribe();
  }

  joinHousehold(householdId: string): void {  
    this.userService.joinHousehold(householdId).pipe(takeUntil(this.destroy$)).subscribe();
  }
}