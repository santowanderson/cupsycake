import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { CartNavigationPopupComponent } from '../cart-navigation-popup/cart-navigation-popup.component';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-cart-navigation',
  standalone: true,
  imports: [CartNavigationPopupComponent, CommonModule],
  templateUrl: './cart-navigation.component.html',
  styleUrl: './cart-navigation.component.css',
})
export class CartNavigationComponent {
  showPopup = false;
  hasItems$: Observable<boolean>;
  cartCount$: Observable<number>;

  constructor(
    private router: Router,
    private cartService: CartService,
  ) {
    this.cartCount$ = this.cartService.cartCount$;
    this.hasItems$ = this.cartCount$.pipe(map((count) => (count ?? 0) > 0));
  }

  onCartClick() {
    this.showPopup = true;
  }

  onSim() {
    this.showPopup = false;
    this.router.navigate(['/cart']);
  }

  onNao() {
    this.showPopup = false;
  }
}
