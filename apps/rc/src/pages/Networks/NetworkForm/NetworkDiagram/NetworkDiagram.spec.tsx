import '@testing-library/jest-dom'

import { rest } from 'msw'

import { CloudpathDeploymentTypeEnum, CommonUrlsInfo, GuestNetworkTypeEnum, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { Provider }                                                                           from '@acx-ui/store'
import { mockServer, render, screen }                                                         from '@acx-ui/test-utils'

import NetworkFormContext from '../NetworkFormContext'

import { NetworkDiagram } from './NetworkDiagram'

const cloudpathResponse = [{
  deploymentType: 'OnPremise',
  id: '6edb22ef74b143f280f2eb3105053840',
  name: 'cloud_02'
}, {
  deploymentType: 'Cloud',
  id: '5cc1d4a21c4d41b8ab1a839a0e03cc8c',
  name: 'cloud_01'
}]
describe('NetworkDiagram', () => {

  beforeEach(() => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json(cloudpathResponse)))
    )
  })
  it('should render default diagram successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <NetworkFormContext.Provider value={{
          editMode: false,
          cloneMode: false,
          data: { type: undefined },
          setData: jest.fn()
        }}>
          <NetworkDiagram />
        </NetworkFormContext.Provider>
      </Provider>)
    const diagram = screen.getByRole('img') as HTMLImageElement
    expect(diagram.src).toContain('none.png')
    expect(asFragment()).toMatchSnapshot()
  })

  describe('NetworkDiagram - PSK', () => {
    const type = NetworkTypeEnum.PSK
    it('should render PSK diagram successfully', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram />
          </NetworkFormContext.Provider>
        </Provider>)
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('psk.png')
      expect(asFragment()).toMatchSnapshot()
    })

    it('should render AAA diagram successfully', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type: NetworkTypeEnum.AAA },
            setData: jest.fn()
          }}>
            <NetworkDiagram enableMACAuth={true} />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('aaa.png')
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('NetworkDiagram - DPSK', () => {
    const type = NetworkTypeEnum.DPSK
    it('should render DPSK diagram successfully', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram />
          </NetworkFormContext.Provider>
        </Provider>)
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('dpsk.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render DPSK (Cloud) diagram successfully', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram cloudpathType={CloudpathDeploymentTypeEnum.Cloud} />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('dpsk-cloudpath-cloud-deployment.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render DPSK (On Premise) diagram successfully', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram cloudpathType={CloudpathDeploymentTypeEnum.OnPremise}
            />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('dpsk-cloudpath-on-prem-deployment')
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('NetworkDiagram - OPEN', () => {
    const type = NetworkTypeEnum.OPEN
    it('should render OPEN diagram successfully', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('open.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render OPEN (Cloud) diagram successfully', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              cloudpathType={CloudpathDeploymentTypeEnum.Cloud}
            />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('open-cloudpath-cloud-deployment.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render OPEN (On Premise) diagram successfully', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              cloudpathType={CloudpathDeploymentTypeEnum.OnPremise}
            />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('open-cloudpath-on-prem-deployment')
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('NetworkDiagram - AAA', () => {
    const type = NetworkTypeEnum.AAA
    it('should render AAA diagram successfully', async () => {
      const { asFragment } = render(<Provider><NetworkDiagram type={type} /></Provider>)
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('aaa.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render AAA Proxy diagram successfully', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram enableAuthProxy={true} />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('aaa-proxy.png')
      expect(asFragment()).toMatchSnapshot()
    })

    it('should render AAA Proxy diagram when enabling Authentication Service button', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              enableAuthProxy={true}
              enableAccountingProxy={false}
              enableAaaAuthBtn={true}
              showButtons={true}
            />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('aaa-proxy.png')
      expect(asFragment()).toMatchSnapshot()
    })

    it('should render AAA diagram when enabling Accounting Service button', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              enableAuthProxy={true}
              enableAccountingProxy={false}
              enableAaaAuthBtn={false}
              showButtons={true}
            />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('aaa.png')
      expect(asFragment()).toMatchSnapshot()
    })

    it('should render AAA (Cloud) diagram successfully', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              cloudpathType={CloudpathDeploymentTypeEnum.Cloud}
            />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('aaa-cloudpath-cloud-deployment.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render AAA (On Premise) diagram successfully', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              cloudpathType={CloudpathDeploymentTypeEnum.OnPremise}
            />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('aaa-cloudpath-on-prem-deployment')
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('NetworkDiagram - Captive portal', () => {
    const type = NetworkTypeEnum.CAPTIVEPORTAL
    it('should render Captive portal default diagram successfully', async () => {
      const { asFragment } = render(<Provider>
        <NetworkFormContext.Provider value={{
          editMode: false,
          cloneMode: false,
          data: { type },
          setData: jest.fn()
        }}><NetworkDiagram /></NetworkFormContext.Provider>
      </Provider>)
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('click-through.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Click Through) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.ClickThrough
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: {
              type
            },
            setData: jest.fn()
          }}>
            <NetworkDiagram networkPortalType={portalType} />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('click-through.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Self Sign In) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.SelfSignIn
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: {
              type
            },
            setData: jest.fn()
          }}>
            <NetworkDiagram networkPortalType={portalType} />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('self-sign-in.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Host Approval) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.HostApproval
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram networkPortalType={portalType} />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('host-approval.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Guest Pass) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.GuestPass
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram networkPortalType={portalType} />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('guest-pass.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (WISPr) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.WISPr
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type, cloudpathServerId: '6edb22ef74b143f280f2eb3105053840' },
            setData: jest.fn()
          }}>
            <NetworkDiagram networkPortalType={portalType} />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('wispr.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (WISPr With Psk) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.WISPr
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type, cloudpathServerId: '6edb22ef74b143f280f2eb3105053840' },
            setData: jest.fn()
          }}>
            <NetworkDiagram networkPortalType={portalType} wisprWithPsk={true} />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('wispr-psk.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Cloudpath - Cloud) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.Cloudpath
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type, cloudpathServerId: '5cc1d4a21c4d41b8ab1a839a0e03cc8c' },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              networkPortalType={portalType}
              cloudpathType={CloudpathDeploymentTypeEnum.Cloud}
            />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('captive-portal-cloudpath-cloud-deployment.png')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Cloudpath - On Premise) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.Cloudpath
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type, cloudpathServerId: '6edb22ef74b143f280f2eb3105053840' },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              networkPortalType={portalType}
              cloudpathType={CloudpathDeploymentTypeEnum.OnPremise}
            />
          </NetworkFormContext.Provider>
        </Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('captive-portal-cloudpath-on-prem-deployment.png')
      expect(asFragment()).toMatchSnapshot()
    })
  })
})
