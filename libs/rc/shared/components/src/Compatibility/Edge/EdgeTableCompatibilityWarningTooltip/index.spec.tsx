/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'

import { CompatibilityDeviceEnum, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { render, screen }                                   from '@acx-ui/test-utils'

import { EdgeTableCompatibilityWarningTooltip } from './'

describe('EdgeTableCompatibilityWarningTooltip', () => {
  const mockFeatureName = IncompatibilityFeatures.SD_LAN
  const mockServiceId = 'test'
  const basicProps = { serviceId: mockServiceId, featureName: mockFeatureName }

  it('renders null when no compatibility data', () => {
    const { container } = render(<EdgeTableCompatibilityWarningTooltip {...basicProps} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders null when edge compatibility data has no incompatible devices', () => {
    const props = {
      ...basicProps,
      compatibility: {
        [CompatibilityDeviceEnum.EDGE]: [{ serviceId: mockServiceId, clusterEdgeCompatibilities: [{ incompatible: 0 }] }]
      }
    }
    const { container } = render(<EdgeTableCompatibilityWarningTooltip {...props} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders tooltip when edge compatibility data has incompatible devices', async () => {
    const props = {
      ...basicProps,
      compatibility: {
        [CompatibilityDeviceEnum.EDGE]: [{ serviceId: mockServiceId, clusterEdgeCompatibilities: [{ incompatible: 1 }] }]
      }
    }
    render(<EdgeTableCompatibilityWarningTooltip {...props} />)
    await userEvent.hover(screen.getByTestId('WarningTriangleSolid'))
    expect(await screen.findByText('This SD-LAN is not able to be brought up on some RUCKUS Edge due to their firmware incompatibility.')).toBeInTheDocument()
  })

  it('renders tooltip when AP compatibility data has incompatible devices', async () => {
    const props = {
      ...basicProps,
      compatibility: {
        [CompatibilityDeviceEnum.AP]: [{ serviceId: mockServiceId, venueEdgeServiceApCompatibilities: [{ incompatible: 1 }] }]
      }
    }
    render(<EdgeTableCompatibilityWarningTooltip {...props} />)
    await userEvent.hover(screen.getByTestId('WarningTriangleSolid'))
    expect(await screen.findByText('This SD-LAN is not able to be brought up on some access point due to their firmware incompatibility.')).toBeInTheDocument()
  })

  it('renders tooltip when both edge and AP compatibility data have incompatible devices', async () => {
    const props = {
      ...basicProps,
      compatibility: {
        [CompatibilityDeviceEnum.EDGE]: [{ serviceId: mockServiceId, clusterEdgeCompatibilities: [{ incompatible: 2 }] }],
        [CompatibilityDeviceEnum.AP]: [{ serviceId: mockServiceId, venueEdgeServiceApCompatibilities: [{ incompatible: 1 }] }]
      }
    }
    render(<EdgeTableCompatibilityWarningTooltip {...props} />)
    await userEvent.hover(screen.getByTestId('WarningTriangleSolid'))
    expect(await screen.findByText('This SD-LAN is not able to be brought up on some RUCKUS Edges and access point due to their firmware incompatibility.')).toBeInTheDocument()
  })

  it('renders null when no feature name', () => {
    const props = { serviceId: mockServiceId, compatibility: {} }
    const { container } = render(<EdgeTableCompatibilityWarningTooltip {...props} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders null when no compatibility data and no feature name', () => {
    const props = { serviceId: mockServiceId }
    const { container } = render(<EdgeTableCompatibilityWarningTooltip {...props} />)
    expect(container).toBeEmptyDOMElement()
  })
})