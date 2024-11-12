import { serviceGuardApiURL, Provider }                          from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, renderHook, waitFor } from '@acx-ui/test-utils'

import { fetchServiceGuardTest } from '../../__tests__/fixtures'

import { Title, useSubTitle } from '.'

describe('Title', () => {
  it('should render', async () => {
    mockGraphqlQuery(
      serviceGuardApiURL, 'FetchServiceGuardTest', { data: fetchServiceGuardTest })
    render(<Title/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    expect(await screen.findByText('name')).toBeVisible()
  })
  it('should handle when no data', async () => {
    mockGraphqlQuery(
      serviceGuardApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest: null } })
    render(<Title/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    expect(await screen.findByText('Test')).toBeVisible()
  })
})

describe('useSubTitle', () => {
  it('should render', async () => {
    const serviceGuardTest = {
      ...fetchServiceGuardTest.serviceGuardTest,
      summary: {
        apsTestedCount: 2,
        apsPendingCount: 0,
        apsSuccessCount: 2
      }
    }
    mockGraphqlQuery(serviceGuardApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest } })
    const { result } = renderHook(() => useSubTitle(), {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    await waitFor(() => expect(result.current).toEqual([
      { label: 'APs Under Test', value: ['2'] },
      { label: 'Test Result', value: ['100% pass'] },
      { label: 'Network', value: ['Wifi Name'] },
      { label: 'Radio Band', value: ['2.4 GHz'] },
      { label: 'Authentication Method', value: ['Pre-Shared Key (PSK)'] }
    ]))
  })
  it('should render - on going test', async () => {
    const serviceGuardTest = {
      ...fetchServiceGuardTest.serviceGuardTest,
      summary: {
        apsTestedCount: 2,
        apsPendingCount: 2,
        apsSuccessCount: 0
      }
    }
    mockGraphqlQuery(serviceGuardApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest } })
    const { result } = renderHook(() => useSubTitle(), {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    await waitFor(() => {
      expect(result.current).toEqual([
        { label: 'APs Under Test', value: ['0 of 2 APs tested'] },
        { label: 'Test Result', value: ['In progress...'] },
        { label: 'Network', value: ['Wifi Name'] },
        { label: 'Radio Band', value: ['2.4 GHz'] },
        { label: 'Authentication Method', value: ['Pre-Shared Key (PSK)'] }
      ])
    })
  })
  it('should handle when no data for test', async () => {
    const serviceGuardTest = {
      ...fetchServiceGuardTest.serviceGuardTest,
      config: { wlanName: '', radio: '', authenticationMethod: '' },
      summary: {}
    }
    mockGraphqlQuery(serviceGuardApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest } })
    const { result } = renderHook(() => useSubTitle(), {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    await waitFor(() => {
      expect(result.current).toEqual([
        { label: 'Network', value: ['Unknown'] },
        { label: 'Radio Band', value: ['Unknown'] },
        { label: 'Authentication Method', value: ['Unknown'] }
      ])
    })
  })
  it('should handle when no data (when loading)', async () => {
    mockGraphqlQuery(
      serviceGuardApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest: null } })
    const { result } = renderHook(() => useSubTitle(), {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    await waitFor(() => {
      expect(result.current).toEqual([])
    })
  })
})
