
import { render, screen } from '@testing-library/react'

import { NetworkTypeEnum } from '@acx-ui/rc/utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

import { EdgeSdLanSelectOption }             from './EdgeSdLanSelectOption'
import { EdgeSdLanSelectOptionContent }      from './EdgeSdLanSelectOptionContent'
import { EdgeSdLanSelectOptionL2greContent } from './EdgeSdLanSelectOptionL2greContent'
import { NetworkTunnelTypeEnum }             from './types'

jest.mock('../useEdgeActions', () => ({
  useIsEdgeFeatureReady: jest.fn()
}))

jest.mock('./EdgeSdLanSelectOptionContent', () => ({
  EdgeSdLanSelectOptionContent: jest.fn(() => <div>EdgeSdLanSelectOptionContent</div>)
}))

jest.mock('./EdgeSdLanSelectOptionL2greContent', () => ({
  EdgeSdLanSelectOptionL2greContent: jest.fn(() => <div>EdgeSdLanSelectOptionL2greContent</div>)
}))

describe('EdgeSdLanSelectOption', () => {
  const defaultProps = {
    tunnelTypeInitVal: NetworkTunnelTypeEnum.SdLan,
    currentTunnelType: NetworkTunnelTypeEnum.SdLan,
    networkId: 'network-1',
    networkVenueId: 'venue-1',
    networkType: NetworkTypeEnum.CAPTIVEPORTAL,
    venueSdLan: undefined,
    networkVlanPool: undefined,
    disabledInfo: {
      noChangePermission: false,
      isDisabled: false,
      tooltip: undefined
    }
  }

  it('renders EdgeSdLanSelectOptionContent when isEdgeL2greReady is false', () => {
    (useIsEdgeFeatureReady as jest.Mock).mockReturnValue(false)

    render(<EdgeSdLanSelectOption {...defaultProps} />)

    expect(screen.getByText('EdgeSdLanSelectOptionContent')).toBeInTheDocument()
    expect(EdgeSdLanSelectOptionContent).toHaveBeenCalledWith(
      expect.objectContaining({
        networkId: 'network-1',
        networkVenueId: 'venue-1',
        venueSdLan: undefined,
        networkType: NetworkTypeEnum.CAPTIVEPORTAL,
        currentTunnelType: NetworkTunnelTypeEnum.SdLan,
        hasVlanPool: false,
        tunnelTypeInitVal: NetworkTunnelTypeEnum.SdLan
      }),
      {}
    )
  })

  it('renders EdgeSdLanSelectOptionL2greContent when isEdgeL2greReady is true', () => {
    (useIsEdgeFeatureReady as jest.Mock).mockReturnValue(true)

    render(<EdgeSdLanSelectOption {...defaultProps} />)

    expect(screen.getByText('EdgeSdLanSelectOptionL2greContent')).toBeInTheDocument()
    expect(EdgeSdLanSelectOptionL2greContent).toHaveBeenCalledWith(
      expect.objectContaining({
        venueSdLan: undefined,
        networkType: NetworkTypeEnum.CAPTIVEPORTAL,
        hasVlanPool: false
      }),
      {}
    )
  })

  it('renders nothing when disabledInfo indicates the component is disabled', () => {
    const disabledProps = {
      ...defaultProps,
      disabledInfo: {
        noChangePermission: true,
        isDisabled: true,
        tooltip: 'Disabled'
      }
    }

    render(<EdgeSdLanSelectOption {...disabledProps} />)

    expect(screen.queryByText('EdgeSdLanSelectOptionContent')).not.toBeInTheDocument()
    expect(screen.queryByText('EdgeSdLanSelectOptionL2greContent')).not.toBeInTheDocument()
  })
})