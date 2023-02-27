import {
  networkHealthApi as api,
  networkHealthApiURL as apiUrl
} from '@acx-ui/analytics/services'
import { Provider, store }                                                 from '@acx-ui/store'
import { act, mockGraphqlMutation, mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import * as fixtures            from './__tests__/fixtures'
import {
  processDtoToPayload,
  specToDto,
  useNetworkHealthSpec,
  useNetworkHealthSpecMutation,
  useNetworkHealthTestResults
} from './services'
import {
  AuthenticationMethod,
  Band,
  ClientType,
  TestType,
  NetworkPaths,
  TestResultByAP
} from './types'

import type { TableCurrentDataSource } from 'antd/lib/table/interface'


beforeEach(() => store.dispatch(api.util.resetApiState()))

describe('useNetworkHealthSpec', () => {
  it.only('load spec data if specId in URL', async () => {
    mockGraphqlQuery(apiUrl, 'FetchServiceGuardSpec', { data: fixtures.fetchServiceGuardSpec })

    const { result } = renderHook(useNetworkHealthSpec, {
      wrapper: Provider,
      route: { params: { specId: 'spec-id' } }
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(fixtures.fetchServiceGuardSpec.serviceGuardSpec)
  })

  it('does not load spec data if specId not in URL', () => {
    const { result } = renderHook(useNetworkHealthSpec, { wrapper: Provider })
    expect(result.current.isUninitialized).toBe(true)
  })
})

describe('useNetworkHealthSpecMutation', () => {
  it('handles create mutation', async () => {
    const dto = {
      isDnsServerCustom: true,
      dnsServer: '10.10.10.10',
      tracerouteAddress: '10.10.10.10',
      pingAddress: '10.10.10.10',
      wlanName: 'WLAN Name',
      clientType: ClientType.VirtualWirelessClient,
      radio: Band.Band6,
      authenticationMethod: AuthenticationMethod.WPA3_PERSONAL,
      wlanPassword: '12345',
      wlanUsername: 'user',
      type: TestType.OnDemand,
      name: 'Test Name',
      // TODO:
      // Update to correct format when APsSelection input done
      networkPaths: { networkNodes: 'VENUE|00:00:00:00:00:00' }
    }
    const { result } = renderHook(
      useNetworkHealthSpecMutation,
      { wrapper: Provider }
    )

    const expected = { spec: { id: 'spec-id' }, userErrors: null }
    mockGraphqlMutation(apiUrl, 'CreateServiceGuardSpec', {
      data: { createServiceGuardSpec: expected }
    })

    expect(result.current.editMode).toBe(false)

    act(() => { result.current.submit(dto) })
    await waitFor(() => expect(result.current.response.isSuccess).toBe(true))

    expect(result.current.response.data).toEqual(expected)
  })

  it('handles update mutation', async () => {
    const dto = {
      id: 'spec-id',
      isDnsServerCustom: true,
      dnsServer: '10.10.10.10',
      tracerouteAddress: '10.10.10.10',
      pingAddress: '10.10.10.10',
      wlanName: 'WLAN Name',
      clientType: ClientType.VirtualWirelessClient,
      radio: Band.Band6,
      authenticationMethod: AuthenticationMethod.WPA3_PERSONAL,
      wlanPassword: '12345',
      wlanUsername: 'user',
      type: TestType.OnDemand,
      name: 'Test Name',
      // TODO:
      // Update to correct format when APsSelection input done
      networkPaths: { networkNodes: 'VENUE|00:00:00:00:00:00' }
    }

    mockGraphqlQuery(apiUrl, 'FetchServiceGuardSpec', { data: fixtures.fetchServiceGuardSpec })

    const { result } = renderHook(useNetworkHealthSpecMutation, {
      wrapper: Provider,
      route: { params: { specId: 'spec-id' } }
    })

    await waitFor(() => expect(result.current.spec.isSuccess).toBe(true))

    const expected = { spec: { id: 'spec-id' }, userErrors: null }
    mockGraphqlMutation(apiUrl, 'UpdateServiceGuardSpec', {
      data: { updateServiceGuardSpec: expected }
    })

    expect(result.current.editMode).toBe(true)

    act(() => { result.current.submit(dto) })
    await waitFor(() => expect(result.current.response.isSuccess).toBe(true))

    expect(result.current.response.data).toEqual(expected)
  })
})

describe('processDtoToPayload', () => {
  const dto = {
    id: 'spec-id',
    isDnsServerCustom: true,
    dnsServer: '10.10.10.10',
    tracerouteAddress: '10.10.10.10',
    pingAddress: '10.10.10.10',
    wlanName: 'WLAN Name',
    clientType: ClientType.VirtualWirelessClient,
    radio: Band.Band6,
    authenticationMethod: AuthenticationMethod.WPA3_PERSONAL,
    wlanPassword: '12345',
    wlanUsername: 'user',
    type: TestType.OnDemand,
    name: 'Test Name'
  }
  it('process dto to payload for GraphQL input', () => {
    const payload = processDtoToPayload({
      ...dto,
      // TODO:
      // Update to correct format when APsSelection input done
      networkPaths: { networkNodes: 'VENUE|00:00:00:00:00:00' }
    })

    expect(payload).toMatchSnapshot()
  })

  it('handle zone only', () => {
    // TODO:
    // Remove when APsSelection input done
    const payload = processDtoToPayload({
      ...dto,
      networkPaths: { networkNodes: 'VENUE' }
    })

    expect(payload).toMatchSnapshot()
  })

  it('handle zone + apGroup', () => {
    // TODO:
    // Remove when APsSelection input done
    const payload = processDtoToPayload({
      ...dto,
      networkPaths: { networkNodes: 'VENUE>AP Group' }
    })

    expect(payload).toMatchSnapshot()
  })
})

describe('specToDto', () => {
  const spec = {
    id: 'spec-id',
    clientType: ClientType.VirtualWirelessClient,
    type: TestType.OnDemand,
    name: 'Test Name',
    configs: [{
      authenticationMethod: 'WPA3_PERSONAL',
      dnsServer: '10.10.10.10',
      pingAddress: '10.10.10.10',
      radio: Band.Band6,
      tracerouteAddress: '10.10.10.10',
      wlanName: 'WLAN Name',
      wlanPassword: '12345',
      wlanUsername: 'user',
      networkPaths: {
        networkNodes: [[
          { type: 'zone', name: 'VENUE' },
          { type: 'apMac', list: ['00:00:00:00:00:00'] }
        ]] as NetworkPaths
      }
    }]
  }
  it('process spec of GraphQL result to dto', () => {
    const dto = specToDto(spec)
    expect(dto).toMatchSnapshot()
  })

  it('handles path without AP list', () => {
    // TODO:
    // Remove when APsSelection input done
    const dto = specToDto({
      ...spec,
      configs: [{
        ...spec.configs[0],
        networkPaths: {
          networkNodes: [[
            { type: 'zone', name: 'VENUE' },
            { type: 'apGroup', name: 'AP Group' }
          ]] as NetworkPaths
        }
      }]
    })
    expect(dto).toMatchSnapshot()
  })

  it('handle spec = undefined', () => {
    expect(specToDto()).toBe(undefined)
  })
})
describe('useNetworkHealthTestResults', () => {
  it('load spec data if specId in URL', async () => {
    const config = {
      pingAddress: null,
      tracerouteAddress: null,
      speedTestEnabled: false
    }
    mockGraphqlQuery(apiUrl, 'ServiceGuardResults', {
      data: { serviceGuardTest: fixtures.mockResultForVirtualClient({ ...config }) }
    })
    const { result } = renderHook(useNetworkHealthTestResults, {
      wrapper: Provider,
      route: { params: { testId: '1' } }
    })
    await waitFor(() => expect(result.current.tableQuery.isSuccess).toBe(true))
    expect(result.current.tableQuery.data).toEqual(
      fixtures.mockResultForVirtualClient({ ...config })
    )
  })

  it('does not load spec data if specId not in URL', () => {
    const { result } = renderHook(useNetworkHealthTestResults, { wrapper: Provider })
    expect(result.current.tableQuery.isUninitialized).toBe(true)
  })

  it('handleTableChange should update pagination', () => {
    const { result } = renderHook(useNetworkHealthTestResults, { wrapper: Provider })
    const customPagination = { current: 1, pageSize: 10 }
    result.current.onPageChange(
      customPagination,
      { filter: null },
      [],
      [] as unknown as TableCurrentDataSource<TestResultByAP>
    )
    expect(result.current.pagination).toEqual({
      defaultPageSize: 10,
      page: 1,
      pageSize: 10,
      total: 0
    })
  })
})
