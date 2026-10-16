import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { ProductTagBadgeComponent } from './product-tag-badge.component';

describe('ProductTagBadgeComponent', () => {
  let component: ProductTagBadgeComponent;
  let fixture: ComponentFixture<ProductTagBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTagBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductTagBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create the component successfully', () => {
    component.tag = 'Test';
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ==========================================
  // 1. TESTES DE EXTRAÇÃO DE TEXTO (rawText)
  // ==========================================
  describe('Raw Text Extraction & Fallbacks', () => {
    it('should handle string input directly', () => {
      component.tag = 'Gourmet';
      expect((component as any).rawText).toBe('Gourmet');
    });

    it('should extract text from object using priority properties (slug, name, title, etc.)', () => {
      component.tag = { name: 'Chocolate Belga' } as any;
      expect((component as any).rawText).toBe('Chocolate Belga');

      component.tag = { slug: 'sem-gluten-slug', name: 'Ignorado' } as any;
      expect((component as any).rawText).toBe('sem-gluten-slug');
    });

    it('should fall back to the first available string property if common properties are missing', () => {
      component.tag = { customField: 'Artesanal' } as any;
      expect((component as any).rawText).toBe('Artesanal');
    });

    it('should return empty string when tag is falsy or empty', () => {
      component.tag = '' as any;
      expect((component as any).rawText).toBe('');
    });
  });

  // ==========================================
  // 2. TESTES DE REGRAS DE RÓTULOS (getTagLabel)
  // ==========================================
  describe('getTagLabel - Formatting & Rules', () => {
    it('should format gluten-related tags as "Sem Glúten"', () => {
      const glutenInputs = ['gluten', 'sem-gluten', 'gluten-free'];
      glutenInputs.forEach((input) => {
        component.tag = input;
        expect((component as any).getTagLabel()).toBe('Sem Glúten');
      });
    });

    it('should format lactose-related tags as "Sem Lactose"', () => {
      const lactoseInputs = ['lactose', 'sem-lactose', 'lactose-free'];
      lactoseInputs.forEach((input) => {
        component.tag = input;
        expect((component as any).getTagLabel()).toBe('Sem Lactose');
      });
    });

    it('should format vegan tags as "Vegano"', () => {
      const veganInputs = ['vegan', 'vegan-product'];
      veganInputs.forEach((input) => {
        component.tag = input;
        expect((component as any).getTagLabel()).toBe('Vegano');
      });
    });

    it('should return the raw text if no specific rule matches', () => {
      component.tag = 'Edição Limitada';
      expect((component as any).getTagLabel()).toBe('Edição Limitada');
    });

    it('should return "Especial" as fallback if raw text is empty', () => {
      component.tag = '' as any;
      expect((component as any).getTagLabel()).toBe('Especial');
    });
  });

  // ==========================================
  // 3. TESTES DE CLASSES CSS (getTagClass)
  // ==========================================
  describe('getTagClass - CSS Styling Rules', () => {
    it('should return "badge-gluten" for gluten-related tags', () => {
      component.tag = 'sem-gluten';
      expect((component as any).getTagClass()).toBe('badge-gluten');
    });

    it('should return "badge-lactose" for lactose-related tags', () => {
      component.tag = 'sem-lactose';
      expect((component as any).getTagClass()).toBe('badge-lactose');
    });

    it('should return "badge-vegan" for vegan tags', () => {
      component.tag = 'vegan';
      expect((component as any).getTagClass()).toBe('badge-vegan');
    });

    it('should return "badge-default" for unknown custom tags', () => {
      component.tag = 'Artesanal';
      expect((component as any).getTagClass()).toBe('badge-default');
    });
  });
});
