import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';

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
    private productService: ProductService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cartItems = this.productService.getCart();
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalPrice = this.productService.getTotalPrice();
  }

  removeItem(productId: string): void {
    this.productService.removeFromCart(productId);
    this.cartItems = this.productService.getCart();
    this.calculateTotal();
  }

  updateQuantity(productId: string, delta: number): void {
    this.productService.updateQuantity(productId, delta);
    this.cartItems = this.productService.getCart();
    this.calculateTotal();
  }

  goBack(): void {
    window.history.back();
  }
}
