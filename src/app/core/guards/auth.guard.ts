// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se o usuário está autenticado (ex: token válido ou signal de usuário)
  if (authService.isAuthenticated()) {
    return true;
  }

  // Se não estiver autenticado, redireciona para o login
  // Boa prática: Salva a URL de destino (returnUrl) para redirecionar o usuário após logar
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
