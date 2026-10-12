import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Tag } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-tag-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'product-tag-badge.component.html',
  styleUrl: 'product-tag-badge.component.css',
})
export class ProductTagBadgeComponent {
  @Input({ required: true }) tag!: Tag | string;

  /**
   * Varre dinamicamente o objeto em busca de qualquer string válida
   */
  private get rawText(): string {
    if (!this.tag) return '';
    if (typeof this.tag === 'string') return this.tag;

    if (typeof this.tag === 'object') {
      const t = this.tag as any;

      // 1. Tenta as propriedades mais comuns
      const directMatch =
        t.slug ||
        t.name ||
        t.title ||
        t.label ||
        t.tag_name ||
        t.tag_slug ||
        t.description;
      if (directMatch) return String(directMatch);

      // 2. Fallback dinâmico: busca a primeira propriedade do objeto que seja uma string com texto
      const firstStringValue = Object.values(t).find(
        (val) => typeof val === 'string' && val.trim().length > 0,
      );
      if (firstStringValue) return String(firstStringValue);
    }

    return String(this.tag);
  }

  protected getTagLabel(): string {
    const s = this.rawText.toLowerCase();

    if (s.includes('gluten') || s.includes('sem-gluten')) return 'Sem Glúten';
    if (s.includes('lactose') || s.includes('sem-lactose'))
      return 'Sem Lactose';
    if (s.includes('vegan')) return 'Vegano';

    // Se encontrou algum texto no banco mas não bateu com as regras acima, exibe o próprio texto
    return this.rawText || 'Especial';
  }

  protected getTagClass(): string {
    const s = this.rawText.toLowerCase();

    if (s.includes('gluten') || s.includes('sem-gluten')) return 'badge-gluten';
    if (s.includes('lactose') || s.includes('sem-lactose'))
      return 'badge-lactose';
    if (s.includes('vegan')) return 'badge-vegan';

    return 'badge-default';
  }
}
