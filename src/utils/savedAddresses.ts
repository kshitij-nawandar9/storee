import type { Address } from "@/types";

export interface SavedAddress {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  isDefault?: boolean;
  label?: string;
  createdAt: string;
}

const STORAGE_KEY = "saved_addresses";

export const getSavedAddresses = (): SavedAddress[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveAddress = (
  address: Omit<SavedAddress, "id" | "createdAt">
): SavedAddress => {
  const addresses = getSavedAddresses();
  const newAddress: SavedAddress = {
    ...address,
    id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  if (newAddress.isDefault) {
    addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  addresses.push(newAddress);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  return newAddress;
};

export const getDefaultAddress = (): SavedAddress | null => {
  const addresses = getSavedAddresses();
  return addresses.find((addr) => addr.isDefault) || addresses[0] || null;
};
