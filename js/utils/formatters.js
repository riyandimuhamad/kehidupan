/**
 * Formatter Utilities for Kehidupan App
 */

export const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
};

export const formatNumber = (number, decimals = 2) => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  }).format(number);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(`kehidupan_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
};

export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(`kehidupan_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn('Storage read failed:', e);
    return defaultValue;
  }
};
