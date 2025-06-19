import { ConfigTemplateType } from '@acx-ui/rc/utils'
import { render, screen }     from '@acx-ui/test-utils'


import { ActivationViewer } from './index'

// Mock the viewer components
jest.mock('./VenueActivationViewer', () => ({
  VenueActivationViewer: () => <div data-testid='venue-viewer'>Venue Viewer</div>
}))

jest.mock('./NetworkActivationViewer', () => ({
  NetworkActivationViewer: () => <div data-testid='network-viewer'>Network Viewer</div>
}))

describe('ActivationViewer', () => {
  const mockTemplateId = 'test-template-id'

  it('should return null when template type is not in allowed set', () => {
    const { container } = render(
      <ActivationViewer type={ConfigTemplateType.SWITCH_CLI} templateId={mockTemplateId} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('should render NetworkActivationViewer when template type is VENUE', () => {
    render(<ActivationViewer type={ConfigTemplateType.VENUE} templateId={mockTemplateId} />)
    expect(screen.getByTestId('network-viewer')).toBeInTheDocument()
  })

  it('should render VenueActivationViewer when template type is NETWORK', () => {
    render(<ActivationViewer type={ConfigTemplateType.NETWORK} templateId={mockTemplateId} />)
    expect(screen.getByTestId('venue-viewer')).toBeInTheDocument()
  })
})