import '@testing-library/jest-dom'

import { dataApiURL }                                      from '@acx-ui/analytics/services'
import { AnalyticsFilter }                                 from '@acx-ui/analytics/utils'
import { Provider, store }                                 from '@acx-ui/store'
import { render, screen, mockGraphqlQuery, mockAutoSizer } from '@acx-ui/test-utils'
import { DateRange }                                       from '@acx-ui/utils'

import { api } from './services'

import TopSwitchesByErrorWidget from '.'

const filters: AnalyticsFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours
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
  mockAutoSizer()

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'TopSwitchesByErrorWidget', {
      data: { network: { hierarchyNode: sample } }
    })
    render( <Provider> <TopSwitchesByErrorWidget filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'TopSwitchesByErrorWidget', {
      data: { network: { hierarchyNode: sample } }
    })
    const { asFragment } =render( 
      <Provider>
        <TopSwitchesByErrorWidget filters={filters}/>
      </Provider>)
    
    expect(await screen.findByText('Top 5 Switches by Error')).toBeVisible()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[class="ant-pro-table"]')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'TopSwitchesByErrorWidget', {
      error: new Error('something went wrong!')
    })
    render( <Provider><TopSwitchesByErrorWidget filters={filters}/></Provider>)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
})
