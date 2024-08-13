import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

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
  within,
  waitFor
} from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions } from '@acx-ui/user'
import { DateRange, setUpIntl }              from '@acx-ui/utils'

import { intentListResult, mockAIDrivenRow, filterOptions } from './__tests__/fixtures'
import {
  api,
  IntentListItem
} from './services'

import { IntentAITabContent } from './index'

const mockedShowOneClickOptimize = jest.fn()

jest.mock('./useIntentAIActions', () => ({
  ...jest.requireActual('./useIntentAIActions'),
  useIntentAIActions: () => ({
    showOneClickOptimize: (_: IntentListItem[], callbackFun: () => void) => {
      mockedShowOneClickOptimize()
      callbackFun && callbackFun()
    }
  })
}))

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

setUpIntl({ locale: 'en-US', messages: {} })
//Refer to libs/analytics/components/src/Recommendations/index.spec.tsx
describe('IntentAITabContent', () => {
  const filters = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }

  beforeEach(() => {
    setRaiPermissions({ WRITE_AI_OPERATIONS: true, WRITE_INTENT_AI: true } as RaiPermissions)
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
      route: {},
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
      route: {},
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
    mockGraphqlQuery(intentAIUrl, 'IntentAI', {
      data: filterOptions
    })
    jest.mocked(get).mockReturnValue('true') // get('IS_MLISA_SA')
    render(<IntentAITabContent />, {
      route: {},
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

  it('should render 1-click-optimize', async () => {
    const extractItem = {
      aiFeature: 'AI-Driven RRM',
      intent: 'Client Density vs. Throughput for 2.4 GHz radio',
      category: 'Wi-Fi Experience',
      scope: `vsz611 (SZ Cluster)
    > EDU-MeshZone_S12348 (Venue)`,
      status: 'New',
      statusTooltip: 'IntentAI is active and has successfully applied the changes to the zone-1.'
    }
    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: { intents: { data: [{ ...mockAIDrivenRow, ...extractItem }], total: 1 } }
    })
    mockGraphqlQuery(intentAIUrl, 'IntentAI', {
      data: filterOptions
    })
    jest.mocked(get).mockReturnValue('true') // get('IS_MLISA_SA')
    render(<IntentAITabContent/>, {
      route: {},
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    const table = await screen.findByRole('table')
    expect(await within(table).findByTestId('AIDrivenRRM')).toBeVisible()
    await userEvent.click(await within(table).findByTestId('AIDrivenRRM'))
    expect(await screen.findByRole('button', { name: '1-Click Optimize' })).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: '1-Click Optimize' }))
    expect(mockedShowOneClickOptimize).toBeCalledTimes(1)
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: '1-Click Optimize' })).toBeNull()
    )
  })

})
