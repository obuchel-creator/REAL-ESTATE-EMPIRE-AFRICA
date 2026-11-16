import { GameDate } from '../types';

export class SimulationClock {
  static advanceMonth(currentDate: GameDate): GameDate {
    let newMonth = currentDate.month + 1;
    let newYear = currentDate.year;
    let newDaysElapsed = currentDate.totalDaysElapsed + 30; // standard 30-day simulation month

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }

    return {
      year: newYear,
      month: newMonth,
      day: 1,
      totalDaysElapsed: newDaysElapsed,
    };
  }

  static getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || 'Unknown';
  }

  static formatDate(date: GameDate): string {
    return `${SimulationClock.getMonthName(date.month)} ${date.year}`;
  }
}
