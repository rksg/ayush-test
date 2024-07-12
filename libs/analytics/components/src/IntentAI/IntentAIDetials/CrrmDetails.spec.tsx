import { pick } from 'lodash'

import { recommendationUrl, Provider }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockedRecommendationCRRM } from './__tests__/fixtures'
import { CrrmDetails }              from './CrrmDetails'

jest.mock('./Overview', () => ({ Overview: () => <div data-testid='Overview' /> }))
jest.mock('./CrrmValuesExtra', () =>
  ({ CrrmValuesExtra: () => <div data-testid='CrrmValuesExtra' /> }))
jest.mock('./StatusTrail', () => ({ StatusTrail: () => <div data-testid='StatusTrail' /> }))

describe('CrrmDetails', () => {
  beforeEach(() => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationCode', {
      data: { recommendation: pick(mockedRecommendationCRRM, ['id', 'code']) }
    })
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: { recommendation: mockedRecommendationCRRM }
    })
  })
  it('renders correctly', async () => {
    render(<CrrmDetails />, {
      route: {
        params: {
          code: 'c-crrm-channel24g-auto',
          recommendationId: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6'
        }
      },
      wrapper: Provider
    })
    expect(await screen.findByText('AI-Driven RRM')).toBeVisible()
    expect(await screen.findByTestId('Overview')).toBeVisible()
    expect(await screen.findByTestId('CrrmValuesExtra')).toBeVisible()
    expect(await screen.findByTestId('StatusTrail')).toBeVisible()
  })
})
