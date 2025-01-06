import '@testing-library/jest-dom'

import { useIsSplitOn }                     from '@acx-ui/feature-toggle'
import { dataApiURL, Provider, store }      from '@acx-ui/store'
import { render, screen, mockGraphqlQuery } from '@acx-ui/test-utils'
import type { AnalyticsFilter }             from '@acx-ui/utils'
import { DateRange }                        from '@acx-ui/utils'

import { api } from './services'

import { ConnectedClientsOverTime } from './index'

const filters: AnalyticsFilter = {
  startDate: '2024-03-18T00:00:00+08:00',
  endDate: '2024-03-19T00:00:00+08:00',
  range: DateRange.last24Hours,
  filter: {}
}

const sample = {
  time: [
    '2024-03-19T18:30:00.000Z',
    '2024-03-19T18:45:00.000Z'
  ],
  wirelessClientsCount: [
    346,
    347
  ],
  wiredClientsCount: [
    82,
    83
  ]
}

const sampleNoData = {
  time: [
    '2024-03-19T18:30:00.000Z',
    '2024-03-19T18:45:00.000Z'
  ],
  wirelessClientsCount: [null],
  wiredClientsCount: [null]
}

describe('HealthConnectedClientsOverTimeWidget', () => {
  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'HealthConnectedClientsOverTimeWidget', {
      data: { network: { hierarchyNode: { timeSeries: sample } } }
    })
    render(<Provider> <ConnectedClientsOverTime filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthConnectedClientsOverTimeWidget', {
      data: { network: { hierarchyNode: { timeSeries: sample } } }
    })
    const { asFragment } = render(
      <Provider>
        <ConnectedClientsOverTime filters={filters}/>
      </Provider>)
    await screen.findByText('Wireless Clients Count')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render chart when FF is enabled', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthConnectedClientsOverTimeWidget', {
      data: { network: { hierarchyNode: { timeSeries: sample } } }
    })
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const { asFragment } = render(
      <Provider>
        <ConnectedClientsOverTime filters={filters}/>
      </Provider>)
    await screen.findByText('Wired Clients')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'HealthConnectedClientsOverTimeWidget', {
      error: new Error('something went wrong!')
    })
    render(<Provider><ConnectedClientsOverTime filters={filters}/></Provider>)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
  it('should render "No data to display" when data is empty', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'HealthConnectedClientsOverTimeWidget', {
      data: { network: { hierarchyNode: { timeSeries: sampleNoData } } }
    })
    render(<Provider><ConnectedClientsOverTime filters={filters}/></Provider>)
    expect(await screen.findByText('No data to display')).toBeVisible()
    jest.resetAllMocks()
  })
})
