import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
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

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  /**
   * Função reutilizável que retorna o caminho completo da imagem do produto.
   * Concatena o campo `image_url` do banco de dados com a pasta local `assets/images/`.
   */
  getImageUrl(productOrImage: Product | string | null | undefined): string {
    if (!productOrImage) {
      return 'assets/images/placeholder.jpg';
    }

    let rawValue = '';

    if (typeof productOrImage === 'string') {
      rawValue = productOrImage.trim();
    } else if (productOrImage.image_url) {
      rawValue = productOrImage.image_url.trim();
    } else if (productOrImage.slug) {
      rawValue = `${productOrImage.slug}.jpg`;
    }

    if (!rawValue) {
      return 'assets/images/placeholder.jpg';
    }

    // Se já for uma URL completa (http/https) ou já começar com assets/
    if (
      rawValue.startsWith('http://') ||
      rawValue.startsWith('https://') ||
      rawValue.startsWith('assets/')
    ) {
      return rawValue;
    }

    // Remove qualquer barra inicial (ex: "/cupcake.jpg" ou " /cupcake.jpg") para evitar busca na raiz do servidor
    const cleanName = rawValue.replace(/^\/+/, '');

    if (cleanName.startsWith('assets/')) {
      return cleanName;
    }

    return `assets/images/${cleanName}`;
  }
}
