export interface Address {
  zipCode: string;
  streetAddress: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  stateCode: string;
  stateName: string;
}

export interface UserRegistrationDTO {
  firstName: string;
  lastName: string;
  cpf: string;
  email: string;
  areaCode: string;
  phoneNumber: string;
  gender: string;
  birthDate: string; // Formato: 'AAAA-MM-DD'
  password: string;
  address: Address;
}

export interface UserLoginDTO {
  email: string;
  password: string;
}
