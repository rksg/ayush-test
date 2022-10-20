import { BrowserRouter } from 'react-router-dom'

import { dataApiURL }                       from '@acx-ui/analytics/services'
import { Provider, store }                  from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { header1, header4 } from './__tests__/fixtures'
import { api }              from './services'

import Header from './index'

jest.mock('../../components/NetworkFilter', () => () => <div>network filter</div>)

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  useAnalyticsFilter: () => ({
    filters: {
      path: [{ type: 'network', name: 'Network' }],
      filter: { networkNodes: [[{ type: 'zone', name: 'Venue' }]] }
    },
    getNetworkFilter: jest
      .fn()
      .mockReturnValueOnce({
        networkFilter: { path: [{ type: 'network', name: 'Network' }] }
      })
  })
}))
describe('Analytics header', () => {
  beforeEach(() => store.dispatch(api.util.resetApiState()))
  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
      data: header1.queryResult
    })
    render(<BrowserRouter><Provider>
      <Header title={''} shouldQuerySwitch/>
    </Provider></BrowserRouter>)
    expect(screen.getAllByRole('img', { name: 'loader' })).toHaveLength(2)
  })
  it('should render header', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
      data: header4.queryResult
    })
    render(<BrowserRouter><Provider>
      <Header title={'Title'} shouldQuerySwitch/>
    </Provider></BrowserRouter>)
    expect(await screen.findByTitle('Venue')).toHaveTextContent('Type:')
    expect(await screen.findByText('Clients: 100')).toBeVisible()
    expect(await screen.findByText('IP Address: ip2 (3)')).toBeVisible()
    expect(await screen.findByText('network filter')).toBeVisible()
    expect(await screen.findByPlaceholderText('Start date')).toBeVisible()
    expect(await screen.findByPlaceholderText('End date')).toBeVisible()
  })
})
