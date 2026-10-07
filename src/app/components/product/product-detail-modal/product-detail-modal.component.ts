import {
  animate,
  animateChild,
  group,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { ProductModalService } from './product-detail-modal.service';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-detail-modal.component.html',
  styleUrl: './product-detail-modal.component.css',
  animations: [
    trigger('backdropFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        // Executa simultaneamente a opacidade do fundo e a expansão do card
        group([
          query('@modalScale', animateChild(), { optional: true }),
          animate('250ms ease-out', style({ opacity: 1 })),
        ]),
      ]),
      transition(':leave', [
        // Garante que a animação de encolher o card rode ANTES/JUNTO com a saída do fundo
        group([
          query('@modalScale', animateChild(), { optional: true }),
          animate('200ms ease-in', style({ opacity: 0 })),
        ]),
      ]),
    ]),
    trigger('modalScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.6)' }),
        animate(
          '280ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'scale(1)' }),
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms cubic-bezier(0.7, 0, 0.84, 0)',
          style({ opacity: 0, transform: 'scale(0.6)' }),
        ),
      ]),
    ]),
  ],
})
export class ProductDetailModalComponent {
  protected readonly modalService = inject(ProductModalService);

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.modalService.isOpen()) {
      this.modalService.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.modalService.close();
    }
  }

  formatTagLabel(tag: string): string {
    const labels: Record<string, string> = {
      'sem-lactose': 'Sem Lactose',
      'sem-gluten': 'Sem Glúten',
      vegano: 'Vegano',
    };
    return labels[tag] || tag;
  }
}
