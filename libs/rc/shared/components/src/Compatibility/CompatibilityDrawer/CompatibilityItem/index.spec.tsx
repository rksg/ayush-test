import { rest } from 'msw'

import {
  ApIncompatibleFeature, CommonUrlsInfo,
  CompatibilityDeviceEnum, IncompatibilityFeatures, CompatibilityType
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import {
  mockApCompatibilitiesVenue,
  mockApCompatibilitiesNetwork,
  mockFeatureCompatibilities
} from '../../ApCompatibilityDrawer/__test__/fixtures'
import {
  transformedMockEdgeCompatibilitiesVenue
} from '../../EdgeCompatibilityDrawer/__test__/fixtures'

import { CompatibilityItem } from '.'

describe('CompatibilityItem', () => {
  const venueId = '8caa8f5e01494b5499fa156a6c565138'
  const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  const featureName = IncompatibilityFeatures.BETA_DPSK3
  let params = { tenantId, venueId, featureName: IncompatibilityFeatures.BETA_DPSK3 }
  const venueName = 'Test Venue'

  it('should display render venue correctly', async () => {
    const mockData = mockApCompatibilitiesVenue.apCompatibilities[0]

    render(<Provider>
      <CompatibilityItem
        compatibilityType={CompatibilityType.VENUE}
        deviceType={CompatibilityDeviceEnum.AP}
        data={mockData.incompatibleFeatures!}
        totalDevices={mockData.total}
        venueId={venueId}
        venueName={venueName}
        featureName={featureName}
      /></Provider>, {
      route: { params: { tenantId }, path: '/:tenantId' }
    })
    expect(await screen.findByText(/Some features are not enabled/)).toBeInTheDocument()
    expect(await screen.findByText('7.0.0.0.123')).toBeInTheDocument()
  })

  it('should fetch venue name and display feature info on specific venue correctly', async () => {
    const mockData = mockApCompatibilitiesVenue.apCompatibilities[0]
    const mockVenueName = 'Mock_Venue'

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url.split('?')[0],
        (_, res, ctx) => res(ctx.json({ name: mockVenueName })))
    )

    render(
      <Provider>
        <CompatibilityItem
          compatibilityType={CompatibilityType.FEATURE}
          deviceType={CompatibilityDeviceEnum.AP}
          data={mockData.incompatibleFeatures!}
          totalDevices={mockData.total}
          venueId={venueId}
          featureName={featureName}
        />
      </Provider>, {
        route: { params: { tenantId }, path: '/:tenantId' }
      })

    expect(await screen.findByText('Mock_Venue')).toBeInTheDocument()
    expect(await screen.findByText('7.0.0.0.123')).toBeInTheDocument()
    expect(screen.getByText('Wi-Fi 6')).toBeInTheDocument()
    expect(screen.getByText('1 / 1')).toBeInTheDocument()
  })

  it('should display requirement info correctly', async () => {
    const mockData = mockFeatureCompatibilities

    render(
      <Provider>
        <CompatibilityItem
          compatibilityType={CompatibilityType.FEATURE}
          deviceType={CompatibilityDeviceEnum.AP}
          data={[{ ...mockData } as ApIncompatibleFeature]}
          venueId={venueId}
          venueName={venueName}
          featureName={featureName}
        />
      </Provider>, {
        route: { params: { tenantId, featureName }, path: '/:tenantId' }
      })

    expect(await screen.findByText('6.2.3.103.251')).toBeInTheDocument()
    expect(screen.getByText('Wi-Fi 6')).toBeInTheDocument()
  })

  it('should direct display render correctly(Devices of Venue banner)', async () => {
    const mockData = mockApCompatibilitiesVenue.apCompatibilities[0]
    render(
      <Provider>
        <CompatibilityItem
          compatibilityType={CompatibilityType.VENUE}
          deviceType={CompatibilityDeviceEnum.AP}
          data={mockData.incompatibleFeatures!}
          totalDevices={mockData.total}
          venueId={venueId}
          venueName={venueName}
        />
      </Provider>, {
        route: { params, path: '/:tenantId' }
      })

    // eslint-disable-next-line max-len
    expect(await screen.findByText(/Some features are not enabled on specific access points/)).toBeInTheDocument()
    expect(await screen.findByText('7.0.0.0.123')).toBeInTheDocument()
  })

  it('should correctly display on network device', async () => {
    const mockData = mockApCompatibilitiesNetwork.apCompatibilities[0]
    render(
      <Provider>
        <CompatibilityItem
          compatibilityType={CompatibilityType.DEVICE}
          deviceType={CompatibilityDeviceEnum.AP}
          data={mockData.incompatibleFeatures!}
          totalDevices={mockData.total}
          venueId={venueId}
          venueName={venueName}
        />
      </Provider>, {
        route: { params, path: '/:tenantId' }
      })

    // eslint-disable-next-line max-len
    expect(await screen.findByText(/The following features are not enabled on this access point/)).toBeInTheDocument()
    expect(await screen.findByText('6.2.3.103.251')).toBeInTheDocument()
  })

  describe('Edge cases', () => {
    it('should direct display render correctly (Devices of Venue)', async () => {
      const mockData = transformedMockEdgeCompatibilitiesVenue.compatibilities[0]
      render(
        <Provider>
          <CompatibilityItem
            compatibilityType={CompatibilityType.VENUE}
            deviceType={CompatibilityDeviceEnum.EDGE}
            data={mockData.incompatibleFeatures as ApIncompatibleFeature[]}
            totalDevices={mockData.total}
            venueId={venueId}
            venueName={venueName}
            featureName={featureName}
          />
        </Provider>, {
          route: { params, path: '/:tenantId' }
        })

      // eslint-disable-next-line max-len
      expect(await screen.findByText(/The following features are unavailable on specific SmartEdges in this venue/)).toBeInTheDocument()
      expect(await screen.findByText('2.1.0.200')).toBeInTheDocument()
    })
  })
})
