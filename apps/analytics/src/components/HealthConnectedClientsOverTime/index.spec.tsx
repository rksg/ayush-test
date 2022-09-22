/* eslint-disable testing-library/no-container */
/* eslint-disable testing-library/no-node-access */
import { createRef } from 'react'

import EChartsReact from 'echarts-for-react'

import { getSeriesData } from '@acx-ui/analytics/utils'
import {
  render,
  mockAutoSizer,
  cleanup,
  screen
} from '@acx-ui/test-utils'
import { TimeStamp } from '@acx-ui/types'

import HealthTimeSeriesChart, { HealthTimeSeriesChartProps } from '.'

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
  mockAutoSizer()
  mockGetClientSize(280, 200)

  afterEach(() => cleanup())

  const seriesMapping = [
    { key: 'newClientCount', name: 'New Clients' },
    { key: 'connectedClientCount', name: 'Connected Clients' }
  ] as Array<{ key: string, name: string }>

  const props: HealthTimeSeriesChartProps = {
    timeWindow: ['2022-04-07T09:30:00.000Z', '2022-04-07T09:45:00.000Z'],
    setTimeWindow: jest.fn((range) => { range.at(1) }),
    queryResults: {
      isLoading: false,
      isFetching: false,
      data: getSeriesData({
        time: [
          '2022-04-07T09:15:00.000Z',
          '2022-04-07T09:30:00.000Z',
          '2022-04-07T09:45:00.000Z',
          '2022-04-07T10:00:00.000Z',
          '2022-04-07T10:15:00.000Z'
        ] as TimeStamp[],
        newClientCount: [100, 150, 300, 400, 500],
        connectedClientCount: [110, 120, 103, 140, 150]
      }, seriesMapping)
    }
  }

  it('should render data', async () => {    
    const ref = createRef<EChartsReact>()
    const { asFragment } = render(
      <div style={{ height: '100%', width: '100%' }}>
        <HealthTimeSeriesChart {...props} ref={ref}/>
      </div>
    )

    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
    expect((await screen.findByText('New Clients', { exact: false })).textContent)
      .toMatch('New Clients')
    expect((await screen.findByText('Connected Clients', { exact: false })).textContent)
      .toMatch('Connected Clients')
  })

  it('should render NoData', async () => {    
    const ref = createRef<EChartsReact>()
    render(
      <div style={{ height: '100%', width: '100%' }}>
        <HealthTimeSeriesChart 
          {...props}
          ref={ref}
          queryResults={{
            data: [],
            isLoading: false
          } as HealthTimeSeriesChartProps['queryResults']}
        />
      </div>
    )
    
    expect((await screen.findByText('No data to display')).textContent)
      .toMatch('No data to display')
  })

  describe('should handle brush movements', () => {
    it('should trigger  useBrushChange', async () => { 
      const ref = createRef<EChartsReact>()
      const { container } = render(
        <HealthTimeSeriesChart {...props} ref={ref}/>
      )

     
      const chartComponent = container.querySelector('div[_echarts_instance_^="ec_"]') as Element
      expect(chartComponent).not.toBeNull()

      const rect = chartComponent.querySelector('rect') as SVGRectElement
      expect(rect.clientHeight).toBe(200)
      expect(rect.clientWidth).toBe(280)

      // set div to have size
      const chartDiv = container.querySelector('div') as HTMLElement
      expect(chartDiv).toBeInTheDocument()

      const instance = ref.current!.getEchartsInstance()
      instance.dispatchAction({
        type: 'brush',
        areas: [{
          brushType: 'lineX',
          coordRange: props.timeWindow,
          xAxisIndex: 0
        }]
      }, {
        silent: false,
        flush: true
      })
      
      const chartSvgs = [...chartComponent.querySelectorAll('svg > g > path')]
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
})

