import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';
import { Product } from '../../../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductModalService {
  private readonly document = inject(DOCUMENT);

  private readonly _isOpen = signal<boolean>(false);
  private readonly _selectedProduct = signal<Product | null>(null);

  readonly isOpen = this._isOpen.asReadonly();
  readonly selectedProduct = this._selectedProduct.asReadonly();

  constructor() {
    // Efeito reativo que executa automaticamente quando o sinal isOpen altera
    effect(() => {
      if (this.isOpen()) {
        this.document.body.classList.add('no-scroll');
      } else {
        this.document.body.classList.remove('no-scroll');
      }
    });
  }

  open(product: Product): void {
    this._selectedProduct.set(product);
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
    this._selectedProduct.set(null);
  }
}
