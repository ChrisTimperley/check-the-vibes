import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null) return 'N/A';

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'merged':
    case 'closed':
    case 'pass':
    case 'green':
      return 'status-green';
    case 'open':
    case 'draft':
    case 'yellow':
      return 'status-yellow';
    case 'fail':
    case 'red':
      return 'status-red';
    default:
      return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
  }
}

export function getSizeBucketColor(bucket: string): string {
  switch (bucket) {
    case 'XS':
      return 'bg-blue-100 text-blue-800';
    case 'S':
      return 'bg-green-100 text-green-800';
    case 'M':
      return 'bg-yellow-100 text-yellow-800';
    case 'L':
      return 'bg-orange-100 text-orange-800';
    case 'XL':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
