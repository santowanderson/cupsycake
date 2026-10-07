import { CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

import { Product } from '../../../models/product.model';
import { CartService } from '../../../components/cart/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  imports: [CurrencyPipe],
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() viewDetails?: (product: Product) => void;

  constructor(private cartService: CartService) {}

  quantity: number = 0;
  isInCart: boolean = false;

  addToCart() {
    this.quantity = 1;
    this.isInCart = true;
    this.cartService.addToCart(this.product);
  }
}
