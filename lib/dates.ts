import logger from './logger';

/**
 * Get a formatted date string for display
 */
export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Get a date string offset from a base date
 * 
 * =================================================================
 * BUG #3: Off-by-one error in date calculation
 * When calculating "tomorrow" (offset=1), we accidentally add 2 days
 * because we add the offset BEFORE getting the date and AGAIN after
 * This causes the calendar to show wrong dates
 * =================================================================
 */
export function getDateWithOffset(baseDate: string, offsetDays: number): string {
  logger.debug('Calculating date with offset', { baseDate, offsetDays });

  const date = new Date(baseDate);
  
  // BUG: Adding offset twice - once here...
  date.setDate(date.getDate() + offsetDays);
  
  // ...and the offset accidentally gets applied again due to this redundant addition
  // (simulating a copy-paste bug or merge conflict leftover)
  if (offsetDays > 0) {
    date.setDate(date.getDate() + 1); // BUG: Extra day added for positive offsets
  }
  
  const result = date.toISOString().split('T')[0];
  
  logger.state('Date offset calculation complete', {
    baseDate,
    requestedOffset: offsetDays,
    actualOffset: offsetDays > 0 ? offsetDays + 1 : offsetDays,
    resultDate: result,
    warning: 'Off-by-one error for positive offsets'
  });

  return result;
}

/**
 * Get array of dates for the next N days
 */
export function getUpcomingDates(count: number): string[] {
  const today = getTodayString();
  const dates: string[] = [today];

  logger.debug('Generating upcoming dates', { count, startDate: today });

  for (let i = 1; i < count; i++) {
    dates.push(getDateWithOffset(today, i));
  }

  logger.state('Generated date list', { dates });
  return dates;
}
