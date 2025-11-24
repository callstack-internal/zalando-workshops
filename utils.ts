import moment from 'moment';

export const formatDate = (dateString: string) => {
  const date = moment(dateString);
  const now = moment();
  const diffDays = Math.abs(now.diff(date, 'days'));

  const dayOfWeek = date.format('dddd');
  const monthDayYear = date.format('MMMM D, YYYY');

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
