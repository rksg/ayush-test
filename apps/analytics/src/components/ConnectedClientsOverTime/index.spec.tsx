import '@testing-library/jest-dom'

import { dataApiURL }                                      from '@acx-ui/analytics/services'
import { AnalyticsFilter }                                 from '@acx-ui/analytics/utils'
import { Provider, store }                                 from '@acx-ui/store'
import { render, screen, mockGraphqlQuery, mockAutoSizer } from '@acx-ui/test-utils'
import { DateRange }                                       from '@acx-ui/utils'

import { api } from './services'

import ConnectedClientsOverTimeWidget from '.'

const filters = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours
} as AnalyticsFilter

const sample = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ],
  uniqueUsers_all: [1, 2, 3, 4, 5],
  uniqueUsers_6: [6, 7, 8, 9, 10],
  uniqueUsers_5: [11, 12, 13, 14, 15],
  uniqueUsers_24: [16, 17, 18, 19, 20]
}

const sampleNoData = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ],
  uniqueUsers_all: [null],
  uniqueUsers_6: [null],
  uniqueUsers_5: [null],
  uniqueUsers_24: [null]
}

describe('ConnectedClientsOverTimeWidget', () => {
  mockAutoSizer()

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'ConnectedClientsOverTimeWidget', {
      data: { network: { hierarchyNode: { timeSeries: sample } } }
    })
    render( <Provider> <ConnectedClientsOverTimeWidget filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'ConnectedClientsOverTimeWidget', {
      data: { network: { hierarchyNode: { timeSeries: sample } } }
    })
    const { asFragment } =render(
      <Provider>
        <ConnectedClientsOverTimeWidget filters={filters}/>
      </Provider>)
    await screen.findByText('Connected Clients Over Time')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'ConnectedClientsOverTimeWidget', {
      error: new Error('something went wrong!')
    })
    render( <Provider><ConnectedClientsOverTimeWidget filters={filters}/></Provider>)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
  it('should render "No data to display" when data is empty', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'ConnectedClientsOverTimeWidget', {
      data: { network: { hierarchyNode: { timeSeries: sampleNoData } } }
    })
    render( <Provider> <ConnectedClientsOverTimeWidget filters={filters}/> </Provider>)
    expect(await screen.findByText('No data to display')).toBeVisible()
    jest.resetAllMocks()
  })
})
