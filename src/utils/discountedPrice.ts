export const calculateDiscountedPrice = (originalPrice: string, discount: number): string => {
  const discountAmount = Number(originalPrice) * (discount / 100);
  const finalPrice = Number(originalPrice) - discountAmount;
  return finalPrice.toFixed(2);
}