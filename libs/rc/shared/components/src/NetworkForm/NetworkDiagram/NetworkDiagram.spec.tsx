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

const params = {
  tenantId: 'tenant-id'
}
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
      </Provider>,
      {
        route: {
          params
        }
      }
    )
    const diagram = screen.getByRole('img') as HTMLImageElement
    expect(diagram.src).toContain('None')
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
        </Provider>,{
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('Psk')
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
        </Provider>, {
          route: {
            params
          }
        }
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('Aaa')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('Dpsk')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('DpskCloudpathCloudDeployment')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('DpskCloudpathOnPremDeployment')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('Open')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('OpenCloudpathCloudDeployment')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('OpenCloudpathOnPremDeployment')
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('NetworkDiagram - AAA', () => {
    const type = NetworkTypeEnum.AAA
    it('should render AAA diagram successfully', async () => {
      const { asFragment } = render(<Provider><NetworkDiagram type={type} /></Provider>)
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('Aaa')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('AaaProxy')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('AaaProxy')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('Aaa')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('AaaCloudpathCloudDeployment')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('AaaCloudpathOnPremDeployment')
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('NetworkDiagram - Hotspot20', () => {
    const type = NetworkTypeEnum.HOTSPOT20
    it('should render Hotspot20 diagram successfully', async () => {
      const { asFragment } = render(<Provider><NetworkDiagram type={type} /></Provider>)
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('Hotspot20')
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
      </Provider>, {
        route: {
          params
        }
      })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('ClickThrough')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('ClickThrough')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('SelfSignIn')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('HostApproval')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('GuestPass')
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
            <NetworkDiagram networkPortalType={portalType}
              cloudpathType={undefined} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('Wispr')
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
            <NetworkDiagram networkPortalType={portalType}
              wisprWithPsk={true}
              cloudpathType={undefined} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('WisprPsk')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('CaptivePortalCloudpathCloudDeployment')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('CaptivePortalCloudpathOnPremDeployment')
      expect(asFragment()).toMatchSnapshot()
    })
  })
})
