export const calculateDiscountedPrice = (originalPrice: number, discount: number): number => {
  const discountAmount = originalPrice * (discount / 100);
  const finalPrice = originalPrice - discountAmount;
  return Number(finalPrice.toFixed(2));
}