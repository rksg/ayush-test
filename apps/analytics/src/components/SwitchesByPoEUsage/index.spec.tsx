import { dataApiURL }                      from '@acx-ui/analytics/services'
import { Provider, store }                 from '@acx-ui/store'
import { render, screen }                  from '@acx-ui/test-utils'
import { mockGraphqlQuery, mockAutoSizer } from '@acx-ui/test-utils'
import { DateRange }                       from '@acx-ui/utils'

import { api }                           from './services'
import { topSwitchesByPoEUsageResponse } from './services.spec'

import SwitchesByPoEUsage from '.'

const filters = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours
}

describe('SwitchesByPoEUsageWidget', () => {
  mockAutoSizer()

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesByPoEUsage', {
      data: topSwitchesByPoEUsageResponse
    })
    render( <Provider> <SwitchesByPoEUsage filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesByPoEUsage', {
      data: topSwitchesByPoEUsageResponse
    })
    const { asFragment } =render( <Provider> <SwitchesByPoEUsage filters={filters}/></Provider>)
    await screen.findByText('Top 5 Switches by PoE Usage')
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'SwitchesByPoEUsage', {
      error: new Error('something went wrong!')
    })
    render( <Provider> <SwitchesByPoEUsage filters={filters}/> </Provider>)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
})
