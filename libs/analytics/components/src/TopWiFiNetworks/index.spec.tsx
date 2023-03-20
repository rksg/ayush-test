/* eslint-disable testing-library/no-node-access */
import { AnalyticsFilter }                             from '@acx-ui/analytics/utils'
import { Provider, store, dataApiURL }                 from '@acx-ui/store'
import { fireEvent, render, screen, mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange }                                   from '@acx-ui/utils'

import { topWifiByNetworkFixture } from './__tests__/fixtures'
import { api }                     from './services'

import { dataFormatter, TopWiFiNetworks } from './index'

describe('TopAppsByTrafficWidget', () => {
  const filters:AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours,
    filter: {}
  }

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', async () => {
    mockGraphqlQuery(dataApiURL, 'TopSSIDsByNetworkWidget', {
      data: { network: { hierarchyNode: topWifiByNetworkFixture } }
    })
    render( <Provider> <TopWiFiNetworks filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await screen.findByText('Top Wi-Fi Networks')

  })

  it('should render for empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'TopSSIDsByNetworkWidget', {
      data: { network: { hierarchyNode: {
        topNSSIDByTraffic: [],
        topNSSIDByClient: []
      } } }
    })
    const { asFragment } = render( <Provider>
      <TopWiFiNetworks filters={filters}/>
    </Provider>)
    await screen.findByText('No data to display')
    expect(asFragment()).toMatchSnapshot('NoData')
  })

  it('should render Tabs', async () => {
    mockGraphqlQuery(dataApiURL, 'TopSSIDsByNetworkWidget', {
      data: { network: { hierarchyNode: topWifiByNetworkFixture } }
    })
    const { asFragment } = render( <Provider> <TopWiFiNetworks
      filters={filters}/></Provider>)
    await screen.findByText('Top Wi-Fi Networks')
    const contentSwitcher = asFragment()
      .querySelector('div.ant-card-body > div > div:nth-child(1) > div')
    expect(contentSwitcher).toMatchSnapshot('contentSwitcher')
    const trafficContent = asFragment().querySelector('div.ant-card-body')
    expect(trafficContent).toMatchSnapshot('trafficContent')
    fireEvent.click(screen.getByText('By Clients'))
    const clientContent = asFragment().querySelector('div.ant-card-body')
    expect(clientContent).toMatchSnapshot('clientContent')

  })

  it('should return the correct formatted data', async () => {
    expect(dataFormatter(12113243434)).toEqual('11.3 GB')
  })

})
