import '@testing-library/jest-dom'

import { dataApiURL, Provider, store }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'
import type { AnalyticsFilter }             from '@acx-ui/utils'

import { topApplicationsResponse } from './__tests__/fixtures'
import { api }                     from './services'

import { TopApplications } from '.'

jest.mock('@acx-ui/icons', ()=> {
  const icons = jest.requireActual('@acx-ui/icons')
  const keys = Object.keys(icons).map(key => [key, () => <div data-testid={key} />])
  return Object.fromEntries(keys)
})

describe('TopApplicationsWidget', () => {
  const filters : AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours,
    filter: {}
  }


  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficPerClient', {
      data: topApplicationsResponse
    })
    render( <Provider> <TopApplications filters={filters} type='donut' /></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render donut chart', async () => {
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficPerClient', {
      data: topApplicationsResponse
    })
    const { asFragment } =render(
      <Provider> <TopApplications filters={filters} type='donut' /></Provider>)
    await screen.findByText('Top 10 Applications by traffic volume')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render line chart', async () => {
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficPerClient', {
      data: topApplicationsResponse
    })
    const { asFragment } =render(
      <Provider> <TopApplications filters={filters} type='line' /></Provider>)
    await screen.findByText('Top 10 Applications by traffic volume')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficPerClient', {
      error: new Error('something went wrong!')
    })
    render( <Provider> <TopApplications filters={filters} type='donut' /> </Provider>)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
  it('should render "No data to display" when data is empty', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficPerClient', {
      data: { client: { topNApplicationByTraffic: [] } }
    })
    render( <Provider> <TopApplications filters={filters} type='donut' /> </Provider>)
    expect(await screen.findByText('No data to display')).toBeVisible()
    jest.resetAllMocks()
  })
})
