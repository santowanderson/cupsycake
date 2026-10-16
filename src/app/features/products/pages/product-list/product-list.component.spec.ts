import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../services/product.service';
import { ProductListComponent } from './product-list.component';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productServiceMock: {
    filteredProducts: ReturnType<typeof signal<Product[]>>;
    isTagActive: jest.Mock;
    toggleTagFilter: jest.Mock;
  };

  const generateMockProducts = (count: number): Product[] => {
    return Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      name: `Cupcake ${index + 1}`,
      slug: `cupcake-${index + 1}`,
      price: 10.0,
      description: `Descrição do cupcake ${index + 1}`,
      image_url: `cupcake-${index + 1}.jpg`,
      stock_quantity: 10,
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      tags: [{ id: 1, name: 'sem-glutem', slug: 'sem-glutem' }],
    }));
  };

  beforeEach(async () => {
    productServiceMock = {
      filteredProducts: signal<Product[]>([]),
      // Adicionado o cast 'as any' para contornar a restrição de tipo do @types/jest
      isTagActive: jest
        .fn()
        .mockImplementation(((tag: string) => tag === 'chocolate') as any),
      toggleTagFilter: jest.fn(),
    };

    // Mock global do método window.scrollTo com cast compatível
    window.scrollTo = jest.fn() as any;

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [{ provide: ProductService, useValue: productServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component successfully', () => {
    expect(component).toBeTruthy();
  });

  // ==========================================
  // 1. ESTADO INICIAL E CÁLCULOS DE PAGINAÇÃO
  // ==========================================
  describe('Initial State & Pagination Computations', () => {
    it('should initialize with currentPage as 1 and itemsPerPage as 8', () => {
      expect(component.currentPage()).toBe(1);
      expect(component.itemsPerPage).toBe(8);
    });

    it('should compute pagination properties correctly when item count is within a single page', () => {
      productServiceMock.filteredProducts.set(generateMockProducts(5));

      expect(component.totalPages()).toBe(1);
      expect(component.showPagination()).toBe(false);
      expect(component.pagesArray()).toEqual([1]);
      expect(component.paginatedProducts().length).toBe(5);
    });

    it('should compute multiple pages and split products correctly across pages', () => {
      // 10 produtos com 8 itens por página geram 2 páginas (8 na p1, 2 na p2)
      productServiceMock.filteredProducts.set(generateMockProducts(10));

      expect(component.totalPages()).toBe(2);
      expect(component.showPagination()).toBe(true);
      expect(component.pagesArray()).toEqual([1, 2]);

      // Validação da Página 1
      expect(component.paginatedProducts().length).toBe(8);
      expect(component.paginatedProducts()[0].id).toBe(1);
      expect(component.paginatedProducts()[7].id).toBe(8);

      // Mudança para a Página 2
      component.currentPage.set(2);
      expect(component.paginatedProducts().length).toBe(2);
      expect(component.paginatedProducts()[0].id).toBe(9);
      expect(component.paginatedProducts()[1].id).toBe(10);
    });
  });

  // ==========================================
  // 2. INTEGRAÇÃO DE FILTRAGEM DE TAGS
  // ==========================================
  describe('Tag Filtering & Delegation', () => {
    it('should delegate isTagActive checks to ProductService', () => {
      const active = component.isTagActive('chocolate');
      expect(productServiceMock.isTagActive).toHaveBeenCalledWith('chocolate');
      expect(active).toBe(true);
    });

    it('should invoke toggleTagFilter on ProductService and reset currentPage to 1', () => {
      component.currentPage.set(3);
      expect(component.currentPage()).toBe(3);

      component.toggleFilter('vegan');

      expect(productServiceMock.toggleTagFilter).toHaveBeenCalledWith('vegan');
      expect(component.currentPage()).toBe(1);
    });
  });

  // ==========================================
  // 3. NAVEGAÇÃO ENTRE PÁGINAS (changePage)
  // ==========================================
  describe('Page Navigation (changePage)', () => {
    beforeEach(() => {
      // Configura 15 produtos para gerar 2 páginas (8 + 7)
      productServiceMock.filteredProducts.set(generateMockProducts(15));
    });

    it('should update currentPage and trigger smooth window scroll when navigating to a valid page', () => {
      expect(component.currentPage()).toBe(1);

      component.changePage(2);

      expect(component.currentPage()).toBe(2);
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });

    it('should ignore page change requests below page 1', () => {
      component.currentPage.set(2);

      component.changePage(0);

      expect(component.currentPage()).toBe(2);
      expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it('should ignore page change requests exceeding totalPages', () => {
      expect(component.totalPages()).toBe(2);
      component.currentPage.set(1);

      component.changePage(3); // Total pages é 2

      expect(component.currentPage()).toBe(1);
      expect(window.scrollTo).not.toHaveBeenCalled();
    });
  });
});
