import { pick } from 'lodash'

import { recommendationUrl, Provider }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { RolesEnum }                        from '@acx-ui/types'
import { getUserProfile, setUserProfile }   from '@acx-ui/user'

import { mockedRecommendationCRRM } from './__tests__/fixtures'
import { CrrmDetails }              from './CrrmDetails'

jest.mock('./Overview', () => ({ Overview: () => <div data-testid='Overview' /> }))
jest.mock('./CrrmValues', () => ({ CrrmValues: () => <div data-testid='CrrmValues' /> }))
jest.mock('./Graph', () => ({ CloudRRMGraph: () => <div data-testid='CloudRRMGraph' /> }))
jest.mock('./CrrmValuesExtra', () =>
  ({ CrrmValuesExtra: () => <div data-testid='CrrmValuesExtra' /> }))
jest.mock('./StatusTrail', () => ({ StatusTrail: () => <div data-testid='StatusTrail' /> }))
jest.mock('./RecommendationSetting', () => ({
  ...jest.requireActual('./RecommendationSetting'),
  RecommendationSetting: () => <div data-testid='RecommendationSetting' />
}))

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6'
  })
}))

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
      route: { path: '/ai/recommendations/crrm/b17acc0d-7c49-4989-adad-054c7f1fc5b6' },
      wrapper: Provider
    })
    expect(await screen.findByTestId('Overview')).toBeVisible()
    expect(await screen.findByTestId('CrrmValues')).toBeVisible()
    expect(await screen.findByTestId('CloudRRMGraph')).toBeVisible()
    expect(await screen.findByTestId('CrrmValuesExtra')).toBeVisible()
    expect(await screen.findByTestId('StatusTrail')).toBeVisible()
    expect(await screen.findByTestId('RecommendationSetting')).toBeVisible()
  })
  it('should hide RecommendationSetting when role = READ_ONLY', async () => {
    const profile = getUserProfile()
    setUserProfile({ ...profile, profile: {
      ...profile.profile, roles: [RolesEnum.READ_ONLY]
    } })

    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationCode', {
      data: {
        recommendation: pick(mockedRecommendationCRRM, ['id', 'code'])
      }
    })
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: {
        recommendation: mockedRecommendationCRRM
      }
    })
    render(<CrrmDetails />, {
      route: {
        path: '/ai/recommendations/crrm/b17acc0d-7c49-4989-adad-054c7f1fc5b6'
      },
      wrapper: Provider
    })

    expect(await screen.findByTestId('Overview')).toBeVisible()
    expect(await screen.findByTestId('CrrmValues')).toBeVisible()
    expect(await screen.findByTestId('CloudRRMGraph')).toBeVisible()
    expect(await screen.findByTestId('CrrmValuesExtra')).toBeVisible()
    expect(await screen.findByTestId('StatusTrail')).toBeVisible()
    expect(screen.queryByTestId('RecommendationSetting')).not.toBeInTheDocument()
  })
  it('should hide CloudRRMGraph when data retention period passed', async () => {
    const spy = jest.spyOn(require('../utils'), 'isDataRetained').mockImplementation(() => false)
    render(<CrrmDetails />, {
      route: { path: '/ai/recommendations/crrm/b17acc0d-7c49-4989-adad-054c7f1fc5b6' },
      wrapper: Provider
    })
    expect(await screen.findByTestId('Overview')).toBeVisible()
    expect(await screen.findByTestId('CrrmValues')).toBeVisible()
    expect(screen.queryByTestId('CloudRRMGraph')).not.toBeInTheDocument()
    expect(await screen.findByTestId('CrrmValuesExtra')).toBeVisible()
    expect(await screen.findByTestId('StatusTrail')).toBeVisible()
    expect(spy).toBeCalledWith(mockedRecommendationCRRM.dataEndTime)
  })
})
