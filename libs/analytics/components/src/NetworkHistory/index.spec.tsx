import { AnalyticsFilter }                           from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }               from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitFor } from '@acx-ui/test-utils'
import { DateRange }                                 from '@acx-ui/utils'

import { api } from './services'

import { NetworkHistory } from './index'

const sample = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ],
  newClientCount: [1, 2, 3, 4, 5],
  impactedClientCount: [6, 7, 8, 9, 10],
  connectedClientCount: [11, 12, 13, 14, 15]
}

const sampleNoData = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ],
  newClientCount: [null],
  impactedClientCount: [null],
  connectedClientCount: [null]
}
const filters = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  filter: {}
} as AnalyticsFilter

describe('NetworkHistoryWidget', () => {

  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'NetworkHistoryWidget', {
      data: { network: { hierarchyNode: { timeSeries: sample } } }
    })
  })

  it('should render loader', () => {
    render( <Provider> <NetworkHistory filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    const { asFragment } =render(<Provider> <NetworkHistory filters={filters}/></Provider>)
    await screen.findByText('Network History')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should render chart without title', async () => {
    const { asFragment } = render(
      <Provider>
        <NetworkHistory hideTitle filters={filters}/>
      </Provider>)
    await screen.findByText('3')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should render chart without lengends', async () => {
    const { asFragment } = render(
      <NetworkHistory hideLegends filters={filters}/>, { wrapper: Provider })
    // eslint-disable-next-line testing-library/no-node-access
    await waitFor(() => {
      expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    })
    expect(screen.queryByText('New Client Associations')).toBeNull()
  })
})
describe('Handle No Data', () => {
  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should render "No data to display" when data is empty', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHistoryWidget', {
      data: { network: { hierarchyNode: { timeSeries: sampleNoData } } }
    })
    render( <Provider> <NetworkHistory filters={filters}/> </Provider>)
    expect(await screen.findByText('No data to display')).toBeVisible()
    jest.resetAllMocks()
  })
})
describe('Handle error', () => {
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'NetworkHistoryWidget', {
      error: new Error('something went wrong!')
    })
    render(<Provider> <NetworkHistory filters={filters}/> </Provider>)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
})
