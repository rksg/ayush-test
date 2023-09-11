import '@testing-library/jest-dom'

import { dataApiURL,Provider, store }       from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'
import type { AnalyticsFilter }             from '@acx-ui/utils'

import { topPortsResponse } from './__tests__/fixtures'
import { api }              from './services'

import { TopPorts } from '.'

jest.mock('@acx-ui/icons', ()=> {
  const icons = jest.requireActual('@acx-ui/icons')
  const keys = Object.keys(icons).map(key => [key, () => <div data-testid={key} />])
  return Object.fromEntries(keys)
})

describe('TopPortsWidget', () => {
  const filtersByTraffic : AnalyticsFilter & { by: 'traffic' | 'error' } = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours,
    filter: {},
    by: 'traffic'
  }
  const filtersByError : AnalyticsFilter & { by: 'traffic' | 'error' } = {
    ...filtersByTraffic,
    by: 'error'
  }

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'TopNPorts', {
      data: topPortsResponse
    })
    render( <Provider> <TopPorts filters={filtersByTraffic} type='donut' /></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render donut chart', async () => {
    mockGraphqlQuery(dataApiURL, 'TopNPorts', {
      data: topPortsResponse
    })
    const { asFragment } =render(
      <Provider> <TopPorts filters={filtersByTraffic} type='donut' /></Provider>)
    await screen.findByText('Top 10 Ports by Traffic')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render line chart', async () => {
    mockGraphqlQuery(dataApiURL, 'TopNPorts', {
      data: topPortsResponse
    })
    const { asFragment } =render(
      <Provider> <TopPorts filters={filtersByTraffic} type='line' /></Provider>)
    await screen.findByText('Top 10 Ports by Traffic')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'TopNPorts', {
      error: new Error('something went wrong!')
    })
    render( <Provider> <TopPorts filters={filtersByError} type='donut' /> </Provider>)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
  it('should render "No data to display" when data is empty', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'TopNPorts', {
      data: { network: { hierarchyNode: { topNPorts: [] } } }
    })
    render( <Provider> <TopPorts filters={filtersByError} type='donut' /> </Provider>)
    expect(await screen.findByText('No data to display')).toBeVisible()
    jest.resetAllMocks()
  })
})
