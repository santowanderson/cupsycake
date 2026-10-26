import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://localhost:3000/api/auth';

  readonly currentUser = signal<UserProfile | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    // Só tenta buscar o perfil se houver indício prévio de sessão.
    // Isso evita o disparo da requisição e o erro 401 para novos visitantes no console.
    if (localStorage.getItem('has_active_session') === 'true') {
      this.loadProfile().subscribe();
    }
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/login`, credentials, { withCredentials: true })
      .pipe(
        tap(() => localStorage.setItem('has_active_session', 'true')),
        switchMap(() => this.loadProfile()),
      );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout(): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          localStorage.removeItem('has_active_session');
          this.currentUser.set(null);

          const currentUrl = this.router.url;
          if (currentUrl.includes('/cart') || currentUrl.includes('/orders')) {
            this.router.navigate(['/']);
          } else {
            this.router.navigate(['/auth/login']);
          }
        }),
      );
  }

  loadProfile(): Observable<UserProfile | null> {
    return this.http
      .get<UserProfile>(`${this.apiUrl}/profile`, { withCredentials: true })
      .pipe(
        tap((profile) => {
          localStorage.setItem('has_active_session', 'true');
          this.currentUser.set(profile);
        }),
        catchError((error) => {
          if (error.status === 401) {
            localStorage.removeItem('has_active_session');
            this.currentUser.set(null);
            return of(null);
          }
          return throwError(() => error);
        }),
      );
  }

  validateAuthAndRedirect(returnUrl: string = '/cart'): boolean {
    if (this.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl } });
    return false;
  }
}
