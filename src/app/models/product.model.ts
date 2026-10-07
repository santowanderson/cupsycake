export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; // e.g., 'Waffle', 'Crème Brûlée'
  tags: ('sem-lactose' | 'sem-gluten' | 'vegano')[];
  ingredients: string[];
  reviews: {
    user: string;
    comment: string;
    rating: number;
  }[];
  image: string;
}
