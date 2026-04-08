export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  phoneNumber: string;
  theme: string;
  favorites: string[];
  lastLogin?: Date;
  cartItems: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserDto = Omit<User, 'id'>;

export type UserWithoutId = Omit<
  User,
  'id' | 'favorites' | 'isAdmin' | 'lastLogin' | 'cartItems' | 'createdAt' | 'updatedAt'
>;

// Initialisation
export const EMPTY_USER: UserWithoutId = {
  username: '',
  email: '',
  phoneNumber: '',
  theme: 'light',
};
