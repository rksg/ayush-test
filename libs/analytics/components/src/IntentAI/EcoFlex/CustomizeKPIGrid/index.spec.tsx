import { intentAIUrl, Provider }            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockIntentContext }                  from '../../__tests__/fixtures'
import { Statuses }                           from '../../states'
import { mocked, mockedKpiData, mockKpiData } from '../__tests__/mockedEcoFlex'
import { useIntentAIEcoFlexQuery }            from '../services'

import { CustomizeKPIGrid } from '.'

jest.mock('../../IntentContext')

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  Tooltip: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <div>{title}</div>
      {children}
    </div>
  )
}))

const mockedQueryResult = {
  isFetching: false,
  isLoading: false,
  data: mockedKpiData
} as ReturnType<typeof useIntentAIEcoFlexQuery>

const mockedEmptyQueryResult = {
  isFetching: false,
  isLoading: false,
  data: { data: { timestamp: '' }, compareData: { timestamp: '' } }
} as ReturnType<typeof useIntentAIEcoFlexQuery>

describe('CustomizeKPIGrid', () => {
  beforeEach(() => {
    mockGraphqlQuery(intentAIUrl, 'IntentAIEcoKpi', {
      data: { intent: mockKpiData }
    })
  })
  afterEach(() => jest.clearAllMocks())

  it('shows fallback when no data (state === "no-data")', async () => {
    mockIntentContext({ intent: { ...mocked, status: Statuses.na } })
    render(<CustomizeKPIGrid kpiQuery={mockedQueryResult} />, { wrapper: Provider })

    expect(await screen.findByText(
      'Key Performance Indications will be generated once Intent is activated.'
    )).toBeVisible()
  })

  it('shows fallback with no kpi data', async () => {
    mockIntentContext({ intent: mocked })
    render(<CustomizeKPIGrid kpiQuery={mockedEmptyQueryResult} />, { wrapper: Provider })
    expect(await screen.findByText(
      'Key Performance Indications will be generated once Intent is activated.'
    )).toBeVisible()
  })

  it('shows fallback when isDataRetained is false', async () => {
    mockIntentContext({ intent:
        {
          ...mocked,
          dataCheck: { ...mocked.dataCheck, isDataRetained: false }
        } })
    render(<CustomizeKPIGrid kpiQuery={mockedEmptyQueryResult} />, { wrapper: Provider })
    expect(await screen.findByText('Beyond data retention period')).toBeVisible()
  })

  it('renders correct when exist kpi values', async () => {
    mockIntentContext({ intent: mocked })
    render(<CustomizeKPIGrid kpiQuery={mockedQueryResult} />, { wrapper: Provider })
    expect(await screen.findByText('AI-Optimized APs')).toBeVisible()
    expect(await screen.findByText('Excluded APs')).toBeVisible()
    expect(await screen.findByText('Unsupported APs')).toBeVisible()
    expect(await screen.findByText('Power Consumption')).toBeVisible()
    expect(await screen.findByText('Max AP Power')).toBeVisible()
    expect(await screen.findByText('Min AP Power (Standard vs AI)')).toBeVisible()
    //check first and last tooltip
    expect(await screen.findByText(
      /Number of APs actively using AI-Driven Energy Saving/)).toBeVisible()
    expect(await screen.findByText(/Comparison of the lowest power/)).toBeVisible()
  })
})