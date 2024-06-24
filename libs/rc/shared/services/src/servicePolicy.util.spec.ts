import { BaseQueryApi, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'

import { AAAViewModalType, AAARbacViewModalType, Radius, TableResult, ApiVersionEnum, GetApiVersionHeader, DHCPUrls } from '@acx-ui/rc/utils'
import { RequestPayload }                                                                                             from '@acx-ui/types'
import { ApiInfo, createHttpRequest }                                                                                 from '@acx-ui/utils'

import { convertRbacDataToAAAViewModelPolicyList, covertAAAViewModalTypeToRadius, createFetchArgsBasedOnRbac, getDhcpProfile, getVenueDHCPProfile, transformGetVenueDHCPPoolsResponse } from './servicePolicy.utils'

jest.mock('@acx-ui/utils')
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid')
}))

describe('servicePolicy.utils', () => {
  it('should convert RBAC data to AAA view model policy list', () => {
    const input: TableResult<AAARbacViewModalType> = {
      page: 1,
      totalCount: 1,
      data: [
        // eslint-disable-next-line max-len
        { id: '1', name: 'Policy 1', primary: '192.168.1.1:8080', secondary: '', type: 'ACCOUNTING', wifiNetworkIds: ['network1', 'network2'] }
      ]
    }
    const expectedOutput: TableResult<AAAViewModalType> = {
      page: 1,
      totalCount: 1,
      data: [
        // eslint-disable-next-line max-len
        { id: '1', name: 'Policy 1', primary: '192.168.1.1:8080', secondary: '', type: 'ACCOUNTING', networkIds: ['network1', 'network2'] }
      ]
    }
    expect(convertRbacDataToAAAViewModelPolicyList(input)).toEqual(expectedOutput)
  })

  it('should convert AAA view model type to Radius', () => {
    const data: AAAViewModalType = {
      id: '1',
      name: 'Policy 1',
      primary: '192.168.1.1:8080',
      secondary: '192.168.1.2:9090',
      type: 'ACCOUNTING',
      networkIds: ['network1', 'network2']
    }
    const expectedOutput: Radius = {
      id: '1',
      name: 'Policy 1',
      type: 'ACCOUNTING',
      primary: { ip: '192.168.1.1', port: 8080 },
      secondary: { ip: '192.168.1.2', port: 9090 }
    }
    expect(covertAAAViewModalTypeToRadius(data)).toEqual(expectedOutput)
  })

  it('should convert AAA view model type to Radius - empty secondary', () => {
    const data: AAAViewModalType = {
      id: '1',
      name: 'Policy 1',
      primary: '192.168.1.1:8080',
      secondary: '',
      type: 'ACCOUNTING',
      networkIds: ['network1', 'network2']
    }
    const expectedOutput: Radius = {
      id: '1',
      name: 'Policy 1',
      type: 'ACCOUNTING',
      primary: { ip: '192.168.1.1', port: 8080 }
    }
    expect(covertAAAViewModalTypeToRadius(data)).toEqual(expectedOutput)
  })

  describe('createFetchArgsBasedOnRbac', () => {
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, max-len
      jest.mocked(createHttpRequest as any).mockImplementationOnce((apiInfo: ApiInfo, params: any, headers: any) => {
        return {
          method: apiInfo.method,
          url: apiInfo.url,
          ...(headers ? { headers } : {})
        }
      })
    })

    it('should create fetch args without RBAC', () => {
      const apiInfo: ApiInfo = { url: '/test', method: 'GET' }
      const queryArgs: RequestPayload = { payload: { key: 'value' }, enableRbac: false }
      // const apiVersionHeaders = GetApiVersionHeader(ApiVersionEnum.v1)

      const result = createFetchArgsBasedOnRbac({ apiInfo, queryArgs })

      expect(result).toEqual({ method: apiInfo.method, url: apiInfo.url, body: queryArgs.payload })
    })

    it('should create fetch args with RBAC', () => {
      const apiInfo: ApiInfo = { url: '/test', method: 'GET' }
      const rbacApiInfo: ApiInfo = { url: '/rbac/test', method: 'GET' }
      const queryArgs: RequestPayload = { payload: { key: 'value' }, enableRbac: true }

      const props = {
        apiInfo,
        rbacApiInfo,
        rbacApiVersionKey: ApiVersionEnum.v1,
        queryArgs
      }
      const result = createFetchArgsBasedOnRbac(props)

      expect(result).toEqual({
        method: rbacApiInfo.method,
        url: rbacApiInfo.url,
        headers: GetApiVersionHeader(ApiVersionEnum.v1),
        body: JSON.stringify(queryArgs.payload)
      })
    })
  })
})

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
    const result = await getDhcpProfile()( { params, enableRbac: false }, {} as BaseQueryApi, {}, fetchWithBQ)

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
    const result = await getDhcpProfile()( { params, enableRbac: true }, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest).toHaveBeenCalledWith(DHCPUrls.queryDHCPProfiles,
      params, GetApiVersionHeader(ApiVersionEnum.v1))
    expect(createHttpRequest).toHaveBeenCalledWith(DHCPUrls.getDHCProfileDetail,
      params, GetApiVersionHeader(ApiVersionEnum.v1_1))

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
    const result = await getVenueDHCPProfile()( { params, enableRbac: false }, {} as BaseQueryApi, {}, fetchWithBQ)

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
    const result = await getVenueDHCPProfile()( { params, enableRbac: true }, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest).toHaveBeenCalledWith(DHCPUrls.queryDHCPProfiles,
      params, GetApiVersionHeader(ApiVersionEnum.v1))
    expect(createHttpRequest).toHaveBeenCalledWith(DHCPUrls.getVenueDHCPServiceProfileRbac,
      { ...params, serviceId: 'service1' }, GetApiVersionHeader(ApiVersionEnum.v1))

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