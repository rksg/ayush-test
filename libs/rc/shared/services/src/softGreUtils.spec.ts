import { SoftGreViewData, MtuTypeEnum } from '@acx-ui/rc/utils'

import consolidateActivations from './softGreUtils'

describe('consolidateActivations', () => {
  it('should return the same activations if no venue or AP activation exists', () => {
    const profile1: SoftGreViewData = {
      id: 'profile1',
      name: 'Profile 1',
      primaryGatewayAddress: '192.168.1.1',
      mtuType: MtuTypeEnum.AUTO,
      keepAliveInterval: 30,
      keepAliveRetryTimes: 3,
      disassociateClientEnabled: true,
      activations: [{ venueId: 'venue1', wifiNetworkIds: ['network1'] }],
      venueActivations: [{ venueId: 'venue1', apModel: 'R550', portId: 1, apSerialNumbers: [] }],
      apActivations: []
    }
    const venueId = 'venue2'
    const result = consolidateActivations(profile1, venueId)
    expect(result).toEqual([{
      venueId: 'venue1',
      wifiNetworkIds: ['network1']
    }])
  })

  it('should add new activation if venue activation exists but existing activation not found',
    () => {
      const profile: SoftGreViewData = {
        id: 'profile1',
        name: 'Profile 1',
        primaryGatewayAddress: '192.168.1.1',
        mtuType: MtuTypeEnum.AUTO,
        keepAliveInterval: 30,
        keepAliveRetryTimes: 3,
        disassociateClientEnabled: true,
        activations: [{ venueId: 'venue2', wifiNetworkIds: ['network2'] }],
        venueActivations: [{ venueId: 'venue1', apModel: 'R550', portId: 1, apSerialNumbers: [] }],
        apActivations: [{ venueId: 'venue2', apSerialNumber: 'ap1', portId: 1 }]
      }

      const venueId = 'venue1'
      const result = consolidateActivations(profile, venueId)
      expect(result).toEqual([
        { venueId: 'venue2', wifiNetworkIds: ['network2'] },
        { venueId: 'venue1', wifiNetworkIds: ['usedByVenueApActivation'] }
      ])
    })

  it('should add new activation if AP activation exists but existing activation not found',
    () => {
      const profile: SoftGreViewData = {
        id: 'profile1',
        name: 'Profile 1',
        primaryGatewayAddress: '192.168.1.1',
        mtuType: MtuTypeEnum.AUTO,
        keepAliveInterval: 30,
        keepAliveRetryTimes: 3,
        disassociateClientEnabled: true,
        activations: [{ venueId: 'venue2', wifiNetworkIds: ['network2'] }],
        venueActivations: [],
        apActivations: [{ venueId: 'venue1', apSerialNumber: 'ap1', portId: 1 }]
      }
      const venueId = 'venue1'
      const result = consolidateActivations(profile, venueId)
      expect(result).toEqual([
        { venueId: 'venue2', wifiNetworkIds: ['network2'] },
        { venueId: 'venue1', wifiNetworkIds: ['usedByVenueApActivation'] }
      ])
    })

  it('should add specific networkId if venue activation exists and existing activation found',
    () => {
      const profile: SoftGreViewData = {
        id: 'profile1',
        name: 'Profile 1',
        primaryGatewayAddress: '192.168.1.1',
        mtuType: MtuTypeEnum.AUTO,
        keepAliveInterval: 30,
        keepAliveRetryTimes: 3,
        disassociateClientEnabled: true,
        activations: [{ venueId: 'venue2', wifiNetworkIds: ['network2'] }],
        venueActivations: [{ venueId: 'venue2', apModel: 'R550', portId: 1, apSerialNumbers: [] }],
        apActivations: [{ venueId: 'venue1', apSerialNumber: 'ap1', portId: 1 }]
      }

      const venueId = 'venue2'
      const result = consolidateActivations(profile, venueId)
      expect(result).toEqual([
        { venueId: 'venue2', wifiNetworkIds: ['network2','usedByVenueApActivation'] }
      ])

    })

  it('should add specific networkId if ap activation exists and existing activation found',
    () => {
      const profile: SoftGreViewData = {
        id: 'profile1',
        name: 'Profile 1',
        primaryGatewayAddress: '192.168.1.1',
        mtuType: MtuTypeEnum.AUTO,
        keepAliveInterval: 30,
        keepAliveRetryTimes: 3,
        disassociateClientEnabled: true,
        activations: [{ venueId: 'venue2', wifiNetworkIds: ['network2'] }],
        venueActivations: [{ venueId: 'venue1', apModel: 'R550', portId: 1, apSerialNumbers: [] }],
        apActivations: [{ venueId: 'venue2', apSerialNumber: 'ap1', portId: 1 }]
      }

      const venueId = 'venue2'
      const result = consolidateActivations(profile, venueId)
      expect(result).toEqual([
        { venueId: 'venue2', wifiNetworkIds: ['network2','usedByVenueApActivation'] }
      ])

    })
})