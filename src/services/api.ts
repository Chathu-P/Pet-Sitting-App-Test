// API Base URL - Update this with your backend URL
const API_BASE_URL = 'http://localhost:3000/api';

// Generic API call function
async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  signup: (userData: { name: string; email: string; password: string }) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

// Pet APIs
export const petAPI = {
  getAllPets: () => apiCall('/pets'),
  
  getPetById: (id: string) => apiCall(`/pets/${id}`),
  
  createPet: (petData: any) =>
    apiCall('/pets', {
      method: 'POST',
      body: JSON.stringify(petData),
    }),
};

// Booking APIs
export const bookingAPI = {
  createBooking: (bookingData: any) =>
    apiCall('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),
  
  getUserBookings: (userId: string) => apiCall(`/bookings/user/${userId}`),
};
