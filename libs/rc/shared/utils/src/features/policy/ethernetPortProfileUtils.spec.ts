import { ApLanPortTypeEnum, EthernetPortAuthType } from '../../models'

import { getEthernetPortAuthTypeOptions, getEthernetPortAuthTypeString, getEthernetPortTypeOptions, getEthernetPortTypeString } from './ethernetPortProfileUtils'




const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getTenantId: jest.fn().mockReturnValue(tenantId)
}))

describe('ethernetPortProfileUtils', () => {
  describe('getEthernetPortTypeOptions', ()=> {
    it('should return the map of PortTypeOptions', () => {
      expect(getEthernetPortTypeOptions()).toStrictEqual([
        {
          label: 'Access',
          value: ApLanPortTypeEnum.ACCESS
        },
        {
          label: 'General',
          value: ApLanPortTypeEnum.GENERAL
        },
        {
          label: 'Trunk',
          value: ApLanPortTypeEnum.TRUNK
        }
      ])
    })
  })

  describe('getEthernetPortTypeString', ()=> {
    it('should return the PortType string by inputType', () => {
      expect(getEthernetPortTypeString(ApLanPortTypeEnum.ACCESS)).toBe('Access')
      expect(getEthernetPortTypeString(ApLanPortTypeEnum.TRUNK)).toBe('Trunk')
      expect(getEthernetPortTypeString()).toBe('')
    })
  })

  describe('getEthernetPortAuthTypeOptions', ()=> {
    it('should return the map of AuthTypeOptions', () => {
      expect(getEthernetPortAuthTypeOptions()).toStrictEqual([
        {
          label: 'Supplicant',
          value: 'SUPPLICANT'
        },
        {
          label: 'Port-based Authenticator',
          value: EthernetPortAuthType.PORT_BASED
        },
        {
          label: 'MAC-based Authenticator',
          value: EthernetPortAuthType.MAC_BASED
        }
      ])
    })
  })

  describe('getEthernetPortAuthTypeString', ()=> {
    it('should return the PortAuthType string by inputType', () => {
      // eslint-disable-next-line max-len
      expect(getEthernetPortAuthTypeString(EthernetPortAuthType.MAC_BASED)).toBe('MAC-based Authenticator')
      // eslint-disable-next-line max-len
      expect(getEthernetPortAuthTypeString(EthernetPortAuthType.PORT_BASED)).toBe('Port-based Authenticator')
      expect(getEthernetPortAuthTypeString(EthernetPortAuthType.SUPPLICANT)).toBe('Supplicant')
      expect(getEthernetPortAuthTypeString(EthernetPortAuthType.DISABLED)).toBe('')
      expect(getEthernetPortAuthTypeString()).toBe('')
    })
  })


})