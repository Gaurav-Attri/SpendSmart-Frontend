import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user!: User;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  currencyForm!: FormGroup;
  saving = false;
  savingPwd = false;
  savingCurrency = false;
  successMsg = '';
  errorMsg = '';
  showPassword = false;

  currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD', 'AED'];

  constructor(private fb: FormBuilder, public auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser!;
    this.profileForm = this.fb.group({
      fullName: [this.user.fullName, [Validators.required, Validators.minLength(2)]],
      avatarUrl: [this.user.avatarUrl || '']
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required, Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      ]]
    });
    this.currencyForm = this.fb.group({
      currency: [this.user.currency, Validators.required]
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.saving = true; this.successMsg = ''; this.errorMsg = '';
    this.auth.updateProfile(this.user.userId, this.profileForm.value).subscribe({
      next: () => { this.saving = false; this.successMsg = 'Profile updated!'; },
      error: err => { this.saving = false; this.errorMsg = err.error?.error || 'Failed'; }
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) return;
    this.savingPwd = true; this.successMsg = ''; this.errorMsg = '';
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.auth.changePassword(this.user.userId, { oldPassword: currentPassword, newPassword }).subscribe({
      next: () => { this.savingPwd = false; this.successMsg = 'Password changed!'; this.passwordForm.reset(); },
      error: err => { this.savingPwd = false; this.errorMsg = err.error?.error || err.error?.detail || err.error?.title || 'Failed'; }
    });
  }

  saveCurrency(): void {
    this.savingCurrency = true;
    this.auth.updateCurrency(this.user.userId, this.currencyForm.value.currency).subscribe({
      next: () => { this.savingCurrency = false; this.successMsg = 'Currency updated!'; },
      error: () => { this.savingCurrency = false; }
    });
  }
}
