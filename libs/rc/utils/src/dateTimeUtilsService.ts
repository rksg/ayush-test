// In order to overcome rollup.js issue we set imported moment to a variabale
// For more details see - https://stackoverflow.com/questions/42267240/angular-aot-rollup-with-modules-which-have-no-default-export-like-immutable-js#answer-42402575
import * as moment_ from 'moment-timezone';
import * as moment_duration_format_ from 'moment-duration-format';
import {UserProfile} from '../models/user-profile.model';
import {DateFilters, DateFiltersEnum} from '../models/report.model';
import * as moment_timezone_ from 'moment-timezone';

const moment = moment_;
const moment_duration_format = moment_duration_format_;
const moment_timezone = moment_timezone_;

// @Injectable({
//   providedIn: 'root'
// })
export class DateTimeUtilsService {

  constructor() {
    moment_duration_format(moment_); // init moment-duration-format plugin
  }

  /**
   * Convert an ISO_8601 string into a formatted date string
   * @param dateTimeStr - date time string in ISO format
   * @param dateFormatStr - date format string
   * @param dateFormatStr - time format string
   * @returns
   */
  static convertTimeFromISOString(dateTimeStr: string, dateFormatStr: string = 'YYYY-MM-DD', timeFormatStr: string = 'HH:mm', localTime = false): string {
    if (dateTimeStr !== '') {
      if (localTime) {
        return moment.utc(dateTimeStr).local().format(dateFormatStr + ' ' + timeFormatStr);
      } else {
        return moment(dateTimeStr).utc().format(dateFormatStr + ' ' + timeFormatStr);
      }
    } else {
      return '';
    }
  }

  /**
   *  Get User selected date format from user profile service
   * @param userProfile
   * @param dateStr
   */
  static getUserDateFormat(userProfile: UserProfile, dateStr: string, recivedDateFormat = 'YYYY-MM-DD HH:mm:ss', localTime = false) {
    const dateFormat = userProfile.dateFormat;

    let date: moment_.Moment;
    if (localTime) {
      date =  moment.utc(dateStr).local();
    } else {
      date = moment(dateStr, recivedDateFormat);
    }
    return date.format(dateFormat.toUpperCase() + ' HH:mm:ss');
  }

  static getUserDateToLocalTimeZone(dateStr: string, dateFormat = 'YYYY-MM-DD', showTime: boolean = true, timeFormat = 'HH:mm:ss') {
    let localDate: moment_.Moment;
    const utc = moment.utc(dateStr);
    localDate = moment(utc).local();
    let format = dateFormat.toUpperCase();
    if (showTime) {
      format += ' ' + timeFormat;
    }
    return localDate.format(format);
  }

  static getDurationString(durationInMills): string {
    return (moment.duration(durationInMills) as any).format('d [days], h [hours], m [minutes]', {trim: 'both mid'});
  }

  static convertTimeToISOString(date) {
    return date.format('YYYY-MM-DD[T]HH:mm:ss[Z]');
  }

  static millisToProperDuration(ms) {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const daysms = ms % (24 * 60 * 60 * 1000);
    const hours = Math.floor((daysms) / (60 * 60 * 1000));
    const hoursms = ms % (60 * 60 * 1000);
    const minutes = Math.floor((hoursms) / (60 * 1000));
    const minutesms = ms % (60 * 1000);
    const seconds = Math.floor((minutesms) / (1000));
    if (days > 0) {
      return days + ' ' + (days === 1 ? 'Day' : 'Days') + ' ' + hours + ' ' + (hours <= 1 ? 'Hour' : 'Hours');
    }
    if (hours > 0) {
      return hours + ' ' + (hours === 1 ? 'Hour' : 'Hours') + ' ' + minutes + ' ' + (minutes <= 1 ? 'Minute' : 'Minutes');
    } else {
      return minutes + ' ' + (minutes <= 1 ? 'Minute' : 'Minutes') + ' ' + seconds + ' ' + (seconds <= 1 ? 'Second' : 'Seconds');
    }
  }

  static getDateBeforeNDays(days: number, dateFormat?: string) {
    return dateFormat ? moment().subtract(days, 'days').utc().format(dateFormat) :
      moment().subtract(days, 'days').utc();
  }

  static getUTCDate(dateFormat?: string, dateToFormat?: string) {
    return dateFormat ? moment(dateToFormat).utc().format(dateFormat) : moment(dateToFormat).utc();
  }

