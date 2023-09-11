import userEvent from '@testing-library/user-event'
import { act }   from 'react-dom/test-utils'

import { healthApi }                   from '@acx-ui/analytics/services'
import { dataApiURL, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  mockGraphqlMutation,
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor
} from '@acx-ui/test-utils'
import type { AnalyticsFilter } from '@acx-ui/utils'
import { DateRange }            from '@acx-ui/utils'

import Histogram from './Histogram'

const thresholdMap = {
  timeToConnect: 2000,
  rss: -75,
  clientThroughput: 10000,
  apCapacity: 50,
  apServiceUptime: 0.995,
  apToSZLatency: 200,
  switchPoeUtilization: 0.8
}
const filters = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours,
  filter: {}
} as AnalyticsFilter
const setKpiThreshold = jest.fn()

describe('Threshold Histogram chart', () => {
  beforeEach(() => {
    store.dispatch(healthApi.util.resetApiState())
  })

  afterEach(() => cleanup())

  it('should render Histogram with data', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [0, 2, 200, 3, 3, 0] } } }
    })
    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'timeToConnect'}
          threshold={thresholdMap['timeToConnect']}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          mutationAllowed={true}
          isNetwork={false}
        />
      </Provider>
    )
    expect(await screen.findByText('(seconds)')).toBeVisible()
  })
  it('should render Histogram with no data', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [] } } }
    })
    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'timeToConnect'}
          threshold={thresholdMap['timeToConnect']}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          mutationAllowed={true}
          isNetwork={false}
        />
      </Provider>
    )
    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should render Histogram with data for reverse interpreted values', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [1, 1, 1, 10, 1, 1, 1, 1, 2] } } }
    })
    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'rss'}
          threshold={thresholdMap['rss']}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          mutationAllowed={false}
          isNetwork={true}
        />
      </Provider>
    )
    expect(await screen.findByText('10')).toBeVisible()
    const button = await screen.findByRole('button', { name: 'Apply' })
    expect(button).toBeDisabled()
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.hover(button.parentElement!)
    await waitFor(async () => {
      expect(await screen.findByText(/Cannot save threshold at organisation level/))
        .toBeInTheDocument()
    })
  })
  it('should handle data greater than the splits size', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [0, 2, 3, 20, 3, 0,20,20,2000] } } }
    })
    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'timeToConnect'}
          threshold={thresholdMap['timeToConnect']}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          mutationAllowed={true}
          isNetwork={false}
        />
      </Provider>
    )
    await screen.findByText('(seconds)')
    expect( screen.queryByText('2000')).toBeNull()
  })
  it('should handle slider onchange and return when value is positive whole number', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [0, 2, 3, 20, 3, 0,20,20,2000] } } }
    })
    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'timeToConnect'}
          threshold={thresholdMap['timeToConnect']}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          mutationAllowed={true}
          isNetwork={false}
        />
      </Provider>
    )
    const slider = await screen.findByRole('slider')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.mouseDown(slider)
      fireEvent.mouseMove(slider)
      fireEvent.mouseUp(slider)
    })
    expect(setKpiThreshold).not.toBeCalled()
  })
  it('should call setKpiThreshold on clicking reset btn', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [0, 2, 2, 3, 3, 0, 20, 20, 2000] } } }
    })

    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'apCapacity'}
          threshold={thresholdMap['apCapacity']}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          mutationAllowed={true}
          isNetwork={false}
        />
      </Provider>
    )

    const resetBtn = await screen.findByRole('button', { name: 'Reset' })
    expect(resetBtn).toBeDefined()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => { fireEvent.click(resetBtn) })
    const sliders = await screen.findAllByRole('slider')
    expect(sliders).toHaveLength(1)
    const values = sliders.map(slider => slider.style.left)
    expect(values.find((val) => val === '50%')).toMatch('50%')
  })

  it('should render success toast setKpiThreshold on clicking apply btn', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [0, 2, 3, 20, 3, 0,20,20,2000] } } }
    })

    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: {
        saveThreshold: {
          success: true
        }
      }
    })
    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'timeToConnect'}
          threshold={thresholdMap['timeToConnect']}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          mutationAllowed={true}
          isNetwork={false}
        />
      </Provider>
    )
    const applyBtn = await screen.findByRole('button', { name: 'Apply' })
    expect(applyBtn).toBeDefined()
    fireEvent.click(applyBtn)
    expect(await screen.findByText('Threshold set successfully.')).toBeInTheDocument()
  })

  it('should render default scale on null data', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [null, null, null] } } }
    })

    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: {
        saveThreshold: {
          success: true
        }
      }
    })
    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'timeToConnect'}
          threshold={thresholdMap['timeToConnect']}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          mutationAllowed={true}
          isNetwork={false}
        />
      </Provider>
    )

    expect(await screen.findByText('100')).toBeInTheDocument()
  })

  it('should render % as unit for apServiceUptime', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [0, 2, 3, 20, 3, 0,20,20,2000] } } }
    })

    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: {
        saveThreshold: {
          success: true
        }
      }
    })
    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'apServiceUptime'}
          threshold={thresholdMap['apServiceUptime']}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          mutationAllowed={true}
          isNetwork={false}
        />
      </Provider>
    )

    expect((await screen.findAllByText(/%/i)).length).toBeGreaterThan(1)
  })
})


