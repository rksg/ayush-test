/* eslint-disable max-len */
import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { venueApi, edgeApi }                                                   from '@acx-ui/rc/services'
import { CommonUrlsInfo, EdgeUrlsInfo, WifiUrlsInfo, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { Provider, store }                                                     from '@acx-ui/store'
import { act, mockServer, render, screen, within }                             from '@acx-ui/test-utils'

import { CompatibilityItemProps } from '../CompatibilityDrawer/CompatibilityItem'
import { FeatureItemProps }       from '../CompatibilityDrawer/CompatibilityItem/FeatureItem'

import {
  mockEdgeCompatibilitiesVenue,
  mockEdgeSdLanCompatibilities,
  mockEdgeSdLanApCompatibilites,
  mockEdgeFeatureCompatibilities,
  mockApFeatureCompatibilities
} from './__test__/fixtures'

import { EdgeCompatibilityDrawer, EdgeCompatibilityType } from '.'


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

const edgeCompatibilitiesVenue = cloneDeep(mockEdgeCompatibilitiesVenue)
edgeCompatibilitiesVenue.compatibilities.splice(1, 1)
describe('EdgeCompatibilityDrawer', () => {
  const venueId = 'mock_venue_id'
  const venueName = 'Test Venue'
  const serviceId = 'mock_sdlan_id'
  const tenantId = 'mock_tenant_id'
  const featureName = IncompatibilityFeatures.SD_LAN
  const mockedCloseDrawer = jest.fn()

  beforeEach(() => {
    act(() => {
      store.dispatch(venueApi.util.resetApiState())
      store.dispatch(edgeApi.util.resetApiState())
    })

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getVenueEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json(edgeCompatibilitiesVenue))),
      rest.post(
        EdgeUrlsInfo.getSdLanEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanCompatibilities))),
      rest.post(
        EdgeUrlsInfo.getSdLanApCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanApCompatibilites))),
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (_, res, ctx) => res(ctx.json(mockEdgeFeatureCompatibilities))),
      rest.get(
        WifiUrlsInfo.getApFeatureSets.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(mockApFeatureCompatibilities))),
      rest.get(
        CommonUrlsInfo.getVenue.url.split('?')[0],
        (_, res, ctx) => res(ctx.json({ name: venueName })))
    )
  })

  it('should fetch and display render venue correctly', async () => {
    render(
      <Provider>
        <EdgeCompatibilityDrawer
          visible={true}
          title='Testing Title'
          type={EdgeCompatibilityType.VENUE}
          venueId={venueId}
          venueName={venueName}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params: { tenantId, venueId }, path: '/:tenantId' }
      })

    await screen.findByText('Testing Title')
    await screen.findByTestId('CompatibilityItem')
    const features = screen.getAllByTestId('FeatureItem')
    expect(features.length).toBe(2)

    const f1 = features[0]
    expect(await within(f1).findByText('SD-LAN')).toBeInTheDocument()
    expect(within(f1).getByText('2.1.0.200')).toBeValid()

    const f2 = features[1]
    expect(within(f2).getByText('Tunnel Profile')).toBeValid()
    expect(within(f2).getByText('2.1.0.400')).toBeValid()
    expect(screen.getByTestId('CloseSymbol')).toBeVisible()
  })

  it('should display render SDLAN incompatible correctly', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getSdLanEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanCompatibilities))),
      rest.post(
        EdgeUrlsInfo.getSdLanApCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanApCompatibilites)))
    )

    render(
      <Provider>
        <EdgeCompatibilityDrawer
          visible={true}
          title='Testing Title'
          type={EdgeCompatibilityType.SD_LAN}
          serviceId={serviceId}
          featureName={IncompatibilityFeatures.SD_LAN}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params: { tenantId }, path: '/:tenantId' }
      })

    expect(await screen.findByText('SD-LAN')).toBeInTheDocument()
    const compatibilityDevices = await screen.findAllByTestId('CompatibilityItem')
    expect(compatibilityDevices.length).toBe(2)
    const features = screen.getAllByTestId('FeatureItem')
    expect(features.length).toBe(2)

    const edgeBlock = compatibilityDevices[0]
    expect(within(edgeBlock).getByText('2.1.0.200')).toBeValid()
    within(edgeBlock).getByText(/Incompatible SmartEdges/)
    expect(within(edgeBlock).getByText('5 / 14')).toBeValid()

    const wifiBlock = compatibilityDevices[1]
    expect(within(wifiBlock).getByText('7.0.0.0.234')).toBeValid()
    within(wifiBlock).getByText(/Incompatible Access Points/)
    expect(within(wifiBlock).getByText('4 / 16')).toBeValid()

    expect(screen.getByTestId('CloseSymbol')).toBeVisible()
  })

  it('should fetch and display render SDLAN feature requirement correctly', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeFeatureSets.url,
        (_, res, ctx) => res(ctx.json({ featureSets: mockEdgeFeatureCompatibilities.featureSets.filter(i => i.featureName === 'SD-LAN') })))
    )
    render(
      <Provider>
        <EdgeCompatibilityDrawer
          visible={true}
          title='Testing feature requirement'
          type={EdgeCompatibilityType.ALONE}
          featureName={IncompatibilityFeatures.SD_LAN}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params: { tenantId, featureName }, path: '/:tenantId' }
      })


    const compatibilityDevices = await screen.findAllByTestId('CompatibilityItem')
    expect(screen.getByText('SD-LAN')).toBeValid()
    expect(screen.getByText('SmartEdge')).toBeValid()
    expect(screen.getByText('Wi-Fi')).toBeValid()

    expect(compatibilityDevices.length).toBe(2)
    const features = screen.getAllByTestId('FeatureItem')
    expect(features.length).toBe(2)

    const edgeBlock = compatibilityDevices[0]
    expect(within(edgeBlock).getByText('2.1.0.600')).toBeValid()

    const wifiBlock = compatibilityDevices[1]
    expect(within(wifiBlock).getByText('7.0.0.0')).toBeValid()
    expect(screen.getByTestId('CloseSymbol')).toBeVisible()
  })

  it('should direct display render correctly(Devices of Venue banner) with given data', async () => {
    mockedCloseDrawer.mockClear()

    render(
      <Provider>
        <EdgeCompatibilityDrawer
          visible={true}
          title='Testing render with given data'
          data={mockEdgeCompatibilitiesVenue.compatibilities}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params: { tenantId, featureName }, path: '/:tenantId' }
      })

    const descriptions = await screen.findAllByText(/The following features are unavailable on certain SmartEdges in this venue due /)
    expect(descriptions.length).toBe(1)
    const features = screen.getAllByTestId('FeatureItem')
    expect(features.length).toBe(2)

    const f1 = features[0]
    expect(await within(f1).findByText('SD-LAN')).toBeInTheDocument()
    expect(within(f1).getByText('2.1.0.200')).toBeValid()

    const f2 = features[1]
    expect(within(f2).getByText('Tunnel Profile')).toBeValid()
    expect(within(f2).getByText('2.1.0.400')).toBeValid()
    await userEvent.click(screen.getByTestId('CloseSymbol'))
    expect(mockedCloseDrawer).toBeCalledTimes(1)
  })

  it('should display venue edge incompatible correctly', async () => {
    mockedCloseDrawer.mockClear()
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getVenueEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json({ compatibilities: mockEdgeCompatibilitiesVenue.compatibilities.slice(0, 1) })))
    )

    render(
      <Provider>
        <EdgeCompatibilityDrawer
          visible={true}
          title='venue edge incompatible'
          venueId={venueId}
          edgeId={'001001001'}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params: { tenantId, featureName }, path: '/:tenantId' }
      })

    expect(await screen.findByText(/The following features are not enabled on this SmartEdge /)).toBeInTheDocument()
    const features = screen.getAllByTestId('FeatureItem')
    expect(features.length).toBe(2)

    const f1 = features[0]
    expect(await within(f1).findByText('SD-LAN')).toBeInTheDocument()
    expect(within(f1).getByText('2.1.0.200')).toBeValid()

    const f2 = features[1]
    expect(within(f2).getByText('Tunnel Profile')).toBeValid()
    expect(within(f2).getByText('2.1.0.400')).toBeValid()
    await userEvent.click(screen.getByTestId('CloseSymbol'))
    expect(mockedCloseDrawer).toBeCalledTimes(1)
  })
})