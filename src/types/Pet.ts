export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  description: string;
  imageUrl: string;
  ownerId: string;
  ownerName: string;
  location: string;
  availability: {
    startDate: string;
    endDate: string;
  };
  price: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
}

export interface Booking {
  id: string;
  petId: string;
  sitterId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
}
