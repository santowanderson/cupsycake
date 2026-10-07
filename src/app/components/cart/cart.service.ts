import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Map<string, { product: Product; quantity: number }> = new Map();

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$: Observable<number> = this.cartCountSubject.asObservable();

  getCart(): Array<{ product: Product; quantity: number }> {
    return Array.from(this.cart.entries()).map(([id, value]) => value);
  }

  addToCart(product: Product) {
    const current = this.cart.get(product.id);
    if (current) {
      current.quantity += 1;
    } else {
      this.cart.set(product.id, { product, quantity: 1 });
    }
    this.cartCountSubject.next(this.getCartCount());
  }

  removeFromCart(productId: string) {
    const current = this.cart.get(productId);
    if (current && current.quantity > 0) {
      this.cart.delete(productId);
    }
    this.cartCountSubject.next(this.getCartCount());
  }

  updateQuantity(productId: string, delta: number) {
    const current = this.cart.get(productId);
    if (current) {
      const newQuantity = current.quantity + delta;
      if (newQuantity > 0 && newQuantity < 99) {
        current.quantity = newQuantity;
      } else if (newQuantity <= 0) {
        this.cart.delete(productId);
      }
    }
    this.cartCountSubject.next(this.getCartCount());
  }

  getTotalPrice(): number {
    return this.getCart().reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
  }

  getCartCount(): number {
    return this.getCart().reduce((acc, item) => acc + item.quantity, 0);
  }
}
