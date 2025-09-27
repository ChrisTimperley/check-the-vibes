const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

export const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = d.getDate();
  const month = MONTHS_SHORT[d.getMonth()] || '';
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

export const formatDateTime = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = formatDate(iso);
  const time = d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date} ${time}`;
};

export const formatDurationMinutes = (minutes?: number | null) => {
  if (!minutes || minutes <= 0) return '—';
  
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (remainingHours > 0) {
    return `${days}d ${remainingHours}h`;
  }
  
  return `${days}d`;
};

export const formatDurationHours = (hours?: number | null) => {
  if (!hours || hours <= 0) return '—';
  
  if (hours < 24) {
    return `${Math.round(hours * 10) / 10}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round((hours % 24) * 10) / 10;
  
  if (remainingHours > 0) {
    return `${days}d ${remainingHours}h`;
  }
  
  return `${days}d`;
};