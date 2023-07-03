import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { get }                                from '@acx-ui/config'
import { BrowserRouter as Router }            from '@acx-ui/react-router-dom'
import { recommendationUrl, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render, screen,
  waitForElementToBeRemoved,
  waitFor
} from '@acx-ui/test-utils'
import { setUpIntl } from '@acx-ui/utils'

import { api }        from './services'
import { mockResult } from './services.spec'

import { RecommendationTabContent } from './index'

const mockGet = get as jest.Mock

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
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
        path: '/tenantId/t/analytics/recommendations/crrm',
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
        path: '/analytics/next/recommendations/crrm',
        wrapRoutes: false
      }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await screen.findAllByText('High')
    expect(screen.getAllByText('High')).toHaveLength(1)
    expect(screen.getByText('Zone')).toHaveTextContent('Zone')
    expect(screen.getByText('Cloud RRM')).toBeVisible()
    expect(screen.getByText('AI Operations')).toBeVisible()
  })
  it('should render table for crrm route in RA SA', async () => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendation', {
      data: mockResult
    })
    mockGet.mockReturnValue(true) // get('IS_MLISA) => true
    render(<Provider><RecommendationTabContent /></Provider>, {
      route: {
        path: '/analytics/next/recommendations/crrm',
        wrapRoutes: true
      }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    let aiOpsTab = await screen.findByRole('tab', { name: 'AI Operations', selected: false })
    expect(aiOpsTab).toBeVisible()
    await userEvent.click(aiOpsTab)
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/recommendations/aiOps', hash: '', search: ''
    }))
  })
  it('should render table for aiOps for RA SA', async () => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendation', {
      data: mockResult
    })
    mockGet.mockReturnValue(true) // get('IS_MLISA) => true
    render(<Provider><RecommendationTabContent /></Provider>, {
      route: {
        path: '/analytics/next/recommendations/aiOps',
        wrapRoutes: false
      }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await screen.findAllByText('Medium')
    expect(screen.getAllByText('Medium')).toHaveLength(1)
    expect(screen.getByText('Zone')).toHaveTextContent('Zone')
    expect(screen.getByText('Cloud RRM')).toBeVisible()
    expect(screen.getByText('AI Operations')).toBeVisible()
  })
})