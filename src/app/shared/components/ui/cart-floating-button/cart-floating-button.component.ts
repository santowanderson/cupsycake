import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
// Ajuste o caminho do seu AuthService

@Component({
  selector: 'app-cart-floating-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-floating-button.component.html',
  styleUrls: ['./cart-floating-button.component.css'],
})
export class CartFloatingButtonComponent {
  protected cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Estado do modal/pop-up
  protected isModalOpen = signal(false);

  // Referência ao botão "Não" para gerenciar o foco via Signal Query (Angular 17+)
  protected noButton = viewChild<ElementRef<HTMLButtonElement>>('noButton');

  // Computed para calcular a quantidade total de itens na badge usando o serviço
  protected itemCount = computed(() => this.cartService.totalItemsCount());

  protected openModal(): void {
    this.isModalOpen.set(true);
    // Aplica o foco automático no botão "Não" após a renderização do modal
    setTimeout(() => {
      this.noButton()?.nativeElement.focus();
    }, 50);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
  }

  protected confirmNavigation(): void {
    this.closeModal();

    // Valida se o usuário está autenticado antes de redirecionar para o carrinho
    if (this.authService.isAuthenticated()) {
      this.cartService.navigateToCart();
    } else {
      // Se não estiver logado, redireciona para o login guardando a intenção de ir para o carrinho
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/cart' },
      });
    }
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.closeModal();
    }
  }
}
