import { render, screen } from '@acx-ui/test-utils'

import { SdLanTopologyDiagram } from '.'

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Badge: () => <div data-testid='antd-badge' />
}))

describe('Edge SD-LAN Topology Diagram', () => {
  it('should render DC topology correctly', async () => {
    render(<SdLanTopologyDiagram
      isGuestTunnelEnabled={false}
      vertical={false}
    />)

    expect((await screen.findAllByTestId('antd-badge')).length).toBe(2)
    const img = screen.getByRole('img')
    expect(img.getAttribute('alt')).toBe('SD-LAN')
  })

  it('should render DMZ topology correctly', async () => {
    render(<SdLanTopologyDiagram
      isGuestTunnelEnabled={true}
      vertical={false}
    />)

    expect((await screen.findAllByTestId('antd-badge')).length).toBe(3)
    const img = screen.getByRole('img')
    expect(img.getAttribute('alt')).toBe('SD-LAN with DMZ')
  })

  it('should render vertical DMZ topology correctly', async () => {
    render(<SdLanTopologyDiagram
      isGuestTunnelEnabled={true}
      vertical={true}
    />)

    expect((await screen.findAllByTestId('antd-badge')).length).toBe(3)
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toBe('EdgeSdLanDcDmzVertical')
  })

  it('should render vertical DC topology correctly', async () => {
    render(<SdLanTopologyDiagram
      isGuestTunnelEnabled={false}
      vertical={true}
    />)

    expect((await screen.findAllByTestId('antd-badge')).length).toBe(2)
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toBe('EdgeSdLanDcVertical')
  })
})