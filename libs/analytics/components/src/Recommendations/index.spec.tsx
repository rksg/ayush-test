import '@testing-library/jest-dom'

import { get }                                from '@acx-ui/config'
import { BrowserRouter as Router }            from '@acx-ui/react-router-dom'
import { recommendationUrl, Provider, store } from '@acx-ui/store'
import {
  fireEvent,
  mockGraphqlQuery, mockGraphqlMutation,
  render, screen,
  waitForElementToBeRemoved,
  act
} from '@acx-ui/test-utils'
import { setUpIntl } from '@acx-ui/utils'

import { api }        from './services'
import { mockResult } from './services.spec'

import { RecommendationTabContent } from './index'

const mockGet = get as jest.Mock

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
describe('RecommendationTabContent', () => {

  beforeEach(() => {
    setUpIntl({
      locale: 'en-US',
      messages: {}
    })
    store.dispatch(api.util.resetApiState())
  })
  afterEach(() => {
    mockGet.mockClear()
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
      data: mockResult
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
      data: mockResult
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
})
it('should render muted recommendations & unmute, reset', async () => {
  const { recommendations } = mockResult
  const [ muted, unmuted ] = recommendations
  muted.isMuted = true
  store.dispatch(api.util.resetApiState())
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

  // mute 
  
  fireEvent.click(afterReset[0])
  const mute = await screen.findByRole('button', { name: 'Mute' })

  // act(() => {
  //   store.dispatch(api.util.resetApiState())
  // })
  // unmuted.isMuted = true
  // mockGraphqlQuery(recommendationUrl, 'ConfigRecommendation', {
  //   data: { recommendations: [muted, unmuted] }
  // })
  const resp =  { toggleMute: { success: true, errorMsg: '' , errorCode: '' } }
  mockGraphqlMutation(recommendationUrl, 'MutateRecommendation', { data: resp })
  act(() => {
    fireEvent.click(mute)
  })
 
  //await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
  // fireEvent.click(settingsButton)
  // await screen.findByText('Show Muted Recommendations')
  // act(() => {
  //   fireEvent.click(showMutedRecommendations)
  // })
  
  // const final = await screen.findAllByRole('radio', { hidden: true, checked: false })
  // expect(final).toHaveLength(2)

})
