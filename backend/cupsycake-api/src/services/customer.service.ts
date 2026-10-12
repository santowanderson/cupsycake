import { CustomerRepository } from '../repositories/customer.repository';

export class CustomerService {
  private customerRepository = new CustomerRepository();

  async getAllCustomers() {
    return await this.customerRepository.findAll();
  }
}
