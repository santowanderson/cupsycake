import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  standalone: true,
  imports: [CommonModule],
})
export class CartComponent implements OnInit {
  cartItems: Array<{ product: any; quantity: number }> = [];
  totalPrice = 0;

  constructor(
    private cartService: CartService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cartItems = this.cartService.getCart();
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalPrice = this.cartService.getTotalPrice();
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
    this.cartItems = this.cartService.getCart();
    this.calculateTotal();
  }

  updateQuantity(productId: string, delta: number): void {
    this.cartService.updateQuantity(productId, delta);
    this.cartItems = this.cartService.getCart();
    this.calculateTotal();
  }

  onContinueShopping(): void {
    this.router.navigate(['/']);
  }
}
