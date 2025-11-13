import {
  getDaysUntilBirthday,
  getBirthdayInfo,
  shouldShowBirthdayNotification,
  getBirthdayMessage,
} from "@/lib/birthday"

describe("Birthday Utility Functions", () => {
  describe("getDaysUntilBirthday", () => {
    test("calculates days until birthday when birthday is in the future this year", () => {
      const dateOfBirth = new Date("1990-12-25") // December 25
      const referenceDate = new Date("2025-12-20") // December 20, 2025
      
      const result = getDaysUntilBirthday(dateOfBirth, referenceDate)
      
      expect(result).toBe(5)
    })

    test("returns 0 when today is the birthday", () => {
      const dateOfBirth = new Date("1990-10-15")
      const referenceDate = new Date("2025-10-15")
      
      const result = getDaysUntilBirthday(dateOfBirth, referenceDate)
      
      expect(result).toBe(0)
    })

    test("calculates days until next year's birthday when this year's birthday has passed", () => {
      const dateOfBirth = new Date("1990-01-15") // January 15
      const referenceDate = new Date("2025-10-15") // October 15, 2025
      
      const result = getDaysUntilBirthday(dateOfBirth, referenceDate)
      
      // From Oct 15, 2025 to Jan 15, 2026
      expect(result).toBe(92)
    })

    test("handles leap year birthdays correctly", () => {
      const dateOfBirth = new Date("1992-02-29") // Leap year birthday
      const referenceDate = new Date("2025-02-28") // Non-leap year
      
      const result = getDaysUntilBirthday(dateOfBirth, referenceDate)
      
      expect(result).toBe(1) // Should be March 1 in non-leap year
    })

    test("works with string date format", () => {
      const dateOfBirth = "1990-12-25"
      const referenceDate = new Date("2025-12-20")
      
      const result = getDaysUntilBirthday(dateOfBirth, referenceDate)
      
      expect(result).toBe(5)
    })

    test("handles birthday exactly one week away", () => {
      const dateOfBirth = new Date("1990-10-20")
      const referenceDate = new Date("2025-10-13")
      
      const result = getDaysUntilBirthday(dateOfBirth, referenceDate)
      
      expect(result).toBe(7)
    })

    test("handles birthday tomorrow", () => {
      const dateOfBirth = new Date("1990-10-14")
      const referenceDate = new Date("2025-10-13")
      
      const result = getDaysUntilBirthday(dateOfBirth, referenceDate)
      
      expect(result).toBe(1)
    })
  })

  describe("getBirthdayInfo", () => {
    test("returns correct info when birthday is upcoming (within 7 days)", () => {
      const dateOfBirth = new Date("1990-10-18")
      const referenceDate = new Date("2025-10-13")
      
      const result = getBirthdayInfo(dateOfBirth, referenceDate)
      
      expect(result).not.toBeNull()
      expect(result?.daysUntilBirthday).toBe(5)
      expect(result?.isUpcoming).toBe(true)
      expect(result?.isBirthdayToday).toBe(false)
    })

    test("returns correct info when today is the birthday", () => {
      const dateOfBirth = new Date("1990-10-13")
      const referenceDate = new Date("2025-10-13")
      
      const result = getBirthdayInfo(dateOfBirth, referenceDate)
      
      expect(result).not.toBeNull()
      expect(result?.daysUntilBirthday).toBe(0)
      expect(result?.isUpcoming).toBe(false)
      expect(result?.isBirthdayToday).toBe(true)
    })

    test("returns correct info when birthday is more than 7 days away", () => {
      const dateOfBirth = new Date("1990-10-25")
      const referenceDate = new Date("2025-10-13")
      
      const result = getBirthdayInfo(dateOfBirth, referenceDate)
      
      expect(result).not.toBeNull()
      expect(result?.daysUntilBirthday).toBe(12)
      expect(result?.isUpcoming).toBe(false)
      expect(result?.isBirthdayToday).toBe(false)
    })

    test("returns null when dateOfBirth is null", () => {
      const result = getBirthdayInfo(null)
      
      expect(result).toBeNull()
    })

    test("returns null when dateOfBirth is undefined", () => {
      const result = getBirthdayInfo(undefined)
      
      expect(result).toBeNull()
    })

    test("returns null when dateOfBirth is invalid", () => {
      const result = getBirthdayInfo("invalid-date")
      
      expect(result).toBeNull()
    })

    test("returns correct nextBirthdayDate when birthday is this year", () => {
      const dateOfBirth = new Date("1990-12-25")
      const referenceDate = new Date("2025-10-13")
      
      const result = getBirthdayInfo(dateOfBirth, referenceDate)
      
      expect(result).not.toBeNull()
      expect(result?.nextBirthdayDate.getFullYear()).toBe(2025)
      expect(result?.nextBirthdayDate.getMonth()).toBe(11) // December (0-indexed)
      expect(result?.nextBirthdayDate.getDate()).toBe(25)
    })

    test("returns correct nextBirthdayDate when birthday is next year", () => {
      const dateOfBirth = new Date("1990-01-15")
      const referenceDate = new Date("2025-10-13")
      
      const result = getBirthdayInfo(dateOfBirth, referenceDate)
      
      expect(result).not.toBeNull()
      expect(result?.nextBirthdayDate.getFullYear()).toBe(2026)
      expect(result?.nextBirthdayDate.getMonth()).toBe(0) // January (0-indexed)
      expect(result?.nextBirthdayDate.getDate()).toBe(15)
    })
  })

  describe("shouldShowBirthdayNotification", () => {
    test("returns true when birthday is today", () => {
      const dateOfBirth = new Date("1990-10-13")
      const referenceDate = new Date("2025-10-13")
      
      const result = shouldShowBirthdayNotification(dateOfBirth, referenceDate)
      
      expect(result).toBe(true)
    })

    test("returns true when birthday is within 7 days", () => {
      const dateOfBirth = new Date("1990-10-18")
      const referenceDate = new Date("2025-10-13")
      
      const result = shouldShowBirthdayNotification(dateOfBirth, referenceDate)
      
      expect(result).toBe(true)
    })

    test("returns true when birthday is exactly 7 days away", () => {
      const dateOfBirth = new Date("1990-10-20")
      const referenceDate = new Date("2025-10-13")
      
      const result = shouldShowBirthdayNotification(dateOfBirth, referenceDate)
      
      expect(result).toBe(true)
    })

    test("returns false when birthday is more than 7 days away", () => {
      const dateOfBirth = new Date("1990-10-25")
      const referenceDate = new Date("2025-10-13")
      
      const result = shouldShowBirthdayNotification(dateOfBirth, referenceDate)
      
      expect(result).toBe(false)
    })

    test("returns false when dateOfBirth is null", () => {
      const result = shouldShowBirthdayNotification(null)
      
      expect(result).toBe(false)
    })

    test("returns false when dateOfBirth is undefined", () => {
      const result = shouldShowBirthdayNotification(undefined)
      
      expect(result).toBe(false)
    })
  })

  describe("getBirthdayMessage", () => {
    test("returns birthday message when days is 0", () => {
      const result = getBirthdayMessage(0)
      
      expect(result).toContain("Happy Birthday")
      expect(result).toContain("FREE")
    })

    test("returns tomorrow message when days is 1", () => {
      const result = getBirthdayMessage(1)
      
      expect(result).toContain("tomorrow")
      expect(result).toContain("FREE")
    })

    test("returns countdown message for other days", () => {
      const result = getBirthdayMessage(5)
      
      expect(result).toContain("5 days")
      expect(result).toContain("FREE")
    })

    test("throws error when dateOfBirth string is invalid", () => {
      expect(() => {
      getDaysUntilBirthday("invalid-date-string")
      }).toThrow("Invalid date of birth")
    })

    test("throws error when dateOfBirth Date object is invalid", () => {
      const invalidDate = new Date("invalid")
      expect(() => {
      getDaysUntilBirthday(invalidDate)
      }).toThrow("Invalid date of birth")
    })

    test("handles edge case when birthday is yesterday", () => {
      const dateOfBirth = new Date("1990-10-12")
      const referenceDate = new Date("2025-10-13")
      
      const result = getDaysUntilBirthday(dateOfBirth, referenceDate)
      
      // Should be next year's birthday (365 days in non-leap year)
      expect(result).toBe(364)
    })

    test("handles New Year's Day birthday correctly", () => {
      const dateOfBirth = new Date("1990-01-01")
      const referenceDate = new Date("2025-12-31")
      
      const result = getDaysUntilBirthday(dateOfBirth, referenceDate)
      
      expect(result).toBe(1)
    })

    test("handles birthday at end of February in leap year", () => {
      const dateOfBirth = new Date("1992-02-29")
      const referenceDate = new Date("2024-02-28") // 2024 is a leap year
      
      const result = getDaysUntilBirthday(dateOfBirth, referenceDate)
      
      expect(result).toBe(1)
    })
  })
})
