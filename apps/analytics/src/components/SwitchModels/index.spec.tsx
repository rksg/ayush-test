import { dataApiURL }                                     from '@acx-ui/analytics/services'
import { AnalyticsFilter }                                from '@acx-ui/analytics/utils'
import { Provider, store }                                from '@acx-ui/store'
import { mockGraphqlQuery, mockDOMWidth, render, screen } from '@acx-ui/test-utils'
import { DateRange }                                      from '@acx-ui/utils'

import { topSwitchModelsResponse } from './__tests__/fixtures'
import { api }                     from './services'

import TopSwitchModelsWidget from '.'

const filters = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours
} as AnalyticsFilter

describe('TopSwitchModelsWidget', () => {
  mockDOMWidth()

  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'topSwitchModels', {
      data: topSwitchModelsResponse
    })
    render(<Provider><TopSwitchModelsWidget filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })

  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'topSwitchModels', {
      data: topSwitchModelsResponse
    })
    const { asFragment } = render( <Provider> <TopSwitchModelsWidget filters={filters}/></Provider>)
    await screen.findByText('Top 5 Switch Models')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('svg')).toBeDefined()
  })

  it('should render "No data to display" when data is empty', async () => {
    mockGraphqlQuery(dataApiURL, 'topSwitchModels', {
      data: { network: { hierarchyNode: { topNSwitchModels: [] } } }
    })
    render(<Provider><TopSwitchModelsWidget filters={filters}/></Provider>)
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})
