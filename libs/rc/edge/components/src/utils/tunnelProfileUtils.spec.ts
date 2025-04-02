import { TunnelTypeEnum } from '@acx-ui/rc/utils'

import { getTunnelTypeDisplayName } from './tunnelProfileUtils'

describe('tunnelProfileUtils', () => {
  describe('getTunnelTypeDisplayName', () => {
    it('should return the correct display name for the tunnel type', () => {
      expect(getTunnelTypeDisplayName(TunnelTypeEnum.L2GRE)).toBe('L2GRE')
      expect(getTunnelTypeDisplayName(TunnelTypeEnum.VXLAN_GPE)).toBe('VxLAN')
      expect(getTunnelTypeDisplayName()).toBeUndefined()
    })
  })
})