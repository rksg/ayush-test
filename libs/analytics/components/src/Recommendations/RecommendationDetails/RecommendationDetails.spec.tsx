import { pick } from 'lodash'

import { recommendationUrl, Provider }               from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitFor } from '@acx-ui/test-utils'
import { RolesEnum }                                 from '@acx-ui/types'
import { getUserProfile, setUserProfile }            from '@acx-ui/user'

import { mockedRecommendationFirmware } from './__tests__/fixtures'
import { RecommendationDetails }        from './RecommendationDetails'

jest.mock('./Overview', () => ({ Overview: () => <div data-testid='Overview' /> }))
jest.mock('./Kpis', () => ({ Kpis: () => <div data-testid='Kpis' /> }))
jest.mock('./StatusTrail', () => ({ StatusTrail: () => <div data-testid='StatusTrail' /> }))
jest.mock('./Values', () => ({ Values: () => <div data-testid='Values' /> }))
jest.mock('./RecommendationSetting', () => ({
  ...jest.requireActual('./RecommendationSetting'),
  RecommendationSetting: () => <div data-testid='RecommendationSetting' />
}))

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    id: '5a4c8253-a2cb-485b-aa81-5ec75db9ceaf'
  })
}))

describe('RecommendationDetails', () => {
  it('renders correctly', async () => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationCode', {
      data: {
        recommendation: pick(mockedRecommendationFirmware, ['id', 'code', 'status'])
      }
    })
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: { recommendation: mockedRecommendationFirmware }
    })
    render(<RecommendationDetails />, {
      route: {
        path: '/ai/recommendations/5a4c8253-a2cb-485b-aa81-5ec75db9ceaf'
      },
      wrapper: Provider
    })
    expect(await screen.findByTestId('Overview')).toBeVisible()
    expect(await screen.findByTestId('Kpis')).toBeVisible()
    expect(await screen.findByTestId('StatusTrail')).toBeVisible()
    expect(await screen.findByTestId('Values')).toBeVisible()
    expect(await screen.findByTestId('RecommendationSetting')).toBeVisible()
    await waitFor(async () => {
      expect(await screen.findByText('Zone firmware upgrade')).toBeVisible()
    })
  })
  it('should hide RecommendationSetting when role = READ_ONLY', async () => {
    const profile = getUserProfile()
    setUserProfile({ ...profile, profile: {
      ...profile.profile, roles: [RolesEnum.READ_ONLY]
    } })

    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationCode', {
      data: {
        recommendation: pick(mockedRecommendationFirmware, ['id', 'code'])
      }
    })
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: { recommendation: mockedRecommendationFirmware }
    })
    render(<RecommendationDetails />, {
      route: {
        path: '/ai/recommendations/5a4c8253-a2cb-485b-aa81-5ec75db9ceaf'
      },
      wrapper: Provider
    })
    expect(await screen.findByTestId('Overview')).toBeVisible()
    expect(await screen.findByTestId('Kpis')).toBeVisible()
    expect(await screen.findByTestId('StatusTrail')).toBeVisible()
    expect(await screen.findByTestId('Values')).toBeVisible()
    expect(screen.queryByTestId('RecommendationSetting')).not.toBeInTheDocument()
    await waitFor(async () => {
      expect(await screen.findByText('Zone firmware upgrade')).toBeVisible()
    })
  })
})
