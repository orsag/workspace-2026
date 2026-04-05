export interface UserInternal {
  // Core Identity
  id: string;
  name: string;
  username: string;
  email: string;

  // Security & Role
  role: 'GUEST' | 'READER';
  isActive: boolean;
  lastLogin?: Date;

  // Contact & Location
  phone: string;
  website: string;
  avatarUrl?: string; // For those nice Tailwind/daisyUI avatars

  // Address Object (Better than just 'street')
  address: {
    street: string;
    suite?: string;
    city: string;
    zipcode: string;
  };

  // Professional / Work Info
  company: {
    name: string;
    catchPhrase?: string;
    bs?: string;
  };

  // Books App Specifics (Optional but helpful)
  preferences: {
    favoriteGenre: string[];
    emailNotifications: boolean;
    darkMode: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserDto = Omit<UserInternal, 'id'>;
