/**
 * Birthday utility functions for calculating days until next birthday
 * These are pure functions that can be easily unit tested
 */

export interface BirthdayInfo {
  daysUntilBirthday: number
  isUpcoming: boolean
  isBirthdayToday: boolean
  nextBirthdayDate: Date
}

/**
 * Calculates the number of days until the next birthday
 * @param dateOfBirth - The user's date of birth
 * @param referenceDate - The date to calculate from (defaults to today, used for testing)
 * @returns Number of days until the next birthday (0 if today is the birthday)
 */
export function getDaysUntilBirthday(
  dateOfBirth: Date | string,
  referenceDate: Date = new Date()
): number {
  // Convert string to Date if needed
  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth
  
  // Validate the date
  if (isNaN(birthDate.getTime())) {
    throw new Error("Invalid date of birth")
  }
  
  // Normalize reference date to start of day
  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)
  
  // Get the birthday month and day
  const birthMonth = birthDate.getMonth()
  const birthDay = birthDate.getDate()
  
  // Calculate this year's birthday
  let nextBirthday = new Date(today.getFullYear(), birthMonth, birthDay)
  nextBirthday.setHours(0, 0, 0, 0)
  
  // Handle Feb 29 in non-leap years - move to March 1
  if (birthMonth === 1 && birthDay === 29) {
    const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
    if (!isLeapYear(today.getFullYear())) {
      nextBirthday = new Date(today.getFullYear(), 2, 1) // March 1
      nextBirthday.setHours(0, 0, 0, 0)
    }
  }
  
  // If this year's birthday has passed, use next year
  if (nextBirthday < today) {
    const nextYear = today.getFullYear() + 1
    nextBirthday = new Date(nextYear, birthMonth, birthDay)
    nextBirthday.setHours(0, 0, 0, 0)
    
    // Handle Feb 29 in non-leap years for next year as well
    if (birthMonth === 1 && birthDay === 29) {
      const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
      if (!isLeapYear(nextYear)) {
        nextBirthday = new Date(nextYear, 2, 1) // March 1
        nextBirthday.setHours(0, 0, 0, 0)
      }
    }
  }
  
  // Calculate the difference in days
  const diffInMs = nextBirthday.getTime() - today.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  return diffInDays
}

/**
 * Gets comprehensive birthday information for a user
 * @param dateOfBirth - The user's date of birth
 * @param referenceDate - The date to calculate from (defaults to today, used for testing)
 * @returns BirthdayInfo object with all relevant birthday data
 */
export function getBirthdayInfo(
  dateOfBirth: Date | string | null | undefined,
  referenceDate: Date = new Date()
): BirthdayInfo | null {
  if (!dateOfBirth) {
    return null
  }
  
  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth
  
  // Validate the date
  if (isNaN(birthDate.getTime())) {
    return null
  }
  
  const daysUntilBirthday = getDaysUntilBirthday(birthDate, referenceDate)
  const isBirthdayToday = daysUntilBirthday === 0
  const isUpcoming = daysUntilBirthday > 0 && daysUntilBirthday <= 7
  
  // Calculate next birthday date
  const nextBirthdayDate = getNextBirthdayDate(referenceDate, birthDate)
  
  return {
    daysUntilBirthday,
    isUpcoming,
    isBirthdayToday,
    nextBirthdayDate,
  }
}

function getNextBirthdayDate(referenceDate: Date, birthDate: Date) {
    const today = new Date(referenceDate)
    today.setHours(0, 0, 0, 0)

    const thisYearBirthday = new Date(
        today.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
    )
    thisYearBirthday.setHours(0, 0, 0, 0)

    if (thisYearBirthday >= today) {
        return thisYearBirthday
    }
    
    const nextYearBirthday = new Date(
        today.getFullYear() + 1,
        birthDate.getMonth(),
        birthDate.getDate()
    )
    nextYearBirthday.setHours(0, 0, 0, 0)
    
    return nextYearBirthday
}

/**
 * Checks if a birthday notification should be shown
 * @param dateOfBirth - The user's date of birth
 * @param referenceDate - The date to calculate from (defaults to today, used for testing)
 * @returns true if notification should be shown (0-7 days until birthday)
 */
export function shouldShowBirthdayNotification(
  dateOfBirth: Date | string | null | undefined,
  referenceDate: Date = new Date()
): boolean {
  const info = getBirthdayInfo(dateOfBirth, referenceDate)
  
  if (!info) {
    return false
  }
  
  return info.isBirthdayToday || info.isUpcoming
}

/**
 * Gets a formatted birthday message based on days until birthday
 * @param daysUntilBirthday - Number of days until the birthday
 * @returns A friendly message for the user
 */
export function getBirthdayMessage(daysUntilBirthday: number): string {
  if (daysUntilBirthday === 0) {
    return "🎉 Happy Birthday! Enjoy a FREE treat on us today!"
  }
  
  if (daysUntilBirthday === 1) {
    return "🎂 Your birthday is tomorrow! Don't forget to claim your FREE birthday treat!"
  }
  
  return `🎈 Your birthday is in ${daysUntilBirthday} days! Get a FREE item on your special day!`
}
