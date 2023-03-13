import { IntlShape } from 'react-intl'

import { formatter } from '@acx-ui/utils'

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

export function formatText ( { $t }: IntlShape, options: object,
  key: keyof typeof factsConfig) {
  switch (key) {
    case 'topApplicationsByClients':
      return($t({ defaultMessage: 'Top 3 applications in terms of users last week were ' +
        '{label0}, {label1} and {label2}.' }, { ...options }))

    case 'topApplicationsByTraffic':
      return($t({ defaultMessage: 'Top 3 applications in terms of user traffic last week were ' +
      '{label0}, {label1} and {label2}.' }, { ...options }))

    case 'l3AuthFailure':
      return($t({ defaultMessage:
        'Average daily L3 authentication failure percentage last week was ' +
        '{value0}.' }, { ...options }))

    case 'topIncidentsZones':
      return($t({ defaultMessage:
        'Top 3 zones with the highest number of incidents last week were ' +
        '{label0}, {label1} and {label2}.' }, { ...options }))

    case 'topIncidentsApGroups':
      return($t({ defaultMessage:
        'Top 3 AP groups with the highest number of incidents last week were ' +
        '{label0}, {label1} and {label2}.' }, { ...options }))

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

export const toObject = (prefix: string, list: string[],
  formatter?:CallableFunction) => {
  return list.reduce((acc, item, i) => ({
    ...acc,
    [`${prefix}${i}`]: formatter ? '<b>'+formatter(item)+'</b>' : '<b>'+item+'</b>'
  }), {})
}

export function getFactsData (data: DidYouKnowData[], intl: IntlShape) {
  let factsList: string[]
  factsList = data?.map(({ key, values, labels }) => {
    const fact:{ valueFormatter?:CallableFunction } = factsConfig[key]
    if (!fact) { return key }
    const options = {
      ...toObject('value', values, fact.valueFormatter),
      ...toObject('label', labels)
    }
    return formatText(intl, options, key)
  })
  let arr: string[] = []
  const maxLength = 500
  let len = 0
  let arrList:string[][] = []
  factsList?.forEach(function (fact, index) {
    if(fact.length+len < maxLength) {
      len = len + fact.length
      arr.push(fact)
      if(index+1 === factsList.length) {
        arrList.push(arr)
      }
    } else {
      len = fact.length
      arrList.push(arr)
      arr = [fact]
      if(index+1 === factsList.length) {
        arrList.push(arr)
      }
    }
  })
  return arrList
}
