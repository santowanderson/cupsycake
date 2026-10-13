import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
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

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/login`, credentials, { withCredentials: true })
      .pipe(switchMap(() => this.loadProfile()));
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout(): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
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

  loadProfile(): Observable<UserProfile> {
    return this.http
      .get<UserProfile>(`${this.apiUrl}/profile`, { withCredentials: true })
      .pipe(tap((profile) => this.currentUser.set(profile)));
  }

  validateAuthAndRedirect(returnUrl: string = '/cart'): boolean {
    if (this.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl } });
    return false;
  }
}
