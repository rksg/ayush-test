import '@testing-library/jest-dom'

import { dataApiURL }                                      from '@acx-ui/analytics/services'
import { AnalyticsFilter }                                 from '@acx-ui/analytics/utils'
import { Provider, store }                                 from '@acx-ui/store'
import { mockGraphqlQuery, mockAutoSizer, render, screen } from '@acx-ui/test-utils'
import { DateRange }                                       from '@acx-ui/utils'

import { api } from './services'

import SwitchesTrafficByVolumeWidget from '.'

const sample = {
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

describe('SwitchesTrafficByVolumeWidget', () => {
  mockAutoSizer()
  const filters : AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours
  }
  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesTrafficByVolumeWidget', {
      data: { network: { hierarchyNode: { timeSeries: sample } } }
    })
    render( <Provider> <SwitchesTrafficByVolumeWidget filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'SwitchesTrafficByVolumeWidget', {
      data: { network: { hierarchyNode: { timeSeries: sample } } }
    })
    const { asFragment } =render( 
      <Provider> <SwitchesTrafficByVolumeWidget filters={filters}/></Provider>)
    await screen.findByText('Traffic by Volume')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'SwitchesTrafficByVolumeWidget', {
      error: new Error('something went wrong!')
    })
    render( <Provider> <SwitchesTrafficByVolumeWidget filters={filters}/> </Provider>)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
})
