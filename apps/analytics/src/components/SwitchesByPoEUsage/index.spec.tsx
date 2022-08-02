import { dataApiURL }                      from '@acx-ui/analytics/services'
import { Provider, store }                 from '@acx-ui/store'
import { render, screen }                  from '@acx-ui/test-utils'
import { mockGraphqlQuery, mockAutoSizer } from '@acx-ui/test-utils'

import { api }                           from './services'
import { topSwitchesByPoEUsageResponse } from './services.spec'

import SwitchesByPoEUsage from '.'

describe('SwitchesByPoEUsageWidget', () => {
  mockAutoSizer()

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesByPoEUsage', {
      data: topSwitchesByPoEUsageResponse
    })
    render( <Provider> <SwitchesByPoEUsage/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesByPoEUsage', {
      data: topSwitchesByPoEUsageResponse
    })
    const { asFragment } =render( <Provider> <SwitchesByPoEUsage/></Provider>)
    await screen.findByText('Top 5 Switches by PoE Usage')
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'SwitchesByPoEUsage', {
      error: new Error('something went wrong!')
    })
    render( <Provider> <SwitchesByPoEUsage/> </Provider>)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
})
