import '@testing-library/jest-dom'

import { get }                                from '@acx-ui/config'
import { BrowserRouter as Router }            from '@acx-ui/react-router-dom'
import { recommendationUrl, Provider, store } from '@acx-ui/store'
import {
  fireEvent,
  mockGraphqlQuery,
  render, screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import { setUpIntl } from '@acx-ui/utils'

import { apiResult }                          from './__tests__/fixtures'
import { api, useMuteRecommendationMutation } from './services'

import { RecommendationTabContent } from './index'

const mockGet = get as jest.Mock

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
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
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendation', {
      data: { recommendations: [] }
    })
    render(<Router><Provider><RecommendationTabContent /></Provider></Router>)
    expect(screen.getAllByRole('img', { name: 'loader' })).toBeTruthy()
  })

  it('should render table for R1', async () => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendation', {
      data: apiResult
    })
    mockGet.mockReturnValue(false) // get('IS_MLISA) => false
    render(<Provider><RecommendationTabContent /></Provider>, {
      route: {
        path: '/tenantId/t/analytics/recommendations',
        wrapRoutes: false
      }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await screen.findAllByText('High')
    expect(screen.getAllByText('High')).toHaveLength(1)
    expect(screen.getByText('Venue')).toHaveTextContent('Venue')
  })
  it('should render table for RA SA', async () => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendation', {
      data: apiResult
    })
    mockGet.mockReturnValue(true) // get('IS_MLISA) => true
    render(<Provider><RecommendationTabContent /></Provider>, {
      route: {
        path: '/analytics/next/recommendations',
        wrapRoutes: false
      }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await screen.findAllByText('High')
    expect(screen.getAllByText('High')).toHaveLength(1)
    expect(screen.getByText('Zone')).toHaveTextContent('Zone')
  })
  it('should render muted recommendations & reset correctly', async () => {
    const { recommendations } = apiResult
    const [ muted, unmuted ] = recommendations
    muted.isMuted = true
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendation', {
      data: { recommendations: [muted, unmuted] }
    })

    render(<Provider><RecommendationTabContent /></Provider>, {
      route: {
        path: '/analytics/next/recommendations',
        wrapRoutes: false
      }
    })

    const before = await screen.findAllByRole('radio', { hidden: false, checked: false })
    expect(before).toHaveLength(1)

    const settingsButton = await screen.findByTestId('SettingsOutlined')
    expect(settingsButton).toBeDefined()
    fireEvent.click(settingsButton)

    const showMutedRecommendations = await screen.findByText('Show Muted Recommendations')
    expect(showMutedRecommendations).toBeDefined()
    fireEvent.click(showMutedRecommendations)

    const afterShowMuted = await screen.findAllByRole('radio', { hidden: false, checked: false })
    expect(afterShowMuted).toHaveLength(2)

    // check the action says unmute:
    fireEvent.click(afterShowMuted[0])
    await screen.findByRole('button', { name: 'Unmute' })

    fireEvent.click(settingsButton)
    const resetButton = await screen.findByText('Reset to default')
    expect(resetButton).toBeDefined()
    fireEvent.click(resetButton)

    const afterReset = await screen.findAllByRole('radio', { hidden: false, checked: false })
    expect(afterReset).toHaveLength(1)

  })

  it('should mute recommendation correctly', async () => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendation', {
      data: apiResult
    })
    mockGet.mockReturnValue(true)
    mockedMuteRecommendation.mockImplementation(() => ({
      unwrap: () => Promise.resolve({
        toggleMute: { success: true, errorCode: '', errorMsg: '' }
      })
    }))

    render(<Provider><RecommendationTabContent /></Provider>, {
      route: {
        path: '/analytics/next/recommendations',
        wrapRoutes: false
      }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    const selectRecommendation = await screen.findAllByRole(
      'radio',
      { hidden: false, checked: false }
    )
    fireEvent.click(selectRecommendation[0])
    const mute = await screen.findByRole('button', { name: 'Mute' })
    expect(mockedMuteRecommendation).toHaveBeenCalledTimes(0)
    fireEvent.click(mute)
    expect(mockedMuteRecommendation).toHaveBeenCalledTimes(1)
  })
})
