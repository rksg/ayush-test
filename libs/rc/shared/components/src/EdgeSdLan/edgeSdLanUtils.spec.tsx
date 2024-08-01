import { cloneDeep } from 'lodash'

import { EdgeSdLanFixtures } from '@acx-ui/rc/utils'
import {
  render,
  renderHook,
  screen,
  within
} from '@acx-ui/test-utils'

import { mockMvSdLanFormData }                                     from './__tests__/fixtures'
import { edgeSdLanFormRequestPreProcess, useGetNetworkTunnelInfo } from './edgeSdLanUtils'

const { mockedSdLanDataListP2 } = EdgeSdLanFixtures

jest.mock('../useEdgeActions', () => ({
  ...jest.requireActual('../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true)
}))

describe('useGetNetworkTunnelInfo', () => {
  const params = { tenantId: 'mock_tenant_id' }

  it('should correctly render DC case', async () => {
    const mockedDcSdlan = mockedSdLanDataListP2[1]
    const targetNetwork = mockedDcSdlan.networkInfos![0]

    const { result } = renderHook(() => useGetNetworkTunnelInfo())
    const resultComp = result.current(targetNetwork.networkId, mockedDcSdlan)
    render(<div>{resultComp}</div>, {
      route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
    })

    const tunnelTxt = screen.getByText(/Tunneled/)
    const btn = within(tunnelTxt).getByRole('link', { name: mockedDcSdlan.edgeClusterName })
    expect(btn).toBeVisible()
    // eslint-disable-next-line max-len
    expect(btn).toHaveAttribute('href', `/${params.tenantId}/t/devices/edge/cluster/${mockedDcSdlan.edgeClusterId}/edit/cluster-details`)
  })

  it('should correctly render DMZ case', async () => {
    const mockedDmzSdlan = mockedSdLanDataListP2[0]
    const targetNetwork = mockedDmzSdlan.networkInfos![1]

    const { result } = renderHook(() => useGetNetworkTunnelInfo())
    const resultComp = result.current(targetNetwork.networkId, mockedDmzSdlan)
    render(<div>{resultComp}</div>, {
      route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
    })

    const tunnelTxt = screen.getByText(/Tunneled/)
    const btn = within(tunnelTxt).getByRole('link', { name: mockedDmzSdlan.guestEdgeClusterName })
    expect(btn).toBeVisible()
    // eslint-disable-next-line max-len
    expect(btn).toHaveAttribute('href', `/${params.tenantId}/t/devices/edge/cluster/${mockedDmzSdlan.guestEdgeClusterId}/edit/cluster-details`)
  })

  it('should correctly render local breakout', async () => {
    const { result } = renderHook(() => useGetNetworkTunnelInfo())

    const resultComp = result.current('test_networkId', undefined)
    render(<div>{resultComp}</div>, {
      route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
    })

    expect(screen.getByText('Local Breakout')).toBeVisible()
  })
})


describe('edgeSdLanFormRequestPreProcess', () => {
  it('should correctly render DC case', async () => {
    const payload = edgeSdLanFormRequestPreProcess(mockMvSdLanFormData)

    expect(payload.isGuestTunnelEnabled).toBe(false)
    expect(payload.guestEdgeClusterId).toBeUndefined()
    expect(payload.guestTunnelProfileId).toBeUndefined()
    expect(payload.guestNetworks).toBeUndefined()
    expect(payload.networks).toStrictEqual({
      venue1: ['network1','network3'],
      venue2: ['network1']
    })
  })

  it('should correctly render DMZ case', async () => {
    const mockDmz = cloneDeep(mockMvSdLanFormData)
    mockDmz.isGuestTunnelEnabled = true
    const payload = edgeSdLanFormRequestPreProcess(mockDmz)

    expect(payload.isGuestTunnelEnabled).toBe(true)
    expect(payload.guestEdgeClusterId).not.toBeUndefined()
    expect(payload.guestTunnelProfileId).not.toBeUndefined()
    expect(payload.networks).toStrictEqual({
      venue1: ['network1','network3'],
      venue2: ['network1']
    })
    expect(payload.guestNetworks).toStrictEqual({
      venue1: ['network1']
    })
  })
})