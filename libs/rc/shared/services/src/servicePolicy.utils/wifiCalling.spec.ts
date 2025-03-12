import { RetryOptions, BaseQueryApi } from '@reduxjs/toolkit/query'

import {
  CommonResult,
  ServicesConfigTemplateUrlsInfo,
  WifiCallingFormContextType,
  WifiCallingUrls
} from '@acx-ui/rc/utils'
import { batchApi, createHttpRequest } from '@acx-ui/utils'

import { createWifiCallingFn, getWifiCallingFn, queryWifiCallingFn, updateWifiCallingFn } from './wifiCalling'

jest.mock('@acx-ui/utils')
const spyFetchWithBQ = jest.fn()
const mockResponse: { data: CommonResult } = {
  data: { response: { id: 'service-id' }, requestId: 'request-id' }
}

describe('wifiCalling.utils', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    spyFetchWithBQ.mockRestore()
  })
  const mockQueryArgs = {
    params: { serviceId: 'mock-service-id' },
    payload: {
      serviceName: 'wifiCalling-name',
      networkIds: ['network-id-1'],
      oldNetworkIds: ['old-network-id-1']
    } as WifiCallingFormContextType,
    enableRbac: true
  }


  it ('execute createWifiCallingFn correctly via RBAC api', async () => {
    spyFetchWithBQ.mockResolvedValue(mockResponse)
    // eslint-disable-next-line max-len
    const result = await createWifiCallingFn()(mockQueryArgs, {} as BaseQueryApi, {} as RetryOptions, spyFetchWithBQ)

    expect(result).toEqual(mockResponse)
    expect(createHttpRequest).toHaveBeenCalledWith(
      WifiCallingUrls.addWifiCallingRbac,
      mockQueryArgs.params
    )
    expect(spyFetchWithBQ).toHaveBeenCalled()
    expect(batchApi).toHaveBeenCalledWith(
      WifiCallingUrls.activateWifiCalling,
      [{ params: { serviceId: mockResponse.data.response?.id, networkId: 'network-id-1' } }],
      spyFetchWithBQ
    )
  })

  it ('execute createWifiCallingFn correctly while is ConfigTemplate', async () => {
    spyFetchWithBQ.mockResolvedValue(mockResponse)
    // eslint-disable-next-line max-len
    const result = await createWifiCallingFn(true)(mockQueryArgs, {} as BaseQueryApi, {} as RetryOptions, spyFetchWithBQ)

    expect(result).toEqual(mockResponse)
    expect(createHttpRequest).toHaveBeenCalledWith(
      ServicesConfigTemplateUrlsInfo.addWifiCallingRbac,
      mockQueryArgs.params
    )
    expect(spyFetchWithBQ).toHaveBeenCalled()
    expect(batchApi).toHaveBeenCalledWith(
      ServicesConfigTemplateUrlsInfo.activateWifiCalling,
      [{ params: { serviceId: mockResponse.data.response?.id, networkId: 'network-id-1' } }],
      spyFetchWithBQ
    )
  })

  it ('execute updateWifiCallingFn correctly via RBAC api', async () => {
    spyFetchWithBQ.mockResolvedValue(mockResponse)
    // eslint-disable-next-line max-len
    const result = await updateWifiCallingFn()(mockQueryArgs, {} as BaseQueryApi, {} as RetryOptions, spyFetchWithBQ)

    expect(result).toEqual(mockResponse)
    expect(createHttpRequest).toHaveBeenCalledWith(
      WifiCallingUrls.updateWifiCallingRbac,
      mockQueryArgs.params
    )
    expect(spyFetchWithBQ).toHaveBeenCalled()

    expect(batchApi).toBeCalledTimes(2)
  })

  it ('execute updateWifiCallingFn correctly while is ConfigTemplate', async () => {
    spyFetchWithBQ.mockResolvedValue(mockResponse)
    // eslint-disable-next-line max-len
    const result = await updateWifiCallingFn(true)(mockQueryArgs, {} as BaseQueryApi, {} as RetryOptions, spyFetchWithBQ)

    expect(result).toEqual(mockResponse)
    expect(createHttpRequest).toHaveBeenCalledWith(
      ServicesConfigTemplateUrlsInfo.updateWifiCallingRbac,
      mockQueryArgs.params
    )
    expect(spyFetchWithBQ).toHaveBeenCalled()
    expect(batchApi).toBeCalledTimes(2)
  })

  it ('execute queryWifiCallingFn correctly via RBAC api', async () => {
    spyFetchWithBQ.mockResolvedValue(mockResponse)
    // eslint-disable-next-line max-len
    const result = await queryWifiCallingFn()({ enableRbac: true }, {} as BaseQueryApi, {} as RetryOptions, spyFetchWithBQ)

    expect(result).toEqual(mockResponse)
    expect(createHttpRequest).toHaveBeenCalledWith(
      WifiCallingUrls.queryWifiCalling,
      undefined
    )
    expect(spyFetchWithBQ).toHaveBeenCalled()
  })

  it ('execute queryWifiCallingFn correctly while is ConfigTemplate', async () => {
    spyFetchWithBQ.mockResolvedValue(mockResponse)
    // eslint-disable-next-line max-len
    const result = await queryWifiCallingFn(true)({ enableRbac: true }, {} as BaseQueryApi, {} as RetryOptions, spyFetchWithBQ)

    expect(result).toEqual(mockResponse)
    expect(createHttpRequest).toHaveBeenCalledWith(
      ServicesConfigTemplateUrlsInfo.queryWifiCalling,
      undefined
    )
    expect(spyFetchWithBQ).toHaveBeenCalled()
  })

  it ('execute getWifiCallingFn correctly via RBAC api', async () => {
    spyFetchWithBQ.mockResolvedValue({ data: {} })
    const args = {
      params: { serviceId: 'service-id' },
      enableRbac: true
    }
    // eslint-disable-next-line max-len
    const result = await getWifiCallingFn()(args, {} as BaseQueryApi, {} as RetryOptions, spyFetchWithBQ)

    expect(createHttpRequest).toHaveBeenCalledWith(WifiCallingUrls.getWifiCallingRbac, args.params)
    expect(createHttpRequest).toHaveBeenCalledWith(WifiCallingUrls.queryWifiCalling, args.params)
    expect(spyFetchWithBQ).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        networkIds: []
      }
    })
  })

  it ('execute getWifiCallingFn correctly while is ConfigTemplate', async () => {
    spyFetchWithBQ.mockResolvedValue({ data: {} })
    const args = {
      params: { serviceId: 'service-id' },
      enableRbac: true
    }
    // eslint-disable-next-line max-len
    const result = await getWifiCallingFn(true)(args, {} as BaseQueryApi, {} as RetryOptions, spyFetchWithBQ)

    expect(createHttpRequest).toHaveBeenCalledWith(
      ServicesConfigTemplateUrlsInfo.getWifiCallingRbac,
      args.params
    )
    expect(createHttpRequest).toHaveBeenCalledWith(
      ServicesConfigTemplateUrlsInfo.queryWifiCalling,
      args.params
    )
    expect(spyFetchWithBQ).toHaveBeenCalled()

    expect(result).toEqual({
      data: {
        networkIds: []
      }
    })
  })

})
