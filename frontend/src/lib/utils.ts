import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  return format(new Date(date), formatStr)
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function truncate(str: string, length: number = 100): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-500',
    published: 'bg-blue-500',
    upcoming: 'bg-blue-500',
    in_progress: 'bg-green-500',
    active: 'bg-green-500',
    closed: 'bg-purple-500',
    completed: 'bg-purple-500',
    cancelled: 'bg-red-500',
    pending: 'bg-yellow-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
    submitted: 'bg-blue-500',
    finalized: 'bg-green-500',
  }
  return colors[status] || 'bg-gray-500'
}

export function getStatusTextColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'text-gray-500',
    published: 'text-blue-500',
    upcoming: 'text-blue-500',
    in_progress: 'text-green-500',
    active: 'text-green-500',
    closed: 'text-purple-500',
    completed: 'text-purple-500',
    cancelled: 'text-red-500',
    pending: 'text-yellow-500',
    approved: 'text-green-500',
    rejected: 'text-red-500',
    submitted: 'text-blue-500',
    finalized: 'text-green-500',
  }
  return colors[status] || 'text-gray-500'
}

export function getRoleBadgeColor(_role: string): string {
  // Role text remains explicit; color is reserved for small status/icon signals.
  return 'border border-border bg-muted text-foreground'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
