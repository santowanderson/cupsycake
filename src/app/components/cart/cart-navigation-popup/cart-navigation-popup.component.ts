import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-cart-navigation-popup',
  standalone: true,
  imports: [],
  templateUrl: './cart-navigation-popup.component.html',
  styleUrl: './cart-navigation-popup.component.css',
})
export class CartNavigationPopupComponent implements AfterViewInit {
  @Output() onSim = new EventEmitter<void>();
  @Output() onNao = new EventEmitter<void>();

  @ViewChild('btnNao') btnNao!: ElementRef;

  closing = false;

  ngAfterViewInit() {
    // Small timeout to ensure the element is rendered and focusable
    setTimeout(() => {
      if (this.btnNao) {
        this.btnNao.nativeElement.focus();
      }
    }, 0);
  }

  onConfirmNavigation() {
    this.onSim.emit();
  }

  onDeclineNavigation() {
    this.closing = true;
    // Wait for the animation to complete before emitting the event to close the popup
    setTimeout(() => {
      this.onNao.emit();
    }, 200);
  }
}
