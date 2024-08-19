/* eslint-disable max-len */
import { rest } from 'msw'

import { edgeApi }                                                      from '@acx-ui/rc/services'
import { EdgeUrlsInfo }                                                 from '@acx-ui/rc/utils'
import { store, Provider }                                              from '@acx-ui/store'
import { act, mockServer, render, screen, within, renderHook, waitFor } from '@acx-ui/test-utils'

import { useEdgeSdLanDetailsCompatibilitiesData } from '../../useEdgeActions/compatibility'
import { CompatibilityItemProps }                 from '../CompatibilityDrawer/CompatibilityItem'
import { FeatureItemProps }                       from '../CompatibilityDrawer/CompatibilityItem/FeatureItem'
import {
  mockEdgeSdLanCompatibilities,
  mockEdgeSdLanApCompatibilites
} from '../EdgeCompatibilityDrawer/__test__/fixtures'

import { EdgeSdLanDetailCompatibilityDrawer } from '.'

jest.mock('../CompatibilityDrawer/CompatibilityItem', () => {
  const CompatibilityItemComp = jest.requireActual('../CompatibilityDrawer/CompatibilityItem')
  return {
    ...CompatibilityItemComp,
    CompatibilityItem: (props: CompatibilityItemProps) => <div data-testid='CompatibilityItem'>
      <CompatibilityItemComp.CompatibilityItem {...props}/>
    </div>
  }
})
jest.mock('../CompatibilityDrawer/CompatibilityItem/FeatureItem', () => {
  const FeatureItemComp = jest.requireActual('../CompatibilityDrawer/CompatibilityItem/FeatureItem')
  return {
    ...FeatureItemComp,
    FeatureItem: (props: FeatureItemProps) => <div data-testid='FeatureItem'>
      <FeatureItemComp.FeatureItem {...props}/>
    </div>
  }
})

describe('EdgeSdLanDetailCompatibilityDrawer', () => {
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

  it('should fetch and display correctly', async () => {
    const { result } = renderHook(() => useEdgeSdLanDetailsCompatibilitiesData('mock_service'),
      { wrapper: Provider })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    render(<Provider>
      <EdgeSdLanDetailCompatibilityDrawer
        visible={true}
        data={result.current.sdLanCompatibilities}
        onClose={mockedCloseDrawer}
      /></Provider>, {
      route: { params: { tenantId }, path: '/:tenantId' }
    })

    await screen.findByText('Incompatibility Details')
    const compatibilityItems = await screen.findAllByTestId('CompatibilityItem')
    expect(compatibilityItems.length).toBe(2)

    const features = screen.getAllByTestId('FeatureItem')
    expect(features.length).toBe(2)

    const edge = compatibilityItems[0]
    expect(await within(edge).findByText(/SmartEdge Firmware/)).toBeInTheDocument()
    expect(within(edge).getByText('2.1.0.200')).toBeValid()
    expect(within(edge).getByText('7 / 14')).toBeValid()

    const wifi = compatibilityItems[1]
    expect(await within(wifi).findByText(/AP Firmware/)).toBeInTheDocument()
    expect(within(wifi).getByText('7.0.0.0.234')).toBeValid()
    expect(within(wifi).getByText('WIFI_7')).toBeValid()
    expect(within(wifi).getByText('4 / 16')).toBeValid()
  })
})