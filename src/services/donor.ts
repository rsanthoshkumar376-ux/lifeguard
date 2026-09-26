import { apiRequest } from '../config/api';

export const getDonorProfile = async (userId?: string) => {
  try {
    const res = await apiRequest('/blood/donor-profile');
    return res.donor;
  } catch (e) {
    return null;
  }
};

export const saveDonorProfile = async (userId: string, data: any) => {
  return await apiRequest('/blood/donor-profile', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateLocation = async (userId: string, lat: number, lng: number) => {
  return await apiRequest('/blood/donor-profile', {
    method: 'POST',
    body: JSON.stringify({ lat, lng })
  });
};

export const updateAvailability = async (userId: string, available: boolean) => {
  return await apiRequest('/blood/donor-profile', {
    method: 'POST',
    body: JSON.stringify({ isAvailable: available })
  });
};