  static getFromToDates(FilterPeriod: DateFiltersEnum, fromDate?, toDate?): DateFilters {
    const currentDate = DateTimeUtilsService.convertTimeToISOString(DateTimeUtilsService.getUTCDate());
    let dateFilter: DateFilters = {};
    if (FilterPeriod === DateFiltersEnum.last24Hours) {
      const yesterdayDate = DateTimeUtilsService.convertTimeToISOString(DateTimeUtilsService.getDateBeforeNDays(1));
      dateFilter = {
        fromDate: yesterdayDate,
        toDate: currentDate,
        filterPeriod: DateFiltersEnum.last24Hours
      };
    } else if (FilterPeriod === DateFiltersEnum.last7Days) {
      const weekBeforeDate = DateTimeUtilsService.convertTimeToISOString(DateTimeUtilsService.getDateBeforeNDays(7));
      dateFilter = {
        fromDate: weekBeforeDate,
        toDate: currentDate,
        filterPeriod: DateFiltersEnum.last7Days
      };
    } else if (FilterPeriod === DateFiltersEnum.last30Days) {
      const monthBeforeDate = DateTimeUtilsService.convertTimeToISOString(DateTimeUtilsService.getDateBeforeNDays(30));
      dateFilter = {
        fromDate: monthBeforeDate,
        toDate: currentDate,
        filterPeriod: DateFiltersEnum.last30Days
      };
    } else if (FilterPeriod === DateFiltersEnum.last6Months) {
      const halfYearBeforeDate = DateTimeUtilsService.convertTimeToISOString(DateTimeUtilsService.getDateBeforeNDays(183));
      dateFilter = {
        fromDate: halfYearBeforeDate,
        toDate: currentDate,
        filterPeriod: DateFiltersEnum.last6Months
      };
    } else if (FilterPeriod === DateFiltersEnum.customRange) {
      const customFromDate = DateTimeUtilsService.convertTimeToISOString(moment(fromDate).utc());
      const customToDate = DateTimeUtilsService.convertTimeToISOString(moment(toDate).utc());
      dateFilter = {
        fromDate: customFromDate,
        toDate: customToDate,
        filterPeriod: DateFiltersEnum.customRange
      };
    }
    return dateFilter;
  }

  static parseDate(dateStr: string) {
    return moment(dateStr);
  }

  static parseDateWithoutZone(dateStr: string = null): Date {
    const momentWithoutZone = moment.parseZone(dateStr);

    if (!momentWithoutZone.isValid()) {
      return null;
    }
    return new Date(
      momentWithoutZone.year(), 
      momentWithoutZone.month(),
      momentWithoutZone.date(),
      momentWithoutZone.hour(),
      momentWithoutZone.minute(),
      momentWithoutZone.second(),
      momentWithoutZone.millisecond()
    );
  }

  static getDateFromMomentByFormat(dateStr, format): Date {
    const dateMomentObject = moment(dateStr, format);
    return dateMomentObject.toDate();
  }

  static convertMillisecondsToTime(ms = 0, dateTimeFormat?, localTime: boolean = false) {
    let dateTime = moment(ms).utc();

    if (localTime) {
      dateTime = dateTime.local();
    }

    return dateTimeFormat ? dateTime.format(dateTimeFormat) : dateTime;
  }

  static getCurrentDate(format: string) {
    return moment().format(format);
  }

  static getDateByFormat(date, format) {
    return moment(date).format(format);
  }

  static getDurationByUnit(date, unit) {
    return moment.duration(date, unit);
  }

  static getCurrentDateWithOffset(timeOffset: number) {
    // const today = moment.utc().add(timeOffset, 's');
    const today = moment.utc().utcOffset(timeOffset / 60);
    return {
      day: today.weekday(),
      hour: today.hours(),
      min: today.minutes(),
    };
  }

  static convertEpochToRelativeTime(timestamp) {
    return moment(new Date().getTime()).diff(moment.unix(timestamp));
  }

  static getTimeZoneName(date: Date) {
    const timeZone = moment.tz.guess();
    const time = new Date();
    const timeZoneOffset = time.getTimezoneOffset();
    return moment.tz.zone(timeZone).abbr(timeZoneOffset);
  }

  static isBefore(date1: string | Date, date2: string | Date) {
    return moment(date1).isBefore(moment(date2));
  }

  static isAfter(date1: string | Date, date2: string | Date) {
    return moment(date1).isAfter(moment(date2));
  }

  static getClosestDate(dates: string[], currentDate?: Date): Date | null {
    const today: Date = currentDate ? currentDate : new Date();

    const data = dates.map(dateStr => new Date(dateStr));

    const closest = data.reduce((a, b) => {
      const adiff = a.getTime() - today.getTime();
      return adiff > 0 && adiff < b.getTime() - today.getTime() ? a : b;
    });

    // check that we did'nt return the last element in the array from the reduce
    return closest.getTime() > today.getTime() ? closest : null;
  }
}
