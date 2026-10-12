import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly STORAGE_KEY = 'cupcake_cart_items';
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private isInitializing = true;

  // Signal privado contendo os itens do carrinho
  private cartItemsSignal = signal<CartItem[]>([]);

  // Sinais públicos somente leitura
  items = this.cartItemsSignal.asReadonly();

  // Alias para compatibilidade com o botão flutuante
  cartItems = this.items;

  // Quantidade total de unidades de cupcakes no carrinho
  totalItemsCount = computed(() =>
    this.cartItemsSignal().reduce((acc, item) => acc + item.quantity, 0),
  );

  // Regra de negócio: Visível apenas quando houver 1 ou mais produtos no carrinho
  isCartVisible = computed(() => this.totalItemsCount() > 0);

  // Valor total monetário do carrinho
  totalPrice = computed(() =>
    this.cartItemsSignal().reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    ),
  );

  constructor() {
    // 1. Sincroniza a inicialização priorizando os QueryParams com fallback para o localStorage
    this.route.queryParams.subscribe((params) => {
      const cartParam = params['cart'];
      if (cartParam) {
        try {
          const decodedItems = JSON.parse(decodeURIComponent(cartParam));
          if (Array.isArray(decodedItems)) {
            this.cartItemsSignal.set(decodedItems);
            this.saveToStorage(decodedItems);
            this.isInitializing = false;
            return;
          }
        } catch {
          // Fallback silencioso caso o JSON da URL esteja corrompido
        }
      }

      // Se não houver queryParams na URL, carrega do localStorage
      const localItems = this.loadFromStorage();
      this.cartItemsSignal.set(localItems);
      this.isInitializing = false;

      // Se houver itens no localStorage mas a URL estiver limpa, popula a URL
      if (localItems.length > 0) {
        this.updateQueryParams(localItems);
      }
    });

    // 2. Efeito reativo: Atualiza automaticamente o localStorage e os queryParams da URL
    effect(() => {
      const items = this.cartItemsSignal();
      if (this.isInitializing) return;

      this.saveToStorage(items);
      this.updateQueryParams(items);
    });
  }

  /**
   * Adiciona um produto ao carrinho ou incrementa sua quantidade se já existir
   */
  addToCart(product: Product, quantity: number = 1): void {
    this.cartItemsSignal.update((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) => item.product.id === product.id,
      );

      let updatedItems: CartItem[];
      if (existingIndex > -1) {
        updatedItems = currentItems.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      } else {
        updatedItems = [...currentItems, { product, quantity }];
      }

      return updatedItems;
    });
  }

  /**
   * Atualiza diretamente a quantidade de um item específico no carrinho
   */
  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.cartItemsSignal.update((currentItems) => {
      return currentItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      );
    });
  }

  /**
   * Remove um produto por completo do carrinho
   */
  removeFromCart(productId: number): void {
    this.cartItemsSignal.update((currentItems) => {
      return currentItems.filter((item) => item.product.id !== productId);
    });
  }

  /**
   * Limpa todo o carrinho
   */
  clearCart(): void {
    this.cartItemsSignal.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateQueryParams([]);
  }

  /**
   * Navega para a página do carrinho
   */
  navigateToCart(): void {
    this.router.navigate(['cart']);
  }

  // --- Métodos Privados de Persistência e Sincronização ---

  private updateQueryParams(items: CartItem[]): void {
    const serialized =
      items.length > 0 ? encodeURIComponent(JSON.stringify(items)) : null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { cart: serialized },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private loadFromStorage(): CartItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Erro ao salvar o carrinho no localStorage', error);
    }
  }
}
