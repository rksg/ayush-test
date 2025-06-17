import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { GuestNetworkTypeEnum, NetworkTypeEnum, WisprSecurityEnum, WlanSecurityEnum } from '@acx-ui/rc/utils'
import { Provider }                                                                   from '@acx-ui/store'
import { render, screen }                                                             from '@acx-ui/test-utils'

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
          isRuckusAiMode: false,
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
            isRuckusAiMode: false,
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

    it('should render PSK Mac Auth with proxy diagram successfully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={type}
              enableMACAuth={true}
              isMacRegistrationList={true}
              enableAccountingService={true}
              enableAccountingProxy={true}
            />
          </NetworkFormContext.Provider>
        </Provider>,{
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('PskMacAuthProxy')
    })

    it('should render PSK external Mac Auth with proxy diagram successfully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={type}
              enableMACAuth={true}
              isMacRegistrationList={false}
              enableAccountingService={true}
              enableAccountingProxy={true}
            />
          </NetworkFormContext.Provider>
        </Provider>,{
          route: {
            params
          }
        })
      const acctButton = screen.getByRole('button', { name: 'Accounting Service' })
      await userEvent.click(acctButton)
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('AaaProxy')
    })

    it('should render PSK non proxy diagram successfully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={type}
              enableMACAuth={false}
              isMacRegistrationList={false}
              enableAccountingService={true}
              enableAccountingProxy={false}
            />
          </NetworkFormContext.Provider>
        </Provider>,{
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('Aaa')
    })

    it('should render AAA diagram successfully', async () => {
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
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
            isRuckusAiMode: false,
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
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              isCloudpathEnabled={true}
              enableAaaAuthBtn={true}
              enableAuthProxy={true}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('DpskCloudpathProxy')
    })

    it('should render DPSK authentication non-proxy radius diagram successfully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              isCloudpathEnabled={true}
              enableAaaAuthBtn={true}
              enableAuthProxy={false}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('DpskAaa')
    })

    it('should render DPSK accounting proxy radius diagram successfully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={type}
              isCloudpathEnabled={true}
              wlanSecurity={WlanSecurityEnum.WPA2Personal}
              enableAccountingService={true}
              enableAccountingProxy={true}
              enableAuthProxy={false}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const acctButton = screen.getByRole('button', { name: 'Accounting Service' })
      await userEvent.click(acctButton)

      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('DpskCloudpathProxy')
    })

    it('should render DPSK accounting non-proxy radius diagram successfully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={type}
              isCloudpathEnabled={true}
              wlanSecurity={WlanSecurityEnum.WPA2Personal}
              enableAccountingService={true}
              enableAccountingProxy={false}
              enableAuthProxy={false}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('DpskAaa')
    })

    it('should render use DPSK accounting proxy radius diagram successfully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={type}
              isCloudpathEnabled={false}
              wlanSecurity={WlanSecurityEnum.WPA2Personal}
              enableAccountingService={true}
              enableAccountingProxy={true}
              enableAuthProxy={false}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('DpskAaaProxy')
    })

    it('should render DPSK3 accounting non-proxy radius diagram successfully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={type}
              isCloudpathEnabled={true}
              wlanSecurity={WlanSecurityEnum.WPA23Mixed}
              enableAccountingService={true}
              enableAccountingProxy={true}
              enableAuthProxy={false}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })

      const acctButton = screen.getByRole('button', { name: 'Accounting Service' })
      await userEvent.click(acctButton)
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('DpskCloudpathProxy')
    })
  })

  describe('NetworkDiagram - OPEN', () => {
    const type = NetworkTypeEnum.OPEN
    it('should render OPEN diagram successfully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={type}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('Open')
    })

    it('should render OPEN OWE diagram successfully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={type}
              enableOwe={true}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('OpenOwe')
    })

    it('should render OPEN OWE Mac Auth Registration List diagram successfully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={type}
              enableOwe={true}
              enableMACAuth={true}
              isMacRegistrationList={true}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('OpenOweMacreg')
    })

    // eslint-disable-next-line max-len
    it('should render OPEN Mac Auth Registration List Accounting proxy diagram successfully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={type}
              enableOwe={false}
              enableMACAuth={true}
              isMacRegistrationList={true}
              enableAccountingService={true}
              enableAccountingProxy={true}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('OpenMacregAaaProxy')
    })

    // eslint-disable-next-line max-len
    it('should render OPEN External Mac Auth Auth non proxy and Accounting proxy diagram successfully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={type}
              enableOwe={false}
              enableMACAuth={true}
              isMacRegistrationList={false}
              enableAccountingService={true}
              enableAccountingProxy={true}
              enableAuthProxy={false}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('OpenAaa')

      const acctButton = screen.getByRole('button', { name: 'Accounting Service' })
      await userEvent.click(acctButton)
      expect(diagram.src).toContain('OpenAaaProxy')
    })
  })

  describe('NetworkDiagram - AAA', () => {
    const type = NetworkTypeEnum.AAA
    it('should render AAA diagram successfully', async () => {
      render(
        <Provider><NetworkDiagram type={type} /></Provider>
      )
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('Aaa')
    })
    it('should render AAA Proxy diagram successfully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={type}
              enableAuthProxy={true}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })

      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('AaaProxy')
    })

    // eslint-disable-next-line max-len
    it('should render AAA Proxy diagram when Auth and Accounting proxy mode not the same', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={type}
              enableAuthProxy={true}
              enableAccountingService={true}
              enableAccountingProxy={false}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })

      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('AaaProxy')

      const acctButton = screen.getByRole('button', { name: 'Accounting Service' })
      await userEvent.click(acctButton)
      expect(diagram.src).toContain('Aaa')
    })

    it('should render AAA Proxy Cert template Accounting proxy diagram successfully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={type}
              useCertificateTemplate={true}
              enableAccountingService={true}
              enableAccountingProxy={true}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })

      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('AaaCertAaaProxy')
    })

    it('should render AAA Proxy Cert template diagram successfully', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={type}
              useCertificateTemplate={true}
              enableAccountingService={false}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })

      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('AaaCert')
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
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: {
              type
            },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              networkPortalType={portalType}
              enableAccountingService={true}
              networkSecurity={'NONE'}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('SelfSignInAaa')
    })
    it('should render Captive portal (Self Sign In with PSK) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.SelfSignIn
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: {
              type
            },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={NetworkTypeEnum.CAPTIVEPORTAL}
              networkPortalType={portalType}
              wlanSecurity={WlanSecurityEnum.WPA3}
              networkSecurity={'PSK'}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('SelfSignInPsk')
    })
    it('should render Captive portal (Self Sign In with OWE) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.SelfSignIn
      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: {
              type
            },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              type={NetworkTypeEnum.CAPTIVEPORTAL}
              networkPortalType={portalType}
              wlanSecurity={WlanSecurityEnum.OWE}
              networkSecurity={'OWE'}
            />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('SelfSignInOwe')
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

    it('should render Captive portal (Workflow) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.Workflow
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
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
      expect(diagram.src).toContain('WorkflowAcctoffNone')
      expect(asFragment()).toMatchSnapshot()
    })

    it('should render Captive portal (Workflow with PSK) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.Workflow
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              networkPortalType={portalType}
              wlanSecurity={WlanSecurityEnum.WPA2Personal} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('WorkflowAcctoffPsk')
      expect(asFragment()).toMatchSnapshot()
    })

    it('should render Captive portal (Workflow with OWE) diagram successfully', async () => {
      const portalType = GuestNetworkTypeEnum.Workflow
      const { asFragment } = render(
        <Provider>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: { type },
            setData: jest.fn()
          }}>
            <NetworkDiagram
              networkPortalType={portalType}
              wlanSecurity={WlanSecurityEnum.OWE} />
          </NetworkFormContext.Provider>
        </Provider>, {
          route: {
            params
          }
        })
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('WorkflowAcctoffOwe')
      expect(asFragment()).toMatchSnapshot()
    })

    it('should render Captive portal (Workflow with accounting service) diagram successfully',
      async () => {
        const portalType = GuestNetworkTypeEnum.Workflow
        const { asFragment } = render(
          <Provider>
            <NetworkFormContext.Provider value={{
              editMode: false,
              cloneMode: false,
              isRuckusAiMode: false,
              data: { type, enableAccountingService: true },
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
        expect(diagram.src).toContain('WorkflowAcctonNone')
        expect(asFragment()).toMatchSnapshot()
      })

    // eslint-disable-next-line max-len
    it('should render Captive portal (Workflow with accounting service and PSK) diagram successfully',
      async () => {
        const portalType = GuestNetworkTypeEnum.Workflow
        const { asFragment } = render(
          <Provider>
            <NetworkFormContext.Provider value={{
              editMode: false,
              cloneMode: false,
              isRuckusAiMode: false,
              data: { type, enableAccountingService: true },
              setData: jest.fn()
            }}>
              <NetworkDiagram
                networkPortalType={portalType}
                wlanSecurity={WlanSecurityEnum.WPA2Personal} />
            </NetworkFormContext.Provider>
          </Provider>, {
            route: {
              params
            }
          })
        const diagram = screen.getByRole('img') as HTMLImageElement
        expect(diagram.src).toContain('WorkflowAcctonPsk')
        expect(asFragment()).toMatchSnapshot()
      })
    // eslint-disable-next-line max-len
    it('should render Captive portal (Workflow with accounting service and OWE) diagram successfully',
      async () => {
        const portalType = GuestNetworkTypeEnum.Workflow
        const { asFragment } = render(
          <Provider>
            <NetworkFormContext.Provider value={{
              editMode: false,
              cloneMode: false,
              isRuckusAiMode: false,
              data: { type, enableAccountingService: true },
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
        expect(diagram.src).toContain('WorkflowAcctonOwe')
        expect(asFragment()).toMatchSnapshot()
      })
    // eslint-disable-next-line max-len
    it('should render Captive portal (Workflow with accounting proxy) diagram successfully',
      async () => {
        const portalType = GuestNetworkTypeEnum.Workflow
        const { asFragment } = render(
          <Provider>
            <NetworkFormContext.Provider value={{
              editMode: false,
              cloneMode: false,
              isRuckusAiMode: false,
              data: { type, enableAccountingProxy: true },
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
        expect(diagram.src).toContain('WorkflowAcctproxyNone')
        expect(asFragment()).toMatchSnapshot()
      })
    // eslint-disable-next-line max-len
    it('should render Captive portal (Workflow with accounting proxy and PSK) diagram successfully',
      async () => {
        const portalType = GuestNetworkTypeEnum.Workflow
        const { asFragment } = render(
          <Provider>
            <NetworkFormContext.Provider value={{
              editMode: false,
              cloneMode: false,
              isRuckusAiMode: false,
              data: { type, enableAccountingProxy: true },
              setData: jest.fn()
            }}>
              <NetworkDiagram
                networkPortalType={portalType}
                wlanSecurity={WlanSecurityEnum.WPA2Personal} />
            </NetworkFormContext.Provider>
          </Provider>, {
            route: {
              params
            }
          })
        const diagram = screen.getByRole('img') as HTMLImageElement
        expect(diagram.src).toContain('WorkflowAcctproxyPsk')
        expect(asFragment()).toMatchSnapshot()
      })
    // eslint-disable-next-line max-len
    it('should render Captive portal (Workflow with accounting proxy and OWE) diagram successfully',
      async () => {
        const portalType = GuestNetworkTypeEnum.Workflow
        const { asFragment } = render(
          <Provider>
            <NetworkFormContext.Provider value={{
              editMode: false,
              cloneMode: false,
              isRuckusAiMode: false,
              data: { type, enableAccountingProxy: true },
              setData: jest.fn()
            }}>
              <NetworkDiagram
                networkPortalType={portalType}
                wlanSecurity={WlanSecurityEnum.OWE} />
            </NetworkFormContext.Provider>
          </Provider>, {
            route: {
              params
            }
          })
        const diagram = screen.getByRole('img') as HTMLImageElement
        expect(diagram.src).toContain('WorkflowAcctproxyOwe')
        expect(asFragment()).toMatchSnapshot()
      })
  })
})
