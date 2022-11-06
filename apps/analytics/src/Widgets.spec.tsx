import { BrowserRouter } from 'react-router-dom'

import { dataApiURL, dataApi }              from '@acx-ui/analytics/services'
import { AnalyticsFilter }                  from '@acx-ui/analytics/utils'
import { Provider, store }                  from '@acx-ui/store'
import { render, screen, mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { header1 }                        from './components/Header/__tests__/fixtures'
import { healthWidgetFixture }            from './components/HealthWidget/__tests__/fixtures'
import { expectedIncidentDashboardData }  from './components/IncidentsDashboard/__tests__/fixtures'
import { networkHierarchy }               from './components/NetworkFilter/__tests__/fixtures'
import { topApplicationByTrafficFixture } from './components/TopApplicationsByTraffic/__tests__/fixtures'
import { topSSIDsByClientFixture }        from './components/TopSSIDsByClient/__tests__/fixtures'
import { topSSIDsByTrafficFixture }       from './components/TopSSIDsByTraffic/__tests__/fixtures'
import { topSwitchesByErrorResponse }     from './components/TopSwitchesByError/__tests__/fixtures'
import { topSwitchesByPoEUsageResponse }  from './components/TopSwitchesByPoEUsage/__tests__/fixtures'
import { topSwitchesByTrafficResponse }   from './components/TopSwitchesByTraffic/__tests__/fixtures'
import AnalyticsWidgets                   from './Widgets'
const sample = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ],
  totalTraffic_all: [1, 2, 3, 4, 5],
  totalTraffic_6: [6, 7, 8, 9, 10],
  totalTraffic_5: [11, 12, 13, 14, 15],
  totalTraffic_24: [16, 17, 18, 19, 20]
}

const networkHistorySample = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ],
  newClientCount: [1, 2, 3, 4, 5],
  impactedClientCount: [6, 7, 8, 9, 10],
  connectedClientCount: [11, 12, 13, 14, 15]
}
const filters: AnalyticsFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours,
  filters: {}
} as AnalyticsFilter

const switchModelsData = [
  {
    name: 'ICX7150-C12P',
    count: 13
  },
  {
    name: 'Unknown',
    count: 8
  }
]

const connectedClientsOverTimeSample = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ],
  uniqueUsers_all: [1, 2, 3, 4, 5],
  uniqueUsers_6: [6, 7, 8, 9, 10],
  uniqueUsers_5: [11, 12, 13, 14, 15],
  uniqueUsers_24: [16, 17, 18, 19, 20]
}

const switchTrafficByVolumeSample = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ],
  switchTotalTraffic: [1, 2, 3, 4, 5],
  switchTotalTraffic_tx: [6, 7, 8, 9, 10],
  switchTotalTraffic_rx: [11, 12, 13, 14, 15]
}

jest.mock('./pages/health/ConnectedClientsOverTime', () => () => <div>Summary TimeSeries</div>)
jest.mock('./pages/health/Kpi', () => () => <div>Kpi Section</div>)

jest.mock('./pages/health/SummaryBoxes', () => ({
  SummaryBoxes: () => <div data-testid='Summary Boxes' />
}))
test('should render Traffic by Volume widget', async () => {

  mockGraphqlQuery(dataApiURL, 'TrafficByVolumeWidget', {
    data: { network: { hierarchyNode: { timeSeries: sample } } }
  })
  render(<Provider><AnalyticsWidgets name='trafficByVolume' filters={filters}/></Provider>,
    { route: true })
  expect(await screen.findByText('Traffic by Volume')).not.toBe(null)
})

test('should render Network History widget', async () => {
  mockGraphqlQuery(dataApiURL, 'NetworkHistoryWidget', {
    data: { network: { hierarchyNode: { timeSeries: networkHistorySample } } }
  })
  render(<Provider><AnalyticsWidgets name='networkHistory' filters={filters}/></Provider>,
    { route: true })
  expect(await screen.findByText('Network History')).not.toBe(null)
})

test('should render Top Switches by Traffic widget', async () => {
  mockGraphqlQuery(dataApiURL, 'SwitchesByTraffic', {
    data: topSwitchesByTrafficResponse
  })
  render(
    <BrowserRouter>
      <Provider>
        <AnalyticsWidgets name='topSwitchesByTraffic' filters={filters}/>
      </Provider>
    </BrowserRouter>
  )
  expect(await screen.findByText('Top 5 Switches by Traffic')).not.toBe(null)
})


test('should render Connected Clients Over Time widget', async () => {
  mockGraphqlQuery(dataApiURL, 'ConnectedClientsOverTimeWidget', {
    data: { network: { hierarchyNode: { timeSeries: connectedClientsOverTimeSample } } }
  })
  render(
    <Provider>
      <AnalyticsWidgets name='connectedClientsOverTime' filters={filters}/>
    </Provider>, { route: true })
  expect(await screen.findByText('Connected Clients Over Time')).not.toBe(null)
})

test('should render Top 5 Switches by PoE Usage widget', async () => {
  mockGraphqlQuery(dataApiURL, 'SwitchesByPoEUsage', { data: topSwitchesByPoEUsageResponse })
  render(
    <BrowserRouter>
      <Provider>
        <AnalyticsWidgets name='topSwitchesByPoeUsage' filters={filters}/>
      </Provider>
    </BrowserRouter>)
  expect(await screen.findByText('Top 5 Switches by PoE Usage')).toBeVisible()
})

