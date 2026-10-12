export type GenderType = 'MALE' | 'FEMALE' | 'OTHER' | 'NOT_SPECIFIED';

/**
 * Representa o endereço do cliente mapeado da tabela `addresses`
 */
export interface Address {
  id: number;
  customer_id: number;
  zip_code: string;
  street_address: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state_code: string;
  state_name: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Representa o cliente mapeado da tabela `customers`
 */
export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  cpf: string;
  email: string;
  area_code: string;
  phone_number: string;
  gender: GenderType;
  birth_date?: string | null;
  password_hash?: string;
  addresses?: Address[];
  created_at?: string;
  updated_at?: string;
}
