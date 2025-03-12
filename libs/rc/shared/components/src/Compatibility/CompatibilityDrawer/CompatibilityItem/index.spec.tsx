import { rest } from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  ApIncompatibleFeature,
  CompatibilityDeviceEnum,
  FirmwareUrlsInfo,
  IncompatibilityFeatures,
  APCompatibilityFixtures
} from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { mockServer, render, screen, within } from '@acx-ui/test-utils'

import {
  mockApCompatibilitiesVenue,
  mockApFeatureCompatibilities
} from '../../Ap/ApCompatibilityDrawer/__test__/fixtures'
import {
  transformedMockEdgeCompatibilitiesVenue
} from '../../Edge/EdgeCompatibilityDrawer/__test__/fixtures'

import { FeatureItemProps } from './FeatureItem'

import { CompatibilityItem } from '.'

const { mockApModelFamilies, mockFeatureCompatibilities } = APCompatibilityFixtures

jest.mock('./FeatureItem', () => {
  const FeatureItemComp = jest.requireActual('./FeatureItem')
  return {
    ...FeatureItemComp,
    FeatureItem: (props: FeatureItemProps) => <div data-testid='FeatureItem'>
      <FeatureItemComp.FeatureItem {...props}/>
    </div>
  }
})

describe('CompatibilityItem', () => {
  const venueId = '8caa8f5e01494b5499fa156a6c565138'
  const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  const featureName = IncompatibilityFeatures.BETA_DPSK3
  let params = { tenantId, venueId, featureName: IncompatibilityFeatures.BETA_DPSK3 }

  const mockeModelFamiliesReq = jest.fn()
  beforeEach(() => {
    mockeModelFamiliesReq.mockClear()

    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getApModelFamilies.url,
        (_, res, ctx) => {
          mockeModelFamiliesReq()
          return res(ctx.json(mockApModelFamilies))
        }))
  })

  it('should render with description correctly', async () => {
    const mockData = mockApCompatibilitiesVenue.apCompatibilities[0]

    render(<Provider>
      <CompatibilityItem
        description='Testing description'
        deviceType={CompatibilityDeviceEnum.AP}
        data={mockData.incompatibleFeatures!}
        totalDevices={mockData.total}
        featureName={featureName}
      /></Provider>, {
      route: { params: { tenantId }, path: '/:tenantId' }
    })

    screen.getByText('Testing description')
    const fItems = await screen.findAllByTestId('FeatureItem')
    expect(fItems.length).toBe(1)
    expect(screen.getByText('Minimum required version')).toBeInTheDocument()
    expect(screen.getByText('7.0.0.0.123')).toBeInTheDocument()
    expect(screen.getByText(/Supported AP Model Family/)).toBeInTheDocument()
    expect(screen.getByText('Wi-Fi 6')).toBeInTheDocument()
    expect(screen.getByText('Incompatible Access Points (Currently)')).toBeInTheDocument()
    expect(screen.getByText('1 / 1')).toBeInTheDocument()
  })

  it('should not display incompatible count when it is not given', async () => {
    const mockData = mockApFeatureCompatibilities

    render(
      <Provider>
        <CompatibilityItem
          deviceType={CompatibilityDeviceEnum.AP}
          data={[{ ...mockData } as ApIncompatibleFeature]}
          featureName={featureName}
        />
      </Provider>, {
        route: { params: { tenantId, featureName }, path: '/:tenantId' }
      })

    const fItems = await screen.findAllByTestId('FeatureItem')
    expect(fItems.length).toBe(1)
    expect(within(fItems[0]).getByText('6.2.3.103.251')).toBeInTheDocument()
    expect(within(fItems[0]).getByText('Wi-Fi 6')).toBeInTheDocument()
    expect(within(fItems[0]).queryByText('Incompatible Access Points (Currently)')).toBeNull()
  })

  describe('Edge cases', () => {
    it('should display RUCKUS Edge info correctly', async () => {
      const mockData = transformedMockEdgeCompatibilitiesVenue.compatibilities[0]
      render(
        <Provider>
          <CompatibilityItem
            deviceType={CompatibilityDeviceEnum.EDGE}
            data={mockData.incompatibleFeatures as ApIncompatibleFeature[]}
            totalDevices={mockData.total}
            featureName={featureName}
          />
        </Provider>, {
          route: { params, path: '/:tenantId' }
        })

      const fItems = await screen.findAllByTestId('FeatureItem')
      expect(fItems.length).toBe(2)

      const sdlanInfo = fItems[0]
      within(sdlanInfo).getByText('Incompatible RUCKUS Edges (Currently)')
      expect(within(sdlanInfo).getByText('2.1.0.200')).toBeInTheDocument()
      expect(within(sdlanInfo).getByText('1 / 6')).toBeInTheDocument()

      const tunnelProfileInfo = fItems[1]
      within(tunnelProfileInfo).getByText('Incompatible RUCKUS Edges (Currently)')
      expect(within(tunnelProfileInfo).getByText('2.1.0.400')).toBeInTheDocument()
      expect(within(tunnelProfileInfo).getByText('2 / 6')).toBeInTheDocument()

      expect(mockeModelFamiliesReq).toBeCalledTimes(0)
    })
  })

  describe('AP compatibility enhancement by model', () => {
    it('should display supported model correctly', async () => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_COMPATIBILITY_BY_MODEL)

      const mockData = mockFeatureCompatibilities.featureSets

      render(
        <Provider>
          <CompatibilityItem
            deviceType={CompatibilityDeviceEnum.AP}
            data={mockData}
            featureName={featureName}
          />
        </Provider>, {
          route: { params: { tenantId, featureName }, path: '/:tenantId' }
        })

      const fItems = await screen.findAllByTestId('FeatureItem')
      expect(fItems.length).toBe(1)
      expect(within(fItems[0]).getByText('6.2.3.103.252')).toBeInTheDocument()
      expect(await within(fItems[0]).findByText('Supported AP Models')).toBeVisible()
      expect(within(fItems[0]).getByText('Wi-Fi 6')).toBeInTheDocument()
      expect(within(fItems[0]).getByText('Wi-Fi 7')).toBeInTheDocument()
      expect(within(fItems[0]).queryByText('Incompatible Access Points (Currently)')).toBeNull()

      jest.mocked(useIsSplitOn).mockReset()
    })
  })
})
