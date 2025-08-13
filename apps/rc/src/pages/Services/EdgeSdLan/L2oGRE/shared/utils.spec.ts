/* eslint-disable max-len */
import { EdgeSdLanFixtures, EdgeTunnelProfileFixtures, Network, NetworkTypeEnum, TunnelProfileViewData } from '@acx-ui/rc/utils'

import { getFilteredTunnelProfileOptions, transformToApiData, transformToFormData } from './utils'

const { mockedL2oGreSdLanDataList } = EdgeSdLanFixtures
const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures

describe('SD-LAN form utils', () => {
  it('test transformToApiData', () => {
    const data = mockedL2oGreSdLanDataList[0]
    const formData = transformToFormData(data)
    const apiData = transformToApiData(formData)
    expect(apiData).toStrictEqual({
      id: formData.id,
      name: formData.name,
      tunnelProfileId: formData.tunnelProfileId,
      activeNetwork: [
        {
          venueId: Object.keys(formData.activatedNetworks)[0],
          networkId: formData.activatedNetworks[Object.keys(formData.activatedNetworks)[0]][0].networkId,
          tunnelProfileId: formData.activatedNetworks[Object.keys(formData.activatedNetworks)[0]][0].tunnelProfileId
        },
        {
          venueId: Object.keys(formData.activatedNetworks)[0],
          networkId: formData.activatedNetworks[Object.keys(formData.activatedNetworks)[0]][1].networkId,
          tunnelProfileId: formData.activatedNetworks[Object.keys(formData.activatedNetworks)[0]][1].tunnelProfileId
        }
      ],
      activeNetworkTemplate: []
    })
  })

  it('test transformToFormData', () => {
    const data = mockedL2oGreSdLanDataList[0]
    const result = transformToFormData(data)
    expect(result).toStrictEqual({
      id: data.id,
      name: data.name,
      tunnelProfileId: data.tunnelProfileId,
      activatedNetworks: {
        [data.tunneledWlans?.[0].venueId]: [
          {
            networkId: data.tunneledWlans?.[0].networkId,
            networkName: data.tunneledWlans?.[0].networkName,
            tunnelProfileId: data.tunneledWlans?.[0].forwardingTunnelProfileId
          },
          {
            networkId: data.tunneledWlans?.[1].networkId,
            networkName: data.tunneledWlans?.[1].networkName,
            tunnelProfileId: data.tunneledWlans?.[1].forwardingTunnelProfileId
          }
        ]
      },
      activatedNetworkTemplates: {}
    })
  })

  describe('test getFilteredTunnelProfileOptions', () => {
    const defaultOptions = [
      {
        label: 'Core Port',
        value: ''
      }
    ]

    const availableTunnelProfiles = mockedTunnelProfileViewData.data as TunnelProfileViewData[]

    it('tunnel profile with segment type VXLAN should be filtered out', () => {
      const options = [
        ...defaultOptions,
        {
          label: availableTunnelProfiles[0].name,
          value: availableTunnelProfiles[0].id
        }
      ]
      const row = {} as Network
      const result = getFilteredTunnelProfileOptions(row, options, availableTunnelProfiles)
      expect(result).toStrictEqual(defaultOptions)
    })

    it('VXLAN-GPE options should be filtered out for non-CAPTIVEPORTAL networks', () => {
      const options = [
        ...defaultOptions,
        {
          label: availableTunnelProfiles[0].name,
          value: availableTunnelProfiles[0].id
        }
      ]
      const row = { nwSubType: NetworkTypeEnum.OPEN } as Network
      const result = getFilteredTunnelProfileOptions(row, options, availableTunnelProfiles)
      expect(result).toStrictEqual(defaultOptions)
    })

    it('tunnel profile with MTU type AUTO should be filtered out', () => {
      const options = [
        ...defaultOptions,
        {
          label: availableTunnelProfiles[3].name,
          value: availableTunnelProfiles[3].id
        }
      ]
      const row = { nwSubType: NetworkTypeEnum.CAPTIVEPORTAL } as Network
      const result = getFilteredTunnelProfileOptions(row, options, availableTunnelProfiles)
      expect(result).toStrictEqual(defaultOptions)
    })

    it('tunnel profile with NAT traversal enabled should be filtered out', () => {
      const options = [
        ...defaultOptions,
        {
          label: availableTunnelProfiles[4].name,
          value: availableTunnelProfiles[4].id
        }
      ]
      const row = { nwSubType: NetworkTypeEnum.CAPTIVEPORTAL } as Network
      const result = getFilteredTunnelProfileOptions(row, options, availableTunnelProfiles)
      expect(result).toStrictEqual(defaultOptions)
    })

    it('VXLAN-GPE options should be disabled when vlan pooling is enabled', () => {
      const options = [
        ...defaultOptions,
        {
          label: availableTunnelProfiles[1].name,
          value: availableTunnelProfiles[1].id
        }
      ]
      const row = { nwSubType: NetworkTypeEnum.CAPTIVEPORTAL, vlanPool: true } as Network
      const result = getFilteredTunnelProfileOptions(row, options, availableTunnelProfiles)
      expect(result).toStrictEqual([
        ...defaultOptions,
        {
          label: availableTunnelProfiles[1].name,
          value: availableTunnelProfiles[1].id,
          disabled: true,
          title: 'Cannot tunnel vlan pooling network to DMZ cluster.'
        }
      ])
    })
  })
})