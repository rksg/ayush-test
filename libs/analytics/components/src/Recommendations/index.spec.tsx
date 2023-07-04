import '@testing-library/jest-dom'

import { get }                                from '@acx-ui/config'
import { BrowserRouter as Router }            from '@acx-ui/react-router-dom'
import { recommendationUrl, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render, screen,
  waitForElementToBeRemoved
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