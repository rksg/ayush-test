import moment  from 'moment-timezone'
import numeral from 'numeral'

const count = ['', ' k', ' m', ' b', ' t'] // from numeral, we could add more
const bytes = [' B', ' KB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB']
const networkSpeed = [
  ' Kbps',
  ' Mbps',
  ' Gbps',
  ' Tbps',
  ' Pbps',
  ' Ebps',
  ' Zbps',
  ' Ybps'
]
const txpowerMapping = {
  _FULL: 'Full',
  _1DB: '-1dB',
  _2DB: '-2dB',
  _3DB: '-3dB(1/2)',
  _4DB: '-4dB',
  _5DB: '-5dB',
  _6DB: '-6dB(1/4)',
  _7DB: '-7dB',
  _8DB: '-8dB',
  _9DB: '-9dB(1/8)',
  _10DB: '-10dB',
  _MIN: 'Min'
}
const durations = {
  years: 'y',
  months: 'mo',
  days: 'd',
  hours: 'h',
  minutes: 'm',
  seconds: 's',
  milliseconds: 'ms'
}

const shorten = (value: number) => {
  return parseFloat(value.toPrecision(3)).toString()
}

function durationFormat (milliseconds: number) {
  const results = []
  let significance = 0
  for (let scale in durations) {
    const value = moment.duration(milliseconds).get(scale as moment.unitOfTime.Base)
    if (value > 0) {
      if (scale === 'seconds' && significance === 0) {
        // to show decimal on seconds only
        results.push(shorten(milliseconds / 1000) + durations[scale])
        break
      }
      results.push(shorten(value) + durations[scale as keyof typeof durations])
      if (++significance === 2) {
        break
      }
    } else if (significance > 0) {
      break
    }
  }
  return results.length ? results.join(' ') : '0'
}

function numberFormat (base: number, units: string[], value: number) {
  for (let a = 1; a <= units.length; a++) {
    const lowest = value / Math.pow(base, a - 1)
    if (Math.abs(lowest) < base) {
      return shorten(lowest) + units[a - 1]
    }
  }
  return shorten(value / Math.pow(base, units.length - 1)) + units[units.length - 1]
}

function dateTimeFormatter (number: unknown, format: string, tz?: string ) {
  return tz
    ? moment(number as moment.MomentInput)
      .tz(tz)
      .format(format + ' Z')
      .replace('+00:00', 'UTC')
    : moment(number as moment.MomentInput).format(format)
}

const formats = {
  durationFormat,
  percentFormat: (number: number) => numeral(number).format('0.[00]%'),
  percentFormatWithoutScalingBy100: (number: number) => numeral(number / 100).format('0.[00]%'),
  percentFormatNoSign: (number: number) => formats['percentFormat'](number).replace('%', ''),
  percentFormatRound: (number: number) => numeral(number).format('0%'),
  countFormat: (number: number) => numberFormat(1000, count, Math.round(number)),
  countWithCommas: (number: number) => numeral(number).format('0,0'),
  decibelFormat: (number: number) => Math.round(number) + ' dB',
  decibelMilliWattsFormat: (number: number) => Math.round(number) + ' dBm',
  bytesFormat: (number:number) => numberFormat(1024, bytes, number),
  networkSpeedFormat: (number: number) => numberFormat(1024, networkSpeed, number),
  radioFormat: (value: string|number) => `${value} GHz`,
  floatFormat: (number: number) => numeral(number).format('0.[000]'),
  enabledFormat: (value: boolean) => (value ? 'Enabled' : 'Disabled'),
  noFormat: (value: unknown) => value,
  ratioFormat: ([x, y]:[number, number]) => `${x} / ${y}`,
  txFormat: (value: keyof typeof txpowerMapping) =>
    (txpowerMapping[value] ? txpowerMapping[value] : value)
} as Record<string, (value: unknown)=> string>

const dateTimeFormats = {
  dateFormat: 'MMM DD YYYY',
  timeFormat: 'HH:mm',
  secondFormat: 'HH:mm:ss',
  dateTimeFormat: 'MMM DD YYYY HH:mm',
  dateTimeFormatWithSeconds: 'MMM DD YYYY HH:mm:ss',
  monthDateFormat: 'MMM DD',
  hourFormat: 'HH'
}

export function formatter (
  name: keyof typeof formats | keyof typeof dateTimeFormats = 'countFormat'
) {
  return function formatter (value: unknown, tz?: string) {
    if (value === null) {
      return null
    }

    if (dateTimeFormats[name as keyof typeof dateTimeFormats]) {
      return dateTimeFormatter(value, dateTimeFormats[name as keyof typeof dateTimeFormats], tz)
    } else {
      return formats[name as keyof typeof formats](value)
    }
  }
}
