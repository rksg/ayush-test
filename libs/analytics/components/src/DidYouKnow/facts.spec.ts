import { useIntl } from 'react-intl'

import { formatter }  from '@acx-ui/formatter'
import { renderHook } from '@acx-ui/test-utils'

import { formatText, toObject, getFactsData, DidYouKnowData, factsConfig } from './facts'

describe('Facts data format', () => {
  it('should return formatted object', () => {
    const data = [{
      input: { prefix: 'value', values: ['0.3173076923076923'],
        valueFormatter: formatter('percentFormat') },
      output: { value0: '<b>31.73%</b>' }
    }, {
      input: { prefix: 'label', values: ['CIOT_WPA2'] },
      output: { label0: '<b>CIOT_WPA2</b>' }
    }]
    data.forEach(({ input, output }) =>
      expect(
        { ...toObject(input.prefix, input.values, input.valueFormatter) }
      ).toStrictEqual(output)
    )
  })
  it('should return formatted text', () => {
  type Data = {
    input: {
      key: keyof typeof factsConfig,
      options: object
    }
    output: string
  }
  const data: Data[] = [{
    input: { key: 'topApplicationsByTraffic', options: {
      label0: '<b>Youtube.com</b>',
      label1: '<b>common-internet-file-system</b>',
      label2: '<b>windows_update</b>'
    } },
    output: 'Top 3 applications in terms of user traffic last week were <b>Youtube.com</b>,'+
    ' <b>common-internet-file-system</b> and <b>windows_update</b>.'
  }, {
    input: { key: 'topApplicationsByClients', options: {
      label0: '<b>dns</b>',
      label1: '<b>google_api</b>',
      label2: '<b>google_gen</b>'
    } },
    output: 'Top 3 applications in terms of users last week were <b>dns</b>,'+
    ' <b>google_api</b> and <b>google_gen</b>.'
  }, {
    input: { key: 'busiestSsidByClients', options: {
      value0: '<b>32%</b>',
      label0: '<b>CIOT_WPA2</b>'
    } },
    output: 'Busiest WLAN in terms of users last week was <b>CIOT_WPA2</b>,'+
    ' accounting for <b>32%</b> of total users.'
  }, {
    input: { key: 'avgSessionDuration', options: {
      value0: '<b>41 m 46 s</b>'
    } },
    output: 'The average session duration last week was <b>41 m 46 s</b>.'
  }, {
    input: { key: 'topIncidentsZones', options: {
      label0: '<b>760-AP</b>',
      label1: '<b>Divya-1</b>',
      label2: '<b>R760_AP_SV</b>'
    } },
    output: 'Top 3 zones with the highest number of incidents last week were '+
    '<b>760-AP</b>, <b>Divya-1</b> and <b>R760_AP_SV</b>.'
  }, {
    input: { key: 'userTrafficThroughAPs', options: {
      value0: '<b>97%</b>'
    } },
    output: '<b>97%</b> of user traffic went through 15% of APs last week.'
  }, {
    input: { key: 'airtimeUtilization', options: {
      value0: '<b>51.46%</b>',
      value1: '<b>10%</b>',
      value2: '<b>5.8%</b>',
      value3: '<b>-11.25%</b>',
      value4: '<b>0.1%</b>',
      value5: '<b>-2.62%</b>'
    } },
    output: 'Average daily airtime utilization last week was 2.4 GHz: <b>51.46%</b>,'+
    ' 5 GHz: <b>10%</b>, and 6(5) GHz: <b>5.8%</b>, which is a change of '+
    '2.4 GHz: <b>-11.25%</b>, 5 GHz: <b>0.1%</b>, and 6(5) GHz: <b>-2.62%</b> '+
    'compared to the previous week.'
  }, {
    input: { key: 'busiestSsidByTraffic', options: {
      value0: '<b>26%</b>',
      label0: '<b>wp3</b>'
    } },
    output: 'Most trafficked WLAN (user traffic) last week was <b>wp3</b>, '+
    'accounting for <b>26%</b> of user traffic.'
  }, {
    input: { key: 'l3AuthFailure', options: {
      value0: '--'
    } },
    output: 'Average daily L3 authentication failure percentage last week was --.'
  }, {
    input: { key: 'topIncidentsApGroups', options: {
      label0: 'N/A',
      label1: 'N/A',
      label2: 'N/A'
    } },
    output: 'Top 3 AP groups with the highest number of incidents last week were'+
    ' N/A, N/A and N/A.'
  }]
  data.forEach(({ input, output }) => {
    const { result } = renderHook(() => formatText( useIntl(), input.options, input.key ))
    expect(result).toStrictEqual({ current: output })
  })
  })
  it('should return formatted facts data', () => {

    const input: DidYouKnowData[] = [
      {
        key: 'busiestSsidByTraffic',
        values: [
          '0.26632137607971657'
        ],
        labels: [
          'wp3'
        ]
      },
      {
        key: 'topIncidentsZones',
        values: [],
        labels: [
          '760-AP',
          'Divya-1',
          'R760_AP_SV'
        ]
      },
      {
        key: 'topApplicationsByTraffic',
        values: [],
        labels: [
          'Youtube.com',
          'common-internet-file-system',
          'windows_update'
        ]
      },
      {
        key: 'userTrafficThroughAPs',
        values: [
          '0.9640097807285833'
        ],
        labels: []
      },
      {
        key: 'topApplicationsByClients',
        values: [],
        labels: [
          'dns',
          'google_api',
          'google_gen'
        ]
      },
      {
        key: 'airtimeUtilization',
        values: [
          '0.5380321288133384',
          '0.10086944135485905',
          '0.06619041281413379',
          '-0.0863264810119635',
          '0.005436566725021186',
          '-0.017430107011398688'
        ],
        labels: []
      },
      {
        key: 'busiestSsidByClients',
        values: [
          '0.3173076923076923'
        ],
        labels: [
          'CIOT_WPA2'
        ]
      },
      {
        key: 'avgSessionDuration',
        values: [
          '2797395.6743002543'
        ],
        labels: []
      }
    ]
    const output = { current: [
      [
        'Most trafficked WLAN (user traffic) last week was <b>wp3</b>,'+
        ' accounting for <b>27%</b> of user traffic.',
        'Top 3 zones with the highest number of incidents last week were <b>760-AP</b>,' +
        ' <b>Divya-1</b> and <b>R760_AP_SV</b>.',
        'Top 3 applications in terms of user traffic last week were <b>Youtube.com</b>,' +
        ' <b>common-internet-file-system</b> and <b>windows_update</b>.',
        '<b>96%</b> of user traffic went through 15% of APs last week.',
        'Top 3 applications in terms of users last week were <b>dns</b>,' +
        ' <b>google_api</b> and <b>google_gen</b>.'
      ],
      [
        'Average daily airtime utilization last week was 2.4 GHz: <b>53.8%</b>,' +
        ' 5 GHz: <b>10.09%</b>, and 6(5) GHz: <b>6.62%</b>, which is a change of 2.4 GHz: ' +
        '<b>-8.63%</b>, 5 GHz: <b>0.54%</b>, and 6(5) GHz: <b>-1.74%</b>' +
        ' compared to the previous week.',
        'Busiest WLAN in terms of users last week was <b>CIOT_WPA2</b>, accounting for <b>32%</b>' +
        ' of total users.',
        'The average session duration last week was <b>46 m 37 s</b>.'
      ]
    ] }
    const { result } = renderHook(() => getFactsData(input))
    expect(result).toStrictEqual(output)
  })

  it('should return formatted facts data list', () => {

    const input: DidYouKnowData[] = [
      {
        key: 'userTrafficThroughAPs',
        values: [
          '0.9642517770549439'
        ],
        labels: []
      },
      {
        key: 'topApplicationsByClients',
        values: [],
        labels: [
          'dns',
          'google_api',
          'google_gen'
        ]
      },
      {
        key: 'avgSessionDuration',
        values: [
          '2741120.646766169'
        ],
        labels: []
      },
      {
        key: 'airtimeUtilization',
        values: [
          '0.5377530977562142',
          '0.10097235004465528',
          '0.0663753261433648',
          '-0.08620892470997843',
          '0.0060048600575886985',
          '-0.01737867502391076'
        ],
        labels: []
      },
      {
        key: 'topIncidentsZones',
        values: [],
        labels: [
          '760-AP',
          'Divya-1',
          'R760_AP_SV'
        ]
      },
      {
        key: 'topApplicationsByTraffic',
        values: [],
        labels: [
          'Youtube.com',
          'common-internet-file-system',
          'windows_update'
        ]
      },
      {
        key: 'busiestSsidByClients',
        values: [
          '0.3173076923076923'
        ],
        labels: [
          'CIOT_WPA2'
        ]
      },
      {
        key: 'busiestSsidByTraffic',
        values: [
          '0.26453064526597714'
        ],
        labels: [
          'wp3'
        ]
      }
    ]
    const output = { current: [
      [
        '<b>96%</b> of user traffic went through 15% of APs last week.',
        'Top 3 applications in terms of users last week were <b>dns</b>, <b>google_api</b>'+
      ' and <b>google_gen</b>.',
        'The average session duration last week was <b>45 m 41 s</b>.',
        'Average daily airtime utilization last week was 2.4 GHz: <b>53.78%</b>,'+
      ' 5 GHz: <b>10.1%</b>, and 6(5) GHz: <b>6.64%</b>, which is a change of'+
      ' 2.4 GHz: <b>-8.62%</b>, 5 GHz: <b>0.6%</b>, and 6(5) GHz: <b>-1.74%</b>'+
      ' compared to the previous week.'
      ],
      [
        'Top 3 zones with the highest number of incidents last week were <b>760-AP</b>,'+
      ' <b>Divya-1</b> and <b>R760_AP_SV</b>.',
        'Top 3 applications in terms of user traffic last week were <b>Youtube.com</b>,'+
      ' <b>common-internet-file-system</b> and <b>windows_update</b>.',
        'Busiest WLAN in terms of users last week was <b>CIOT_WPA2</b>,'+
      ' accounting for <b>32%</b> of total users.',
        'Most trafficked WLAN (user traffic) last week was <b>wp3</b>,'+
      ' accounting for <b>26%</b> of user traffic.'
      ]
    ]
    }
    const { result } = renderHook(() => getFactsData(input))
    expect(result).toStrictEqual(output)
  })
  it('should return key if the key is not found in facts list', () => {

    const input = [
      {
        key: 'topApplicationsByTrafficDemo',
        values: [],
        labels: [
          'Youtube.com',
          'common-internet-file-system',
          'windows_update'
        ]
      }
    ]
    const output = {
      current: [
        [
          'topApplicationsByTrafficDemo'
        ]
      ]
    }
    const { result } = renderHook(() => getFactsData(input))
    expect(result).toStrictEqual(output)
  })
})
