/* eslint-disable testing-library/no-node-access */
import { AnalyticsFilter }                  from '@acx-ui/analytics/utils'
import { Provider, store, dataApiURL }      from '@acx-ui/store'
import { render, screen, mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { topAppsByTrafficFixture } from './__tests__/fixtures'
import { api }                     from './services'

import { dataFormatter, TopAppsByTraffic } from './index'

describe('TopAppsByTrafficWidget', () => {
  const filters:AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', async () => {
    mockGraphqlQuery(dataApiURL, 'TopAppsByTraffic', {
      data: { network: { hierarchyNode: topAppsByTrafficFixture } }
    })
    render( <Provider> <TopAppsByTraffic filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await screen.findByText('Top Applications by Traffic')

  })

  it('should render for empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'TopAppsByTraffic', {
      data: { network: { hierarchyNode: {
        topNAppByTotalTraffic: []
      } } }
    })
    const { asFragment } = render( <Provider>
      <TopAppsByTraffic filters={filters}/>
    </Provider>)
    await screen.findByText('No data to display')
    expect(asFragment()).toMatchSnapshot('NoData')
  })
  it('should return the correct formatted data', async () => {
    expect(dataFormatter(12113243434)).toEqual('11.3 GB')
  })

})