test('should render Top 5 Switch Models widget', async () => {
  mockGraphqlQuery(dataApiURL, 'topSwitchModels', {
    data: { network: { hierarchyNode: { topNSwitchModels: switchModelsData } } }
  })
  render(
    <Provider>
      <AnalyticsWidgets name='topSwitchModelsByCount' filters={filters}/>
    </Provider>, { route: true }
  )
  expect(await screen.findByText('Top 5 Switch Models')).not.toBe(null)
})

test('should render Switches Traffic by Volume widget', async () => {
  mockGraphqlQuery(dataApiURL, 'SwitchesTrafficByVolumeWidget', {
    data: { network: { hierarchyNode: { timeSeries: switchTrafficByVolumeSample } } }
  })
  render(
    <Provider>
      <AnalyticsWidgets name='switchTrafficByVolume' filters={filters}/>
    </Provider>, { route: true })
  expect(await screen.findByText('Traffic by Volume')).not.toBe(null)
})

test('should render Top 5 Switches by Error widget', async () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }
  mockGraphqlQuery(dataApiURL, 'TopSwitchesByErrorWidget', { data: topSwitchesByErrorResponse })
  render( <Provider> <AnalyticsWidgets name='topSwitchesByErrors' filters={filters}/></Provider>,
    { route: { params } })
  expect(await screen.findByText('Top 5 Switches by Error')).toBeVisible()
})

test('should render Traffic by Application Widget', async () => {
  mockGraphqlQuery(dataApiURL, 'TopApplicationsByTrafficWidget', {
    data: { network: { hierarchyNode: topApplicationByTrafficFixture } }
  })
  render(<Provider>
    <AnalyticsWidgets
      name='topApplicationsByTraffic'
      filters={filters} />
  </Provider>, { route: true })
  await screen.findByText('Top 5 Applications by Traffic')
})

test('should render Traffic by SSID Widget', async () => {
  mockGraphqlQuery(dataApiURL, 'TopSSIDsByTrafficWidget', {
    data: { network: { hierarchyNode: topSSIDsByTrafficFixture } }
  })
  render(<Provider>
    <AnalyticsWidgets
      name='topSSIDsByTraffic'
      filters={filters} />
  </Provider>, { route: true })
  await screen.findByText('Top 5 SSIDs by Traffic')
})

test('should render Clients by SSID Widget', async () => {
  mockGraphqlQuery(dataApiURL, 'TopSSIDsByClientWidget', {
    data: { network: { hierarchyNode: topSSIDsByClientFixture } }
  })
  render(<Provider>
    <AnalyticsWidgets
      name='topSSIDsByClient'
      filters={filters} />
  </Provider>, { route: true })
  await screen.findByText('Top 5 SSIDs by Clients')
})

test('should render Incidents Dashboard Widget', async () => {
  mockGraphqlQuery(dataApiURL, 'IncidentsDashboardWidget', {
    data: { network: { hierarchyNode: expectedIncidentDashboardData } }
  })
  render(<Provider>
    <AnalyticsWidgets
      name='incidents'
      filters={filters}
    /></Provider>, { route: true })

  await screen.findByText('Incidents')
})

test('should render Venue health Widget', async () => {
  mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
    data: {
      timeToConnectThreshold: {
        value: 1000
      },
      clientThroughputThreshold: {
        value: 5000
      }
    }
  })
  render(<Provider>
    <AnalyticsWidgets
      name='venueHealth'
      filters={filters}
    /></Provider>, { route: true })

  await screen.findByText('Client Experience')
})

test('should render Health Widget on dashboard', async () => {
  mockGraphqlQuery(dataApiURL, 'HealthWidget', {
    data: { network: { hierarchyNode: healthWidgetFixture } }
  })
  render( <Provider> <AnalyticsWidgets
    name='health'
    filters={filters}
  /></Provider>)

  await screen.findByText('Top 5 Venues/Services with poor experience')
})

test('should render Venue Overview Incidents Widget', async () => {
  const sample = { P1: 0, P2: 2, P3: 3, P4: 4 }
  mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
    data: { network: { hierarchyNode: sample } }
  })
  render(<Provider>
    <AnalyticsWidgets
      name='venueIncidentsDonut'
      filters={filters} />
  </Provider>, { route: true })
  await screen.findByText('Incidents')
})
test('should render incidents page widget', async () => {
  const queryResult = {
    network: {
      node: {
        type: 'switch',
        name: 'Switch',
        model: 'm',
        firmware: '123',
        portCount: 20
      }
    }
  }
  mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', { data: queryResult })
  mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
    data: { network: { hierarchyNode: networkHierarchy } }
  })
  mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
    data: { network: { hierarchyNode: { incidents: [] } } }
  })
  const sample = { P1: 0, P2: 2, P3: 3, P4: 4 }
  mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
    data: { network: { hierarchyNode: sample } }
  })
  render(
    <Provider>
      <BrowserRouter>
        <AnalyticsWidgets
          name='incidentsPageWidget'
          filters={filters} />
      </BrowserRouter>
    </Provider>)
  await screen.findByText('Total Incidents')
})
test('should render health page widget', async () => {
  store.dispatch(dataApi.util.resetApiState())
  mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', { data: header1.queryResult })
  mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
    data: { network: { hierarchyNode: networkHierarchy } }
  })
  mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
    data: { network: { hierarchyNode: { incidents: [] } } }
  })
  render(
    <Provider>
      <BrowserRouter>
        <AnalyticsWidgets
          name='healthPageWidget'
          filters={filters} />
      </BrowserRouter>
    </Provider>)
  await screen.findByText('Kpi Section')
})