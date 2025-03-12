import { EdgePinFixtures, PersonalIdentityNetworkFormData } from '@acx-ui/rc/utils'

import { getSubmitPayload } from '.'

const { mockPinSwitchInfoData } = EdgePinFixtures


describe('getSubmitPayload', () => {
  const mockFullFormData = {
    id: '1',
    name: 'Test PIN',
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
    expect(getSubmitPayload(mockFullFormData)).toEqual(expectedPayload)
  })
})