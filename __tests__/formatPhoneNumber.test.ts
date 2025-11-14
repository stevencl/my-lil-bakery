import { formatPhoneNumber } from '../lib/utils'

describe('formatPhoneNumber', () => {
  describe('US format (default)', () => {
    it('should return empty string for null', () => {
      expect(formatPhoneNumber(null)).toBe('')
    })

    it('should return empty string for undefined', () => {
      expect(formatPhoneNumber(undefined)).toBe('')
    })

    it('should return empty string for empty string', () => {
      expect(formatPhoneNumber('')).toBe('')
    })

    it('should format 10-digit number correctly', () => {
      expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567')
    })

    it('should format number with special characters', () => {
      expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567')
    })

    it('should format 11-digit number with country code correctly', () => {
      expect(formatPhoneNumber('15551234567')).toBe('+1 (555) 123-4567')
    })

    it('should return original for invalid format', () => {
      expect(formatPhoneNumber('123')).toBe('123')
    })
  })

  describe('international format', () => {
    it('should format 10-digit number internationally', () => {
      expect(formatPhoneNumber('5551234567', 'international')).toBe('+1 555 123 4567')
    })

    it('should format 11-digit number internationally', () => {
      expect(formatPhoneNumber('15551234567', 'international')).toBe('+1 555 123 4567')
    })
  })
})
