import { createRef } from 'react'

import EChartsReact from 'echarts-for-react'

import { dataApiURL }         from '@acx-ui/analytics/services'
import { AnalyticsFilter }    from '@acx-ui/analytics/utils'
import { Provider, store }    from '@acx-ui/store'
import {
  render,
  mockDOMWidth,
  cleanup,
  mockGraphqlQuery,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import { DateRange } from '@acx-ui/utils'

import { api }                           from '../../../components/NetworkHistory/services'
import { HealthPageContext, TimeWindow } from '../HealthPageContext'

import HealthTimeSeriesChart from '.'

function mockGetClientSize (width = 280, height = 280) {
  const originalHeight = Object.getOwnPropertyDescriptor(Element.prototype, 'clientHeight')
  const originalWidth = Object.getOwnPropertyDescriptor(Element.prototype, 'clientWidth')

  beforeAll(() => {
    Object.defineProperty(Element.prototype, 'clientHeight', 
      { configurable: true, writable: true, value: height }
    )
    Object.defineProperty(Element.prototype, 'clientWidth', 
      { configurable: true, writable: true, value: width }
    )
  })
  
  afterAll(() => {
    Object.defineProperty(Element.prototype, 'clientHeight', originalHeight as PropertyDescriptor)
    Object.defineProperty(Element.prototype, 'clientWidth', originalWidth as PropertyDescriptor)
  })
}

describe('HealthConnectedClientsOverTime', () => {
  mockDOMWidth()
  mockGetClientSize(280, 200)

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
    timeWindow: ['2022-04-07T09:30:00.000Z', '2022-04-07T09:45:00.000Z'] as TimeWindow,
    setTimeWindow: jest.fn()
  }

  it('should render brush component', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHistoryWidget', {
      data: { network: { hierarchyNode: { timeSeries: sample } } }
    })
    const ref = createRef<EChartsReact>()
    const { asFragment } = render(
      <Provider>
        <HealthPageContext.Provider value={healthContext}>
          <HealthTimeSeriesChart ref={ref}/>
        </HealthPageContext.Provider>
      </Provider>
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
   
    const chartComponent = () => 
      asFragment().querySelector('div[_echarts_instance_^="ec_"]') as Element
    expect(chartComponent()).not.toBeNull()

    const rect = chartComponent().querySelector('rect') as SVGRectElement
    expect(rect.clientHeight).toBe(200)
    expect(rect.clientWidth).toBe(280)

    const instance = ref.current!.getEchartsInstance()
    instance.dispatchAction({
      type: 'brush',
      areas: [{
        brushType: 'lineX',
        coordRange: ['2022-04-07T09:30:00.000Z', '2022-04-07T10:00:00.000Z'],
        xAxisIndex: 0
      }]
    }, {
      silent: false,
      flush: true
    })
    
    const chartSvgs = [...chartComponent().querySelectorAll('svg > g > path')]

    const startEndBrushes = () => chartSvgs.filter(
      elem => elem 
        && elem.getAttribute('fill') === '#000'
        && elem.getAttribute('fill-opacity') === '0'
    )
    expect(startEndBrushes()).toHaveLength(2)
    
    const blueTimeWindow = chartSvgs.filter(
      elem => elem && elem.getAttribute('stroke') === '#123456'
    )
    expect(blueTimeWindow).toHaveLength(1)
    expect(blueTimeWindow[0]).toBeDefined()
  })
})

