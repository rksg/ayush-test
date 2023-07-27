import { withKnobs,object }       from '@storybook/addon-knobs'
import { storiesOf }              from '@storybook/react'
import { defineMessage, useIntl } from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'
import moment                     from 'moment-timezone'

import { intlFormats } from '@acx-ui/formatter'
import {TooltipWrapper}                                     from '@acx-ui/components'
import { renderToString }                          from 'react-dom/server'
import { TooltipComponentFormatterCallbackParams } from 'echarts'
import { cssStr } from '../../theme/helper'
import { Card }   from '../Card'
import { Heatmap } from '.'
import { flatten } from 'lodash'

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
const config : any = {
  network: {
    apGroup: {
      channel: [
        {
          time: '1688610685821',
          key: 'initialState.CcmApGroup.radio5g.radio.channel',
          id: 'f2907118-3c5f-48eb-91cb-b86a47f60a6a',
          values: [
            'AUTO'
          ]
        }
      ],
      channelWidth: [
        {
          time: '1688610685821',
          key: 'initialState.CcmApGroup.radio5g.radio.channel_width',
          id: 'f2907118-3c5f-48eb-91cb-b86a47f60a6a',
          values: [
            '_AUTO'
          ]
        }
      ],
      channelRange: [
        {
          time: '1688610685821',
          key: 'initialState.CcmApGroup.radio5g.radio.channel_range',
          id: 'f2907118-3c5f-48eb-91cb-b86a47f60a6a',
          values: [
            '52',
            '56',
            '60',
            '64',
            '100',
            '104',
            '108',
            '112',
            '116',
            '120',
            '124',
            '128',
            '132',
            '136'
          ]
        }
      ]
    },
    zone: {
      channel: [
        {
          time: '1688610685824',
          key: 'initialState.ccmZone.radio5g.radio.channel',
          id: 'f77a8816-3049-40cd-8484-82919275ddc3',
          values: [
            'AUTO'
          ]
        }
      ],
      channelWidth: [
        {
          time: '1688610685824',
          key: 'initialState.ccmZone.radio5g.radio.channel_width',
          id: 'f77a8816-3049-40cd-8484-82919275ddc3',
          values: [
            '_AUTO'
          ]
        }
      ],
      channelRange: [
        {
          time: '1688610685824',
          key: 'initialState.ccmZone.radio5g.radio.channel_range',
          id: 'f77a8816-3049-40cd-8484-82919275ddc3',
          values: [
            '52',
            '56',
            '60',
            '64',
            '100',
            '104',
            '108',
            '112',
            '116',
            '120',
            '124',
            '128',
            '132',
            '136'
          ]
        }
      ]
    }
  }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
const chartData: any = {
  time: [
    '2023-07-18T00:00:00.000Z',
    '2023-07-18T00:03:00.000Z',
    '2023-07-18T00:06:00.000Z',
    '2023-07-18T00:09:00.000Z',
    '2023-07-18T00:12:00.000Z',
    '2023-07-18T00:15:00.000Z',
    '2023-07-18T00:18:00.000Z'
  ],
  heatmap: [
    [
      {
        timestamp: '2023-07-18T00:00:00.000Z',
        channel: '56',
        apCount: 3
      },
      {
        timestamp: '2023-07-18T00:00:00.000Z',
        channel: '60',
        apCount: 1
      },
      {
        timestamp: '2023-07-18T00:00:00.000Z',
        channel: '116',
        apCount: 3
      },
      {
        timestamp: '2023-07-18T00:00:00.000Z',
        channel: '132',
        apCount: 2
      }
    ],
    [
      {
        timestamp: '2023-07-18T00:03:00.000Z',
        channel: '56',
        apCount: 3
      },
      {
        timestamp: '2023-07-18T00:03:00.000Z',
        channel: '60',
        apCount: 1
      },
      {
        timestamp: '2023-07-18T00:03:00.000Z',
        channel: '116',
        apCount: 3
      },
      {
        timestamp: '2023-07-18T00:03:00.000Z',
        channel: '132',
        apCount: 1
      }
    ],
    [
      {
        timestamp: '2023-07-18T00:06:00.000Z',
        channel: '56',
        apCount: 3
      },
      {
        timestamp: '2023-07-18T00:06:00.000Z',
        channel: '60',
        apCount: 1
      },
      {
        timestamp: '2023-07-18T00:06:00.000Z',
        channel: '116',
        apCount: 3
      },
      {
        timestamp: '2023-07-18T00:06:00.000Z',
        channel: '132',
        apCount: 1
      }
    ],
    [
      {
        timestamp: '2023-07-18T00:09:00.000Z',
        channel: '56',
        apCount: 3
      },
      {
        timestamp: '2023-07-18T00:09:00.000Z',
        channel: '60',
        apCount: 1
      },
      {
        timestamp: '2023-07-18T00:09:00.000Z',
        channel: '116',
        apCount: 3
      },
      {
        timestamp: '2023-07-18T00:09:00.000Z',
        channel: '132',
        apCount: 1
      }
    ],
    [
      {
        timestamp: '2023-07-18T00:12:00.000Z',
        channel: '56',
        apCount: 3
      },
      {
        timestamp: '2023-07-18T00:12:00.000Z',
        channel: '60',
        apCount: 1
      },
      {
        timestamp: '2023-07-18T00:12:00.000Z',
        channel: '116',
        apCount: 3
      },
      {
        timestamp: '2023-07-18T00:12:00.000Z',
        channel: '132',
        apCount: 1
      }
    ],
    [
      {
        timestamp: '2023-07-18T00:15:00.000Z',
        channel: '56',
        apCount: 3
      },
      {
        timestamp: '2023-07-18T00:15:00.000Z',
        channel: '60',
        apCount: 1
      },
      {
        timestamp: '2023-07-18T00:15:00.000Z',
        channel: '116',
        apCount: 3
      },
      {
        timestamp: '2023-07-18T00:15:00.000Z',
        channel: '132',
        apCount: 1
      }
    ],
    [
      {
        timestamp: '2023-07-18T00:18:00.000Z',
        channel: '56',
        apCount: 3
      },
      {
        timestamp: '2023-07-18T00:18:00.000Z',
        channel: '60',
        apCount: 1
      },
      {
        timestamp: '2023-07-18T00:18:00.000Z',
        channel: '116',
        apCount: 6
      },
      {
        timestamp: '2023-07-18T00:18:00.000Z',
        channel: '132',
        apCount: 10
      }
    ]
  ]
}

export const tooltipFormatter = (params: any) => {
  const value1 = Array.isArray(params.data) ? params.data[0] : ''
  const value2 = Array.isArray(params.data) ? params.data[1] : ''
  const value3 = Array.isArray(params.data) ? params.data[2] : ''

  return renderToString(
    <TooltipWrapper>
      <div>
        {'Time: '+value1 as string} <br/>
        {'Channel: '+value2 as string}<br/>
        {'Ap Count : '+value3 as string}
      </div>
    </TooltipWrapper>
  )
}
const xAxisCategories = chartData.time.map(datum => moment(datum).format(('DD MMM HH:mm')))  // prettier-ignore

const yAxisCategories = config.network.apGroup.channelRange[0].values ?? []
const data = flatten(chartData.heatmap).map((datum: any) => [
  moment(datum.timestamp).format(('DD MMM HH:mm')),
  datum.channel,
  datum.apCount
])
storiesOf('Heatmap', module)
  .addDecorator(withKnobs)
  .add('With formatter', () => {
    const { $t } = useIntl()
    return <div style={{ width: 800, height: 500 }}>
      <Card title='Heatmap'>
        <AutoSizer>
          {({ height, width }) => (
            <Heatmap
              style={{ width, height }}
              tooltipFormatter = {tooltipFormatter}
              xAxisCategories={xAxisCategories}
              yAxisCategories={yAxisCategories}
              data = {data}
              colors = {['green', '#FFF85E','#FFBD58', 'red']}
            />
          )}
        </AutoSizer>
      </Card>
    </div>
  })
