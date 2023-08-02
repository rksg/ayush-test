import { recommendationUrl, Provider }               from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitFor } from '@acx-ui/test-utils'

import { mockedRecommendationFirmware, mockedRecommendationCRRM } from './__tests__/fixtures'

import { RecommendationDetails } from '.'

jest.mock('./overview', () => ({
  Overview: () => <div data-testid='overview'>Overview</div>
}))

jest.mock('./kpis', () => ({
  Kpis: () => <div data-testid='kpis'>Kpis</div>
}))

jest.mock('./values', () => ({
  Values: () => <div data-testid='values'>Values</div>
}))

jest.mock('./graph', () => ({
  CloudRRMGraph: () => <div data-testid='graph'>Values</div>
}))

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    id: '5a4c8253-a2cb-485b-aa81-5ec75db9ceaf'
  })
}))

describe('RecommendationDetails', () => {
  it('renders correctly', async () => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: { recommendation: mockedRecommendationFirmware }
    })
    render(<RecommendationDetails />, {
      route: {
        path: '/analytics/next/recommendations/5a4c8253-a2cb-485b-aa81-5ec75db9ceaf'
      },
      wrapper: Provider
    })
    expect(await screen.findByTestId('overview')).toBeVisible()
    expect(await screen.findByTestId('kpis')).toBeVisible()
    expect(await screen.findByTestId('values')).toBeVisible()
    expect(screen.queryByTestId('graph')).toBeNull()
    await waitFor(async () => {
      expect(await screen.findByText('Zone firmware upgrade')).toBeVisible()
    })
  })
  it('should render graph correctly', async () => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: { recommendation: mockedRecommendationCRRM }
    })
    render(<RecommendationDetails />, {
      route: {
        path: '/analytics/next/recommendations/ad336e2a-63e4-4651-a9ac-65f5df4f4c47'
      },
      wrapper: Provider
    })
    expect(await screen.findByTestId('graph')).toBeVisible()
  })
})