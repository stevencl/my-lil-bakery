import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Formats a phone number with better validation and error handling
 */
export function formatPhoneNumber(
  phoneNumber: string | null | undefined,
  format: 'US' | 'international' = 'US'
): string {
  if (!phoneNumber) return ''
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '')
  
  if (format === 'US') {
    // US format: (555) 123-4567
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    // US format with country code: +1 (555) 123-4567
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
  } else if (format === 'international') {
    // International format: +1 555 123 4567
    if (cleaned.length >= 10) {
      const countryCode = cleaned.slice(0, cleaned.length - 10)
      const rest = cleaned.slice(cleaned.length - 10)
      return `+${countryCode} ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`
    }
  }
  
  // Return original if no format matches
  return phoneNumber
}