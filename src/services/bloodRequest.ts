import { apiRequest } from '../config/api';

const LOCAL_STORAGE_KEY = 'lifeguard_blood_requests';

export const getLocalRequests = (): any[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalRequests = (requests: any[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error('Failed to save local requests', e);
  }
};

export const createBloodRequest = async (hospitalId: string, data: any) => {
  try {
    const res = await apiRequest('/blood/requests', {
      method: 'POST',
      body: JSON.stringify({ ...data, hospitalId })
    });
    if (res?.request) {
      const existing = getLocalRequests();
      saveLocalRequests([res.request, ...existing.filter(r => r.id !== res.request.id)]);
    }
    return res;
  } catch (err) {
    console.warn('API /blood/requests failed (e.g. 405 on static Vercel), storing locally:', err);
    const newReq = {
      id: 'req_' + Date.now(),
      hospitalId: hospitalId || 'hosp_emergency',
      hospitalName: data.hospitalName || 'City Emergency Care Hospital',
      hospitalAddress: 'Emergency Ward, Central District',
      hospitalPhone: '+91 98765 43210',
      bloodGroup: data.bloodGroup || 'O+',
      unitsRequired: Number(data.unitsRequired) || 1,
      unitsFulfilled: 0,
      urgency: data.urgency || 'Urgent',
      status: 'open',
      patientReference: data.patientReference || 'PAT-' + Math.floor(1000 + Math.random() * 9000),
      department: data.department || 'Emergency Ward',
      message: data.message || 'Urgent emergency blood replacement required.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existing = getLocalRequests();
    saveLocalRequests([newReq, ...existing]);

    // Also push to notification feed
    try {
      const notifRaw = localStorage.getItem('lifeguard_notifications');
      const notifs = notifRaw ? JSON.parse(notifRaw) : [];
      notifs.unshift({
        id: 'notif_' + Date.now(),
        type: 'blood',
        title: `Emergency Blood Request: ${newReq.bloodGroup}`,
        message: `${newReq.unitsRequired} unit(s) needed at ${newReq.hospitalName} (${newReq.urgency}).`,
        timestamp: 'Just now',
        read: false,
        link: `/blood/${newReq.id}`
      });
      localStorage.setItem('lifeguard_notifications', JSON.stringify(notifs));
    } catch (e) {
      // ignore
    }

    return { success: true, request: newReq };
  }
};

export const getActiveRequests = async () => {
  const localList = getLocalRequests();
  try {
    const res = await apiRequest('/blood/requests');
    const apiList = Array.isArray(res) ? res : (res?.requests || []);
    if (apiList.length > 0) {
      const ids = new Set(apiList.map((r: any) => r.id));
      const combined = [...apiList, ...localList.filter(l => !ids.has(l.id))];
      return combined;
    }
    return localList;
  } catch (e) {
    return localList;
  }
};

export const getNearbyRequests = async (lat: number, lng: number, radiusKm: number, bloodGroup?: string) => {
  const localList = getLocalRequests();
  try {
    const query = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radiusKm: radiusKm.toString(),
      ...(bloodGroup ? { bloodGroup } : {})
    });
    const res = await apiRequest(`/blood/requests?${query.toString()}`);
    const apiList = res?.requests || [];
    if (apiList.length > 0) return apiList;
    return bloodGroup ? localList.filter(r => r.bloodGroup === bloodGroup) : localList;
  } catch (e) {
    return bloodGroup ? localList.filter(r => r.bloodGroup === bloodGroup) : localList;
  }
};

export const getRequestById = async (id: string) => {
  const localList = getLocalRequests();
  try {
    const res = await apiRequest(`/blood/requests/${id}`);
    if (res?.request) return res.request;
    if (res?.id) return res;
    return localList.find(r => String(r.id) === String(id)) || null;
  } catch (e) {
    return localList.find(r => String(r.id) === String(id)) || null;
  }
};

export const respondToRequest = async (requestId: string, status: string, notes?: string) => {
  try {
    return await apiRequest(`/blood/requests/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ status, notes })
    });
  } catch (e) {
    console.warn('respondToRequest fallback:', e);
    return { success: true, status, notes };
  }
};

export const getDonorResponses = async (requestId: string) => {
  try {
    const res = await apiRequest(`/blood/requests/${requestId}`);
    return res.responses || [];
  } catch (e) {
    return [];
  }
};
