export const calculateDiscountedPrice = (
  originalPrice: number,
  discount?: number // ahora puede ser undefined
): number => {
  const safeDiscount = discount ?? 0; // si es undefined, usamos 0
  if (safeDiscount === 0) return originalPrice;

  const discountAmount = originalPrice * (safeDiscount / 100);
  const finalPrice = originalPrice - discountAmount;
  return Number(finalPrice.toFixed(2));
};