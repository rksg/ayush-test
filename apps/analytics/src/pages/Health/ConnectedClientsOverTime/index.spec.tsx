import { dataApiURL }         from '@acx-ui/analytics/services'
import { AnalyticsFilter }    from '@acx-ui/analytics/utils'
import { Provider, store }    from '@acx-ui/store'
import {
  render,
  cleanup,
  mockGraphqlQuery,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import { TimeStampRange } from '@acx-ui/types'
import { DateRange }      from '@acx-ui/utils'


import { api }               from '../../../components/NetworkHistory/services'
import { HealthPageContext } from '../HealthPageContext'

import ConnectedClientsOverTime from '.'

describe('HealthConnectedClientsOverTime', () => {

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  afterEach(() => cleanup())

  const sample = {
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
    startDate: '2022-04-07T09:15:00.000Z',
    endDate: '2022-04-07T10:15:00.000Z',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours
  } as AnalyticsFilter

  const healthContext = {
    ...filters,
    timeWindow: ['2022-04-07T09:30:00.000Z', '2022-04-07T09:45:00.000Z'] as TimeStampRange,
    setTimeWindow: jest.fn()
  }

  it('should render brush component', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHistoryWidget', {
      data: { network: { hierarchyNode: { timeSeries: sample } } }
    })

    const { asFragment } = render(
      <Provider>
        <HealthPageContext.Provider value={healthContext}>
          <ConnectedClientsOverTime />
        </HealthPageContext.Provider>
      </Provider>
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const chartComponent = () =>
      asFragment().querySelector('div[_echarts_instance_^="ec_"]') as Element
    expect(chartComponent()).not.toBeNull()

    const rect = chartComponent().querySelector('rect') as SVGRectElement
    expect(rect.clientHeight).toBe(800)
    expect(rect.clientWidth).toBe(1280)
  })
})

