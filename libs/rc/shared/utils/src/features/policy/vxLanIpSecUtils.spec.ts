import { IpSecProposalTypeEnum, IpSecPseudoRandomFunctionEnum } from '../../models'
import { Ipsec }                                                from '../../types'

import {
  toIpSecIkeProposalData,
  toIpSecEspProposalData,
  toIpSecEspAlgorithmOptionValue,
  toIpSecIkeAlgorithmOptionValue
} from './vxLanIpSecUtils'

describe('vxLanIpSecUtils', () => {
  describe('toIpSecIkeProposalData', () => {
    it('should return undefined when input has less than 3 parts', () => {
      expect(toIpSecIkeProposalData('AES128-SHA1')).toBeUndefined()
      expect(toIpSecIkeProposalData('AES128')).toBeUndefined()
      expect(toIpSecIkeProposalData('')).toBeUndefined()
    })

    it('should return undefined when input has more than 3 parts', () => {
      expect(toIpSecIkeProposalData('AES128-SHA1-MODP2048-EXTRA')).toBeUndefined()
    })

    it('should return correct IKE proposal data for valid input', () => {
      const result = toIpSecIkeProposalData('AES128-SHA1-MODP2048')

      expect(result).toEqual({
        ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
        ikeProposals: [{
          encAlg: 'AES128',
          authAlg: 'SHA1',
          prfAlg: IpSecPseudoRandomFunctionEnum.USE_INTEGRITY_ALG,
          dhGroup: 'MODP2048'
        }]
      })
    })

    it('should handle different algorithm combinations', () => {
      const result = toIpSecIkeProposalData('AES256-SHA384-ECP384')

      expect(result).toEqual({
        ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
        ikeProposals: [{
          encAlg: 'AES256',
          authAlg: 'SHA384',
          prfAlg: IpSecPseudoRandomFunctionEnum.USE_INTEGRITY_ALG,
          dhGroup: 'ECP384'
        }]
      })
    })
  })

  describe('toIpSecEspProposalData', () => {
    it('should return undefined when input has less than 3 parts', () => {
      expect(toIpSecEspProposalData('AES128-SHA1')).toBeUndefined()
      expect(toIpSecEspProposalData('AES128')).toBeUndefined()
      expect(toIpSecEspProposalData('')).toBeUndefined()
    })

    it('should return undefined when input has more than 3 parts', () => {
      expect(toIpSecEspProposalData('AES128-SHA1-MODP2048-EXTRA')).toBeUndefined()
    })

    it('should return correct ESP proposal data for valid input', () => {
      const result = toIpSecEspProposalData('AES128-SHA1-MODP2048')

      expect(result).toEqual({
        espProposalType: IpSecProposalTypeEnum.SPECIFIC,
        espProposals: [{
          encAlg: 'AES128',
          authAlg: 'SHA1',
          dhGroup: 'MODP2048'
        }]
      })
    })

    it('should handle different algorithm combinations', () => {
      const result = toIpSecEspProposalData('AES256-SHA384-ECP384')

      expect(result).toEqual({
        espProposalType: IpSecProposalTypeEnum.SPECIFIC,
        espProposals: [{
          encAlg: 'AES256',
          authAlg: 'SHA384',
          dhGroup: 'ECP384'
        }]
      })
    })
  })

  describe('toIpSecEspAlgorithmOptionValue', () => {
    it('should return undefined when espSecurityAssociation is undefined', () => {
      const data: Ipsec = {} as Ipsec
      expect(toIpSecEspAlgorithmOptionValue(data)).toBeUndefined()
    })

    it('should return undefined when espProposals is undefined', () => {
      const data: Ipsec = {
        espSecurityAssociation: {}
      } as Ipsec
      expect(toIpSecEspAlgorithmOptionValue(data)).toBeUndefined()
    })

    it('should return undefined when espProposals is empty', () => {
      const data = {
        espSecurityAssociation: {
          espProposals: []
        }
      } as unknown as Ipsec
      expect(toIpSecEspAlgorithmOptionValue(data)).toBeUndefined()
    })

    it('should return undefined when espProposalType is not SPECIFIC', () => {
      const data = {
        espSecurityAssociation: {
          espProposalType: IpSecProposalTypeEnum.DEFAULT,
          espProposals: [{
            encAlg: 'AES128',
            authAlg: 'SHA1',
            dhGroup: 'MODP2048'
          }]
        }
      } as unknown as Ipsec
      expect(toIpSecEspAlgorithmOptionValue(data)).toBeUndefined()
    })

    it('should return undefined when espProposals length is not 1', () => {
      const data: Ipsec = {
        espSecurityAssociation: {
          espProposalType: IpSecProposalTypeEnum.SPECIFIC,
          espProposals: [
            {
              encAlg: 'AES128',
              authAlg: 'SHA1',
              dhGroup: 'MODP2048'
            },
            {
              encAlg: 'AES256',
              authAlg: 'SHA384',
              dhGroup: 'ECP384'
            }
          ]
        }
      } as Ipsec
      expect(toIpSecEspAlgorithmOptionValue(data)).toBeUndefined()
    })

    it('should return undefined when proposal is not in allowed list', () => {
      const data: Ipsec = {
        espSecurityAssociation: {
          espProposalType: IpSecProposalTypeEnum.SPECIFIC,
          espProposals: [{
            encAlg: 'AES192',
            authAlg: 'SHA256',
            dhGroup: 'MODP1024'
          }]
        }
      } as Ipsec
      expect(toIpSecEspAlgorithmOptionValue(data)).toBeUndefined()
    })

    it('should return proposal string for AES128-SHA1-MODP2048', () => {
      const data: Ipsec = {
        espSecurityAssociation: {
          espProposalType: IpSecProposalTypeEnum.SPECIFIC,
          espProposals: [{
            encAlg: 'AES128',
            authAlg: 'SHA1',
            dhGroup: 'MODP2048'
          }]
        }
      } as Ipsec
      expect(toIpSecEspAlgorithmOptionValue(data)).toBe('AES128-SHA1-MODP2048')
    })

    it('should return proposal string for AES256-SHA384-ECP384', () => {
      const data: Ipsec = {
        espSecurityAssociation: {
          espProposalType: IpSecProposalTypeEnum.SPECIFIC,
          espProposals: [{
            encAlg: 'AES256',
            authAlg: 'SHA384',
            dhGroup: 'ECP384'
          }]
        }
      } as Ipsec
      expect(toIpSecEspAlgorithmOptionValue(data)).toBe('AES256-SHA384-ECP384')
    })
  })

  describe('toIpSecIkeAlgorithmOptionValue', () => {
    it('should return undefined when ikeSecurityAssociation is undefined', () => {
      const data: Ipsec = {} as Ipsec
      expect(toIpSecIkeAlgorithmOptionValue(data)).toBeUndefined()
    })

    it('should return undefined when ikeProposals is undefined', () => {
      const data: Ipsec = {
        ikeSecurityAssociation: {}
      } as Ipsec
      expect(toIpSecIkeAlgorithmOptionValue(data)).toBeUndefined()
    })

    it('should return undefined when ikeProposals is empty', () => {
      const data = {
        ikeSecurityAssociation: {
          ikeProposals: []
        }
      } as unknown as Ipsec
      expect(toIpSecIkeAlgorithmOptionValue(data)).toBeUndefined()
    })

    it('should return undefined when ikeProposalType is not SPECIFIC', () => {
      const data = {
        ikeSecurityAssociation: {
          ikeProposalType: IpSecProposalTypeEnum.DEFAULT,
          ikeProposals: [{
            encAlg: 'AES128',
            authAlg: 'SHA1',
            dhGroup: 'MODP2048'
          }]
        }
      } as unknown as Ipsec
      expect(toIpSecIkeAlgorithmOptionValue(data)).toBeUndefined()
    })

    it('should return undefined when ikeProposals length is not 1', () => {
      const data: Ipsec = {
        ikeSecurityAssociation: {
          ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
          ikeProposals: [
            {
              encAlg: 'AES128',
              authAlg: 'SHA1',
              dhGroup: 'MODP2048'
            },
            {
              encAlg: 'AES256',
              authAlg: 'SHA384',
              dhGroup: 'ECP384'
            }
          ]
        }
      } as Ipsec
      expect(toIpSecIkeAlgorithmOptionValue(data)).toBeUndefined()
    })

    it('should return undefined when proposal is not in allowed list', () => {
      const data: Ipsec = {
        ikeSecurityAssociation: {
          ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
          ikeProposals: [{
            encAlg: 'AES192',
            authAlg: 'SHA256',
            dhGroup: 'MODP1024'
          }]
        }
      } as Ipsec
      expect(toIpSecIkeAlgorithmOptionValue(data)).toBeUndefined()
    })

    it('should return proposal string for AES128-SHA1-MODP2048', () => {
      const data: Ipsec = {
        ikeSecurityAssociation: {
          ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
          ikeProposals: [{
            encAlg: 'AES128',
            authAlg: 'SHA1',
            dhGroup: 'MODP2048'
          }]
        }
      } as Ipsec
      expect(toIpSecIkeAlgorithmOptionValue(data)).toBe('AES128-SHA1-MODP2048')
    })

    it('should return proposal string for AES256-SHA384-ECP384', () => {
      const data: Ipsec = {
        ikeSecurityAssociation: {
          ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
          ikeProposals: [{
            encAlg: 'AES256',
            authAlg: 'SHA384',
            dhGroup: 'ECP384'
          }]
        }
      } as Ipsec
      expect(toIpSecIkeAlgorithmOptionValue(data)).toBe('AES256-SHA384-ECP384')
    })

    it('should handle null ikeProposals length', () => {
      const data = {
        ikeSecurityAssociation: {
          ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
          ikeProposals: null as unknown as undefined
        }
      } as unknown as Ipsec
      expect(toIpSecIkeAlgorithmOptionValue(data)).toBeUndefined()
    })
  })
})