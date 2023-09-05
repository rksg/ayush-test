import { recommendationUrl, Provider }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockedRecommendationCRRM } from './__tests__/fixtures'
import { CrrmDetails }              from './CrrmDetails'

jest.mock('./Overview', () => ({ Overview: () => <div data-testid='Overview' /> }))
jest.mock('./CrrmValues', () => ({ CrrmValues: () => <div data-testid='CrrmValues' /> }))
jest.mock('./Graph', () => ({ CloudRRMGraph: () => <div data-testid='CloudRRMGraph' /> }))
jest.mock('./CrrmValuesExtra', () =>
  ({ CrrmValuesExtra: () => <div data-testid='CrrmValuesExtra' /> }))
jest.mock('./StatusTrail', () => ({ StatusTrail: () => <div data-testid='StatusTrail' /> }))

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6'
  })
}))

describe('CrrmDetails', () => {
  it('renders correctly', async () => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: {
        recommendation: mockedRecommendationCRRM
      }
    })
    render(<CrrmDetails />, {
      route: {
        path: '/analytics/next/recommendations/crrm/b17acc0d-7c49-4989-adad-054c7f1fc5b6'
      },
      wrapper: Provider
    })

    expect(await screen.findByTestId('Overview')).toBeVisible()
    expect(await screen.findByTestId('CrrmValues')).toBeVisible()
    expect(await screen.findByTestId('CloudRRMGraph')).toBeVisible()
    expect(await screen.findByTestId('CrrmValuesExtra')).toBeVisible()
    expect(await screen.findByTestId('StatusTrail')).toBeVisible()
  })
})
