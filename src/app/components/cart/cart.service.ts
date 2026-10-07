import { isPlatformBrowser } from '@angular/common';
import {
  computed,
  effect,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface StoredCart {
  items: CartItem[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly STORAGE_KEY = 'shopping_cart_items';

  private readonly CART_TTL_MS = 3 * 60 * 60 * 1000;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);

  private isInitializing = true;

  readonly cartItems = signal<CartItem[]>([]);

  readonly cartCount = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.quantity, 0),
  );

  readonly totalPrice = computed(() =>
    this.cartItems().reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    ),
  );

  readonly cartCount$: Observable<number> = toObservable(this.cartCount);

  constructor() {
    this.listenToUrlParams();

    effect(() => {
      const items = this.cartItems();

      if (this.isInitializing) {
        return;
      }

      this.syncCartToUrl(items);
      this.syncCartToStorage(items);
    });
  }

  getCart(): CartItem[] {
    return this.cartItems();
  }

  addToCart(product: Product): void {
    this.cartItems.update((items) => {
      const existingIndex = items.findIndex(
        (item) => item.product.id === product.id,
      );
      if (existingIndex > -1) {
        const updated = [...items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [...items, { product, quantity: 1 }];
    });
  }

  removeFromCart(productId: string): void {
    this.cartItems.update((items) =>
      items.filter((item) => item.product.id !== productId),
    );
  }

  updateQuantity(productId: string, delta: number): void {
    this.cartItems.update((items) =>
      items
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity > 0 && newQuantity < 99) {
              return { ...item, quantity: newQuantity };
            }
            if (newQuantity <= 0) {
              return null;
            }
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null),
    );
  }

  clearCart(): void {
    this.cartItems.set([]);
  }

  getTotalPrice(): number {
    return this.totalPrice();
  }

  getCartCount(): number {
    return this.cartCount();
  }

  private syncCartToUrl(items: CartItem[]): void {
    const hasItems = items.length > 0;
    const cartParam = hasItems
      ? items
          .map(
            (item) =>
              `${encodeURIComponent(item.product.name)}:${item.quantity}`,
          )
          .join(',')
      : null;

    const timestampParam = hasItems ? Date.now().toString() : null;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { cart: cartParam, ts: timestampParam },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private syncCartToStorage(items: CartItem[]): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        if (items.length === 0) {
          localStorage.removeItem(this.STORAGE_KEY);
          return;
        }

        const dataToStore: StoredCart = {
          items,
          timestamp: Date.now(),
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToStore));
      } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
      }
    }
  }

  private listenToUrlParams(): void {
    this.activatedRoute.queryParams.subscribe(async (params) => {
      const cartParam = params['cart'];
      const timestampParam = params['ts'];

      if (cartParam && cartParam.trim() !== '') {
        const isUrlExpired = this.isExpired(
          timestampParam ? parseInt(timestampParam, 10) : null,
        );

        if (!isUrlExpired) {
          const itemsFromUrl = await this.parseCartParam(cartParam);
          this.cartItems.set(itemsFromUrl);
          this.isInitializing = false;
          return;
        }
      }

      const itemsFromStorage = this.loadFromStorage();
      this.cartItems.set(itemsFromStorage);

      this.isInitializing = false;
    });
  }

  private loadFromStorage(): CartItem[] {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (!saved) return [];

        const parsed: StoredCart = JSON.parse(saved);

        if (this.isExpired(parsed.timestamp)) {
          localStorage.removeItem(this.STORAGE_KEY);
          return [];
        }

        return parsed.items || [];
      } catch (error) {
        console.error('Erro ao ler do localStorage:', error);
        return [];
      }
    }
    return [];
  }

  private isExpired(timestamp: number | null): boolean {
    if (!timestamp) return false;
    const now = Date.now();
    return now - timestamp > this.CART_TTL_MS;
  }

  private async parseCartParam(cartParam: string): Promise<CartItem[]> {
    const items: CartItem[] = [];
    const entries = cartParam.split(',');

    for (const entry of entries) {
      const [encodedName, qtyStr] = entry.split(':');
      const quantity = parseInt(qtyStr, 10);

      if (encodedName && !isNaN(quantity) && quantity > 0) {
        const productName = decodeURIComponent(encodedName);
        const product = await firstValueFrom(
          this.productService.getProductByName(productName),
        );

        if (product) {
          items.push({ product, quantity });
        }
      }
    }

    return items;
  }
}
