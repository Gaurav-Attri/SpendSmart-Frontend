import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, shareReplay, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginDto,
  RegisterDto,
  User,
  ChangePasswordDto,
  UpdateProfileDto,
  GoogleAuthUrlResponse,
  GoogleLoginDto,
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = environment.apis.auth;
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  private googleAuthUrl$?: Observable<string>;
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  get isLoggedIn(): boolean {
    return !!this.token && !!this.currentUser;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'Admin';
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/api/auth/login`, dto).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/api/auth/register`, dto).pipe(
      tap(res => this.saveSession(res))
    );
  }

  loginWithGoogle(dto: GoogleLoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/api/auth/google-token`, dto).pipe(
      tap(res => this.saveSession(res))
    );
  }

  getGoogleAuthUrl(): Observable<string> {
    if (!this.googleAuthUrl$) {
      this.googleAuthUrl$ = this.http
        .get<GoogleAuthUrlResponse | string>(`${this.base}/api/auth/google-url`)
        .pipe(
          map(response => typeof response === 'string' ? response : response?.url ?? ''),
          shareReplay(1)
        );
    }

    return this.googleAuthUrl$;
  }

  getGoogleClientId(): Observable<string> {
    return this.getGoogleAuthUrl().pipe(
      map(url => {
        try {
          return new URL(url).searchParams.get('client_id') ?? '';
        } catch {
          return '';
        }
      })
    );
  }

  refreshToken(refreshToken: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.base}/api/auth/refresh-token`, { refreshToken }).pipe(
      tap(res => localStorage.setItem('token', res.token))
    );
  }

  getProfile(userId: number): Observable<User> {
    return this.http.get<User>(`${this.base}/api/auth/profile/${userId}`);
  }

  updateProfile(userId: number, dto: UpdateProfileDto): Observable<void> {
    return this.http.put<void>(`${this.base}/api/auth/profile/${userId}`, dto).pipe(
      tap(() => {
        const user = this.currentUser;
        if (user) {
          const updated = { ...user, ...dto };
          localStorage.setItem('user', JSON.stringify(updated));
          this.currentUserSubject.next(updated);
        }
      })
    );
  }

  changePassword(userId: number, dto: ChangePasswordDto): Observable<void> {
    return this.http.put<void>(`${this.base}/api/auth/change-password/${userId}`, dto);
  }

  updateCurrency(userId: number, currency: string): Observable<void> {
    return this.http.put<void>(`${this.base}/api/auth/currency/${userId}`, JSON.stringify(currency), {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      tap(() => {
        const user = this.currentUser;
        if (user) {
          const updated = { ...user, currency };
          localStorage.setItem('user', JSON.stringify(updated));
          this.currentUserSubject.next(updated);
        }
      })
    );
  }

  logout(): void {
    localStorage.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('refreshToken', res.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }
}
