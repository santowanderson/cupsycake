import { OrderRepository } from '../repositories/order.repository';

export class OrderService {
  private orderRepository = new OrderRepository();

  async getUserOrders(customerId: number) {
    return await this.orderRepository.findByCustomerId(customerId);
  }
}
