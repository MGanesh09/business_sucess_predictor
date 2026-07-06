export type CurrencyType = 'USD' | 'INR';

export const getCurrencySetting = (): CurrencyType => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('currency') as CurrencyType) || 'USD';
  }
  return 'USD';
};

export const setCurrencySetting = (currency: CurrencyType) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currency', currency);
    // Dispatch a custom event to notify all components instantly
    window.dispatchEvent(new Event('currencyChange'));
  }
};

export const formatAmount = (amount: number, currency: CurrencyType) => {
  if (currency === 'INR') {
    // 1 USD = 83 INR
    return `₹${Math.round(amount * 83).toLocaleString()}`;
  }
  return `$${Math.round(amount).toLocaleString()}`;
};
