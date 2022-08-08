import { dataApiURL }       from '@acx-ui/analytics/services'
import { Provider }         from '@acx-ui/store'
import { render, screen }   from '@acx-ui/test-utils'
import { mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange }        from '@acx-ui/utils'

import { topSwitchesByPoEUsageResponse } from './components/SwitchesByPoEUsage/services.spec'
import AnalyticsWidgets                  from './Widgets'

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
const filters = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours
}

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
test('should render Traffic by Volume widget', async () => {

  mockGraphqlQuery(dataApiURL, 'TrafficByVolumeWidget', {
    data: { network: { hierarchyNode: { timeSeries: sample } } }
  })
  render( <Provider> <AnalyticsWidgets name='trafficByVolume' filters={filters}/></Provider>)
  expect(await screen.findByText('Traffic by Volume')).not.toBe(null)
})

test('should render Network History widget', async () => {
  mockGraphqlQuery(dataApiURL, 'NetworkHistoryWidget', {
    data: { network: { hierarchyNode: { timeSeries: networkHistorySample } } }
  })
  render( <Provider> <AnalyticsWidgets name='networkHistory' filters={filters}/></Provider>)
  expect(await screen.findByText('Network History')).not.toBe(null)
})

test('should render Connected Clients Over Time widget', async () => {
  mockGraphqlQuery(dataApiURL, 'ConnectedClientsOverTimeWidget', {
    data: { network: { hierarchyNode: { timeSeries: connectedClientsOverTimeSample } } }
  })
  render( 
    <Provider>
      <AnalyticsWidgets name='connectedClientsOverTime' filters={filters}/>
    </Provider>)
  expect(await screen.findByText('Connected Clients Over Time')).not.toBe(null)
})

test('should render Top 5 Switches by PoE Usage widget', async () => {
  mockGraphqlQuery(dataApiURL, 'SwitchesByPoEUsage', { data: topSwitchesByPoEUsageResponse })
  render( <Provider> <AnalyticsWidgets name='switchesByPoEUsage' /></Provider>)
  expect(await screen.findByText('Top 5 Switches by PoE Usage')).toBeVisible()
  
})
