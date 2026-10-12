// src/app/app.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CartService } from './core/services/cart.service';
import { HeaderComponent } from './layout/header/header.component';

import { ProductModalComponent } from './shared/components/product-modal/product-modal.component';
import { CartFloatingButtonComponent } from './shared/components/ui/cart-floating-button/cart-floating-button.component';
import { FooterComponent } from './shared/components/ui/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    ProductModalComponent,
    CartFloatingButtonComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  protected cartService = inject(CartService);
  title = 'Cupcake Delight Store';
}
