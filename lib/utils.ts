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
  else return phoneNumber
  
  // write code to return the properly formatted phone number 

}