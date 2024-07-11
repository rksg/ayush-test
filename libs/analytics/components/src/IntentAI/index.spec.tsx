import '@testing-library/jest-dom'

import { useAnalyticsFilter, defaultNetworkPath }             from '@acx-ui/analytics/utils'
import { defaultTimeRangeDropDownContextValue, useDateRange } from '@acx-ui/components'
import { get }                                                from '@acx-ui/config'
import { useIsSplitOn }                                       from '@acx-ui/feature-toggle'
import { recommendationUrl, Provider, store }                 from '@acx-ui/store'
import {
  findTBody,
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions } from '@acx-ui/user'
import { setUpIntl, DateRange, NetworkPath } from '@acx-ui/utils'

import { intentAIRecommendationListResult } from './__tests__/fixtures'
import {
  api
} from './services'

import { IntentAIRecommendationTabContent } from './index'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  useAnalyticsFilter: jest.fn()
}))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useDateRange: jest.fn()
}))

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

jest.mock('./services', () => ({
  ...jest.requireActual('./services')
}))

//Refer to libs/analytics/components/src/Recommendations/index.spec.tsx
describe('IntentAIRecommendationTabContent', () => {
  const filters = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }

  beforeEach(() => {
    setRaiPermissions({ WRITE_AI_OPERATIONS: true } as RaiPermissions)
    setUpIntl({
      locale: 'en-US',
      messages: {}
    })
    store.dispatch(api.util.resetApiState())

    const pathFilters = { ...filters, path: defaultNetworkPath }
    jest.mocked(useAnalyticsFilter).mockReturnValue({
      filters,
      pathFilters,
      setNetworkPath: jest.fn(),
      raw: []
    })

    jest.mocked(useDateRange).mockReturnValue(defaultTimeRangeDropDownContextValue)

    jest.mocked(get).mockReturnValue('') // get('IS_MLISA_SA')

    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })

  it('should render loader and empty table', async () => {
    mockGraphqlQuery(recommendationUrl, 'IntentAIList', {
      data: { intents: [] }
    })
    render(<IntentAIRecommendationTabContent/>, {
      wrapper: Provider
    })

    const loader = screen.queryByRole('img', { name: 'loader' })
    expect(loader).toBeVisible()

    await waitForElementToBeRemoved(loader)

    const tbody = await findTBody()
    expect(await within(tbody).findAllByRole('row')).toHaveLength(1)
  })

  it('should render intentAI table for R1', async () => {
    mockGraphqlQuery(recommendationUrl, 'IntentAIList', {
      data: intentAIRecommendationListResult
    })
    render(<IntentAIRecommendationTabContent/>, {
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    //search row text
    const rrmText = await screen.findAllByText('AI-Driven RRM')
    expect(rrmText).toHaveLength(3)
    //search column title
    expect(screen.getByText('Intent')).toBeVisible()
    expect(screen.getByText('Venue')).toBeVisible()
    expect(screen.queryByText('Zone')).toBeNull()
    //search test id
    expect(screen.getByTestId('intentAI')).toBeVisible()
  })

  it('should render intentAI table for RA', async () => {
    mockGraphqlQuery(recommendationUrl, 'IntentAIList', {
      data: intentAIRecommendationListResult
    })
    jest.mocked(get).mockReturnValue('true') // get('IS_MLISA_SA')
    render(<IntentAIRecommendationTabContent />, {
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    //search row text
    const rrmText = await screen.findAllByText('AI-Driven RRM')
    expect(rrmText).toHaveLength(3)
    //search column title
    expect(screen.getByText('Intent')).toBeVisible()
    expect(screen.getByText('Zone')).toBeVisible()
    expect(screen.queryByText('Venue')).toBeNull()
    //search test id
    expect(screen.getByTestId('intentAI')).toBeVisible()
  })

  it('renders no data for switch path', async () => {
    const pathFilters = {
      ...filters,
      path: [
        { type: 'network', name: 'Network' },
        { type: 'system', name: 's1' },
        { type: 'switchGroup', name: 'sg1' }
      ] as NetworkPath
    }
    jest.mocked(useAnalyticsFilter).mockReturnValue({
      filters,
      pathFilters,
      setNetworkPath: jest.fn(),
      raw: []
    })
    render(<IntentAIRecommendationTabContent />, {
      route: { params: { activeTab: 'aiOps' } },
      wrapper: Provider
    })

    //search if any row text is rendered
    expect(screen.queryByText('AI-Driven RRM')).toBe(null)
    jest.clearAllMocks()
  })

})
