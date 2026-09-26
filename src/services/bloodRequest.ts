import { apiRequest } from '../config/api';

export const createBloodRequest = async (hospitalId: string, data: any) => {
  return await apiRequest('/blood/requests', {
    method: 'POST',
    body: JSON.stringify({ ...data, hospitalId })
  });
};

export const getActiveRequests = async () => {
  try {
    const res = await apiRequest('/blood/requests');
    return res.requests || [];
  } catch (e) {
    return [];
  }
};

export const getNearbyRequests = async (lat: number, lng: number, radiusKm: number, bloodGroup?: string) => {
  try {
    const query = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radiusKm: radiusKm.toString(),
      ...(bloodGroup ? { bloodGroup } : {})
    });
    const res = await apiRequest(`/blood/requests?${query.toString()}`);
    return res.requests || [];
  } catch (e) {
    return [];
  }
};

export const getRequestById = async (id: string) => {
  return await apiRequest(`/blood/requests/${id}`);
};

export const respondToRequest = async (requestId: string, status: string, notes?: string) => {
  return await apiRequest(`/blood/requests/${requestId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ status, notes })
  });
};

export const getDonorResponses = async (requestId: string) => {
  try {
    const res = await apiRequest(`/blood/requests/${requestId}`);
    return res.responses || [];
  } catch (e) {
    return [];
  }
};
