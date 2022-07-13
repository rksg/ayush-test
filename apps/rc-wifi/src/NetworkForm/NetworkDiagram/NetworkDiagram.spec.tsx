import '@testing-library/jest-dom'

import { CloudpathDeploymentTypeEnum, GuestNetworkTypeEnum, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { fireEvent, render, screen }                                          from '@acx-ui/test-utils'

import { NetworkTypeLabel } from '../contentsMap'

import { NetworkDiagram } from './NetworkDiagram'


describe('NetworkDiagram', () => {
  it('should render default diagram successfully', async () => {
    const { asFragment } = render(<NetworkDiagram type='' />)
    const diagram = screen.getByRole('img')
    expect(diagram.src).toContain('none.png')
    expect(asFragment()).toMatchSnapshot()
  })

  describe('NetworkDiagram - PSK', () => {
    const type = NetworkTypeEnum.PSK
    it('should render PSK diagram successfully', async () => {
      const { asFragment } = render(<NetworkDiagram type={type} />)
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('psk.png')
      expect(asFragment()).toMatchSnapshot()
    }) 

    it('should render AAA diagram successfully', async () => {
      const { asFragment } = render(<NetworkDiagram type={type} enableMACAuth={true} />)
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('aaa.png')
      expect(asFragment()).toMatchSnapshot()
    }) 
  })

  describe('NetworkDiagram - DPSK', () => {
    const type = NetworkTypeEnum.DPSK
    it('should render DPSK diagram successfully', async () => {
      const { asFragment } = render(<NetworkDiagram type={type} />)
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('dpsk.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render DPSK (Cloud) diagram successfully', async () => {
      const { asFragment } = render(
        <NetworkDiagram
          type={type}
          cloudpathType={CloudpathDeploymentTypeEnum.Cloud}
        />
      )
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('dpsk-cloudpath-cloud-deployment.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render DPSK (On Premise) diagram successfully', async () => {
      const { asFragment } = render(
        <NetworkDiagram
          type={type}
          cloudpathType={CloudpathDeploymentTypeEnum.OnPremise}
        />
      )
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('dpsk-cloudpath-on-prem-deployment')
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('NetworkDiagram - OPEN', () => {
    const type = NetworkTypeEnum.OPEN
    it('should render OPEN diagram successfully', async () => {
      const { asFragment } = render(<NetworkDiagram type={type} />)
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('open.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render OPEN (Cloud) diagram successfully', async () => {
      const { asFragment } = render(
        <NetworkDiagram
          type={type}
          cloudpathType={CloudpathDeploymentTypeEnum.Cloud}
        />
      )
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('open-cloudpath-cloud-deployment.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render OPEN (On Premise) diagram successfully', async () => {
      const { asFragment } = render(
        <NetworkDiagram
          type={type}
          cloudpathType={CloudpathDeploymentTypeEnum.OnPremise}
        />
      )
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('open-cloudpath-on-prem-deployment')
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('NetworkDiagram - AAA', () => {
    const type = NetworkTypeEnum.AAA
    it('should render AAA diagram successfully', async () => {
      const { asFragment } = render(<NetworkDiagram type={type} />)
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('aaa.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render AAA Proxy diagram successfully', async () => {
      const { asFragment } = render(<NetworkDiagram type={type} enableAuthProxy={true} />)
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('aaa-proxy.png')
      expect(asFragment()).toMatchSnapshot()
    })

    it('test AAA Buttons when enabling Authentication Proxy Service', async () => {
      render(
        <NetworkDiagram
          type={type}
          enableAuthProxy={true}
          showAaaButton={true}
        />
      )
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      const aaaAccButton = screen.getByRole('button', { name: 'Accounting Service' })
      await fireEvent.click(aaaAccButton)
      expect(diagram.src).toContain('aaa.png')
    })

    it('test AAA Buttons when enabling Accounting Proxy Service', async () => {
      render(
        <NetworkDiagram
          type={type}
          enableAccountingService={true}
          enableAccountingProxy={true}
          showAaaButton={true}
        />
      )
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      const aaaAccButton = screen.getByRole('button', { name: 'Accounting Service' })
      await fireEvent.click(aaaAccButton)
      expect(diagram.src).toContain('aaa-proxy.png')
    })

    it('should render AAA (Cloud) diagram successfully', async () => {
      const { asFragment } = render(
        <NetworkDiagram
          type={type}
          cloudpathType={CloudpathDeploymentTypeEnum.Cloud}
        />
      )
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('aaa-cloudpath-cloud-deployment.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render AAA (On Premise) diagram successfully', async () => {
      const { asFragment } = render(
        <NetworkDiagram
          type={type}
          cloudpathType={CloudpathDeploymentTypeEnum.OnPremise}
        />
      )
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('aaa-cloudpath-on-prem-deployment')
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('NetworkDiagram - Captive portal', () => {
    const type = NetworkTypeEnum.CAPTIVEPORTAL
    it('should render Captive portal default diagram successfully', async () => {
      const { asFragment } = render(<NetworkDiagram type={type} />)
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('click-through.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Click Through) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.ClickThrough
      const { asFragment } = render(<NetworkDiagram type={type} networkPortalType={portalType} />)
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('click-through.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Self Sign In) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.SelfSignIn
      const { asFragment } = render(<NetworkDiagram type={type} networkPortalType={portalType} />)
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('self-sign-in.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Host Approval) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.HostApproval
      const { asFragment } = render(<NetworkDiagram type={type} networkPortalType={portalType} />)
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('host-approval.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Guest Pass) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.GuestPass
      const { asFragment } = render(<NetworkDiagram type={type} networkPortalType={portalType} />)
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('guest-pass.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (WISPr) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.WISPr
      const { asFragment } = render(<NetworkDiagram type={type} networkPortalType={portalType} />)
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('wispr.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (WISPr With Psk) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.WISPr
      const { asFragment } = render(
        <NetworkDiagram
          type={type}
          networkPortalType={portalType}
          wisprWithPsk={true}
        />
      )
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('wispr-psk.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Cloudpath - Cloud) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.Cloudpath
      const { asFragment } = render(
        <NetworkDiagram
          type={type}
          networkPortalType={portalType}
          cloudpathType={CloudpathDeploymentTypeEnum.Cloud}
        />
      )
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('captive-portal-cloudpath-cloud-deployment.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Cloudpath - On Premise) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.Cloudpath
      const { asFragment } = render(
        <NetworkDiagram
          type={type}
          networkPortalType={portalType}
          cloudpathType={CloudpathDeploymentTypeEnum.OnPremise}
        />
      )
      const diagram = screen.getByAltText(NetworkTypeLabel[type])
      expect(diagram.src).toContain('captive-portal-cloudpath-on-prem-deployment.png')
      expect(asFragment()).toMatchSnapshot()
    })
  })
})