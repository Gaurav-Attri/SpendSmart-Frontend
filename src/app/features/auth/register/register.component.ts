import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import {
  GoogleCredentialResponse,
  GoogleIdentityService,
} from '../../../core/services/google-identity.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['../auth.scss']
})
export class RegisterComponent implements AfterViewInit, OnDestroy {
  @ViewChild('googleButton') googleButton?: ElementRef<HTMLDivElement>;

  form: FormGroup;
  loading = false;
  googleLoading = false;
  googleInitError = '';
  error = '';
  showPassword = false;
  private destroyed = false;

  currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private zone: NgZone,
    private googleIdentity: GoogleIdentityService,
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      ]],
      currency: ['INR', Validators.required]
    });
  }

  async ngAfterViewInit(): Promise<void> {
    await this.renderGoogleButton();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.googleIdentity.cancel();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    this.auth.register(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.error = this.getErrorMessage(err, 'Registration failed. Please try again.');
        this.loading = false;
      }
    });
  }

  private async renderGoogleButton(): Promise<void> {
    if (!this.googleButton?.nativeElement) {
      return;
    }

    try {
      const clientId = await firstValueFrom(this.auth.getGoogleClientId());
      if (!clientId) {
        throw new Error('Missing Google client ID.');
      }

      await this.googleIdentity.renderButton(
        this.googleButton.nativeElement,
        clientId,
        response => this.zone.run(() => this.handleGoogleCredential(response)),
      );

      if (!this.destroyed) {
        this.googleInitError = '';
      }
    } catch {
      if (!this.destroyed) {
        this.googleInitError = 'Google sign-in is unavailable right now.';
      }
    }
  }

  private handleGoogleCredential(response: GoogleCredentialResponse): void {
    if (!response.credential) {
      this.error = 'Google sign-in was cancelled. Please try again.';
      return;
    }

    this.error = '';
    this.googleLoading = true;

    this.auth.loginWithGoogle({ idToken: response.credential }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.error = this.getErrorMessage(err, 'Google sign-in failed. Please try again.');
        this.googleLoading = false;
      }
    });
  }

  private getErrorMessage(err: any, fallback: string): string {
    const apiError = err?.error;
    if (typeof apiError === 'string' && apiError.trim()) {
      return apiError;
    }
    return apiError?.error || apiError?.detail || apiError?.title || fallback;
  }

  get f() { return this.form.controls; }
}
