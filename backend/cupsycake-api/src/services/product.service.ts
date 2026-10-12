import { ProductRepository } from '../repositories/product.repository';
import { Product } from '../types';

export class ProductService {
  private productRepository = new ProductRepository();

  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.findAllActive();
  }
}
