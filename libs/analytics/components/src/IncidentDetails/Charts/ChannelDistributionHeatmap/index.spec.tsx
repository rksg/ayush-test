import {
  CallbackDataParams
} from 'echarts/types/dist/shared'
import { unitOfTime } from 'moment-timezone'

import { fakeIncident1 }                    from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { api } from './services'

import { ChannelDistributionHeatMap, tooltipFormatter } from '.'

const buffer = {
  front: { value: 0, unit: 'hours' as unitOfTime.Base },
  back: { value: 0, unit: 'hours' as unitOfTime.Base }
}

const config = {
  key: 'apDistribution',
  value: 'AP DISTRIBUTION BY CHANNEL',
  channel: 'channel',
  count: 'apCount',
  countText: 'Ap Count',
  infoIconText: null
}
const config2 = {
  key: 'dfsEvents',
  value: 'DFS EVENTS BY CHANNEL',
  channel: 'channel',
  count: 'eventCount',
  countText: 'DFS Events',
  infoIconText: 'some text'
}

const response = {
  network: {
    hierarchyNode: {
      dfsEvents: {
        time: ['2023-07-18T00:00:00.000Z', '2023-07-18T00:03:00.000Z'],
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
          ]
        ]
      }
    }
  }
}

describe('ChannelDistributionHeatMap', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', { data: response })
    const { asFragment } = render(
      <Provider>
        <ChannelDistributionHeatMap
          heatMapConfig={config2}
          incident={fakeIncident1}
          buffer={buffer}
          minGranularity='PT3M'
        />
      </Provider>
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await screen.findByText('DFS EVENTS BY CHANNEL')
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('canvas')).toBeDefined()
  })
  it('should show no data for empty response', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', { data: { network: {
      hierarchyNode: {
        apDistribution: { time: [], heatmap: [] } } } } })
    const { asFragment } = render(
      <Provider>
        <ChannelDistributionHeatMap
          heatMapConfig={{ ...config,key: 'rogueDistribution' }}
          incident={fakeIncident1}
          buffer={buffer}
          minGranularity='PT3M'
        />
      </Provider>
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await screen.findByText('AP DISTRIBUTION BY CHANNEL')
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).toBeNull()
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
  it('should handle dynamic height', async () => {
    let time: object [] = []
    let heatmap: object[] = []
    const startDate = new Date()
    Array.from({ length: 25 }).forEach((_, index) => {
      const newDate = new Date(startDate)
      newDate.setDate(startDate.getDate() + index)
      time.push(newDate)
      heatmap.push([{
        timestamp: newDate,
        channel: index*5,
        apCount: 3
      }])
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', { data: { network: {
      hierarchyNode: {
        apDistribution: { time: time, heatmap: heatmap } } } } })
    const { asFragment } = render(
      <Provider>
        <ChannelDistributionHeatMap
          heatMapConfig={config}
          incident={fakeIncident1}
          buffer={buffer}
          minGranularity='PT3M'
        />
      </Provider>
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await screen.findByText('AP DISTRIBUTION BY CHANNEL')
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('canvas')).toBeDefined()
  })
})

describe('tooltipFormatter', () => {
  it('should return correct Html string', async () => {
    const params = {
      data: ['test', 'test2', 100]
    } as unknown as CallbackDataParams
    expect(tooltipFormatter(params)).toContain('test2')
  })
  it('should return "-" Html string for missing data', async () => {
    const params = {} as unknown as CallbackDataParams
    expect(tooltipFormatter(params)).toContain('-')
  })
})

