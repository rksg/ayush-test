import { EdgeDhcpSettingFormData } from '../../types/services/edgeDhcpService'

import { convertEdgeDHCPFormDataToApiPayload } from './edgeDHCPUtils'

const mockedRelayOffFormData = {
  id: '1',
  serviceName: 'test',
  dhcpRelay: false,
  externalDhcpServerFqdnIp: '1.1.1.1',
  domainName: 'test.com.cc',
  primaryDnsIp: '1.1.1.1',
  secondaryDnsIp: '2.2.2.2',
  edgeIds: [],
  leaseTime: 30,
  leaseTimeType: 'Limited',
  leaseTimeUnit: 'HOURS',
  enableSecondaryDNSServer: false,
  dhcpPools: [{
    id: '0fb1c9de-2ef3-4480-80b0-b7e6135df268',
    poolName: 'PoolTest1',
    subnetMask: '255.255.255.0',
    poolStartIp: '1.1.1.1',
    poolEndIp: '1.1.1.10',
    gatewayIp: '1.1.1.127',
    activated: true
  }, {
    id: '_NEW_mock_data',
    poolName: 'Pool2',
    subnetMask: '255.255.255.0',
    poolStartIp: '2.2.2.0',
    poolEndIp: '2.2.2.5',
    gatewayIp: '2.2.3.4'
  }],
  dhcpOptions: [{
    id: 'dd86bc3a-40ca-406e-9f1e-ff55ddd94e80',
    optionId: '15',
    optionName: 'Domain name',
    optionValue: 'mocked_domain'
  }, {
    id: '_NEW_mock_data',
    optionId: '66',
    optionName: 'Server-Name',
    optionValue: 'mocked_server'
  }],
  hosts: [{
    id: '1',
    hostName: 'HostTest1',
    mac: '00:0c:29:26:dd:fc',
    fixedAddress: '1.1.1.1'
  }, {
    id: '_NEW_mock_data',
    hostName: 'HostTest2',
    mac: '00:0c:39:26:dd:bc',
    fixedAddress: '1.1.2.2'
  }]
} as EdgeDhcpSettingFormData

const mockedRelayOnFormData = {
  id: '2',
  serviceName: 'testRelayOn',
  dhcpRelay: true,
  externalDhcpServerFqdnIp: '1.1.1.1',
  domainName: '',
  primaryDnsIp: '1.1.1.1',
  secondaryDnsIp: '',
  edgeIds: [],
  leaseTime: 20,
  leaseTimeType: 'Infinite',
  leaseTimeUnit: 'HOURS',
  enableSecondaryDNSServer: false,
  dhcpPools: [{
    id: '1',
    poolName: 'PoolTest1',
    subnetMask: '255.255.255.0',
    poolStartIp: '1.1.1.1',
    poolEndIp: '1.1.1.10',
    gatewayIp: '1.1.1.127',
    activated: true
  }, {
    id: '_NEW_mock_data',
    poolName: 'Pool2',
    subnetMask: '255.255.255.0',
    poolStartIp: '2.2.2.0',
    poolEndIp: '2.2.2.5',
    gatewayIp: '2.2.3.4'
  }],
  dhcpOptions: [],
  hosts: [{
    id: '1',
    hostName: 'HostTest1',
    mac: '00:0c:29:26:dd:fc',
    fixedAddress: '1.1.1.1'
  }]
} as EdgeDhcpSettingFormData

describe('Edge DHCP utils - convertEdgeDHCPFormDataToApiPayload', () => {

  it('should remove UI used fields', () => {
    const mockedData = { ...mockedRelayOnFormData }
    delete mockedData.leaseTimeType
    delete mockedData.enableSecondaryDNSServer
    const result = convertEdgeDHCPFormDataToApiPayload(mockedRelayOnFormData)
    expect(result.enableSecondaryDNSServer).toBe(undefined)
    expect(result.leaseTimeType).toBe(undefined)
    expect(result).toEqual({
      id: '2',
      serviceName: 'testRelayOn',
      dhcpRelay: true,
      externalDhcpServerFqdnIp: '1.1.1.1',
      domainName: '',
      primaryDnsIp: '1.1.1.1',
      secondaryDnsIp: '',
      edgeIds: [],
      leaseTime: -1,
      leaseTimeUnit: 'HOURS',
      dhcpPools: [{
        id: '1',
        poolName: 'PoolTest1',
        subnetMask: '255.255.255.0',
        poolStartIp: '1.1.1.1',
        poolEndIp: '1.1.1.10',
        gatewayIp: '1.1.1.127',
        activated: true
      }, {
        id: '',
        poolName: 'Pool2',
        subnetMask: '255.255.255.0',
        poolStartIp: '2.2.2.0',
        poolEndIp: '2.2.2.5',
        gatewayIp: '2.2.3.4'
      }],
      dhcpOptions: [],
      hosts: []
    })
  })

  it('should get correct `leaseTime`', () => {
    const result = convertEdgeDHCPFormDataToApiPayload(mockedRelayOnFormData)
    expect(result.leaseTime).toBe(-1)
  })

  it('options & hosts should be empty when relay is ON', () => {
    const result = convertEdgeDHCPFormDataToApiPayload(mockedRelayOnFormData)
    expect(result.dhcpOptions?.length).toBe(0)
    expect(result.hosts?.length).toBe(0)
  })

  it('pools/options/hosts should not using UI used id', () => {
    const result = convertEdgeDHCPFormDataToApiPayload(mockedRelayOffFormData)

    result.dhcpPools?.forEach(pool => {
      expect(pool.id.startsWith('_NEW_')).toBeFalsy()
    })

    expect(result.dhcpPools[0].id).toBe(result.dhcpPools[0].id)
    expect(result.dhcpPools[1].id).toBe('')

    expect(result.dhcpOptions![0].id).toBe(result.dhcpOptions![0].id)
    expect(result.dhcpOptions![1].id).toBe('')

    expect(result.hosts![0].id).toBe(result.hosts![0].id)
    expect(result.hosts![1].id).toBe('')
  })

  it('options / hosts is undefined', () => {
    const result = convertEdgeDHCPFormDataToApiPayload({
      id: '1',
      serviceName: 'test',
      dhcpRelay: false,
      externalDhcpServerFqdnIp: '1.1.1.1',
      domainName: 'test.com.cc',
      primaryDnsIp: '1.1.1.1',
      secondaryDnsIp: '2.2.2.2',
      edgeIds: [],
      leaseTime: 30,
      leaseTimeUnit: 'HOURS',
      enableSecondaryDNSServer: false,
      dhcpPools: [{
        id: '1',
        poolName: 'PoolTest1',
        subnetMask: '255.255.255.0',
        poolStartIp: '1.1.1.1',
        poolEndIp: '1.1.1.10',
        gatewayIp: '1.1.1.127',
        activated: true
      }],
      dhcpOptions: []
    })
    expect(result.dhcpOptions).toEqual([])
    expect(result.hosts).toBe(undefined)
  })
})
