import { intentAIUrl, Provider }            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockIntentContext }                  from '../../__tests__/fixtures'
import { Statuses }                           from '../../states'
import { mocked, mockedKpiData, mockKpiData } from '../__tests__/mockedEcoFlex'
import { useIntentAIEcoFlexQuery }            from '../services'

import { BenefitsGrid } from '.'

jest.mock('../../IntentContext')

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

describe('BenefitsGrid', () => {
  beforeEach(() => {
    mockGraphqlQuery(intentAIUrl, 'IntentAIEcoKpi', {
      data: { intent: mockKpiData }
    })
  })
  afterEach(() => jest.clearAllMocks())

  it('shows fallback when no data (state === "no-data")', async () => {
    mockIntentContext({ intent: { ...mocked, status: Statuses.na } })
    render(<BenefitsGrid kpiQuery={mockedEmptyQueryResult} />, { wrapper: Provider })

    expect(await screen.findByText('Projected power saving')).toBeVisible()
    expect(await screen.findByText('Not available')).toBeVisible()
  })

  it('shows fallback with no kpi data', async () => {
    mockIntentContext({ intent: mocked })
    render(<BenefitsGrid kpiQuery={mockedEmptyQueryResult} />, { wrapper: Provider })
    expect(await screen.findByText('Projected power saving')).toBeVisible()
    expect(await screen.findByText('Not available')).toBeVisible()
  })

  it('shows fallback when isDataRetained is false', async () => {
    mockIntentContext({ intent:
        {
          ...mocked,
          dataCheck: { ...mocked.dataCheck, isDataRetained: false }
        } })
    render(<BenefitsGrid kpiQuery={mockedEmptyQueryResult} />, { wrapper: Provider })
    expect(await screen.findByText('Projected power saving')).toBeVisible()
    expect(await screen.findByText('Not available')).toBeVisible()
  })

  it('shows value when DataRetained is false and projectedPowerSaving is exist', async () => {
    mockIntentContext({ intent:
        {
          ...mocked,
          dataCheck: { ...mocked.dataCheck, isDataRetained: false }
        } })
    render(<BenefitsGrid kpiQuery={mockedQueryResult} />, { wrapper: Provider })
    expect(await screen.findByText('Projected power saving')).toBeVisible()
    expect(screen.queryByText('Not available')).toBeNull()
  })

  it('renders correct when exist kpi values', async () => {
    mockIntentContext({ intent: mocked })
    render(<BenefitsGrid kpiQuery={mockedQueryResult} />, { wrapper: Provider })
    expect(await screen.findByText('Projected power saving')).toBeVisible()
    expect(await screen.findByText(
      `${mockedQueryResult.data?.data.data.projectedPowerSaving} kWh`
    )).toBeVisible()
    expect(await screen.findByText('/month')).toBeVisible()
  })
})