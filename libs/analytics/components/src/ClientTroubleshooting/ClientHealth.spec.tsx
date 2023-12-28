import { dataApiURL, Provider }                                        from '@acx-ui/store'
import { mockGraphqlQuery, render, waitForElementToBeRemoved, screen } from '@acx-ui/test-utils'
import type { AnalyticsFilter }                                        from '@acx-ui/utils'
import { DateRange, noDataDisplay }                                    from '@acx-ui/utils'

import { ClientHealth, durations } from './ClientHealth'


const filters = {
  startDate: '2022-12-01T00:00:00+08:00',
  endDate: '2022-12-31T00:00:00+08:00',
  range: DateRange.last24Hours
} as AnalyticsFilter

const testMac = 'AA:AA:AA:AA:AA:AA'

const connectionQualities = [
  {
    start: '2022-12-21T10:18:00.000Z',
    end: '2022-12-22T10:18:00.000Z',
    rss: -60,
    snr: 20,
    throughput: 1024 * 3,
    avgTxMCS: 1024 * 37
  },
  {
    start: '2022-12-23T18:00:00.000Z',
    end: '2022-12-24T18:00:00.000Z',
    rss: -80,
    snr: 10,
    throughput: 1024 * 1,
    avgTxMCS: 1024 * 15
  },
  {
    start: '2022-12-24T10:18:00.000Z',
    end: '2022-12-25T10:18:00.000Z',
    rss: -90,
    snr: 1,
    throughput: 1,
    avgTxMCS: 1,
    all: 'bad'
  }
]

const testData = {
  client: {
    connectionDetailsByAp: [],
    connectionEvents: [],
    connectionQualities,
    incidents: []
  }
}

describe('ClientHealth', () => {

  it('should render correctly for valid data', async () => {
    mockGraphqlQuery(dataApiURL, 'ClientInfo', { data: testData })

    render(<Provider>
      <ClientHealth filter={filters} clientMac={testMac}/>
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    expect(await screen.findAllByText('33.33%')).toHaveLength(3)
  })

  it('should render correctly for undefined data', async () => {
    mockGraphqlQuery(dataApiURL, 'ClientInfo', { data: {
      client: { }
    } })

    render(<Provider>
      <ClientHealth filter={filters} clientMac={testMac}/>
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    expect(await screen.findAllByText(noDataDisplay)).toHaveLength(3)
  })

  it('should render warning icon for max event error', async () => {
    mockGraphqlQuery(dataApiURL, 'ClientInfo', { error: {
      message: 'CTP:MAX_EVENTS_EXCEEDED'
    } })

    render(<Provider>
      <ClientHealth filter={filters} clientMac={testMac}/>
    </Provider>)
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))
    expect(await screen.findByTestId('WarningTriangleOutlined')).toBeDefined()
  })

  describe('durations', () => {
    it('should handle undefined', () => {
      const undef = durations(undefined)
      expect(undef).toBe(0)
    })
  })
})
