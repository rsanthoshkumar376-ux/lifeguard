import { apiRequest } from '../config/api';

export const getVerifiedHospitals = async () => {
  try {
    const res = await apiRequest('/hospitals');
    return res.hospitals || [];
  } catch (e) {
    return [];
  }
};

export const registerHospital = async (data: any) => {
  return await apiRequest('/hospitals/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const getPendingHospitals = async () => {
  try {
    const res = await apiRequest('/admin/hospitals');
    return res.hospitals || [];
  } catch (e) {
    return [];
  }
};

export const verifyHospital = async (hospitalId: string, status: string) => {
  return await apiRequest(`/admin/hospitals/${hospitalId}/verify`, {
    method: 'POST',
    body: JSON.stringify({ status })
  });
};
