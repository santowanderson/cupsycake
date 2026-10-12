import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { CustomerRepository } from '../repositories/customer.repository';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';

export class AuthService {
  private customerRepository = new CustomerRepository();

  async register(input: RegisterInput) {
    const emailExists = await this.customerRepository.findByEmail(input.email);
    if (emailExists) throw new Error('Email already registered');

    const cpfExists = await this.customerRepository.findByCpf(input.cpf);
    if (cpfExists) throw new Error('CPF already registered');

    const passwordHash = await bcrypt.hash(input.password, 10);

    const customerId = await this.customerRepository.createCustomerWithAddress(
      {
        first_name: input.firstName,
        last_name: input.lastName,
        cpf: input.cpf,
        email: input.email,
        area_code: input.areaCode,
        phone_number: input.phoneNumber,
        gender: input.gender,
        birth_date: input.birthDate,
        password_hash: passwordHash,
      },
      input.address
        ? {
            zip_code: input.address.zipCode,
            street_address: input.address.streetAddress,
            number: input.address.number,
            complement: input.address.complement,
            neighborhood: input.address.neighborhood,
            city: input.address.city,
            state_code: input.address.stateCode,
            state_name: input.address.stateName,
          }
        : undefined,
    );

    const token = this.generateToken(customerId, input.email);

    return {
      user: { id: customerId, firstName: input.firstName, email: input.email },
      token,
    };
  }

  async login(input: LoginInput) {
    const customer = await this.customerRepository.findByEmail(input.email);
    if (!customer) throw new Error('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(
      input.password,
      customer.password_hash,
    );
    if (!isPasswordValid) throw new Error('Invalid email or password');

    const token = this.generateToken(customer.id, customer.email);

    return {
      user: {
        id: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
      },
      token,
    };
  }

  private generateToken(customerId: number, email: string): string {
    const secret = process.env.JWT_SECRET || 'secret';

    // Cast do expiresIn para o tipo aceito pelas opções do JWT
    const expiresIn = (process.env.JWT_EXPIRES_IN ||
      '1d') as SignOptions['expiresIn'];

    const options: SignOptions = {
      expiresIn,
    };

    return jwt.sign({ sub: customerId, email }, secret, options);
  }
}
