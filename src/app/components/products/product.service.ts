import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { Product, TagName } from '../../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly apiUrl = 'http://localhost:3000/api/products';

  // Tipagem estrita com Record<string, TagName>
  private readonly tagMap: Record<string, TagName> = {
    lactoseFree: 'sem-lactose',
    glutenFree: 'sem-gluten',
    vegan: 'vegano',
  };

  private readonly products$ = this.http.get<any[]>(this.apiUrl).pipe(
    map((data) =>
      data.map(
        (item): Product => ({
          id: String(item.id),
          name: item.name,
          description: item.description || '',
          price: Number(item.price),
          tags: Array.isArray(item.tags)
            ? (item.tags as TagName[])
            : item.tags
              ? (item.tags.split(',').map((t: string) => t.trim()) as TagName[])
              : [],
          ingredients: Array.isArray(item.ingredients)
            ? item.ingredients
            : item.ingredients
              ? item.ingredients.split(',').map((i: string) => i.trim())
              : [],
          imageUrl:
            item.imageUrl || item.image || 'assets/images/placeholder.jpg',
        }),
      ),
    ),
    catchError((error) => {
      console.error('Erro ao buscar produtos da API:', error);
      return of([]);
    }),
  );

  readonly productsSignal = toSignal(this.products$, { initialValue: [] });

  readonly activeFilters = toSignal(
    this.route.queryParams.pipe(
      map((params) => {
        const tagsParam = params['tags'];
        return tagsParam ? tagsParam.split(',').filter(Boolean) : [];
      }),
    ),
    { initialValue: [] },
  );

  readonly filteredProducts = computed(() => {
    const products = this.productsSignal();
    const selectedKeys = this.activeFilters();

    if (selectedKeys.length === 0) {
      return products;
    }

    return products.filter((product) =>
      selectedKeys.every((filterKey: string) => {
        // Casting explícito com 'as TagName' para satisfazer o TypeScript
        const targetDbTag = (this.tagMap[filterKey] || filterKey) as TagName;
        return product.tags?.includes(targetDbTag);
      }),
    );
  });

  getProducts(): Product[] {
    return this.productsSignal();
  }

  getProductById(id: string): Product | undefined {
    return this.productsSignal().find((p) => p.id === String(id));
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
