import { dataApiURL }                      from '@acx-ui/analytics/services'
import { Provider, store }                 from '@acx-ui/store'
import { render, screen }                  from '@acx-ui/test-utils'
import { mockGraphqlQuery, mockAutoSizer } from '@acx-ui/test-utils'
import { DateRange }                       from '@acx-ui/utils'

import { api }                          from './services'
import { topSwitchesByTrafficResponse } from './services.spec'

import SwitchesByTraffic from '.'

const filters = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours
}

describe('SwitchesByTrafficWidget', () => {
  mockAutoSizer()

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesByTraffic', {
      data: topSwitchesByTrafficResponse
    })
    render( <Provider> <SwitchesByTraffic filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesByTraffic', {
      data: topSwitchesByTrafficResponse
    })
    const { asFragment } =render( <Provider> <SwitchesByTraffic filters={filters}/></Provider>)
    await screen.findByText('Top 5 Switches by Traffic')
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'SwitchesByTraffic', {
      error: new Error('something went wrong!')
    })
    render( <Provider> <SwitchesByTraffic filters={filters}/> </Provider>)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
  it('should render "No data to display" when data is empty', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'SwitchesByTraffic', {
      data: { network: { hierarchyNode: { topNSwitchesByTraffic: [] } } }
    })
    render( <Provider> <SwitchesByTraffic filters={filters}/> </Provider>)
    expect(await screen.findByText('No data to display')).toBeVisible()
    jest.resetAllMocks()
  })
})
