import { intentAIUrl, Provider }            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockIntentContext }                  from '../../__tests__/fixtures'
import { mocked, mockedKpiData, mockKpiData } from '../__tests__/mockedEcoFlex'
import { useIntentAIEcoFlexQuery }            from '../services'

import { MetricsGrid } from '.'

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

describe('MetricsGrid', () => {
  beforeEach(() => {
    mockGraphqlQuery(intentAIUrl, 'IntentAIEcoKpi', {
      data: { intent: mockKpiData }
    })
  })
  afterEach(() => jest.clearAllMocks())

  it('shows fallback with no kpi data', async () => {
    mockIntentContext({ intent: mocked })
    render(<MetricsGrid kpiQuery={mockedEmptyQueryResult} />, { wrapper: Provider })
    expect(screen.queryByTestId('Metrics')).toBeNull()
  })

  it('renders correct when exist kpi values', async () => {
    mockIntentContext({ intent: mocked })
    render(<MetricsGrid kpiQuery={mockedQueryResult} />, { wrapper: Provider })
    expect(screen.queryByTestId('Metrics')).toBeVisible()
    expect(await screen.findByText('Metrics')).toBeVisible()
    expect(await screen.findByText('AI-Optimized APs')).toBeVisible()
    expect(await screen.findByText('Excluded APs')).toBeVisible()
    expect(await screen.findByText('Unsupported APs')).toBeVisible()
    //check first and last tooltip
    expect(await screen.findByText(
      /Number of APs actively using AI-Driven Energy Saving/)).toBeVisible()
    expect(await screen.findByText(
      /Older generation APs that do not support AI-Driven Energy Saving/)).toBeVisible()
  })
})