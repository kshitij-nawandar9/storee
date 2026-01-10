import type { Address } from '@/types';

export interface SavedAddress {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  isDefault?: boolean;
  label?: string; // e.g., "Home", "Work", "Office"
  createdAt: string;
}

const STORAGE_KEY = 'saved_addresses';

export const getSavedAddresses = (): SavedAddress[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading saved addresses:', error);
    return [];
  }
};

export const saveAddress = (address: Omit<SavedAddress, 'id' | 'createdAt'>): SavedAddress => {
  const addresses = getSavedAddresses();
  const newAddress: SavedAddress = {
    ...address,
    id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  // If this is set as default, unset other defaults
  if (newAddress.isDefault) {
    addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  addresses.push(newAddress);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  return newAddress;
};

export const updateAddress = (id: string, updates: Partial<SavedAddress>): boolean => {
  const addresses = getSavedAddresses();
  const index = addresses.findIndex(addr => addr.id === id);
  
  if (index === -1) return false;

  // If setting as default, unset other defaults
  if (updates.isDefault) {
    addresses.forEach(addr => {
      if (addr.id !== id) {
        addr.isDefault = false;
      }
    });
  }

  addresses[index] = { ...addresses[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  return true;
};

export const deleteAddress = (id: string): boolean => {
  const addresses = getSavedAddresses();
  const filtered = addresses.filter(addr => addr.id !== id);
  
  if (filtered.length === addresses.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

export const getDefaultAddress = (): SavedAddress | null => {
  const addresses = getSavedAddresses();
  return addresses.find(addr => addr.isDefault) || addresses[0] || null;
};

export const setDefaultAddress = (id: string): boolean => {
  return updateAddress(id, { isDefault: true });
};
