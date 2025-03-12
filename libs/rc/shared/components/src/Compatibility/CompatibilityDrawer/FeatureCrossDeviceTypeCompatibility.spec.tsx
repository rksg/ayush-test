/* eslint-disable max-len */
import { IncompatibilityFeatures, CompatibilityDeviceEnum } from '@acx-ui/rc/utils'
import { Provider }                                         from '@acx-ui/store'
import { render, screen, within }                           from '@acx-ui/test-utils'

import { mockApCompatibilitiesVenue }              from '../Ap/ApCompatibilityDrawer/__test__/fixtures'
import { CompatibilityItemProps }                  from '../CompatibilityDrawer/CompatibilityItem'
import { FeatureItemProps }                        from '../CompatibilityDrawer/CompatibilityItem/FeatureItem'
import { transformedMockEdgeCompatibilitiesVenue } from '../Edge/EdgeCompatibilityDrawer/__test__/fixtures'

import { FeatureCrossDeviceTypeCompatibility } from './FeatureCrossDeviceTypeCompatibility'

jest.mock('./CompatibilityItem', () => {
  const CompatibilityItemComp = jest.requireActual('./CompatibilityItem')
  return {
    ...CompatibilityItemComp,
    CompatibilityItem: (props: CompatibilityItemProps) => <div data-testid='CompatibilityItem'>
      <CompatibilityItemComp.CompatibilityItem {...props}/>
    </div>
  }
})
jest.mock('./CompatibilityItem/FeatureItem', () => {
  const FeatureItemComp = jest.requireActual('./CompatibilityItem/FeatureItem')
  return {
    ...FeatureItemComp,
    FeatureItem: (props: FeatureItemProps) => <div data-testid='FeatureItem'>
      <FeatureItemComp.FeatureItem {...props}/>
    </div>
  }
})

describe('FeatureCrossDeviceTypeCompatibility', () => {
  const venueId = '8caa8f5e01494b5499fa156a6c565138'
  const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  let params = { tenantId, venueId }

  it('should render correctly', async () => {
    const edgeData = transformedMockEdgeCompatibilitiesVenue.compatibilities[0]
    edgeData.incompatibleFeatures = edgeData.incompatibleFeatures?.filter(i => i.featureName === IncompatibilityFeatures.SD_LAN)

    render(
      <Provider>
        <FeatureCrossDeviceTypeCompatibility
          data={{
            [CompatibilityDeviceEnum.AP]: mockApCompatibilitiesVenue.apCompatibilities[0],
            [CompatibilityDeviceEnum.EDGE]: edgeData
          }}
          featureName={IncompatibilityFeatures.SD_LAN}
        />
      </Provider>, {
        route: { params, path: '/:tenantId' }
      })

    const description = screen.getByText(/To enable the/)
    expect(description).toHaveTextContent('SD-LAN feature completely')
    const compatibilityItems = await screen.findAllByTestId('CompatibilityItem')
    expect(compatibilityItems.length).toBe(2)
    screen.getByText('RUCKUS Edge')
    screen.getByText('Wi-Fi')

    expect(screen.getByRole('link', { name: /AP Firmware/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /RUCKUS Edge Firmware/ })).toBeInTheDocument()

    const wifiBlock = compatibilityItems[0]
    const features = within(wifiBlock).getAllByTestId('FeatureItem')
    expect(features.length).toBe(1)
    within(features[0]).getByText(/Minimum required version/)
    within(features[0]).getByText('7.0.0.0.123')
    within(features[0]).getByText('Incompatible Access Points (Currently)')

    const edgeBlock = compatibilityItems[1]
    const features2 = within(edgeBlock).getAllByTestId('FeatureItem')
    expect(features2.length).toBe(1)
    within(features2[0]).getByText(/Minimum required version/)
    within(features2[0]).getByText('2.1.0.200')
    within(features2[0]).getByText('Incompatible RUCKUS Edges (Currently)')
  })
})