// src/app/core/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

// Interface estruturada para o Endereço correspondente ao FormGroup
export interface EnderecoRequest {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

// Interface RegisterRequest expandida com todos os campos do formulário
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  cpf: string;
  telefone: string;
  sexo: string;
  idade: number;
  endereco: EnderecoRequest;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'access_token';

  // Signal privado para gerenciar o token reativamente
  private tokenSignal = signal<string | null>(
    localStorage.getItem(this.TOKEN_KEY),
  );

  // Método público que valida se o usuário está autenticado
  isAuthenticated(): boolean {
    return !!this.tokenSignal();
  }

  private readonly API_URL = 'http://localhost:3000/api/auth';

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap((response) => {
          this.setSession(response.token);
        }),
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap((response) => {
          this.setSession(response.token);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.tokenSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private setSession(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.tokenSignal.set(token);
  }
}
