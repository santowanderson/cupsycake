import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-cart-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-detail.component.html',
  styleUrl: './cart-detail.component.css',
})
export class CartDetailComponent {
  protected cartService = inject(CartService);
  private router = inject(Router);

  /**
   * Remove um produto do carrinho pelo ID numérico
   */
  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  /**
   * Atualiza diretamente a quantidade de um produto
   */
  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  /**
   * Método auxiliar para incrementar ou decrementar via botões (+ / -)
   */
  changeQuantity(
    productId: number,
    currentQuantity: number,
    delta: number,
  ): void {
    const newQuantity = currentQuantity + delta;
    this.cartService.updateQuantity(productId, newQuantity);
  }

  /**
   * Retorna para a página inicial (catálogo de cupcakes)
   */
  onContinueShopping(): void {
    this.router.navigate(['/'], { queryParamsHandling: 'merge' });
  }

  /**
   * Finaliza o pedido e limpa o carrinho
   */
  onCheckout(): void {
    alert('Pedido confirmado com sucesso! Obrigado por comprar na CupsCake.');
    this.cartService.clearCart();
    this.router.navigate(['/']);
  }
}
