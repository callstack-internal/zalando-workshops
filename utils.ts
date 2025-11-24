import {differenceInDays, format, parseISO} from 'date-fns';

export const formatDate = (dateString: string) => {
  const date = parseISO(dateString);
  const now = new Date();
  const diffDays = Math.abs(differenceInDays(now, date));

  const dayOfWeek = format(date, 'EEEE');
  const monthDayYear = format(date, 'MMMM d, yyyy');

  let relativeText = '';
  if (diffDays === 0) {
    relativeText = 'today';
  } else if (diffDays === 1) {
    relativeText = 'yesterday';
  } else if (diffDays < 7) {
    relativeText = `${diffDays} days ago`;
  } else if (diffDays < 30) {
    relativeText = `${Math.floor(diffDays / 7)} weeks ago`;
  } else if (diffDays < 365) {
    relativeText = `${Math.floor(diffDays / 30)} months ago`;
  } else {
    relativeText = `${Math.floor(diffDays / 365)} years ago`;
  }

  return `${dayOfWeek}, ${monthDayYear} (${relativeText})`;
};
