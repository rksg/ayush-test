import '@testing-library/jest-dom'

import { dataApiURL }                       from '@acx-ui/analytics/services'
import { AnalyticsFilter }                  from '@acx-ui/analytics/utils'
import { Provider, store }                  from '@acx-ui/store'
import { render, screen, mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { api } from './services'

import { TopSwitchesByError } from './index'

const filters: AnalyticsFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours,
  filter: {}
}

const sample = {
  topNSwitchesByErrors: [{
    name: 'CIOT-ISOLATION-MLISA',
    mac: 'D4:C1:9E:20:5F:25',
    inErr: 1,
    outErr: 1
  }]
}

describe('TopSwitchesByErrorWidget', () => {

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    mockGraphqlQuery(dataApiURL, 'TopSwitchesByErrorWidget', {
      data: { network: { hierarchyNode: sample } }
    })
    render( <Provider> <TopSwitchesByError filters={filters}/></Provider>,
      { route: { params } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    mockGraphqlQuery(dataApiURL, 'TopSwitchesByErrorWidget', {
      data: { network: { hierarchyNode: sample } }
    })
    const { asFragment } =render(
      <Provider>
        <TopSwitchesByError filters={filters}/>
      </Provider>, { route: { params } })

    expect(await screen.findByText('Top 5 Switches by Error')).toBeVisible()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[class="ant-pro-table"]')).not.toBeNull()
  })

  it('should render error', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'TopSwitchesByErrorWidget', {
      error: new Error('something went wrong!')
    })
    render( <Provider><TopSwitchesByError filters={filters}/></Provider>,
      { route: { params } })
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
})
