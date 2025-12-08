import api from './api';

/**
 * Authentication Service
 * Handles all auth-related API calls
 * DEV MODE: Using mock authentication for development
 */

const DEV_MODE = false; // Set to false when backend is ready

/**
 * @param {import('../types').LoginCredentials} credentials
 * @returns {Promise<import('../types').AuthResponse>}
 */
export const login = async (credentials) => {
  if (DEV_MODE) {
    // Mock login for development
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    const mockUser = {
      id: 1,
      email: credentials.email,
      profile: {
        id: 1,
        user_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '09123456789',
        academic_level: '3rd Year',
        bio: 'Test user',
        total_reviews: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    };
    
    const mockToken = 'dev-mock-token-' + Date.now();
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    return { token: mockToken, user: mockUser };
  }
  
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

/**
 * @param {import('../types').RegisterData} data
 * @returns {Promise<import('../types').AuthResponse>}
 */
export const register = async (data) => {
  if (DEV_MODE) {
    // Mock registration for development
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    const mockUser = {
      id: Date.now(),
      email: data.email,
      profile: {
        id: Date.now(),
        user_id: Date.now(),
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        academic_level: data.academic_level,
        bio: '',
        total_reviews: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    };
    
    const mockToken = 'dev-mock-token-' + Date.now();
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    return { token: mockToken, user: mockUser };
  }
  
  // Convert snake_case to camelCase for backend
  const backendData = {
    email: data.email,
    password: data.password,
    firstName: data.first_name,
    lastName: data.last_name,
    phoneNumber: data.phone_number,
    instagramHandle: data.instagram_handle,
    academicLevel: data.academic_level
  };
  
  const response = await api.post('/auth/register', backendData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const response = await api.put(`/auth/users/${userId}/change-password`, {
    currentPassword,
    newPassword
  });
  return response.data;
};

export const getCurrentUser = () => {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
