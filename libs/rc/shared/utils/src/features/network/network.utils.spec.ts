import { isOweTransitionNetwork, isDsaeOnboardingNetwork } from './network.utils'


describe('network.utils', () => {
  describe('isOweTransitionNetwork', () => {
    it('should correctly recognize OWE transition network', async () => {
      expect(isOweTransitionNetwork({
        isOweMaster: false,
        owePairNetworkId: 'network_id'
      })).toBe(true)
    })

    it('should return false when it is OWE network', async () => {
      expect(isOweTransitionNetwork({
        isOweMaster: true,
        owePairNetworkId: 'network_id'
      })).toBe(false)
    })

    it('should return false when related fields are undefined', async () => {
      expect(isOweTransitionNetwork({})).toBe(false)
      expect(isOweTransitionNetwork({
        isOweMaster: true
      })).toBe(false)
      expect(isOweTransitionNetwork({
        owePairNetworkId: 'network_id'
      })).toBe(false)
    })
  })

  describe('isDsaeOnboardingNetwork', () => {
    it('should correctly recognize DSAE onboarding network', async () => {
      expect(isDsaeOnboardingNetwork({
        isDsaeServiceNetwork: false,
        dsaeNetworkPairId: 'network_id'
      })).toBe(true)
    })

    it('should return false when it is DSAE network', async () => {
      expect(isDsaeOnboardingNetwork({
        isDsaeServiceNetwork: true,
        dsaeNetworkPairId: 'network_id'
      })).toBe(false)
    })

    it('should return false when related fields are undefined', async () => {
      expect(isDsaeOnboardingNetwork({})).toBe(false)
      expect(isDsaeOnboardingNetwork({
        isDsaeServiceNetwork: false
      })).toBe(false)
      expect(isDsaeOnboardingNetwork({
        dsaeNetworkPairId: 'network_id'
      })).toBe(false)
    })
  })
})
