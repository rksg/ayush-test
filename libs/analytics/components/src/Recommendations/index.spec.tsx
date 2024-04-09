import '@testing-library/jest-dom'

import userEvent    from '@testing-library/user-event'
import { uniqueId } from 'lodash'

import { useAnalyticsFilter, defaultNetworkPath }             from '@acx-ui/analytics/utils'
import { defaultTimeRangeDropDownContextValue, useDateRange } from '@acx-ui/components'
import { get }                                                from '@acx-ui/config'
import { useIsSplitOn }                                       from '@acx-ui/feature-toggle'
import { BrowserRouter as Router, Link }                      from '@acx-ui/react-router-dom'
import { recommendationUrl, Provider, store }                 from '@acx-ui/store'
import {
  findTBody,
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'
import { setUpIntl, DateRange, NetworkPath } from '@acx-ui/utils'

import { recommendationListResult } from './__tests__/fixtures'
import {
  api,
  useDeleteRecommendationMutation,
  useMuteRecommendationMutation,
  useSetPreferenceMutation
} from './services'

import { RecommendationTabContent } from './index'

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

const mockedDeleteRecommendation = jest.fn()
const mockedMuteRecommendation = jest.fn()
const mockedSetPreference = jest.fn()
jest.mock('./services', () => ({
  ...jest.requireActual('./services'),
  useDeleteRecommendationMutation: jest.fn(),
  useMuteRecommendationMutation: jest.fn(),
  useSetPreferenceMutation: jest.fn()
}))

describe('RecommendationTabContent', () => {
  const filters = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }

  beforeEach(() => {
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

    jest.mocked(useDeleteRecommendationMutation).mockImplementation(() => [
      mockedDeleteRecommendation,
      { reset: jest.fn() }
    ])

    jest.mocked(useMuteRecommendationMutation).mockImplementation(() => [
      mockedMuteRecommendation,
      { reset: jest.fn() }
    ])

    jest.mocked(useSetPreferenceMutation).mockImplementation(() => [
      mockedSetPreference,
      { reset: jest.fn() }
    ])

    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })

  it('should render loader and empty table', async () => {
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: [] }
    })
    render(<Router><Provider><RecommendationTabContent /></Provider></Router>)

    const loader = screen.queryByRole('img', { name: 'loader' })
    expect(loader).toBeVisible()

    await waitForElementToBeRemoved(loader)

    const tbody = await findTBody()
    expect(await within(tbody).findAllByRole('row')).toHaveLength(1)
  })

  it('should render crrm table for R1', async () => {
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: recommendationListResult.recommendations
        .filter(r => r.code.includes('crrm') || r.code === 'unknown')
        .map(r => ({ ...r, id: uniqueId() }))
      }
    })
    render(<RecommendationTabContent/>, {
      route: { params: { activeTab: 'crrm' } },
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    const text = await screen.findAllByText('Optimized')
    expect(text).toHaveLength(1)
    expect(screen.getByText('Venue')).toBeVisible()
    expect(useDateRange).toBeCalled()
  })

  it('should render crrm table for RA', async () => {
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: recommendationListResult.recommendations
        .filter(r => r.code.includes('crrm') || r.code === 'unknown')
        .map(r => ({ ...r, id: uniqueId() }))
      }
    })
    jest.mocked(get).mockReturnValue('true')
    render(<RecommendationTabContent/>, {
      route: { params: { activeTab: 'crrm' } },
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    const text = await screen.findAllByText('Optimized')
    expect(text).toHaveLength(1)
    expect(screen.getByText('Zone')).toBeVisible()
    expect(useDateRange).toBeCalled()
  })

  it('should render aiops table for R1', async () => {
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: recommendationListResult.recommendations
        .filter(r => !r.code.includes('crrm'))
        .map(r => ({ ...r, id: uniqueId() }))
      }
    })
    render(<RecommendationTabContent />, {
      route: { params: { activeTab: 'aiOps' } },
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    const text = await screen.findAllByText('Medium')
    expect(text).toHaveLength(1)
    expect(screen.getByText('Venue')).toBeVisible()
    expect(useDateRange).toBeCalled()
  })

  it('should render aiops table for RA', async () => {
    const recommendations = [...recommendationListResult.recommendations
      .filter(r => !r.code.includes('crrm'))
      .map(r => ({ ...r, id: uniqueId() }))
    ]
    recommendations[1].status = 'applywarning' // coverage for Status styled-component
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', { data: { recommendations } })
    jest.mocked(get).mockReturnValue('true')
    render(<RecommendationTabContent />, {
      route: { params: { activeTab: 'aiOps' } },
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    const text = await screen.findAllByText('Medium')
    expect(text).toHaveLength(1)
    expect(screen.getByText('Zone')).toBeVisible()
    expect(useDateRange).toBeCalled()
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
    render(<RecommendationTabContent />, {
      route: { params: { activeTab: 'aiOps' } },
      wrapper: Provider
    })

    expect(screen.queryByText('Medium')).toBe(null)
    jest.clearAllMocks()
  })

  it('switches from aiops to crrm without error', async () => {
    const recommendations = [...recommendationListResult.recommendations
      .filter(r => !r.code.includes('crrm'))
      .map(r => ({ ...r, id: uniqueId() }))
    ]
    const crrm = [...recommendationListResult.recommendations
      .filter(r => r.code.includes('crrm'))]
    jest.mocked(get).mockReturnValue('true')

    mockGraphqlQuery(recommendationUrl, 'RecommendationList', { data: { recommendations } })
    render(
      <Provider><RecommendationTabContent /><Link to='/crrm'>CRRM</Link></Provider>,
      { route: { path: '/:activeTab', params: { activeTab: 'aiOps' } } }
    )
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    mockGraphqlQuery(recommendationUrl, 'RecommendationList', { data: { recommendations: crrm } })
    await userEvent.click(screen.getByText('CRRM'))
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    const text = await screen.findAllByText('Optimized')
    expect(text).toHaveLength(1)
  })

  it('should render muted recommendations & reset correctly', async () => {
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: recommendationListResult.recommendations
        .filter(r => !r.code.includes('crrm'))
        .map(r => ({ ...r, id: uniqueId() }))
      }
    })
    jest.mocked(get).mockReturnValue('true')
    render(<Provider><RecommendationTabContent /></Provider>, {
      route: {
        path: '/ai/recommendations/aiOps',
        params: { activeTab: 'aiOps' }
      }
    })

    const before = await screen.findAllByRole('radio', { hidden: false, checked: false })
    expect(before).toHaveLength(1)

    const settingsButton = await screen.findByTestId('SettingsOutlined')
    expect(settingsButton).toBeDefined()
    await userEvent.click(settingsButton)

    const showMutedRecommendations = await screen.findByText('Show Muted Recommendations')
    expect(showMutedRecommendations).toBeDefined()
    await userEvent.click(showMutedRecommendations)

    const afterShowMuted = await screen.findAllByRole('radio', { hidden: false, checked: false })
    expect(afterShowMuted).toHaveLength(2)

    await userEvent.click(afterShowMuted[1])
    await screen.findByRole('button', { name: 'Unmute' })

    await userEvent.click(settingsButton)
    const resetButton = await screen.findByText('Reset to default')
    expect(resetButton).toBeDefined()
    await userEvent.click(resetButton)

    const afterReset = await screen.findAllByRole('radio', { hidden: false, checked: false })
    expect(afterReset).toHaveLength(1)
  })

  it('should mute recommendation correctly', async () => {
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: recommendationListResult.recommendations
        .filter(r => !r.code.includes('crrm'))
        .map(r => ({ ...r, id: uniqueId() }))
      }
    })
    jest.mocked(get).mockReturnValue('true')
    mockedMuteRecommendation.mockImplementation(() => ({
      unwrap: () => Promise.resolve({
        toggleMute: { success: true, errorCode: '', errorMsg: '' }
      })
    }))
    render(<Provider><RecommendationTabContent /></Provider>, {
      route: {
        path: '/ai/recommendations/aiOps',
        params: { activeTab: 'aiOps' },
        wrapRoutes: false
      }
    })

    const selectRecommendation = await screen.findAllByRole(
      'radio',
      { hidden: false, checked: false }
    )
    await userEvent.click(selectRecommendation[0])
    const mute = await screen.findByRole('button', { name: 'Mute' })
    expect(mute).toBeVisible()
    expect(mockedMuteRecommendation).toHaveBeenCalledTimes(0)
    await userEvent.click(mute)
    expect(mockedMuteRecommendation).toHaveBeenCalledTimes(1)
  })

  it('should handle toggle of full/partial crrm correctly', async () => {
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: recommendationListResult.recommendations
        .filter(r => r.code.includes('crrm') || r.code === 'unknown')
        .map(r => ({ ...r, id: uniqueId() }))
      }
    })
    render(<RecommendationTabContent/>, {
      route: { params: { activeTab: 'crrm' } },
      wrapper: Provider
    })
    mockedSetPreference.mockImplementation(() => ({
      unwrap: () => Promise.resolve({
        setPreference: { success: true, errorCode: '', errorMsg: '' }
      })
    }))

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    const row = screen.getByRole('row', {
      // eslint-disable-next-line max-len
      name: /Non-Optimized 06\/16\/2023 06:05 Optimal channel plan found for 2\.4 GHz radio zone-1 New/i
    })
    await userEvent.click(within(row).getByRole('switch'))
    expect(mockedSetPreference).toBeCalled()
  })

  it('should not allow toggle of full/partial crrm', async () => {
    const appliedRecommendation = recommendationListResult.recommendations
      .find(r => r.code.includes('crrm') && r.status === 'applied')
    const newRecommendation = recommendationListResult.recommendations
      .find(r => r.code.includes('crrm') && r.status === 'new')
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', { data: { recommendations: [
      appliedRecommendation,
      {
        ...newRecommendation,
        metadata: { algorithmData: { isCrrmFullOptimization: true } },
        preferences: { crrmFullOptimization: false },
        isMuted: true
      }
    ] } })
    render(<RecommendationTabContent/>, {
      route: { params: { activeTab: 'crrm' } },
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    await userEvent.click(await screen.findByTestId('SettingsOutlined'))
    await userEvent.click(await screen.findByText('Show Muted Recommendations'))
    const appliedRow = screen.getByRole('row', {
      // eslint-disable-next-line max-len
      name: /Optimized 06\/16\/2023 06:05 Optimal Ch\/Width and Tx Power found for 5 GHz radio zone-1 Applied/i
    })
    const newRow = screen.getByRole('row', {
      // eslint-disable-next-line max-len
      name: /Non-Optimized 06\/16\/2023 06:05 Optimal Ch\/Width and Tx Power found for 2.4 GHz radio zone-1 New/i
    })
    expect(within(appliedRow).getByRole('switch')).toBeDisabled()
    expect(within(newRow).getByRole('switch')).toBeDisabled()
  })

  it('should not have mismatch tooltip for unknown zone', async () => {
    const unknownRecommendation = recommendationListResult.recommendations
      .find(r => r.code === 'unknown')
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', { data: { recommendations: [
      {
        ...unknownRecommendation,
        preferences: { crrmFullOptimization: false }
      }
    ] } })
    render(<RecommendationTabContent/>, {
      route: { params: { activeTab: 'crrm' } },
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    const row = screen.getByRole('row', {
      // eslint-disable-next-line max-len
      name: /Insufficient Licenses 11\/12\/2023 06:05 No RRM recommendation due to incomplete license compliance 01-Alethea-WiCheck Test Insufficient Licenses/
    })
    expect(row.classList.contains('crrm-optimization-mismatch')).toBeFalsy()
  })

  it('should delete recommendation correctly', async () => {
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: [ {
        ...recommendationListResult.recommendations[1], status: 'revertfailed'
      } ] }
    })
    jest.mocked(get).mockReturnValue('true')
    mockedDeleteRecommendation.mockImplementation(() => ({
      unwrap: () => Promise.resolve({
        deleteRecommendation: { success: true, errorCode: '', errorMsg: '' }
      })
    }))
    render(<Provider><RecommendationTabContent /></Provider>, {
      route: {
        path: '/ai/recommendations/crrm',
        params: { activeTab: 'crrm' },
        wrapRoutes: false
      }
    })

    const selectRecommendation = await screen.findAllByRole(
      'radio',
      { hidden: false, checked: false }
    )
    await userEvent.click(selectRecommendation[0])
    const deleteBtn = await screen.findByRole('button', { name: 'Delete' })
    expect(deleteBtn).toBeVisible()
    expect(mockedDeleteRecommendation).toHaveBeenCalledTimes(0)
    await userEvent.click(deleteBtn)
    expect(mockedDeleteRecommendation).toHaveBeenCalledTimes(1)
  })

  it('should hide delete recommendation when status is not in enableDeleteStatus', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: [ {
        ...recommendationListResult.recommendations[1], status: 'new'
      } ] }
    })
    jest.mocked(get).mockReturnValue('true')
    mockedDeleteRecommendation.mockImplementation(() => ({
      unwrap: () => Promise.resolve({
        deleteRecommendation: { success: true, errorCode: '', errorMsg: '' }
      })
    }))
    render(<Provider><RecommendationTabContent /></Provider>, {
      route: {
        path: '/ai/recommendations/crrm',
        params: { activeTab: 'crrm' },
        wrapRoutes: false
      }
    })

    const selectRecommendation = await screen.findAllByRole(
      'radio',
      { hidden: false, checked: false }
    )
    await userEvent.click(selectRecommendation[0])
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('should hide delete recommendations when trigger is once', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: [ {
        ...recommendationListResult.recommendations[1],
        status: 'revertfailed',
        trigger: 'once'
      } ] }
    })
    jest.mocked(get).mockReturnValue('true')
    mockedDeleteRecommendation.mockImplementation(() => ({
      unwrap: () => Promise.resolve({
        deleteRecommendation: { success: true, errorCode: '', errorMsg: '' }
      })
    }))
    render(<Provider><RecommendationTabContent /></Provider>, {
      route: {
        path: '/ai/recommendations/crrm',
        params: { activeTab: 'crrm' },
        wrapRoutes: false
      }
    })

    const selectRecommendation = await screen.findAllByRole(
      'radio',
      { hidden: false, checked: false }
    )
    await userEvent.click(selectRecommendation[0])
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('should hide delete recommendation when Features.RECOMMENDATION_DELETE disabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: [ {
        ...recommendationListResult.recommendations[1], status: 'revertfailed'
      } ] }
    })
    mockedDeleteRecommendation.mockImplementation(() => ({
      unwrap: () => Promise.resolve({
        deleteRecommendation: { success: true, errorCode: '', errorMsg: '' }
      })
    }))
    render(<Provider><RecommendationTabContent /></Provider>, {
      route: {
        path: '/ai/recommendations/crrm',
        params: { activeTab: 'crrm' },
        wrapRoutes: false
      }
    })

    const selectRecommendation = await screen.findAllByRole(
      'radio',
      { hidden: false, checked: false }
    )
    await userEvent.click(selectRecommendation[0])
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('should show delete recommendation when IS_MLISA_SA', async () => {
    jest.mocked(get).mockReturnValue('true')
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: [ {
        ...recommendationListResult.recommendations[1], status: 'revertfailed'
      } ] }
    })
    jest.mocked(get).mockReturnValue('true')
    mockedDeleteRecommendation.mockImplementation(() => ({
      unwrap: () => Promise.resolve({
        deleteRecommendation: { success: true, errorCode: '', errorMsg: '' }
      })
    }))
    render(<Provider><RecommendationTabContent /></Provider>, {
      route: {
        path: '/ai/recommendations/crrm',
        params: { activeTab: 'crrm' },
        wrapRoutes: false
      }
    })

    const selectRecommendation = await screen.findAllByRole(
      'radio',
      { hidden: false, checked: false }
    )
    await userEvent.click(selectRecommendation[0])
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })
})
