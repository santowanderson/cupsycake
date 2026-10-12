import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
})
export class ProductListComponent {
  protected readonly productService = inject(ProductService);

  // Estado da Paginação
  readonly currentPage = signal<number>(1);
  readonly itemsPerPage: number = 8; // 2 fileiras (4 itens por linha no desktop)

  // Exposição direta do Signal computado de produtos filtrados do serviço
  readonly filteredProducts = this.productService.filteredProducts;

  // Produtos exibidos apenas na página atual
  readonly paginatedProducts = computed(() => {
    const products = this.filteredProducts();
    const page = this.currentPage();
    const startIndex = (page - 1) * this.itemsPerPage;
    return products.slice(startIndex, startIndex + this.itemsPerPage);
  });

  // Total de páginas calculadas com base nos filtros ativos
  readonly totalPages = computed(() => {
    const total = this.filteredProducts().length;
    return Math.ceil(total / this.itemsPerPage) || 1;
  });

  // Array numérico de páginas para o loop do template
  readonly pagesArray = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // Controla se a paginação deve aparecer (se há mais itens que o limite por página)
  readonly showPagination = computed(() => {
    return this.filteredProducts().length > this.itemsPerPage;
  });

  isTagActive(tag: string): boolean {
    return this.productService.isTagActive(tag);
  }

  toggleFilter(tag: string): void {
    this.productService.toggleTagFilter(tag);
    this.currentPage.set(1); // Reseta para a primeira página sempre que o filtro mudar
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Retorna ao topo suavemente ao trocar de página
    }
  }
}
