export const toMonthDayYearTwelveHoursFormat = (
  isoString : string
): string => {
  const date = new Date(isoString);

  const formatter = new Intl.DateTimeFormat('en-US', {
    month  : '2-digit',
    day    : '2-digit',
    year   : '2-digit',
    hour   : '2-digit',
    minute : '2-digit',
    second : '2-digit',
    hour12 : true
  });

  return formatter.format(date).toLowerCase();
}

