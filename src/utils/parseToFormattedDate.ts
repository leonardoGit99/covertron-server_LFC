export const parseToFormattedDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  const formatted = date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  // Remover "de" y reformatear
  return formatted.replace(/ de /g, ' ').replace(/, /, ' - ');
};