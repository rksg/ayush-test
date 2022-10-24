import { dataApiURL }      from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'
import { DateRange } from '@acx-ui/utils'

import { histogramApi } from '../Kpi/services'

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
    store.dispatch(histogramApi.util.resetApiState())
  })

  it('should render Histogram with data', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [0, 2, 200, 3, 3, 0] } }
    })
    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'timeToConnect'}
          threshold={thresholdMap['timeToConnect'] as unknown as string}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          canSave={{
            data: { allowedSave: true },
            isFetching: false,
            isLoading: false
          }}
          fetchingDefault={{
            data: {},
            isFetching: false,
            isLoading: false
          }}
        />
      </Provider>
    )
    expect(await screen.findByText('200')).toBeVisible()
  })
  it('should render Histogram with no data', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [] } }
    })
    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'timeToConnect'}
          threshold={thresholdMap['timeToConnect'] as unknown as string}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          canSave={{
            data: { allowedSave: true },
            isFetching: false,
            isLoading: false
          }}
          fetchingDefault={{
            data: {},
            isFetching: false,
            isLoading: false
          }}
        />
      </Provider>
    )
    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should render Histogram with data for reverse interpreted values', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [1, 1, 1, 10, 1, 1, 1, 1, 2] } }
    })
    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'rss'}
          threshold={thresholdMap['rss'] as unknown as string}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          canSave={{
            data: { allowedSave: true },
            isFetching: false,
            isLoading: false
          }}
          fetchingDefault={{
            data: {},
            isFetching: false,
            isLoading: false
          }}
        />
      </Provider>
    )
    expect(await screen.findByText('10')).toBeVisible()
  })
  it('should handle data greater than the splits size', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [0, 2, 3, 20, 3, 0,20,20,2000] } }
    })
    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'timeToConnect'}
          threshold={thresholdMap['timeToConnect'] as unknown as string}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          canSave={{
            data: { allowedSave: true },
            isFetching: false,
            isLoading: false
          }}
          fetchingDefault={{
            data: {},
            isFetching: false,
            isLoading: false
          }}
        />
      </Provider>
    )
    await screen.findByText('(seconds)')
    expect( screen.queryByText('2000')).toBeNull()
  })
  it('should handle slider onchange and return when value is positive whole number', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [0, 2, 3, 20, 3, 0,20,20,2000] } }
    })
    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'timeToConnect'}
          threshold={thresholdMap['timeToConnect'] as unknown as string}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          canSave={{
            data: { allowedSave: true },
            isFetching: false,
            isLoading: false
          }}
          fetchingDefault={{
            data: {},
            isFetching: false,
            isLoading: false
          }}
        />
      </Provider>
    )
    fireEvent.mouseDown(await screen.findByRole('slider'))
    fireEvent.mouseMove(await screen.findByRole('slider'))
    fireEvent.mouseUp(await screen.findByRole('slider'))
    expect(setKpiThreshold).toBeCalled()
  })
  it('should call setKpiThreshold on clicking reset btn', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [0, 2, 3, 20, 3, 0,20,20,2000] } }
    })
    const onReset = jest.fn()
    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'timeToConnect'}
          threshold={thresholdMap['timeToConnect'] as unknown as string}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          onReset={onReset}
          canSave={{
            data: { allowedSave: true },
            isFetching: false,
            isLoading: false
          }}
          fetchingDefault={{
            data: {},
            isFetching: false,
            isLoading: false
          }}
        />
      </Provider>
    )

    fireEvent.click(await screen.findByRole('button', { name: 'Reset' }))
    expect(onReset).toBeCalled()
  })

  it('should call setKpiThreshold on clicking apply btn', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [0, 2, 3, 20, 3, 0,20,20,2000] } }
    })
    const onApply = jest.fn()
    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'timeToConnect'}
          threshold={thresholdMap['timeToConnect'] as unknown as string}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          onApply={() => onApply}
          canSave={{
            data: { allowedSave: true },
            isFetching: false,
            isLoading: false
          }}
          fetchingDefault={{
            data: {},
            isFetching: false,
            isLoading: false
          }}
        />
      </Provider>
    )

    fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(onApply).toBeCalledTimes(1)
  })

  it('should see error setKpiThreshold on clicking apply btn', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [0, 2, 3, 20, 3, 0,20,20,2000] } }
    })
    const applyCounter = jest.fn()
    const onApply = () => {
      return async () => {
        applyCounter()
        return Promise.reject('failed apply fn')
      }
    }
    render(
      <Provider>
        <Histogram
          filters={filters}
          kpi={'timeToConnect'}
          threshold={thresholdMap['timeToConnect'] as unknown as string}
          thresholds={thresholdMap}
          setKpiThreshold={setKpiThreshold}
          onApply={onApply}
          canSave={{
            data: { allowedSave: true },
            isFetching: false,
            isLoading: false
          }}
          fetchingDefault={{
            data: {},
            isFetching: false,
            isLoading: false
          }}
        />
      </Provider>
    )

    fireEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(applyCounter).toBeCalledTimes(1)
  })
})


