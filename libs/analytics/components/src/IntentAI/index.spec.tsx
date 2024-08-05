import '@testing-library/jest-dom'

import { useAnalyticsFilter, defaultNetworkPath }             from '@acx-ui/analytics/utils'
import { defaultTimeRangeDropDownContextValue, useDateRange } from '@acx-ui/components'
import { get }                                                from '@acx-ui/config'
import { useIsSplitOn }                                       from '@acx-ui/feature-toggle'
import { intentAIUrl, Provider, store }                       from '@acx-ui/store'
import {
  findTBody,
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions } from '@acx-ui/user'
import { DateRange }                         from '@acx-ui/utils'

import { intentListResult, filterOptions } from './__tests__/fixtures'
import {
  api
} from './services'

import { IntentAITabContent } from './index'

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
describe('IntentAITabContent', () => {
  const filters = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }

  beforeEach(() => {
    setRaiPermissions({ WRITE_AI_OPERATIONS: true } as RaiPermissions)
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
    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: { intents: { data: [] } }
    })
    mockGraphqlQuery(intentAIUrl, 'IntentAI', {
      data: { intentFilterOptions: { zones: [], codes: [], statuses: [] } }
    })
    render(<IntentAITabContent/>, {
      wrapper: Provider
    })

    const loader = screen.queryByRole('img', { name: 'loader' })
    expect(loader).toBeVisible()

    await waitForElementToBeRemoved(loader)

    const tbody = await findTBody()
    expect(await within(tbody).findAllByRole('row')).toHaveLength(1)
  })

  it('should render intentAI table for R1', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: intentListResult
    })
    mockGraphqlQuery(intentAIUrl, 'IntentAI', {
      data: filterOptions
    })
    render(<IntentAITabContent/>, {
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    //search row text
    const rowText = await screen.findAllByText('AI-Driven RRM')
    expect(rowText).toHaveLength(1)
    //search column title
    expect(screen.getByText('Intent')).toBeVisible()
    expect(screen.getByText('Venue')).toBeVisible()
    expect(screen.queryByText('Zone')).toBeNull()
  })

  it('should render intentAI table for RA', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: intentListResult
    })
    jest.mocked(get).mockReturnValue('true') // get('IS_MLISA_SA')
    render(<IntentAITabContent />, {
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    //search row text
    const rowText = await screen.findAllByText('AI-Driven RRM')
    expect(rowText).toHaveLength(1)
    //search column title
    expect(screen.getByText('Intent')).toBeVisible()
    expect(screen.getByText('Zone')).toBeVisible()
    expect(screen.queryByText('Venue')).toBeNull()
    //search test id
    expect(screen.getByTestId('intentAI')).toBeVisible()
  })

})
