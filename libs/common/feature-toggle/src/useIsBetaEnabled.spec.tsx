import { TierFeatures }     from './features'
import { useIsBetaEnabled } from './useIsBetaEnabled'


const user = require('@acx-ui/user')
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: jest.fn(() => ({ data: { dogfood: 'false' } }))
}))

const featuresList = [
  {
    id: TierFeatures.AP_70,
    enabled: true
  },
  {
    id: TierFeatures.BETA_DPSK3,
    enabled: false
  },
  {
    id: TierFeatures.CONFIG_TEMPLATE,
    enabled: true
  }
]
describe('Test useIsBetaEnabled function', () => {
  beforeEach(async () => {
    user.useGetBetaStatusQuery = jest.fn().mockImplementation(() => {
      return { data: { enabled: 'true' } }
    })
    user.useGetAccountTierQuery = jest.fn().mockImplementation(() => {
      return { data: {} }
    })
  })
  it('should function correctly for beta not enabled', async () => {
    user.useUserProfileContext = jest.fn(() =>
      ({ betaEnabled: false, betaFeaturesList: featuresList }))
    const enabled = useIsBetaEnabled(TierFeatures.AP_70)
    expect(enabled).toBeFalsy()
  })
  it('should function correctly for beta enabled', async () => {
    user.useUserProfileContext = jest.fn(() =>
      ({ betaEnabled: true, betaFeaturesList: featuresList }))
    const enabled = useIsBetaEnabled(TierFeatures.AP_70)
    expect(enabled).toBeTruthy()
  })
  it('should function correctly for feature not enabled', async () => {
    user.useUserProfileContext = jest.fn(() =>
      ({ betaEnabled: true, betaFeaturesList: featuresList }))
    const enabled = useIsBetaEnabled(TierFeatures.BETA_DPSK3)
    expect(enabled).toBeFalsy()
  })
  it('should function correctly for beta enabled not specified in user profile', async () => {
    user.useUserProfileContext = jest.fn(() =>
      ({ betaFeaturesList: featuresList }))
    const enabled = useIsBetaEnabled(TierFeatures.AP_70)
    expect(enabled).toBeFalsy()
  })
  it('should function correctly for feature list not specified in user profile', async () => {
    user.useUserProfileContext = jest.fn(() =>
      ({ betaEnabled: true }))
    const enabled = useIsBetaEnabled(TierFeatures.AP_70)
    expect(enabled).toBeFalsy()
  })
})