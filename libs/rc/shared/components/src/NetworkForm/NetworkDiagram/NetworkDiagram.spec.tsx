import '@testing-library/jest-dom'

import { GuestNetworkTypeEnum, NetworkTypeEnum, WlanSecurityEnum } from '@acx-ui/rc/utils'
import { Provider }                                                from '@acx-ui/store'
import { render, screen }                                          from '@acx-ui/test-utils'

import NetworkFormContext from '../NetworkFormContext'

import { NetworkDiagram } from './NetworkDiagram'

const params = {
  tenantId: 'tenant-id'
}
describe('NetworkDiagram', () => {

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

    it('should render DPSK authentication proxy radius diagram successfully', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram isCloudpathEnabled={true}
              enableAaaAuthBtn={true}
              enableAuthProxy={true}/>
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('DpskUsingRadius')
      expect(asFragment()).toMatchSnapshot()
    })

    it('should render DPSK authentication non-proxy radius diagram successfully', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram isCloudpathEnabled={true}
              enableAaaAuthBtn={true}
              enableAuthProxy={false}/>
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('DpskUsingRadiusNonProxy')
      expect(asFragment()).toMatchSnapshot()
    })

    it('should render DPSK accounting proxy radius diagram successfully', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram isCloudpathEnabled={true}
              enableAaaAuthBtn={false}
              enableAccountingProxy={true}/>
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('DpskUsingRadius')
      expect(asFragment()).toMatchSnapshot()
    })

    it('should render DPSK accounting non-proxy radius diagram successfully', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram isCloudpathEnabled={true}
              enableAaaAuthBtn={false}
              enableAccountingProxy={false}/>
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('DpskUsingRadiusNonProxy')
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
    it('should render Captive portal (Click Through with PSK) diagram successfully', async () => {
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
            <NetworkDiagram networkPortalType={portalType}
              wlanSecurity={WlanSecurityEnum.WPA2Personal} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('ClickThroughPsk')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Click Through with OWE) diagram successfully', async () => {
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
            <NetworkDiagram networkPortalType={portalType} wlanSecurity={WlanSecurityEnum.OWE} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('ClickThroughOwe')
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
    it('should render Captive portal (Self Sign In with PSK) diagram successfully', async () => {
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
            <NetworkDiagram networkPortalType={portalType} wlanSecurity={WlanSecurityEnum.WPA3} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('SelfSignInPsk')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Self Sign In with OWE) diagram successfully', async () => {
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
            <NetworkDiagram networkPortalType={portalType} wlanSecurity={WlanSecurityEnum.OWE} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('SelfSignInOwe')
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
    it('should render Captive portal (Host Approval with PSK) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.HostApproval
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram networkPortalType={portalType}
              wlanSecurity={WlanSecurityEnum.WPA23Mixed} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('HostApprovalPsk')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Host Approval with OWE) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.HostApproval
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram networkPortalType={portalType} wlanSecurity={WlanSecurityEnum.OWE} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('HostApprovalOwe')
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
    it('should render Captive portal (Guest Pass with PSK) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.GuestPass
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram networkPortalType={portalType}
              wlanSecurity={WlanSecurityEnum.WPA23Mixed} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('GuestPassPsk')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Guest Pass with OWE) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.GuestPass
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram networkPortalType={portalType} wlanSecurity={WlanSecurityEnum.OWE} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('GuestPassOwe')
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
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('Wispr')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (WISPr With PSK) diagram successfully', async () => {
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
              wlanSecurity={WlanSecurityEnum.WPA2Personal} />
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
    it('should render Captive portal (WISPr With OWE) diagram successfully', async () => {
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
              wlanSecurity={WlanSecurityEnum.OWE} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('WisprOwe')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (WISPr with alwaysAccept) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.WISPr
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type, cloudpathServerId: '6edb22ef74b143f280f2eb3105053840' },
            setData: jest.fn()
          }}>
            <NetworkDiagram networkPortalType={portalType} wisprWithAlwaysAccept={true} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('WisprAlwaysAccept')
      expect(asFragment()).toMatchSnapshot()
    })
    // eslint-disable-next-line max-len
    it('should render Captive portal (WISPr With alwaysAccept & PSK) diagram successfully', async () => {
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
              wisprWithAlwaysAccept={true}
              wlanSecurity={WlanSecurityEnum.WPA2Personal} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('WisprAlwaysAcceptPsk')
      expect(asFragment()).toMatchSnapshot()
    })
    // eslint-disable-next-line max-len
    it('should render Captive portal (WISPr With alwaysAccept & OWE) diagram successfully', async () => {
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
              wisprWithAlwaysAccept={true}
              wlanSecurity={WlanSecurityEnum.OWE} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('WisprAlwaysAcceptOwe')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Cloudpath) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.Cloudpath
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
      expect(diagram.src).toContain('Cloudpath')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Cloudpath with PSK) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.Cloudpath
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram networkPortalType={portalType} wlanSecurity={WlanSecurityEnum.WPA3} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('CloudpathPsk')
      expect(asFragment()).toMatchSnapshot()
    })
    it('should render Captive portal (Cloudpath with OWE) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.Cloudpath
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram networkPortalType={portalType} wlanSecurity={WlanSecurityEnum.OWE} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('CloudpathOwe')
      expect(asFragment()).toMatchSnapshot()
    })


    it('should render Captive portal (Cloudpath with proxy) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.Cloudpath
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type, enableAuthProxy: true },
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
      expect(diagram.src).toContain('CloudpathProxy')
      expect(asFragment()).toMatchSnapshot()
    })
    // eslint-disable-next-line max-len
    it('should render Captive portal (Cloudpath with proxy & PSK) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.Cloudpath
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type, enableAuthProxy: true },
            setData: jest.fn()
          }}>
            <NetworkDiagram networkPortalType={portalType} wlanSecurity={WlanSecurityEnum.WPA3} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('CloudpathProxyPsk')
      expect(asFragment()).toMatchSnapshot()
    })
    // eslint-disable-next-line max-len
    it('should render Captive portal (Cloudpath with proxy & OWE) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.Cloudpath
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            data: { type, enableAuthProxy: true },
            setData: jest.fn()
          }}>
            <NetworkDiagram networkPortalType={portalType} wlanSecurity={WlanSecurityEnum.OWE} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('CloudpathProxyOwe')
      expect(asFragment()).toMatchSnapshot()
    })
  })
})
