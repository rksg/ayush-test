/* eslint-disable max-len */
import { IpsecViewData } from '@acx-ui/rc/utils'

import { getIpSecIkeAlgorithmOptions, getIpSecEspAlgorithmOptions, getVxlanIkeProposalText, getVxlanEspProposalText } from './ipsecUtils'

describe('ipSecUtils', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  describe('getIpSecIkeAlgorithmOptions', () => {
    it('should return the correct IKE algorithm options with translated labels', () => {
      const result = getIpSecIkeAlgorithmOptions()

      expect(result).toEqual([
        {
          value: 'AES128-SHA1-MODP2048',
          label: 'AE128-SHA1-MODP2048'
        },
        {
          value: 'AES256-SHA384-ECP384',
          label: 'AES256-SHA384-ECP384'
        }
      ])
    })
  })

  describe('getIpSecEspAlgorithmOptions', () => {
    it('should return the correct ESP algorithm options with translated labels', () => {
      const result = getIpSecEspAlgorithmOptions()

      expect(result).toEqual([
        {
          value: 'AES128-SHA1-MODP2048',
          label: 'AE128-SHA1-MODP2048'
        },
        {
          value: 'AES256-SHA384-ECP384',
          label: 'AES256-SHA384-ECP384'
        }
      ])

    })
  })

  describe('getVxlanIkeProposalText', () => {
    it('returns default proposal text for default proposal type', () => {
      const profile = { ikeProposalType: 'DEFAULT' } as IpsecViewData
      expect(getVxlanIkeProposalText(profile)).toBe('AES128-SHA1-MODP2048')
    })

    it('returns formatted proposal text for specific proposal type with valid first proposal', () => {
      const profile = {
        ikeProposalType: 'SPECIFIC',
        ikeProposals: [
          {
            encAlg: 'AES256',
            authAlg: 'SHA256',
            dhGroup: 'MODP4096'
          }
        ]
      } as IpsecViewData
      expect(getVxlanIkeProposalText(profile)).toBe('AES256-SHA256-MODP4096')
    })

    it('returns default proposal text for specific proposal type with no proposals', () => {
      const profile = { ikeProposalType: 'SPECIFIC', ikeProposals: [] } as unknown as IpsecViewData
      expect(getVxlanIkeProposalText(profile)).toBe('AES128-SHA1-MODP2048')
    })

    it('returns default proposal text for specific proposal type with null proposals', () => {
      const profile = { ikeProposalType: 'SPECIFIC', ikeProposals: null } as unknown as IpsecViewData
      expect(getVxlanIkeProposalText(profile)).toBe('AES128-SHA1-MODP2048')
    })

    it('returns default proposal text for specific proposal type with undefined proposals', () => {
      const profile = { ikeProposalType: 'SPECIFIC' } as IpsecViewData
      expect(getVxlanIkeProposalText(profile)).toBe('AES128-SHA1-MODP2048')
    })
  })

  describe('getVxlanEspProposalText', () => {
    it('returns default proposal text for default proposal type', () => {
      const profile = { espProposalType: 'DEFAULT' } as IpsecViewData
      expect(getVxlanEspProposalText(profile)).toBe('AES128-SHA1-MODP2048')
    })

    it('returns formatted proposal text for specific proposal type with valid first proposal', () => {
      const profile = {
        espProposalType: 'SPECIFIC',
        espProposals: [
          {
            encAlg: 'AES256',
            authAlg: 'SHA256',
            dhGroup: 'MODP4096'
          }
        ]
      } as IpsecViewData
      expect(getVxlanEspProposalText(profile)).toBe('AES256-SHA256-MODP4096')
    })

    it('returns default proposal text for specific proposal type with no proposals', () => {
      const profile = { espProposalType: 'SPECIFIC', espProposals: [] } as unknown as IpsecViewData
      expect(getVxlanEspProposalText(profile)).toBe('AES128-SHA1-MODP2048')
    })

    it('returns default proposal text for specific proposal type with null proposals', () => {
      const profile = { espProposalType: 'SPECIFIC', espProposals: null } as unknown as IpsecViewData
      expect(getVxlanEspProposalText(profile)).toBe('AES128-SHA1-MODP2048')
    })

    it('returns default proposal text for specific proposal type with undefined proposals', () => {
      const profile = { espProposalType: 'SPECIFIC' } as IpsecViewData
      expect(getVxlanEspProposalText(profile)).toBe('AES128-SHA1-MODP2048')
    })
  })
})