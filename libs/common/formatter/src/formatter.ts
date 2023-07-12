import moment  from 'moment-timezone'
import numeral from 'numeral'
import {
  defineMessage,
  MessageDescriptor,
  IntlShape
} from 'react-intl'

import { getUserProfile }         from '@acx-ui/user'
import { getIntl, noDataDisplay } from '@acx-ui/utils'

import { channelSelection } from './channelSelection'

const bytes = [' B', ' KB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB']
const watts = [' mW', ' W', ' kW', ' MW', ' GW', ' TW', ' PW']
const hertz = [' Hz', ' daHz', ' hHz', ' kHz', ' MHz', ' GHz', ' THz']

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
const durations = [
  'years',
  'months',
  'days',
  'hours',
  'minutes',
  'seconds',
  'milliseconds'
] as const

const shorten = (value: number) => {
  return parseFloat(value.toPrecision(3)).toString()
}

const durationMapping = {
  years: defineMessage({ defaultMessage: '{years} y' }),
  months: defineMessage({ defaultMessage: '{months} mo' }),
  days: defineMessage({ defaultMessage: '{days} d' }),
  hours: defineMessage({ defaultMessage: '{hours} h' }),
  minutes: defineMessage({ defaultMessage: '{minutes} m' }),
  seconds: defineMessage({ defaultMessage: '{seconds} s' }),
  milliseconds: defineMessage({ defaultMessage: '{milliseconds} ms' })
}
const longDurationMapping = {
  years: defineMessage({ defaultMessage: '{years} {years, plural, one {year} other {years}}' }),
  months: defineMessage({ defaultMessage: '{months} {months, plural, one {month} other {months}}' }), // eslint-disable-line max-len
  days: defineMessage({ defaultMessage: '{days} {days, plural, one {day} other {days}}' }),
  hours: defineMessage({ defaultMessage: '{hours} {hours, plural, one {hour} other {hours}}' }),
  minutes: defineMessage({ defaultMessage: '{minutes} {minutes, plural, one {minute} other {minutes}}' }), // eslint-disable-line max-len
  seconds: defineMessage({ defaultMessage: '{seconds} {seconds, plural, one {second} other {seconds}}' }), // eslint-disable-line max-len
  milliseconds: defineMessage({ defaultMessage: '{milliseconds} {milliseconds, plural, one {millisecond} other {milliseconds}}' }) // eslint-disable-line max-len
}
const combineDuration = defineMessage({
  defaultMessage: '{duration1} {duration2}',
  description: 'e.g. duration1 = 3 mo, duration2 = 2 d, result = 3 mo 2 d'
})
function durationFormat (milliseconds: number, format: 'short' | 'long', { $t }: IntlShape) {
  const mapping = format === 'short' ? durationMapping : longDurationMapping
  let results: Partial<Record<typeof durations[number], number>> = {}
  let significance = 0

  for (let i = 0; i < durations.length; i++) {
    const scale = durations[i]
    const value = moment.duration(milliseconds).get(scale as moment.unitOfTime.Base)
    if (value > 0) {
      // to show decimal on seconds only
      if (scale === 'seconds' && significance === 0) {
        results[scale] = parseFloat((milliseconds / 1000).toPrecision(3))
        break
      }
      results[scale] = parseFloat(value.toPrecision(3))
      if (++significance === 2) {
        break
      }
    } else if (significance > 0) {
      break
    }
  }
  const [
    duration1,
    duration2 = ''
  ] = (Object.entries(results) as [typeof durations[number], number][])
    .map(([key, value]) => $t(mapping[key], { [key]: value }))

  return duration1
    ? $t(combineDuration, { duration1, duration2 }).trim()
    : '0'
}

