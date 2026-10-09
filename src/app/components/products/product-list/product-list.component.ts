import { NgFor } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../../models/product.model';

import { CartNavigationComponent } from '../../cart/cart-navigation/cart-navigation.component';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  imports: [ProductCardComponent, NgFor, CartNavigationComponent],
  standalone: true,
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  selectedProduct: Product | null = null;

  ngOnInit(): void {
    this.products = this.productService.getProducts();
  }

  readonly productService = inject(ProductService);

  get filteredProducts(): Product[] {
    return this.productService.filteredProducts();
  }

  get filters() {
    return {
      lactoseFree: this.productService.isTagActive('lactoseFree'),
      glutenFree: this.productService.isTagActive('glutenFree'),
      vegan: this.productService.isTagActive('vegan'),
    };
  }

  toggleFilter(tag: string): void {
    this.productService.toggleTagFilter(tag);
  }
}
