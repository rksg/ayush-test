import { cloneDeep } from 'lodash'

import { EdgePinFixtures, PersonalIdentityNetworkFormData } from '@acx-ui/rc/utils'

import { NetworkTopologyType } from './NetworkTopologyForm'

import { getStepsByTopologyType, getSubmitPayload } from '.'

const { mockPinSwitchInfoData } = EdgePinFixtures

describe('getStepsByTopologyType', () => {

  it('Test getStepsByTopologyType', () => {
    const wirelessSteps = getStepsByTopologyType(NetworkTopologyType.Wireless)
    expect(wirelessSteps.length).toBe(6)
    expect(wirelessSteps[0].title.defaultMessage[0].value).toBe('Prerequisite')
    expect(wirelessSteps[1].title.defaultMessage[0].value).toBe('General Settings')
    expect(wirelessSteps[2].title.defaultMessage[0].value).toBe('Network Topology')
    expect(wirelessSteps[3].title.defaultMessage[0].value).toBe('RUCKUS Edge')
    expect(wirelessSteps[4].title.defaultMessage[0].value).toBe('Wireless Network')
    expect(wirelessSteps[5].title.defaultMessage[0].value).toBe('Summary')
    const twoTierSteps = getStepsByTopologyType(NetworkTopologyType.TwoTier)
    expect(twoTierSteps.length).toBe(7)
    expect(twoTierSteps[0].title.defaultMessage[0].value).toBe('Prerequisite')
    expect(twoTierSteps[1].title.defaultMessage[0].value).toBe('General Settings')
    expect(twoTierSteps[2].title.defaultMessage[0].value).toBe('Network Topology')
    expect(twoTierSteps[3].title.defaultMessage[0].value).toBe('RUCKUS Edge')
    expect(twoTierSteps[4].title.defaultMessage[0].value).toBe('Dist. Switch')
    expect(twoTierSteps[5].title.defaultMessage[0].value).toBe('Access Switch')
    expect(twoTierSteps[6].title.defaultMessage[0].value).toBe('Summary')
    const threeTierSteps = getStepsByTopologyType(NetworkTopologyType.ThreeTier)
    expect(threeTierSteps.length).toBe(8)
    expect(threeTierSteps[0].title.defaultMessage[0].value).toBe('Prerequisite')
    expect(threeTierSteps[1].title.defaultMessage[0].value).toBe('General Settings')
    expect(threeTierSteps[2].title.defaultMessage[0].value).toBe('Network Topology')
    expect(threeTierSteps[3].title.defaultMessage[0].value).toBe('RUCKUS Edge')
    expect(threeTierSteps[4].title.defaultMessage[0].value).toBe('Dist. Switch')
    expect(threeTierSteps[5].title.defaultMessage[0].value).toBe('Access Switch')
    expect(threeTierSteps[6].title.defaultMessage[0].value).toBe('Wireless Network')
    expect(threeTierSteps[7].title.defaultMessage[0].value).toBe('Summary')
  })
})

describe('getSubmitPayload', () => {
  const mockFullFormData = {
    id: '1',
    name: 'Test PIN',
    networkTopologyType: NetworkTopologyType.Wireless,
    vxlanTunnelProfileId: '123',
    edgeClusterId: '456',
    segments: 6,
    dhcpId: '789',
    poolId: '012',
    distributionSwitchInfos: mockPinSwitchInfoData.distributionSwitches,
    accessSwitchInfos: mockPinSwitchInfoData.accessSwitches,
    networkIds: ['mockNetworkId1', 'mockNetworkId2', 'mockNetworkId3']
  } as PersonalIdentityNetworkFormData

  const expectedPayload = {
    id: '1',
    name: 'Test PIN',
    vxlanTunnelProfileId: '123',
    edgeClusterInfo: {
      edgeClusterId: '456',
      segments: 6,
      dhcpInfoId: '789',
      dhcpPoolId: '012'
    },
    networkIds: mockFullFormData.networkIds,
    distributionSwitchInfos: [{
      id: 'c8:03:f5:3a:95:c6',
      siteIp: '10.206.78.150',
      vlans: '23',
      siteKeepAlive: '5',
      siteRetry: '3',
      loopbackInterfaceId: '12',
      loopbackInterfaceIp: '1.2.3.4',
      loopbackInterfaceSubnetMask: '255.255.255.0',
      forwardingProfile: '2',
      siteConnection: 'Disconnected',
      siteActive: '10.206.78.150',
      dispatchMessage: '[SUCCESS]',
      model: 'ICX7550-48P',
      familyId: 'ICX7550',
      firmwareVersion: 'GZR09010f_b40.bin'
    }],
    accessSwitchInfos: [{
      id: 'c0:c5:20:aa:35:fd',
      vlanId: 111,
      webAuthPageType: 'TEMPLATE',
      templateId: '723250a97f3a4c3780e70c83c5b095ba',
      webAuthPasswordLabel: 'password-Ken-0209',
      webAuthCustomTitle: 'title-Ken-0209',
      webAuthCustomTop: 'top-Ken-0209',
      webAuthCustomLoginButton: 'login-Ken-0209',
      webAuthCustomBottom: 'bottom-Ken-0209',
      uplinkInfo: {
        uplinkType: 'PORT',
        uplinkId: '1/1/1'
      },
      distributionSwitchId: 'c8:03:f5:3a:95:c6',
      dispatchMessage: '[SUCCESS]'
    }]
  }

  it('should return the correct payload for Wireless topology type', () => {
    const expectedWirelessPayload = cloneDeep(expectedPayload)
    expectedWirelessPayload.distributionSwitchInfos = []
    expectedWirelessPayload.accessSwitchInfos = []

    expect(getSubmitPayload(mockFullFormData)).toEqual(expectedWirelessPayload)
  })

  it('should return the correct payload for TwoTier topology type', () => {
    const formData2Tier = cloneDeep(mockFullFormData)
    formData2Tier.networkTopologyType = NetworkTopologyType.TwoTier
    const expected2TierPayload = cloneDeep(expectedPayload)
    expected2TierPayload.networkIds = []

    expect(getSubmitPayload(formData2Tier)).toEqual(expected2TierPayload)
  })

  it('should return the correct payload for ThreeTier topology type', () => {
    const formData3Tier = cloneDeep(mockFullFormData)
    formData3Tier.networkTopologyType = NetworkTopologyType.ThreeTier
    expect(getSubmitPayload(formData3Tier)).toEqual(expectedPayload)
  })
})