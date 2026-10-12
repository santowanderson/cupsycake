import { Routes } from '@angular/router';

export const routes: Routes = [
  // Rotas de Autenticação (Prefixo 'auth', resultando em /auth/login e /auth/register)
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // Rota do Carrinho (Protegida)
  {
    path: 'cart',
    loadChildren: () =>
      import('./features/cart/cart.routes').then((m) => m.CART_ROUTES),
  },

  // Rotas de Produtos / Catálogo (Devem vir por último por utilizarem path: '')
  {
    path: '',
    loadChildren: () =>
      import('./features/products/products.routes').then(
        (m) => m.PRODUCT_ROUTES,
      ),
  },

  // Rota curinga para redirecionar caminhos inválidos à home
  {
    path: '**',
    redirectTo: '',
  },
];
