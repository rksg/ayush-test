import { BaseQueryApi, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'

import { DHCPUrls }          from '@acx-ui/rc/utils'
import { createHttpRequest } from '@acx-ui/utils'

import { getDhcpProfileFn, getVenueDHCPProfileFn, transformGetVenueDHCPPoolsResponse } from './dhcp'

jest.mock('@acx-ui/utils')
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid')
}))
describe('getDhcpProfile', () => {
  let fetchWithBQ = jest.fn()

  beforeEach(() => {
    fetchWithBQ = jest.fn()
  })

  it('should fetch DHCP profile without RBAC', async () => {
    const response = { data: { } }
    fetchWithBQ.mockResolvedValue(response)

    const params = { serviceId: 'service1' }
    // eslint-disable-next-line max-len
    const result = await getDhcpProfileFn()( { params, enableRbac: false }, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest).toHaveBeenCalledWith(DHCPUrls.getDHCProfileDetail, params)
    expect(result).toEqual({ data: response.data })
  })

  it('should fetch DHCP profile with RBAC and return data', async () => {
    const viewmodelResponse = { data: { data: [{ venueIds: ['venue1', 'venue2'] }] } }
    const dhcpProfileResponse =
      { data: { dhcpPools:
          [{ name: 'pool1',
            leaseTimeMinutes: 0,
            leaseTimeHours: 24,
            startIpAddress: '192.168.1.10',
            endIpAddress: '192.168.1.100' }] } }

    fetchWithBQ
      .mockResolvedValueOnce(viewmodelResponse)
      .mockResolvedValueOnce(dhcpProfileResponse)

    const params = { serviceId: 'service1' }
    // eslint-disable-next-line max-len
    const result = await getDhcpProfileFn()( { params, enableRbac: true }, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest).toHaveBeenCalledWith(DHCPUrls.queryDhcpProfiles, params)
    expect(createHttpRequest).toHaveBeenCalledWith(DHCPUrls.getDHCProfileDetail, params)

    const expectedData = {
      ...dhcpProfileResponse.data,
      venueIds: ['venue1', 'venue2'],
      dhcpPools: [
        {
          ...dhcpProfileResponse.data.dhcpPools[0],
          id: 'mock-uuid',
          leaseUnit: 'leaseTimeHours',
          leaseTime: 24,
          numberOfHosts: expect.any(Number)
        }
      ]
    }
    expect(result).toEqual({ data: expectedData })
  })
})

describe('getVenueDHCPProfile', () => {
  let fetchWithBQ = jest.fn()

  beforeEach(() => {
    fetchWithBQ = jest.fn()
  })

  it('should fetch venue DHCP profile without RBAC', async () => {
    const response = { data: { } }
    fetchWithBQ.mockResolvedValue(response)

    const params = { venueId: 'venue1' }
    // eslint-disable-next-line max-len
    const result = await getVenueDHCPProfileFn()( { params, enableRbac: false }, {} as BaseQueryApi, {}, fetchWithBQ)

    // eslint-disable-next-line max-len
    expect(createHttpRequest).toHaveBeenCalledWith(DHCPUrls.getVenueDHCPServiceProfile, params)
    expect(result).toEqual({ data: response.data })
  })

  it('should fetch venue DHCP profile with RBAC and return data', async () => {
    const viewmodelResponse = { data: { data: [{ id: 'service1' }] } }
    const venueDhcpProfileResponse = { data: { activeDhcpPoolNames: ['pool1'] } }

    fetchWithBQ
      .mockResolvedValueOnce(viewmodelResponse)
      .mockResolvedValueOnce(venueDhcpProfileResponse)

    const params = { venueId: 'venue1' }
    // eslint-disable-next-line max-len
    const result = await getVenueDHCPProfileFn()( { params, enableRbac: true }, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest).toHaveBeenCalledWith(DHCPUrls.queryDhcpProfiles,
      params)
    expect(createHttpRequest).toHaveBeenCalledWith(DHCPUrls.getVenueDhcpServiceProfileRbac,
      { ...params, serviceId: 'service1' })

    const expectedData = {
      ...venueDhcpProfileResponse.data,
      serviceProfileId: 'service1',
      enabled: true,
      id: params.venueId
    }
    expect(result).toEqual({ data: expectedData })
  })
})

