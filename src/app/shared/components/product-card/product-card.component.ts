import { CurrencyPipe } from '@angular/common';
import { Component, Input, inject } from '@angular/core';

import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { ProductModalService } from '../../../features/products/services/product-modal.service';
import { ProductService } from '../../../features/products/services/product.service';
import { ProductTagBadgeComponent } from '../product-tag-badge/product-tag-badge.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  imports: [CurrencyPipe, ProductTagBadgeComponent],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);
  private readonly productModalService = inject(ProductModalService); // Injeção do service

  isAdding: boolean = false;

  get imageUrl(): string {
    return this.productService.getImageUrl(this.product);
  }

  openModal(): void {
    this.productModalService.open(this.product);
  }

  addToCart(event: Event): void {
    event.stopPropagation();
    if (this.isAdding) return;

    this.isAdding = true;
    this.cartService.addToCart(this.product, 1);

    setTimeout(() => {
      this.isAdding = false;
    }, 1000);
  }

  get normalizedTags(): (string | any)[] {
    const rawTags = this.product.tags as any;
    if (!rawTags) return [];

    if (typeof rawTags === 'string') {
      return rawTags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean);
    }

    if (Array.isArray(rawTags)) {
      return rawTags;
    }

    return [];
  }
}
