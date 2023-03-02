import _ from 'lodash'

import {
  networkHealthApi as api,
  networkHealthApiURL as apiUrl
} from '@acx-ui/analytics/services'
import { Provider, store }                                                         from '@acx-ui/store'
import { act, mockGraphqlMutation, mockGraphqlQuery, renderHook, waitFor, screen } from '@acx-ui/test-utils'

import * as fixtures          from './__tests__/fixtures'
import {
  processDtoToPayload,
  specToDto,
  useNetworkHealthSpec,
  useNetworkHealthSpecMutation,
  useAllNetworkHealthSpecsQuery,
  useRunNetworkHealthTestMutation,
  useDeleteNetworkHealthTestMutation,
  useMutationResponseEffect
}                                                                         from './services'
import { AuthenticationMethod, Band, ClientType, TestType, NetworkPaths, MutationResponse, MutationUserError } from './types'



beforeEach(() => store.dispatch(api.util.resetApiState()))

describe('useNetworkHealthSpec', () => {
  it('load spec data if specId in URL', async () => {
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

describe('useAllNetworkHealthSpecsQuery', () => {
  it('should return empty data', async () => {
    mockGraphqlQuery(
      apiUrl, 'FetchAllServiceGuardSpecs', { data: { allServiceGuardSpecs: [] } })
    const { result } = renderHook(() => useAllNetworkHealthSpecsQuery(), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
  it('should return correct data', async () => {
    mockGraphqlQuery(
      apiUrl, 'FetchAllServiceGuardSpecs', { data: fixtures.fetchAllServiceGuardSpecs })
    const { result } = renderHook(() => useAllNetworkHealthSpecsQuery(), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data)
      .toEqual(fixtures.fetchAllServiceGuardSpecs.allServiceGuardSpecs
        .map(row => ({ ...row, latestTest: _.get(row, 'tests.items[0]') })))
  })
})

it('useRunNetworkHealthTestMutation', async () => {
  mockGraphqlMutation(apiUrl, 'RunNetworkHealthTest', { data: fixtures.runServiceGuardTest })
  const { result } = renderHook(() => useRunNetworkHealthTestMutation(), { wrapper: Provider })
  act(() => {
    result.current.runTest({ id: fixtures.runServiceGuardTest.runServiceGuardTest.spec.id })
  })
  await waitFor(() => expect(result.current.response.isSuccess).toBe(true))
  expect(result.current.response.data).toEqual(fixtures.runServiceGuardTest.runServiceGuardTest)
})

it('useDeleteNetworkHealthTestMutation', async () => {
  mockGraphqlMutation(apiUrl, 'DeleteServiceGuardSpec', { data: fixtures.deleteNetworkHealth })
  const { result } = renderHook(() => useDeleteNetworkHealthTestMutation(), { wrapper: Provider })
  act(() => {
    result.current.deleteTest({ id: fixtures.runServiceGuardTest.runServiceGuardTest.spec.id })
  })
  await waitFor(() => expect(result.current.response.isSuccess).toBe(true))
  expect(result.current.response.data).toEqual(fixtures.deleteNetworkHealth.deleteServiceGuardSpec)
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

describe('useMutationResponseEffect', () => {
  it('should return when no data', async () => {
    const response = {} as MutationResponse<{ userErrors?: MutationUserError[] }>
    const { result } = renderHook(() =>
      useMutationResponseEffect(response), { wrapper: Provider })
    expect(result.current).toEqual(undefined)
  })
  it('should return when no error', async () => {
    const onOk = jest.fn()
    const response = { data: {} } as MutationResponse<{ userErrors?: MutationUserError[] }>
    renderHook(() => useMutationResponseEffect(response, onOk), { wrapper: Provider })
    expect(onOk).toBeCalled()
  })
  it('should show error', async () => {
    const response = {
      data: { userErrors: [{ field: 'spec', message: 'RUN_TEST_NO_APS' }] }
    } as MutationResponse<{ userErrors?: MutationUserError[] }>
    renderHook(() => useMutationResponseEffect(response), { wrapper: Provider })
    expect(await screen.findByText('There are no APs to run the test')).toBeVisible()
  })
})