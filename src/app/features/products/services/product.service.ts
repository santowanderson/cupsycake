import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { Product, Tag } from '../../../core/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly apiUrl = 'http://localhost:3000/api/products';

  // Mapeia os filtros da URL para os slugs reais salvos na tabela `tags` do banco de dados
  private readonly tagSlugMap: Record<string, string> = {
    lactoseFree: 'lactose-free',
    glutenFree: 'gluten-free',
    vegan: 'vegan',
  };

  // Requisição HTTP mapeando o payload do backend para a interface `Product` e `Tag`
  private readonly products$ = this.http.get<any[]>(this.apiUrl).pipe(
    map((data) =>
      data.map(
        (item): Product => ({
          id: Number(item.id),
          name: item.name,
          slug: item.slug,
          description: item.description || null,
          ingredients: item.ingredients || null,
          price: Number(item.price),
          image_url: item.image_url || item.imageUrl || null,
          stock_quantity: Number(item.stock_quantity ?? 0),
          is_active: Boolean(item.is_active ?? true),
          tags: Array.isArray(item.tags)
            ? item.tags.map((t: Tag) => ({
                id: Number(t.id),
                name: String(t.name),
                slug: String(t.slug),
              }))
            : [],
        }),
      ),
    ),
    catchError((error) => {
      console.error('Erro ao buscar produtos da API:', error);
      return of([]);
    }),
  );

  // Estado reativo global dos produtos utilizando Signals do Angular 17
  readonly productsSignal = toSignal(this.products$, { initialValue: [] });

  // Captura reativa dos parâmetros de query string para filtros (ex: ?tags=glutenFree)
  readonly activeFilters = toSignal(
    this.route.queryParams.pipe(
      map((params) => {
        const tagsParam = params['tags'];
        return tagsParam ? tagsParam.split(',').filter(Boolean) : [];
      }),
    ),
    { initialValue: [] },
  );

  // Computação reativa para filtrar a listagem de cupcakes instantaneamente
  readonly filteredProducts = computed(() => {
    const products = this.productsSignal();
    const selectedKeys = this.activeFilters();

    if (selectedKeys.length === 0) {
      return products;
    }

    return products.filter((product) =>
      selectedKeys.every((filterKey: string) => {
        const targetSlug = this.tagSlugMap[filterKey] || filterKey;
        // Verifica se o array de tags do produto possui o slug correspondente
        return product.tags?.some((tag) => tag.slug === targetSlug);
      }),
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

  getProducts(): Product[] {
    return this.productsSignal();
  }

  getProductById(id: number): Product | undefined {
    return this.productsSignal().find((p) => p.id === Number(id));
  }

  getProductByName(name: string): Observable<Product | undefined> {
    const normalizedName = name.trim().toLowerCase();
    const foundProduct = this.productsSignal().find(
      (p) => p.name.trim().toLowerCase() === normalizedName,
    );
    return of(foundProduct);
  }

  toggleTagFilter(filterKey: string): void {
    const currentFilters = [...this.activeFilters()];
    const index = currentFilters.indexOf(filterKey);

    if (index > -1) {
      currentFilters.splice(index, 1);
    } else {
      currentFilters.push(filterKey);
    }

    const tagsParam =
      currentFilters.length > 0 ? currentFilters.join(',') : null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tags: tagsParam },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  isTagActive(filterKey: string): boolean {
    return this.activeFilters().includes(filterKey);
  }
}
