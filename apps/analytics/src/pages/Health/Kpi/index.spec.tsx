import { dataApiURL }              from '@acx-ui/analytics/services'
import { AnalyticsFilter }         from '@acx-ui/analytics/utils'
import { BrowserRouter as Router } from '@acx-ui/react-router-dom'
import { Provider, store }         from '@acx-ui/store'
import {
  fireEvent,
  mockGraphqlMutation,
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import { TimeStampRange } from '@acx-ui/types'
import { DateRange }      from '@acx-ui/utils'

import { HealthPageContext } from '../HealthPageContext'

import { timeseriesApi, histogramApi, thresholdApi } from './services'

import KpiSection from '.'


describe('Kpi Section', () => {
  beforeEach(() => {
    store.dispatch(histogramApi.util.resetApiState())
    store.dispatch(timeseriesApi.util.resetApiState())
    store.dispatch(thresholdApi.util.resetApiState())
  })
  const sampleTS = {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z',
      '2022-04-07T09:45:00.000Z',
      '2022-04-07T10:00:00.000Z',
      '2022-04-07T10:15:00.000Z'
    ],
    data: [[10, 20], [null, null], [0, 0], [4, 5], [4, 5]]
  }
  const filters = {
    startDate: '2022-04-07T09:15:00.000Z',
    endDate: '2022-04-07T10:15:00.000Z',
    path: [{ type: 'ap', name: 'Network' }],
    range: DateRange.last24Hours
  } as AnalyticsFilter
  const healthContext = {
    ...filters,
    timeWindow: ['2022-04-07T09:30:00.000Z', '2022-04-07T09:45:00.000Z'] as TimeStampRange,
    setTimeWindow: jest.fn()
  }

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
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    await screen.findByText('Time To Connect')
    expect(await screen.findByText('20% meets goal')).toBeVisible()

    const resetBtns = await screen.findAllByRole('button', { name: 'Reset' })
    expect(resetBtns).toHaveLength(4)
    const resetBtn = resetBtns[0]
    expect(resetBtn).toBeDefined()
    fireEvent.click(resetBtn)

    const sliders = await screen.findAllByRole('slider')
    expect(sliders).toHaveLength(4)
    const values = sliders.map(slider => slider.style.left)
    expect(values.find((val) => val === '50%')).toMatch('50%')

    const applyBtns = await screen.findAllByRole('button', { name: 'Apply' })
    expect(applyBtns).toHaveLength(4)
    const applyBtn = applyBtns[0]
    expect(applyBtn).toBeDefined()
    fireEvent.click(applyBtn)
    expect(await screen.findByText('Threshold set successfully.')).toBeInTheDocument()
  }, 30000)



  it('should render disabled tooltip with non-network path', async () => {
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
      <HealthPageContext.Provider
        value={{ ...healthContext, path: [{ type: 'network', name: 'Network' }] }}
      >
        <KpiSection tab={'overview'} />
      </HealthPageContext.Provider>
    </Provider></Router>)
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    // eslint-disable-next-line max-len
    const disabledTooltips = await screen.findAllByTitle(/^Cannot save threshold at organisation level*/)
    expect(disabledTooltips).toHaveLength(4)
  }, 30000)

  it('should render disabled tooltip with no permissions', async () => {
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

    const period = Buffer.from(JSON.stringify(filters)).toString('base64')
    const analyticsNetworkFilter = Buffer.from(JSON.stringify({
      path: [{ type: 'ap', name: 'AP' }],
      raw: []
    })).toString('base64')

    render(<Provider>
      <HealthPageContext.Provider value={healthContext}>
        <KpiSection tab={'overview'} />
      </HealthPageContext.Provider>
    </Provider>, {
      route: {
        // eslint-disable-next-line max-len
        path: `/tenantId/analytics/health?period=${period}&analyticsNetworkFilter=${analyticsNetworkFilter}`,
        wrapRoutes: false
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    // eslint-disable-next-line max-len
    const disabledTooltips = await screen.findAllByTitle(/^You don't have permission to set threshold for selected network node./)
    expect(disabledTooltips).toHaveLength(4)
  }, 30000)

})
