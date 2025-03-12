/* eslint-disable max-len */
import { rest } from 'msw'

import { edgeApi }                                                          from '@acx-ui/rc/services'
import { EdgeCompatibilityFixtures, EdgeUrlsInfo, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { store, Provider }                                                  from '@acx-ui/store'
import { act, mockServer, render, screen, within, renderHook, waitFor }     from '@acx-ui/test-utils'

import { transformEdgeCompatibilitiesWithFeatureName, useEdgeSdLanDetailsCompatibilitiesData } from '../../../useEdgeActions/compatibility'
import { CompatibilityItemProps }                                                              from '../../CompatibilityDrawer/CompatibilityItem'
import { FeatureItemProps }                                                                    from '../../CompatibilityDrawer/CompatibilityItem/FeatureItem'

import { EdgeDetailCompatibilityDrawer } from '.'

const { mockEdgeSdLanCompatibilities, mockEdgeSdLanApCompatibilites } = EdgeCompatibilityFixtures

jest.mock('../../CompatibilityDrawer/CompatibilityItem', () => {
  const CompatibilityItemComp = jest.requireActual('../../CompatibilityDrawer/CompatibilityItem')
  return {
    ...CompatibilityItemComp,
    CompatibilityItem: (props: CompatibilityItemProps) => <div data-testid='CompatibilityItem'>
      <CompatibilityItemComp.CompatibilityItem {...props}/>
    </div>
  }
})
jest.mock('../../CompatibilityDrawer/CompatibilityItem/FeatureItem', () => {
  const FeatureItemComp = jest.requireActual('../../CompatibilityDrawer/CompatibilityItem/FeatureItem')
  return {
    ...FeatureItemComp,
    FeatureItem: (props: FeatureItemProps) => <div data-testid='FeatureItem'>
      <FeatureItemComp.FeatureItem {...props}/>
    </div>
  }
})

describe('EdgeDetailCompatibilityDrawer', () => {
  const tenantId = 'mock_tenant_id'
  const mockedCloseDrawer = jest.fn()
  beforeEach(() => {
    act(() => {
      store.dispatch(edgeApi.util.resetApiState())
    })

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getSdLanEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanCompatibilities))),
      rest.post(
        EdgeUrlsInfo.getSdLanApCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanApCompatibilites)))
    )
  })

  it('should fetch and display SD-LAN correctly', async () => {
    const { result } = renderHook(() => useEdgeSdLanDetailsCompatibilitiesData({ serviceId: 'mock_service' }),
      { wrapper: Provider })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const sdlanData = transformEdgeCompatibilitiesWithFeatureName(result.current.compatibilities, IncompatibilityFeatures.SD_LAN)

    render(<Provider>
      <EdgeDetailCompatibilityDrawer
        title='Incompatibility Details'
        visible
        featureName={IncompatibilityFeatures.SD_LAN}
        data={sdlanData}
        onClose={mockedCloseDrawer}
      /></Provider>, {
      route: { params: { tenantId }, path: '/:tenantId' }
    })

    await screen.findByText('Incompatibility Details')
    expect(await screen.findByText('SD-LAN')).toBeInTheDocument()
    const compatibilityItems = await screen.findAllByTestId('CompatibilityItem')
    expect(compatibilityItems.length).toBe(2)

    const features = screen.getAllByTestId('FeatureItem')
    expect(features.length).toBe(2)

    const edge = compatibilityItems[0]
    expect(await screen.findByRole('link', { name: /RUCKUS Edge Firmware/ })).toBeInTheDocument()
    expect(within(edge).getByText('2.1.0.200')).toBeValid()
    expect(within(edge).getByText('5 / 14')).toBeValid()

    const wifi = compatibilityItems[1]
    expect(await screen.findByRole('link', { name: /AP Firmware/ })).toBeInTheDocument()
    expect(within(wifi).getByText('7.0.0.0.234')).toBeValid()
    expect(within(wifi).getByText('WIFI_7')).toBeValid()
    expect(within(wifi).getByText('4 / 16')).toBeValid()
  })

  it('should fetch and display Tunnel Profile correctly', async () => {
    const { result } = renderHook(() => useEdgeSdLanDetailsCompatibilitiesData({ serviceId: 'mock_service' }),
      { wrapper: Provider })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const sdlanData = transformEdgeCompatibilitiesWithFeatureName(result.current.compatibilities, IncompatibilityFeatures.TUNNEL_PROFILE)

    render(<Provider>
      <EdgeDetailCompatibilityDrawer
        visible
        featureName={IncompatibilityFeatures.TUNNEL_PROFILE}
        data={sdlanData}
        onClose={mockedCloseDrawer}
      /></Provider>, {
      route: { params: { tenantId }, path: '/:tenantId' }
    })

    await screen.findByText('Incompatibility Details')
    expect(await screen.findByText('Tunnel Profile')).toBeInTheDocument()
    const compatibilityItems = await screen.findAllByTestId('CompatibilityItem')
    expect(compatibilityItems.length).toBe(1)

    const features = screen.getAllByTestId('FeatureItem')
    expect(features.length).toBe(1)

    const edge = compatibilityItems[0]
    expect(await screen.findByRole('link', { name: /RUCKUS Edge Firmware/ })).toBeInTheDocument()
    expect(within(edge).getByText('2.1.0.400')).toBeValid()
    expect(within(edge).getByText('7 / 14')).toBeValid()
  })
})