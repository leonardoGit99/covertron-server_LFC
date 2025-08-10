export const parseToFormmatedDate = (dateString: string): string => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  }).replace(/ de /g, ' ');

  return formattedDate;
} 