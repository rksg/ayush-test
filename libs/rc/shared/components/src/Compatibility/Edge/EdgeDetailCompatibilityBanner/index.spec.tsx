/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'

import { CompatibilityDeviceEnum, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { render, screen, within }                           from '@acx-ui/test-utils'

import { EdgeDetailCompatibilityBanner, EdgeCompatibilityAlertBannerProps, resolveApEdgeCompatibilityInfo } from './'

const defaultProps = {
  compatibilities: {
    [CompatibilityDeviceEnum.EDGE]: {
      [IncompatibilityFeatures.SD_LAN]: {
        incompatible: 1,
        incompatibleFeatures: [
          {
            featureName: IncompatibilityFeatures.SD_LAN,
            requiredFw: '2.1.0.200'
          }
        ]
      }
    },
    [CompatibilityDeviceEnum.AP]: {
      [IncompatibilityFeatures.SD_LAN]: {
        incompatible: 1,
        incompatibleFeatures: [
          {
            featureName: IncompatibilityFeatures.SD_LAN,
            requiredFw: '2.1.0.200'
          }
        ]
      }
    }
  },
  isLoading: false,
  featureNames: [IncompatibilityFeatures.SD_LAN]
} as EdgeCompatibilityAlertBannerProps

jest.mock('../EdgeDetailCompatibilityDrawer', () => ({
  EdgeDetailCompatibilityDrawer: (props: {
    visible: boolean
    featureName: IncompatibilityFeatures
    onClose: () => void
  }) => <div data-testid='EdgeDetailCompatibilityDrawer'>
    {props.visible && <>
      <span>{props.featureName}</span>
      <button onClick={props.onClose}>Close</button></>}
  </div>
}))
describe('EdgeDetailCompatibilityBanner', () => {

  it('renders null when isLoading is true', () => {
    const props = { ...defaultProps, isLoading: true }
    const { container } = render(<EdgeDetailCompatibilityBanner {...props} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders null when hasIncompatible is false', () => {
    const props = { ...defaultProps, compatibilities: undefined }
    const { container } = render(<EdgeDetailCompatibilityBanner {...props} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders CompatibleAlertBanner when hasIncompatible is true and drawerFeature is undefined', () => {
    const props = { ...defaultProps }
    render(<EdgeDetailCompatibilityBanner {...props} />)
    expect(screen.getByText('SD-LAN is not able to be brought up on 1 RUCKUS Edge and 1 AP due to their firmware incompatibility.')).toBeInTheDocument()
  })

  it('should correctly show detail drawer when CompatibleAlertBanner is clicked', async () => {
    const props = { ...defaultProps }
    render(<EdgeDetailCompatibilityBanner {...props} />)
    screen.getByText('SD-LAN is not able to be brought up on 1 RUCKUS Edge and 1 AP due to their firmware incompatibility.')
    await userEvent.click(screen.getByRole('button', { name: 'See details' }))
    const detailDrawer = screen.getByTestId('EdgeDetailCompatibilityDrawer')
    expect(await within(detailDrawer).findByText('SD-LAN')).toBeInTheDocument()
    await userEvent.click(within(detailDrawer).getByRole('button'))
    expect(within(detailDrawer).queryByRole('button')).toBeNull()
  })
})


describe('resolveApEdgeCompatibilityInfo', () => {
  const mockFeatureNames: IncompatibilityFeatures[] = [IncompatibilityFeatures.SD_LAN]
  const mockMultiFeatureNames: IncompatibilityFeatures[] = mockFeatureNames.concat(IncompatibilityFeatures.TUNNEL_PROFILE)

  it('should return empty object with empty feature names array', () => {
    const edgeData= undefined
    const apData = undefined
    const result = resolveApEdgeCompatibilityInfo(mockFeatureNames, edgeData, apData)
    expect(result).toEqual({ [IncompatibilityFeatures.SD_LAN]: { isAll: false, isOneOf: false, isEdge: false, isAp: false, edgeCount: 0, apCount: 0 } })
  })

  it('should return empty object with no edge data and no ap data', () => {
    const edgeData= undefined
    const apData = undefined
    const result = resolveApEdgeCompatibilityInfo(mockFeatureNames, edgeData, apData)
    expect(result).toEqual({ [IncompatibilityFeatures.SD_LAN]: { isAll: false, isOneOf: false, isEdge: false, isAp: false, edgeCount: 0, apCount: 0 } })
  })

  it('should return correct result with edge data but no ap data', () => {
    const edgeData = { [mockFeatureNames[0]]: { incompatible: 1 } }
    const apData = undefined
    const result = resolveApEdgeCompatibilityInfo(mockFeatureNames, edgeData, apData)
    expect(result).toEqual({ [IncompatibilityFeatures.SD_LAN]: { isAll: false, isOneOf: true, isEdge: true, isAp: false, edgeCount: 1, apCount: 0 } })
  })

  it('should return correct result with ap data but no edge data', () => {
    const edgeData = undefined
    const apData= { [mockFeatureNames[0]]: { incompatible: 1 } }
    const result = resolveApEdgeCompatibilityInfo(mockFeatureNames, edgeData, apData)
    expect(result).toEqual({ [IncompatibilityFeatures.SD_LAN]: { isAll: false, isOneOf: true, isEdge: false, isAp: true, edgeCount: 0, apCount: 1 } })
  })

  it('should return correct result with both edge and ap data', () => {
    const edgeData= { [mockFeatureNames[0]]: { incompatible: 1 } }
    const apData= { [mockFeatureNames[0]]: { incompatible: 1 } }
    const result = resolveApEdgeCompatibilityInfo(mockFeatureNames, edgeData, apData)
    expect(result).toEqual({ [IncompatibilityFeatures.SD_LAN]: { isAll: true, isOneOf: true, isEdge: true, isAp: true, edgeCount: 1, apCount: 1 } })
  })

  it('should return correct result with multiple feature names', () => {
    const edgeData = { [mockMultiFeatureNames[0]]: { incompatible: 1 }, [mockMultiFeatureNames[1]]: { incompatible: 0 } }
    const apData= { [mockMultiFeatureNames[0]]: { incompatible: 1 }, [mockMultiFeatureNames[1]]: { incompatible: 1 } }
    const result = resolveApEdgeCompatibilityInfo(mockMultiFeatureNames, edgeData, apData)
    expect(result).toEqual({
      [IncompatibilityFeatures.SD_LAN]: { isAll: true, isOneOf: true, isEdge: true, isAp: true, edgeCount: 1, apCount: 1 },
      [IncompatibilityFeatures.TUNNEL_PROFILE]: { isAll: false, isOneOf: true, isEdge: false, isAp: true, edgeCount: 0, apCount: 1 }
    })
  })

  it('should return correct result with edge and ap data having different incompatible counts', () => {
    const edgeData= { [mockFeatureNames[0]]: { incompatible: 2 } }
    const apData = { [mockFeatureNames[0]]: { incompatible: 1 } }
    const result = resolveApEdgeCompatibilityInfo(mockFeatureNames, edgeData, apData)
    expect(result).toEqual({ [IncompatibilityFeatures.SD_LAN]: { isAll: true, isOneOf: true, isEdge: true, isAp: true, edgeCount: 2, apCount: 1 } })
  })
})