function numberFormat (base: number, units: string[], value: number) {
  const baseExpo = Number(base.toExponential().split('e')[1])
  // threshold that we need to trigger division.
  // baseExpo >= 1
  const dividerThreshold = Math.pow(10, baseExpo - 1)

  for (let a = 1; a <= units.length; a++) {
    const lowest = value / Math.pow(base, a - 1)
    if (Math.abs(lowest) < Math.round(base / dividerThreshold) * dividerThreshold) {
      return shorten(lowest) + units[a - 1]
    }
  }
  return shorten(value / Math.pow(base, units.length - 1)) + units[units.length - 1]
}

export const defaultDateFormat = 'MMM DD YYYY'

export enum DateFormatEnum {
  DateFormat = 'dateFormat',
  DateTimeFormat = 'dateTimeFormat',
  DateTimeFormatWithTimezone = 'dateTimeFormatWithTimezone',
  DateTimeFormatWithSeconds = 'dateTimeFormatWithSeconds',
  OnlyTime = 'onlyTime'
}

const dateTimeFormats = {
  dateFormat: '',
  dateTimeFormat: 'HH:mm',
  dateTimeFormatWithTimezone: '- HH:mm z',
  dateTimeFormatWithSeconds: 'HH:mm:ss',
  onlyTime: 'HH:mm'
}

export function userDateTimeFormat (format: DateFormatEnum) {
  const dateFormat = getUserProfile().profile.dateFormat as string
  const dateTimeArr = [
    dateFormat?.toUpperCase() || defaultDateFormat,
    dateTimeFormats[format]
  ]
  if(format === DateFormatEnum.OnlyTime){
    dateTimeArr.shift()
  }
  return dateTimeArr.filter(Boolean).join(' ')
}

function dateTimeFormatter (
  value: moment.MomentInput,
  format: DateFormatEnum,
  tz?: string
) {
  const customFormat = userDateTimeFormat(format)
  return tz
    ? moment(value)
      .tz(tz)
      .format(customFormat + ' Z')
      .replace('+00:00', 'UTC')
    : moment(value).format(customFormat)
}

function calendarFormat (number: number) {
  const { $t } = getIntl()
  return moment(number).calendar({
    lastDay: $t({ defaultMessage: '[Yesterday,] HH:mm' }),
    sameDay: $t({ defaultMessage: '[Today,] HH:mm' }),
    nextDay: $t({ defaultMessage: '[Tomorrow,] HH:mm' }),
    lastWeek: $t({ defaultMessage: '[Last] dddd[,] HH:mm' }),
    nextWeek: $t({ defaultMessage: 'dddd[,] HH:mm' }),
    sameElse: $t({ defaultMessage: 'MMM DD HH:mm' })
  })
}

function hertzFormat (number:number) {
  const boundary = Math.pow(10, 3)

  if (number < boundary) {
    return numberFormat(10, hertz.slice(0, 3), number)
  } else {
    return numberFormat(boundary, hertz.slice(3), number / boundary)
  }
}

const handleAutoWidth = (text: string) => {
  if (text === 'Auto') {
    return text
  } else {
    return `${text} MHz`
  }
}

const json2keymap = (
  keyFields: string[],
  field: keyof(typeof channelSelection)[0],
  filter: string[]
) =>
  (mappings: typeof channelSelection) => mappings
    .flatMap(items => items)
    .filter(item => !filter.includes(item[field] as string))
    .reduce((map, item) => map.set(
      keyFields.map(keyField => item[keyField as keyof typeof item]).join('-'),
      item[field]
    ), new Map())

type CrrmTextType =
  string | Array<{ radio: string, channelMode: string, channelWidth: string }>

