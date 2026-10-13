import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/header.component';
import { ProductModalComponent } from './shared/components/product-modal/product-modal.component';
import { FloatingCartButtonComponent } from './shared/components/ui/floating-cart-button/floating-cart-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    RouterOutlet,
    ProductModalComponent,
    FloatingCartButtonComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'cupsycake-frontend';
}
