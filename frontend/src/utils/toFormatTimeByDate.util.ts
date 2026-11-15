export const toFormatTimeByDate = (
  dateString : string
): string => {

  const date = new Date(dateString);
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const yesterday = new Date(today);
  
  yesterday.setDate(yesterday.getDate() - 1);

  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (targetDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString('en-US', {
      hour   : '2-digit',
      minute : '2-digit',
      hour12 : true,
    });
  }

  if (targetDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    month : '2-digit',
    day   : '2-digit',
    year  : '2-digit',
  });
};