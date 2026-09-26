import { apiRequest } from '../config/api';

export interface EmergencyToken {
  id: string;
  token: string;
  userId: string;
  active?: boolean;
  isActive?: boolean;
  createdAt: any;
}

export interface AccessLog {
  id?: string;
  timestamp?: any;
  accessedAt?: any;
  accessType?: string;
  approximateLocation?: string;
  location?: any;
}

export const generateEmergencyToken = async (userId?: string) => {
  return await apiRequest('/emergency/token', { method: 'POST' });
};

export const generateToken = generateEmergencyToken;

export const getActiveTokens = async (userId?: string): Promise<EmergencyToken[]> => {
  try {
    const res = await apiRequest<{ tokens: EmergencyToken[] }>('/emergency/tokens');
    return res.tokens || [];
  } catch (e) {
    return [];
  }
};

export const toggleTokenActive = async (tokenId: string, active: boolean) => {
  return await apiRequest(`/emergency/tokens/${tokenId}/toggle`, {
    method: 'POST',
    body: JSON.stringify({ active })
  });
};

export const revokeAllTokens = async (userId?: string) => {
  const tokens = await getActiveTokens(userId);
  for (const t of tokens) {
    await toggleTokenActive(t.id, false);
  }
  return await generateEmergencyToken(userId);
};

export const getAccessLogs = async (userId?: string): Promise<AccessLog[]> => {
  try {
    const res = await apiRequest<{ logs: AccessLog[] }>('/emergency/logs');
    return res.logs || [];
  } catch (e) {
    return [];
  }
};

export const validateEmergencyToken = async (token: string) => {
  return await apiRequest(`/emergency/view/${token}`);
};

export const sendSosAlert = async (lat?: number, lng?: number) => {
  return await apiRequest('/emergency/sos', {
    method: 'POST',
    body: JSON.stringify({ lat, lng })
  });
};
