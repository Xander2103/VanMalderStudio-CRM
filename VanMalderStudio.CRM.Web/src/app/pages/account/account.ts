import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, UpdateCredentialsRequest } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  imports: [FormsModule],
  templateUrl: './account.html',
  styleUrl: './account.scss'
})
export class Account implements OnInit {
  currentEmail = '';
  currentPassword = '';
  newEmail = '';
  newPassword = '';
  confirmNewPassword = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (account) => {
        this.currentEmail = account.email;
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  save(): void {
    if (!this.currentPassword.trim()) {
      this.errorMessage = 'Vul je huidig wachtwoord in.';
      return;
    }

    if (this.newPassword && this.newPassword !== this.confirmNewPassword) {
      this.errorMessage = 'Nieuwe wachtwoorden komen niet overeen.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: UpdateCredentialsRequest = {
      currentPassword: this.currentPassword,
      newEmail: this.newEmail || undefined,
      newPassword: this.newPassword || undefined,
      confirmNewPassword: this.confirmNewPassword || undefined,
    };

    this.authService.updateCredentials(request).subscribe({
      next: () => {
        this.successMessage = 'Gegevens bijgewerkt. Je wordt uitgelogd...';
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err.error?.message ?? 'Er is een fout opgetreden.';
        this.isLoading = false;
      }
    });
  }
}
