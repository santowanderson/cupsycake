import { CurrencyPipe } from '@angular/common';
import { Component, Input, inject } from '@angular/core';

import { CartService } from '../../../components/cart/cart.service';
import { Product } from '../../../models/product.model';
import { ProductModalService } from '../../product/product-detail-modal/product-detail-modal.service';

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

  // Injeção do serviço de modal e do serviço de carrinho
  private readonly cartService = inject(CartService);
  private readonly modalService = inject(ProductModalService);

  quantity: number = 0;
  isInCart: boolean = false;

  openModal(): void {
    console.log('faslfsalkjfl');
    if (this.product) {
      this.modalService.open(this.product);
    }
  }

  addToCart(): void {
    this.quantity = 1;
    this.isInCart = true;
    this.cartService.addToCart(this.product);
  }
}
