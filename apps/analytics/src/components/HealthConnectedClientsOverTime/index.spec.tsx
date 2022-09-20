import { dataApiURL }      from '@acx-ui/analytics/services'
import { getSeriesData }   from '@acx-ui/analytics/utils'
import { Provider, store } from '@acx-ui/store'
import {
  render,
  mockAutoSizer,
  cleanup,
  mockGraphqlQuery
} from '@acx-ui/test-utils'
import { TimeStamp } from '@acx-ui/types'

import { api } from './services'

import HealthTimeSeriesChart, { HealthTimeSeriesChartProps } from '.'

describe('HealthConnectedClientsOverTime', () => {
  mockAutoSizer()

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  afterEach(() => cleanup())

  const seriesMapping = [
    { key: 'newClientCount', name: 'New Clients' },
    { key: 'connectedClientCount', name: 'Connected Clients' }
  ] as Array<{ key: string, name: string }>

  const props: HealthTimeSeriesChartProps = {
    timeWindow: ['2022-09-07', '2022-09-07'],
    setTimeWindow: jest.fn(),
    queryResults: {
      data: getSeriesData({
        time: [
          '2022-04-07T09:15:00.000Z',
          '2022-04-07T09:30:00.000Z',
          '2022-04-07T09:45:00.000Z',
          '2022-04-07T10:00:00.000Z',
          '2022-04-07T10:15:00.000Z'
        ] as TimeStamp[],
        newClientCount: [1, 2, 3, 4, 5],
        connectedClientCount: [11, 12, 13, 14, 15]
      }, seriesMapping)
    } as HealthTimeSeriesChartProps['queryResults']
  }

  it('should render data', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthTimeSeriesChart', {
      data: { network: { hierarchyNode: { timeseries: {
        time: [
          '2022-04-07T09:15:00.000Z',
          '2022-04-07T09:30:00.000Z',
          '2022-04-07T09:45:00.000Z',
          '2022-04-07T10:00:00.000Z',
          '2022-04-07T10:15:00.000Z'
        ] as TimeStamp[],
        newClientCount: [1, 2, 3, 4, 5],
        connectedClientCount: [11, 12, 13, 14, 15]
      } } } }
    })
    const { asFragment } = render(<Provider><HealthTimeSeriesChart {...props} /></Provider>)
    expect(asFragment()).toMatchSnapshot()
  })

})