import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Product } from '../../../core/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/products';

  readonly products = signal<Product[]>([]);
  readonly activeTagFilters = signal<string[]>([]);

  constructor() {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.http.get<Product[]>(this.apiUrl).subscribe({
      next: (data) => this.products.set(data),
      error: (err) => console.error('Erro ao carregar produtos:', err),
    });
  }

  toggleTagFilter(tagSlug: string): void {
    this.activeTagFilters.update((filters) => {
      if (filters.includes(tagSlug)) {
        return filters.filter((f) => f !== tagSlug);
      }
      return [...filters, tagSlug];
    });
  }

  isTagActive(tagSlug: string): boolean {
    return this.activeTagFilters().includes(tagSlug);
  }

  readonly filteredProducts = computed(() => {
    const list = this.products();
    const filters = this.activeTagFilters();

    if (filters.length === 0) return list;

    return list.filter((product) =>
      filters.every((filterSlug) =>
        product.tags.some((t) => t.slug === filterSlug),
      ),
    );
  });

  getImageUrl(productOrSlug: Product | string | null | undefined): string {
    if (!productOrSlug) {
      return 'assets/images/placeholder.jpg';
    }

    // Se receber apenas a string do slug
    if (typeof productOrSlug === 'string') {
      return productOrSlug.trim()
        ? `assets/images/${productOrSlug}.jpg`
        : 'assets/images/placeholder.jpg';
    }

    // Se receber o objeto Product e ele já tiver uma imagem cadastrada
    if (productOrSlug.image_url) {
      return productOrSlug.image_url;
    }

    // Caso contrário, tenta montar com base no slug do produto
    if (!productOrSlug.slug) {
      return 'assets/images/placeholder.jpg';
    }

    return `assets/images/${productOrSlug.slug}.jpg`;
  }
}
