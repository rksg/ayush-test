import {
  ApIncompatibleFeature,
  CompatibilityDeviceEnum, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import { render, screen, within } from '@acx-ui/test-utils'

import {
  mockApCompatibilitiesVenue,
  mockFeatureCompatibilities
} from '../../ApCompatibilityDrawer/__test__/fixtures'
import {
  transformedMockEdgeCompatibilitiesVenue
} from '../../EdgeCompatibilityDrawer/__test__/fixtures'

import { FeatureItemProps } from './FeatureItem'

import { CompatibilityItem } from '.'

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
    const mockData = mockFeatureCompatibilities

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
    it('should display smartEdge info correctly', async () => {
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
      within(sdlanInfo).getByText('Incompatible SmartEdges (Currently)')
      expect(within(sdlanInfo).getByText('2.1.0.200')).toBeInTheDocument()
      expect(within(sdlanInfo).getByText('1 / 6')).toBeInTheDocument()

      const tunnelProfileInfo = fItems[1]
      within(tunnelProfileInfo).getByText('Incompatible SmartEdges (Currently)')
      expect(within(tunnelProfileInfo).getByText('2.1.0.400')).toBeInTheDocument()
      expect(within(tunnelProfileInfo).getByText('2 / 6')).toBeInTheDocument()
    })
  })
})
