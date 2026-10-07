import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { CartNavigationComponent } from '../../cart/cart-navigation/cart-navigation.component';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  imports: [ProductCardComponent, NgFor, CartNavigationComponent],
  standalone: true,
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];

  filters = {
    lactoseFree: false,
    glutenFree: false,
    vegan: false,
  };

  selectedProduct: Product | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.products = this.productService.getProducts();
    this.applyFilters();
  }

  toggleFilter(filter: string) {
    if (filter === 'lactoseFree') {
      this.filters.lactoseFree = !this.filters.lactoseFree;
    } else if (filter === 'glutenFree') {
      this.filters.glutenFree = !this.filters.glutenFree;
    } else if (filter === 'vegan') {
      this.filters.vegan = !this.filters.vegan;
    }
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.products.filter((p) => {
      const matchesLactose = this.filters.lactoseFree
        ? p.tags.includes('sem-lactose')
        : true;
      const matchesGluten = this.filters.glutenFree
        ? p.tags.includes('sem-gluten')
        : true;
      const matchesVegan = this.filters.vegan
        ? p.tags.includes('vegano')
        : true;
      return matchesLactose && matchesGluten && matchesVegan;
    });
  }

  viewDetails(product: Product) {
    this.selectedProduct = product;
  }

  closeDetails() {
    this.selectedProduct = null;
  }
}
