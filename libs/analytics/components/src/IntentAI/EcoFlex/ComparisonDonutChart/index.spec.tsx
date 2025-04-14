import 'jest-styled-components'

import { intentAIUrl, Provider }            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockIntentContext }                      from '../../__tests__/fixtures'
import { Statuses }                               from '../../states'
import { mocked, mockKpiData, mockKpiResultData } from '../__tests__/mockedEcoFlex'

import { useIntentAIEcoFlexQuery } from './services'

import { ComparisonDonutChart } from '.'

jest.mock('../../IntentContext')
jest.mock('./Legend', () => ({
  Legend: () => <div data-testid='ecoflex-legend' />
}))

const mockedQueryResult = {
  isFetching: false,
  isLoading: false,
  data: mockKpiResultData
} as ReturnType<typeof useIntentAIEcoFlexQuery>

describe('ComparisonDonutChart', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(+new Date('2024-08-08T12:00:00.000Z'))
    mockIntentContext({ intent: mocked })
    mockGraphqlQuery(intentAIUrl, 'IntentAIEcoKpi', {
      data: { intent: mockKpiData }
    })
  })

  it('should render correctly for active states (Detail)', async () => {
    render(<ComparisonDonutChart kpiQuery={mockedQueryResult} isDetail />, { wrapper: Provider })

    expect(await screen.findByText('Before')).toBeVisible()
    expect(await screen.findByText('Recommended')).toBeVisible()
  })

  it('should render correctly for non-active states (Detail)', async () => {
    mockIntentContext({ intent: { ...mocked, status: Statuses.na } })

    render(<ComparisonDonutChart kpiQuery={mockedQueryResult} isDetail />, { wrapper: Provider })
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Key Performance Indications will be generated once Intent is activated.')).toBeVisible()
  })

  it('should render correctly for active states (non-Detail)', async () => {
    // eslint-disable-next-line max-len
    render(<ComparisonDonutChart kpiQuery={mockedQueryResult} />, { wrapper: Provider })

    expect(await screen.findByText('(Default)')).toBeVisible()
    expect(await screen.findByText('(Energy Saving projection)')).toBeVisible()
  })

  it('handle beyond data retention', async () => {
    const beyondDataRetentionMock = {
      ...mocked,
      dataCheck: {
        isDataRetained: false,
        isHotTierData: true
      }
    }
    mockIntentContext({ intent: beyondDataRetentionMock })

    const { container } = render(<ComparisonDonutChart kpiQuery={mockedQueryResult}/>, {
      wrapper: Provider
    })
    expect(container).toHaveTextContent('Beyond data retention period')
  })
})
