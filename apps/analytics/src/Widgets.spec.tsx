import { dataApiURL }       from '@acx-ui/analytics/services'
import { Provider }         from '@acx-ui/store'
import { render, screen }   from '@acx-ui/test-utils'
import { mockGraphqlQuery } from '@acx-ui/test-utils'


import AnalyticsWidgets from './Widgets'

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
  render( <Provider> <AnalyticsWidgets name='trafficByVolume' /></Provider>)
  await screen.findByText('Traffic by Volume')
  screen.getByText('Traffic by Volume')
})

test('should render Network History widget', async () => {
  mockGraphqlQuery(dataApiURL, 'NetworkHistoryWidget', {
    data: { network: { hierarchyNode: { timeSeries: networkHistorySample } } }
  })
  render( <Provider> <AnalyticsWidgets name='networkHistory' /></Provider>)
  await screen.findByText('Network History')
  screen.getByText('Network History')
})

test('should render Connected Clients Over Time widget', async () => {
  mockGraphqlQuery(dataApiURL, 'ConnectedClientsOverTimeWidget', {
    data: { network: { hierarchyNode: { timeSeries: connectedClientsOverTimeSample } } }
  })
  render( <Provider> <AnalyticsWidgets name='connectedClientsOverTime' /></Provider>)
  await screen.findByText('Connected Clients Over Time')
  screen.getByText('Connected Clients Over Time')
})
