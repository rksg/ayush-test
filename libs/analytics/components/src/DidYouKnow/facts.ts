import { castArray } from 'lodash'
import { IntlShape } from 'react-intl'

import { formatter } from '@acx-ui/formatter'
import { getIntl }   from '@acx-ui/utils'

export type DidYouKnowData = {
  key: keyof typeof factsConfig
  values: string[]
  labels: string[]
}

export const factsConfig = {
  topApplicationsByClients: {},
  topApplicationsByTraffic: {},
  l3AuthFailure: {
    valueFormatter: formatter('percentFormat')
  },
  topIncidentsZones: {},
  topIncidentsApGroups: {},
  busiestSsidByClients: {
    valueFormatter: formatter('percentFormatRound')
  },
  busiestSsidByTraffic: {
    valueFormatter: formatter('percentFormatRound')
  },
  userTrafficThroughAPs: {
    valueFormatter: formatter('percentFormatRound')
  },
  avgSessionDuration: {
    valueFormatter: formatter('durationFormat')
  },
  airtimeUtilization: {
    valueFormatter: formatter('percentFormat')
  }
}

export function formatText (
  { $t, formatList }: IntlShape,
  options: Record<string, string[] | string | number>,
  key: keyof typeof factsConfig
) {
  switch (key) {
    case 'topApplicationsByClients':
      return($t({
        defaultMessage: `Top {labelsSize, plural,
          one {application}
          other {applications}
        } in terms of users last week {labelsSize, plural,
          one {was {labelsText}}
          other {were {labelsText}}
        }.`
      }, {
        ...options,
        labelsText: formatList(castArray(options.labels), { type: 'conjunction', style: 'long' })
      }))

    case 'topApplicationsByTraffic':
      return($t({
        defaultMessage: `Top {labelsSize, plural,
          one {application}
          other {applications}
        } in terms of user traffic last week {labelsSize, plural,
          one {was {labelsText}}
          other {were {labelsText}}
        }.`
      }, {
        ...options,
        labelsText: formatList(castArray(options.labels), { type: 'conjunction', style: 'long' })
      }))

    case 'l3AuthFailure':
      return($t({ defaultMessage:
        'Average daily L3 authentication failure percentage last week was ' +
        '{value0}.' }, { ...options }))

    case 'topIncidentsZones':
      return($t({
        defaultMessage: `Top {labelsSize, plural,
          one {<venueSingular></venueSingular>}
          other {<venuePlural></venuePlural>}
        } with highest number of incidents last week {labelsSize, plural,
          one {was {labelsText}}
          other {were {labelsText}}
        }.`
      }, {
        ...options,
        labelsText: formatList(castArray(options.labels), { type: 'conjunction', style: 'long' })
      }))

    case 'topIncidentsApGroups':
      return($t({
        defaultMessage: `Top {labelsSize, plural,
          one {AP group}
          other {AP groups}
        } with highest number of incidents last week {labelsSize, plural,
          one {was {labelsText}}
          other {were {labelsText}}
        }.`
      }, {
        ...options,
        labelsText: formatList(castArray(options.labels), { type: 'conjunction', style: 'long' })
      }))

    case 'busiestSsidByClients':
      return($t({ defaultMessage: 'Busiest WLAN in terms of users last week was {label0}, ' +
      'accounting for {value0} of total users.' }, { ...options }))

    case 'busiestSsidByTraffic':
      return($t({ defaultMessage: 'Most trafficked WLAN (user traffic) last week was {label0}, ' +
      'accounting for {value0} of user traffic.' }, { ...options }))

    case 'userTrafficThroughAPs':
      return($t({ defaultMessage:
        '{value0} of user traffic went through 15% of APs last week.' }, { ...options }))

    case 'avgSessionDuration':
      return($t({ defaultMessage:
        'The average session duration last week was {value0}.' }, { ...options }))

    case 'airtimeUtilization':
      return($t({ defaultMessage:
        'Average daily airtime utilization last week was 2.4 GHz: {value0}' +
        ', 5 GHz: {value1}, and 6(5) GHz: {value2}, ' +
        'which is a change of 2.4 GHz: {value3}, 5 GHz: {value4}, ' +
        'and 6(5) GHz: {value5} compared to the previous week.' }, { ...options }))
  }
}

export const toObject = (prefix: string, list: string[], formatter?:CallableFunction) => {
  const results: Record<string, string[] | string | number> = {
    [`${prefix}s`]: list.map(item => `<b>${formatter ? formatter(item) : item}</b>`),
    [`${prefix}sSize`]: list.length
  }
  return list.reduce((acc, item, i) => ({
    ...acc,
    [`${prefix}${i}`]: formatter ? '<b>'+formatter(item)+'</b>' : '<b>'+item+'</b>'
  }), results)
}

export function getFactsData (data: DidYouKnowData[]): Record<string, string> {
  const intl = getIntl()
  const factsList = data.map(({ key, values, labels }) => {
    const fact:{ valueFormatter?:CallableFunction } = factsConfig[key]
    if (!fact) { return [key, key] }
    const options = {
      ...toObject('value', values, fact.valueFormatter),
      ...toObject('label', labels)
    }
    return [key, formatText(intl, options, key)]
  })
  return Object.fromEntries(factsList)
}
