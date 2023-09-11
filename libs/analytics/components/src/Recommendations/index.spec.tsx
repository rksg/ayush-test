import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { get }                                from '@acx-ui/config'
import { BrowserRouter as Router }            from '@acx-ui/react-router-dom'
import { recommendationUrl, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render, screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import { setUpIntl } from '@acx-ui/utils'

import { recommendationListResult }           from './__tests__/fixtures'
import { api, useMuteRecommendationMutation } from './services'

import { RecommendationTabContent } from './index'

const mockGet = get as jest.Mock

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const mockedUseMuteRecommendationMutation = useMuteRecommendationMutation as jest.Mock
const mockedMuteRecommendation = jest.fn()
jest.mock('./services', () => ({
  ...jest.requireActual('./services'),
  useMuteRecommendationMutation: jest.fn()
}))

describe('RecommendationTabContent', () => {

  beforeEach(() => {
    setUpIntl({
      locale: 'en-US',
      messages: {}
    })
    store.dispatch(api.util.resetApiState())
    mockedUseMuteRecommendationMutation.mockImplementation(() => [mockedMuteRecommendation])
  })
  afterEach(() => {
    mockGet.mockClear()
    mockedUseMuteRecommendationMutation.mockClear()
  })

  it('should render loader', () => {
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: [] }
    })
    render(<Router><Provider><RecommendationTabContent /></Provider></Router>)
    expect(screen.getAllByRole('img', { name: 'loader' })).toBeTruthy()
  })

  it('should render crrm table for R1', async () => {
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: recommendationListResult.recommendations
        .filter(r => r.code.includes('crrm')) }
    })
    mockGet.mockReturnValue(false) // get('IS_MLISA_SA') => false
    render(<RecommendationTabContent/>, {
      route: { params: { activeTab: 'crrm' } },
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    const text = await screen.findAllByText('Optimized')
    expect(text).toHaveLength(1)
    expect(screen.getByText('Venue')).toBeVisible()
  })

  it('should render crrm table for RA', async () => {
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: recommendationListResult.recommendations
        .filter(r => r.code.includes('crrm')) }
    })
    mockGet.mockReturnValue(true) // get('IS_MLISA_SA') => true
    render(<RecommendationTabContent/>, {
      route: { params: { activeTab: 'crrm' } },
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    const text = await screen.findAllByText('Optimized')
    expect(text).toHaveLength(1)
    expect(screen.getByText('Zone')).toBeVisible()
  })

  it('should render aiops table for R1', async () => {
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: recommendationListResult.recommendations
        .filter(r => !r.code.includes('crrm')) }
    })
    mockGet.mockReturnValue(false) // get('IS_MLISA_SA') => false
    render(<RecommendationTabContent />, {
      route: { params: { activeTab: 'aiOps' } },
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    const text = await screen.findAllByText('Medium')
    expect(text).toHaveLength(1)
    expect(screen.getByText('Venue')).toBeVisible()
  })

  it('should render aiops table for RA', async () => {
    const recommendations = [...recommendationListResult.recommendations
      .filter(r => !r.code.includes('crrm'))]
    recommendations[1].status = 'applywarning' // coverage for Status styled-component
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', { data: { recommendations } })
    mockGet.mockReturnValue(true) // get('IS_MLISA_SA') => true
    render(<RecommendationTabContent />, {
      route: { params: { activeTab: 'aiOps' } },
      wrapper: Provider
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    const text = await screen.findAllByText('Medium')
    expect(text).toHaveLength(1)
    expect(screen.getByText('Zone')).toBeVisible()
  })

  it('should render muted recommendations & reset correctly', async () => {
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: { recommendations: recommendationListResult.recommendations
        .filter(r => !r.code.includes('crrm')) }
    })
    mockGet.mockReturnValue(true) // get('IS_MLISA_SA') => true
    render(<Provider><RecommendationTabContent /></Provider>, {
      route: {
        path: '/analytics/next/recommendations/aiOps',
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

    // check the action says unmute:
    await userEvent.click(afterShowMuted[0])
    await screen.findByRole('button', { name: 'Mute' })

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
        .filter(r => !r.code.includes('crrm')) }
    })
    mockGet.mockReturnValue(true) // get('IS_MLISA_SA') => true
    mockedMuteRecommendation.mockImplementation(() => ({
      unwrap: () => Promise.resolve({
        toggleMute: { success: true, errorCode: '', errorMsg: '' }
      })
    }))
    render(<Provider><RecommendationTabContent /></Provider>, {
      route: {
        path: '/analytics/next/recommendations/aiOps',
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
})
