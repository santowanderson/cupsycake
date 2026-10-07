import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private products: Product[] = [
    {
      id: '1',
      name: 'Waffle com Frutas Vermelhas',
      description:
        'Waffle crocante acompanhado de frutas vermelhas frescas e calda especial.',
      price: 6.5,
      category: 'Waffle',
      tags: ['sem-gluten'],
      ingredients: [
        'Farinha de trigo sem glúten',
        'Ovos',
        'Manteiga',
        'Frutas Vermelhas',
        'Açúcar',
      ],
      reviews: [
        { user: 'Maria', comment: 'Delicioso!', rating: 5 },
        { user: 'João', comment: 'Muito gostoso.', rating: 4 },
      ],
      image: 'assets/images/cupcake-baunilha.jpg',
    },
    {
      id: '2',
      name: 'Crème Brûlée de Baunilha',
      description: 'Clássico francês com calda de açúcar queimado por cima.',
      price: 7.0,
      category: 'Crème Brûlée',
      tags: ['sem-lactose'],
      ingredients: ['Creme de leite', 'Ovos', 'Baunilha', 'Açúcar'],
      reviews: [{ user: 'Ana', comment: 'A melhor que já comi.', rating: 5 }],
      image: 'assets/images/cupcake-caramelo.jpg',
    },
    {
      id: '3',
      name: 'Mix de Macarons (5 unidades)',
      description: 'Seleção de 5 sabores variados de macarons franceses.',
      price: 8.0,
      category: 'Macaron',
      tags: ['vegano'],
      ingredients: [
        'Farinha de amêndoas',
        'Clara de ovo',
        'Açúcar',
        'Corantes naturais',
      ],
      reviews: [
        { user: 'Pedro', comment: 'Muito coloridos e saborosos.', rating: 5 },
      ],
      image: 'assets/images/cupcake-chocolate.jpg',
    },
    {
      id: '4',
      name: 'Tiramisu Clássico',
      description: 'Sobremesa italiana clássica com café e queijo mascarpone.',
      price: 5.5,
      category: 'Tiramisu',
      tags: [],
      ingredients: ['Biscoitos', 'Café', 'Mascarpone', 'Ovos', 'Cacau'],
      reviews: [
        { user: 'Carla', comment: 'Perfeito para o café da tarde.', rating: 5 },
      ],
      image: 'assets/images/cupcake-confetti.jpg',
    },
    {
      id: '5',
      name: 'Baklava de Pistache',
      description: 'Doce grego tradicional com pistaches e mel.',
      price: 4.0,
      category: 'Baklava',
      tags: ['sem-lactose'],
      ingredients: ['Massa filo', 'Pistache', 'Mel', 'Canela'],
      reviews: [{ user: 'Ricardo', comment: 'Muito autêntico.', rating: 5 }],
      image: 'assets/images/cupcake-leite-condensado.jpg',
    },
    {
      id: '6',
      name: 'Torta de Merengue de Limão',
      description: 'Torta refrescante de limão com cobertura de merengue.',
      price: 5.0,
      category: 'Pie',
      tags: ['vegano'],
      ingredients: ['Limão', 'Leite de coco', 'Açúcar', 'Merengue de aquafaba'],
      reviews: [{ user: 'Beatriz', comment: 'Refrescante!', rating: 4 }],
      image: 'assets/images/cupcake-maca.jpg',
    },
    {
      id: '7',
      name: 'Bolo Red Velvet',
      description: 'Bolo aveludado com cobertura de cream cheese.',
      price: 4.5,
      category: 'Cake',
      tags: [],
      ingredients: [
        'Farinha de trigo',
        'Cocoa',
        'Beterraba',
        'Ovos',
        'Cream Cheese',
      ],
      reviews: [
        { user: 'Lucas', comment: 'Visual lindo e sabor incrível.', rating: 5 },
      ],
      image: 'assets/images/cupcake-oreo-creme.jpg',
    },
    {
      id: '8',
      name: 'Brownie de Caramelo Salgado',
      description: 'Brownie macio com caramelo e pitadas de flor de sal.',
      price: 5.5,
      category: 'Brownie',
      tags: ['sem-lactose'],
      ingredients: ['Chocolate', 'Manteiga', 'Caramelo', 'Flor de sal'],
      reviews: [
        {
          user: 'Juliana',
          comment: 'O equilíbrio perfeito de doce e salgado.',
          rating: 5,
        },
      ],
      image: 'assets/images/cupcake-romeu-e-julieta.jpg',
    },
    {
      id: '9',
      name: 'Panna Cotta de Baunilha',
      description: 'Sobremesa italiana cremosa de baunilha.',
      price: 6.5,
      category: 'Panna Cotta',
      tags: ['vegano'],
      ingredients: ['Leite de coco', 'Agar-agar', 'Baunilha', 'Açúcar'],
      reviews: [{ user: 'Sonia', comment: 'Muito leve e gostosa.', rating: 4 }],
      image: 'assets/images/cupcake-snickers.jpg',
    },
  ];

  private cart: Map<string, { product: Product; quantity: number }> = new Map();

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$: Observable<number> = this.cartCountSubject.asObservable();

  getProducts(): Product[] {
    return this.products;
  }

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
