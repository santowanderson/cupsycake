// export interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   category: string;
//   tags: ('sem-lactose' | 'sem-gluten' | 'vegano')[];
//   ingredients: string[];
//   reviews: {
//     user: string;
//     comment: string;
//     rating: number;
//   }[];
//   image: string;
// }

export type TagName = 'sem-gluten' | 'sem-lactose' | 'vegano';

export interface Tag {
  id?: number;
  name: TagName;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  ingredients?: string;
  price: number;
  imageUrl?: string;
  tags: TagName[];
  createdOn?: string;
  updatedOn?: string;
}
