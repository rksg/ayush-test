/* eslint-disable max-len */
import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { venueApi, edgeApi }                                                                                                                      from '@acx-ui/rc/services'
import { CommonUrlsInfo, EdgeUrlsInfo, WifiUrlsInfo, IncompatibilityFeatures, EdgeCompatibilityFixtures, FirmwareUrlsInfo, EdgeFirmwareFixtures } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                                        from '@acx-ui/store'
import { act, mockServer, render, screen, waitForElementToBeRemoved, within }                                                                     from '@acx-ui/test-utils'

import { CompatibilityItemProps } from '../../CompatibilityDrawer/CompatibilityItem'
import { FeatureItemProps }       from '../../CompatibilityDrawer/CompatibilityItem/FeatureItem'

import {
  mockApFeatureCompatibilities
} from './__test__/fixtures'

import { EdgeCompatibilityDrawer, EdgeCompatibilityType } from '.'

const {
  mockEdgeCompatibilitiesVenue,
  mockEdgeSdLanCompatibilities,
  mockEdgeSdLanApCompatibilites,
  mockEdgeFeatureCompatibilities
} = EdgeCompatibilityFixtures

const {
  mockedVenueFirmwareList,
  mockAvailableVersions
} = EdgeFirmwareFixtures

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

const edgeCompatibilitiesVenue = cloneDeep(mockEdgeCompatibilitiesVenue)
edgeCompatibilitiesVenue.compatibilities?.splice(1, 1)
describe('EdgeCompatibilityDrawer', () => {
  const venueId = 'mock_venue_id'
  const venueName = 'Test Venue'
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
        (_, res, ctx) => res(ctx.json({ name: venueName }))),
      rest.post(
        FirmwareUrlsInfo.getVenueEdgeFirmwareList.url,
        (_req, res, ctx) => res(ctx.json(mockedVenueFirmwareList))),
      rest.get(
        FirmwareUrlsInfo.getAvailableEdgeFirmwareVersions.url,
        (_req, res, ctx) => res(ctx.json(mockAvailableVersions)))
    )
  })

  it('should fetch and display render venue compatibility in table', async () => {
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
    const sdlanRow = await screen.findByRole('row', { name: /SD-LAN/ })
    expect(sdlanRow).toBeVisible()
    expect(screen.getByRole('row', { name: 'SD-LAN 1 2.1.0.200' })).toBeValid()
    expect(screen.getByRole('row', { name: 'Tunnel Profile 2 2.1.0.400' })).toBeValid()
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
    expect(screen.getByText('RUCKUS Edge')).toBeValid()
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

  it('should render Venue compatibilities correctly with given data', async () => {
    mockedCloseDrawer.mockClear()

    render(
      <Provider>
        <EdgeCompatibilityDrawer
          visible={true}
          title='Testing render with given data'
          data={mockEdgeCompatibilitiesVenue.compatibilities?.slice(0, 1)}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params: { tenantId, featureName }, path: '/:tenantId' }
      })

    const descriptions = await screen.findAllByText(/The following features are unavailable on certain RUCKUS Edges in this venue due /)
    expect(descriptions.length).toBe(1)

    const sdlanRow = screen.getByRole('row', { name: /SD-LAN/ })
    expect(sdlanRow).toBeVisible()
    expect(within(sdlanRow).getByText('2.1.0.200')).toBeValid()

    const tunnelProfileRow = screen.getByRole('row', { name: /Tunnel Profile/ })
    expect(within(tunnelProfileRow).getByText('2.1.0.400')).toBeValid()
    await userEvent.click(screen.getByTestId('CloseSymbol'))
    expect(mockedCloseDrawer).toBeCalledTimes(1)
  })

  it('should display venue edge incompatible correctly', async () => {
    mockedCloseDrawer.mockClear()
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getVenueEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json({ compatibilities: mockEdgeCompatibilitiesVenue.compatibilities?.slice(0, 1) })))
    )

    render(
      <Provider>
        <EdgeCompatibilityDrawer
          visible={true}
          title='venue edge incompatible'
          type={EdgeCompatibilityType.DEVICE}
          venueId={venueId}
          edgeId={'001001001'}
          onClose={mockedCloseDrawer}
        />
      </Provider>, {
        route: { params: { tenantId, featureName }, path: '/:tenantId' }
      })

    expect(await screen.findByText(/The following features are not enabled on this RUCKUS Edge /)).toBeInTheDocument()

    const sdlanRow = screen.getByRole('row', { name: /SD-LAN/ })
    expect(sdlanRow).toBeVisible()
    expect(within(sdlanRow).getByText('2.1.0.200')).toBeValid()

    const tunnelProfileRow = screen.getByRole('row', { name: /Tunnel Profile/ })
    expect(within(tunnelProfileRow).getByText('2.1.0.400')).toBeValid()
    await userEvent.click(screen.getByTestId('CloseSymbol'))
    expect(mockedCloseDrawer).toBeCalledTimes(1)
  })

  it('should change query payload when props changed', async () => {
    const mockeReq = jest.fn()
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getVenueEdgeCompatibilities.url,
        (req, res, ctx) => {
          mockeReq(req.body)
          return res(ctx.json({ compatibilities: mockEdgeCompatibilitiesVenue.compatibilities?.slice(0, 1) }))
        })
    )

    const { rerender } = render(
      <Provider>
        <EdgeCompatibilityDrawer
          visible={true}
          title='venue edge incompatible'
          type={EdgeCompatibilityType.DEVICE}
          venueId={venueId}
          edgeId={'001001001'}
          onClose={jest.fn()}
        />
      </Provider>, {
        route: { params: { tenantId, featureName }, path: '/:tenantId' }
      })

    expect(await screen.findByText(/The following features are not enabled on this RUCKUS Edge /)).toBeInTheDocument()
    const sdlanRow = screen.getByRole('row', { name: /SD-LAN/ })
    expect(sdlanRow).toBeVisible()
    expect(within(sdlanRow).getByText('2.1.0.200')).toBeValid()
    const tunnelProfileRow = screen.getByRole('row', { name: /Tunnel Profile/ })
    expect(within(tunnelProfileRow).getByText('2.1.0.400')).toBeValid()

    rerender(
      <Provider>
        <EdgeCompatibilityDrawer
          visible={true}
          title='venue edge incompatible: Edge2'
          type={EdgeCompatibilityType.DEVICE}
          venueId={venueId}
          edgeId={'001002222'}
          onClose={mockedCloseDrawer}
        />
      </Provider>)

    expect(await screen.findByText('venue edge incompatible: Edge2')).toBeInTheDocument()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(mockeReq).toBeCalledTimes(2)
    expect(mockeReq).toHaveBeenNthCalledWith(2, {
      filters: {
        edgeIds: ['001002222'],
        venueIds: ['mock_venue_id']
      }
    })
    screen.getByRole('row', { name: /SD-LAN/ })
  })
})