describe('transformGetVenueDHCPPoolsResponse', () => {
  it('should return merged pools with active flag when enableRbac is true', () => {
    const response = {
      wifiDhcpPoolUsages: [
        {
          name: 'pool1', vlanId: 1, subnetAddress: '192.168.1.0', subnetMask: '255.255.255.0',
          startIpAddress: '192.168.1.10', endIpAddress: '192.168.1.100', primaryDnsIp: '8.8.8.8',
          secondaryDnsIp: '8.8.4.4', leaseTimeHours: 24, leaseTimeMinutes: 0, totalIpCount: 90,
          usedIpCount: 50, active: false, id: '1'
        },
        {
          name: 'pool2', vlanId: 2, subnetAddress: '192.168.2.0', subnetMask: '255.255.255.0',
          startIpAddress: '192.168.2.10', endIpAddress: '192.168.2.100', primaryDnsIp: '8.8.8.8',
          secondaryDnsIp: '8.8.4.4', leaseTimeHours: 24, leaseTimeMinutes: 0, totalIpCount: 90,
          usedIpCount: 70, active: false, id: '2'
        }
      ]
    }
    const arg = {
      enableRbac: true,
      payload: {
        venueDHCPProfile: {
          activeDhcpPoolNames: ['pool1']
        },
        dhcpProfile: {
          dhcpPools: [
            {
              name: 'pool1', vlanId: 1, subnetAddress: '192.168.1.0', subnetMask: '255.255.255.0',
              startIpAddress: '192.168.1.10', endIpAddress: '192.168.1.100',
              primaryDnsIp: '8.8.8.8', secondaryDnsIp: '8.8.4.4', leaseTimeHours: 24,
              leaseTimeMinutes: 0, totalIpCount: 90,
              usedIpCount: 50, active: false, id: '1'
            },
            {
              name: 'pool2', vlanId: 2, subnetAddress: '192.168.2.0', subnetMask: '255.255.255.0',
              startIpAddress: '192.168.2.10', endIpAddress: '192.168.2.100',
              primaryDnsIp: '8.8.8.8', secondaryDnsIp: '8.8.4.4', leaseTimeHours: 24,
              leaseTimeMinutes: 0, totalIpCount: 90,
              usedIpCount: 70, active: false, id: '2'
            }
          ]
        }
      }
    }

    const expected = [
      {
        name: 'pool1', vlanId: 1, subnetAddress: '192.168.1.0', subnetMask: '255.255.255.0',
        startIpAddress: '192.168.1.10', endIpAddress: '192.168.1.100', primaryDnsIp: '8.8.8.8',
        secondaryDnsIp: '8.8.4.4', leaseTimeHours: 24, leaseTimeMinutes: 0, totalIpCount: 90,
        usedIpCount: 50, active: true, id: '1'
      },
      {
        name: 'pool2', vlanId: 2, subnetAddress: '192.168.2.0', subnetMask: '255.255.255.0',
        startIpAddress: '192.168.2.10', endIpAddress: '192.168.2.100', primaryDnsIp: '8.8.8.8',
        secondaryDnsIp: '8.8.4.4', leaseTimeHours: 24, leaseTimeMinutes: 0, totalIpCount: 90,
        usedIpCount: 70, active: false, id: '2'
      }
    ]

    const result = transformGetVenueDHCPPoolsResponse(response, {} as FetchBaseQueryMeta, arg)
    expect(result).toEqual(expected)
  })

  it('should return the original response when enableRbac is false', () => {
    const response = [
      {
        name: 'pool1', vlanId: 1, subnetAddress: '192.168.1.0', subnetMask: '255.255.255.0',
        startIpAddress: '192.168.1.10', endIpAddress: '192.168.1.100', primaryDnsIp: '8.8.8.8',
        secondaryDnsIp: '8.8.4.4', leaseTimeHours: 24, leaseTimeMinutes: 0, totalIpCount: 90,
        usedIpCount: 50, active: false, id: '1'
      },
      {
        name: 'pool2', vlanId: 2, subnetAddress: '192.168.2.0', subnetMask: '255.255.255.0',
        startIpAddress: '192.168.2.10', endIpAddress: '192.168.2.100', primaryDnsIp: '8.8.8.8',
        secondaryDnsIp: '8.8.4.4', leaseTimeHours: 24, leaseTimeMinutes: 0, totalIpCount: 90,
        usedIpCount: 70, active: false, id: '2'
      }
    ]
    const arg = {
      enableRbac: false,
      payload: {}
    }

    const result = transformGetVenueDHCPPoolsResponse(response, {} as FetchBaseQueryMeta, arg)
    expect(result).toEqual(response)
  })
})