import { act } from 'react-dom/test-utils'

import { dataApiURL }                                                       from '@acx-ui/analytics/services'
import { AnalyticsFilter }                                                  from '@acx-ui/analytics/utils'
import { BrowserRouter as Router }                                          from '@acx-ui/react-router-dom'
import { Provider, store }                                                  from '@acx-ui/store'
import { fireEvent, mockGraphqlMutation, mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { TimeStampRange }                                                   from '@acx-ui/types'
import { DateRange }                                                        from '@acx-ui/utils'

import { HealthPageContext } from '../HealthPageContext'

import { timeseriesApi, histogramApi } from './services'

import KpiSection, { defaultData, getDefaultThreshold, getApplyCallback, getResetCallback } from '.'


describe('Kpi Section', () => {
  beforeEach(() => {
    store.dispatch(histogramApi.util.resetApiState())
    store.dispatch(timeseriesApi.util.resetApiState())
  })
  const sampleTS = {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z',
      '2022-04-07T09:45:00.000Z',
      '2022-04-07T10:00:00.000Z',
      '2022-04-07T10:15:00.000Z'
    ],
    data: [null, [null, null], [0, 0], [4, 5], [4, 5]]
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
  it('should render kpis for tab', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [0, 2, 2, 3, 3, 0] } }
    })
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleTS }
    })
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: {
        mutationAllowed: false
      }
    })
    mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {})
    render(<Router><Provider>
      <HealthPageContext.Provider value={healthContext}>
        <KpiSection tab={'overview'} />
      </HealthPageContext.Provider>
    </Provider></Router>)
    await screen.findByText('Time To Connect')
    expect(screen.getByText('20% meets goal')).toBeVisible()
  })

  it('should render kpis for tab with thresholds', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [0, 2, 2, 3, 3, 0] } }
    })
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleTS }
    })
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: {
        mutationAllowed: false
      }
    })
    mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
      data: {
        timeToConnectThreshold: { value: null },
        rssThreshold: { value: null },
        clientThroughputThreshold: { value: null },
        apCapacityThreshold: { value: null },
        switchPoeUtilizationThreshold: { value: null },
        apServiceUptimeThreshold: { value: null },
        apToSZLatencyThreshold: { value: null }
      }
    })
    render(<Router><Provider>
      <HealthPageContext.Provider value={healthContext}>
        <KpiSection tab={'overview'} />
      </HealthPageContext.Provider>
    </Provider></Router>)
    await screen.findByText('Time To Connect')
    expect(screen.getByText('20% meets goal')).toBeVisible()
  })


  it('should render kpis for tab with valid thresholds', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [0, 2, 2, 3, 3, 0] } }
    })
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleTS }
    })
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: {
        mutationAllowed: true
      }
    })
    mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
      data: {
        timeToConnectThreshold: { value: 30000 }
      }
    })
    mockGraphqlMutation(dataApiURL, 'SaveThreshold', {
      data: {
        timeToConnect: {
          success: true
        }
      }
    })
    render(<Router><Provider>
      <HealthPageContext.Provider value={healthContext}>
        <KpiSection tab={'overview'} />
      </HealthPageContext.Provider>
    </Provider></Router>)
    await screen.findByText('Time To Connect')
    expect(screen.getByText('20% meets goal')).toBeVisible()

    const resets = await screen.findAllByRole('button', { name: 'Reset' })
    expect(resets.length).toBeGreaterThan(0)
    const resetBtn = resets[0]
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => { fireEvent.click(resetBtn) })

    const applys = await screen.findAllByRole('button', { name: 'Apply' })
    expect(applys.length).toBeGreaterThan(0)
    const applyBtn = applys[0]
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => { fireEvent.click(applyBtn) })
  }, 20000)

  describe('getDefaultThreshold', () => {
    it('should match defaultData on undefined fetchedData', () => {
      expect(getDefaultThreshold(undefined)).toMatchObject(defaultData)
    })

    it('should match on partial fetchedData', () => {
      expect(getDefaultThreshold({
        timeToConnectThreshold: { value: 10 }
      })).toMatchObject({ ...defaultData, timeToConnect: 10 })
    })
  })

  describe('onResetClick', () => {
    it('should match default timeToConnect for undefined data', () => {
      expect(getResetCallback(undefined)('timeToConnect')(false)).toBe(2000)
    })

    it('should return supplied threshold value data', () => {
      expect(
        getResetCallback({ timeToConnectThreshold: { value: 10 } })('timeToConnect')(false)
      ).toBe(10)
    })
  })

  describe('onApplyClick', () => {
    const triggerSave = jest.fn(
      () => ({
        unwrap: async () => jest.fn()
      })
    )
    const filters = {
      startDate: '2022-04-07T09:15:00.000Z',
      endDate: '2022-04-07T10:15:00.000Z',
      path: [{ type: 'network', name: 'Network' }],
      range: DateRange.last24Hours
    } as AnalyticsFilter

    it('should match default timeToConnect for undefined data', async () => {
      await getApplyCallback(triggerSave, filters)('timeToConnect')(10)
      expect(triggerSave).toBeDefined()
      expect(triggerSave).toBeCalled()
    })
  })
})
