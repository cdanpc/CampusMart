import api from './api';

// Get all profiles
export const getAllProfiles = async () => {
  const response = await api.get('/profiles');
  return response.data;
};

// Get profile by ID
export const getProfileById = async (id) => {
  const response = await api.get(`/profiles/${id}`);
  return response.data;
};

// Update profile (requires authentication)
export const updateProfile = async (id, profileData) => {
  const response = await api.put(`/profiles/${id}`, profileData);
  return response.data;
};

// Delete profile (requires authentication)
export const deleteProfile = async (id) => {
  const response = await api.delete(`/profiles/${id}`);
  return response.data;
};

// Upload profile picture
export const uploadProfilePicture = async (profileId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await api.post(`/profiles/${profileId}/upload-picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