const crrmText = (value: CrrmTextType) => {
  const { $t } = getIntl()
  const enumTextMap = json2keymap(['enumType', 'value'], 'text', ['TBD'])(channelSelection)
  const enumMode = 'com.ruckuswireless.scg.protobuf.ccm.Zone.CcmRadio.ChannelSelectMode'
  const enumWidth = 'com.ruckuswireless.scg.protobuf.ccm.Zone.CcmRadio.ChannelWidth'
  if (typeof value === 'string') {
    return $t({
      defaultMessage: 'AI-Driven Cloud RRM for channel planning and channel bandwidth selection' })
  }
  return value.map(config => {
    const channelMode = String(enumTextMap.get(`${enumMode}-${config.channelMode}`))
    const channelWidth = handleAutoWidth(enumTextMap.get(`${enumWidth}-${config.channelWidth}`))
    const radio = formats.radioFormat(config.radio)
    return $t({
      defaultMessage: '{channelMode} and {channelWidth} for {radio}' },
    { channelMode, channelWidth, radio } )
  }).join(', ')
}

export const formats = {
  durationFormat: (number: number, intl: IntlShape) => durationFormat(number, 'short', intl),
  longDurationFormat: (number: number, intl: IntlShape) => durationFormat(number, 'long', intl),
  calendarFormat: (number: number) => calendarFormat(number),
  decibelFormat: (number: number) => Math.round(number) + ' dB',
  decibelMilliWattsFormat: (number: number) => Math.round(number) + ' dBm',
  milliWattsFormat: (number:number) => numberFormat(1000, watts, number),
  bytesFormat: (number:number) => numberFormat(1024, bytes, number),
  networkSpeedFormat: (number: number) => numberFormat(1000, networkSpeed, number),
  radioFormat: (value: string|number) => `${value} GHz`,
  hertzFormat: (number: number) => hertzFormat(number),
  floatFormat: (number: number) => numeral(number).format('0.[000]'),
  ratioFormat: ([x, y]:[number, number]) => `${x} / ${y}`,
  txFormat: (value: keyof typeof txpowerMapping) =>
    (txpowerMapping[value] ? txpowerMapping[value] : value),
  numberWithCommas: (number: number) =>
    number?.toLocaleString('en-US', { maximumFractionDigits: 0 }),
  fpsFormat: (value: number) => `${value} fps`,
  percent: (value: number) => `${value} %`,
  crrmFormat: (value: CrrmTextType) => crrmText(value),
  noFormat: (value: unknown) => `${value}`
} as const

const enabledFormat: MessageDescriptor = defineMessage({
  defaultMessage: '{value, select, true {Enabled} other {Disabled}}'
})

const countFormat: MessageDescriptor = defineMessage({
  defaultMessage: '{value, number, ::K .##/@##r}'
})
const percentFormat: MessageDescriptor = defineMessage({
  defaultMessage: '{value, number, ::percent .##}'
})
const percentFormatRound: MessageDescriptor = defineMessage({
  defaultMessage: '{value, number, ::percent }'
})
const scaleFormatRound: MessageDescriptor = defineMessage({
  defaultMessage: '{value, number, ::scale/100 . }'
})

export const intlFormats = {
  enabledFormat,
  countFormat,
  percentFormat,
  percentFormatRound,
  scaleFormatRound
} as const

export function formatter (
  name: keyof typeof formats | DateFormatEnum | keyof typeof intlFormats
) {
  return function formatter (value: unknown, tz?: string): string {
    const intl = getIntl()
    if (value === null || value === noDataDisplay) {
      return noDataDisplay
    }
    if (isIntlFormat(name)) {
      return intl.$t(intlFormats[name], { value: value as number | string | Date })
    }
    if (isDateTimeFormat(name)) {
      return dateTimeFormatter(value as moment.MomentInput, name, tz)
    }
    if (isFormat(name)) {
      const formatter = formats[name] as (value: unknown, intl: IntlShape) => string
      return formatter(value, intl)
    }
    return noDataDisplay
  }
}

export function convertEpochToRelativeTime (timestamp: number) {
  return moment(new Date().getTime()).diff(moment.unix(timestamp))
}

function isIntlFormat (name: string): name is keyof typeof intlFormats {
  return name in intlFormats
}

function isDateTimeFormat (name: string): name is keyof typeof dateTimeFormats {
  return name in dateTimeFormats
}

function isFormat (name: string): name is keyof typeof formats {
  return name in formats
}

