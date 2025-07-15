import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'


import { Features, useIsSplitOn }                                                                      from '@acx-ui/feature-toggle'
import { AaaUrls, CertificateUrls, CommonUrlsInfo, MacRegListUrlsInfo, NetworkSaveData, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                                    from '@acx-ui/store'
import { act, mockServer, render, screen, fireEvent, waitForElementToBeRemoved, within, waitFor }      from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                                                from '@acx-ui/user'

import { certificateAuthorityList, certificateTemplateList } from '../../policies/CertificateTemplate/__test__/fixtures'
import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  networkDeepResponse,
  mockAAAPolicyListResponse,
  mockMacRegistrationPoolList
} from '../__tests__/fixtures'
import { MLOContext, NetworkForm } from '../NetworkForm'
import NetworkFormContext          from '../NetworkFormContext'

import { AaaSettingsForm, resolveMacAddressAuthenticationConfiguration } from './AaaSettingsForm'

jest.mock('react-intl', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })

  return {
    ...reactIntl,
    useIntl: () => intl
  }
})
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  useNetworkVxLanTunnelProfileInfo: jest.fn().mockReturnValue({
    enableTunnel: false,
    enableVxLan: false,
    vxLanTunnels: undefined
  })
}))
jest.mock('../../ApCompatibility', () => ({
  ...jest.requireActual('../../ApCompatibility'),
  ApCompatibilityToolTip: () => <div data-testid={'ApCompatibilityToolTip'} />,
  ApCompatibilityDrawer: () => <div data-testid={'ApCompatibilityDrawer'} />
}))
jest.mock('./SharedComponent/IdentityGroup/IdentityGroup', () => ({
  IdentityGroup: () => <div data-testid={'rc-IdentityGroupSelector'} />
}))
jest.mocked(useIsSplitOn).mockReturnValue(true) // mock AAA policy

let mockedCertTemplateModalCallback: (id: string) => void
jest.mock('../../policies', () => ({
  ...jest.requireActual('../../policies'),
  CertificateTemplateForm: ({ modalCallBack }: { modalCallBack: (id: string) => void }) => {
    mockedCertTemplateModalCallback = modalCallBack
    return <div data-testid='mock-certificate-template-form' />
  }
}))


async function fillInBeforeSettings (networkName: string) {
  const insertInput = screen.getByLabelText(/Network Name/)
  fireEvent.change(insertInput, { target: { value: networkName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })
  await userEvent.click(screen.getByRole('radio', { name: /802.1X standard/ }))
  await userEvent.click(screen.getByText('Next'))
  await screen.findByRole('heading', { level: 3, name: 'AAA Settings' })
  await userEvent.click((await screen.findAllByRole('combobox'))[1])
  await userEvent.click((await screen.findAllByTitle('test1'))[0])
}

async function fillInAfterSettings (checkSummary: Function) {
  await userEvent.click(screen.getByText('Next'))
  await screen.findByRole('heading', { level: 3, name: 'Venues' })
  await userEvent.click(screen.getByText('Next'))
  await screen.findByRole('heading', { level: 3, name: 'Summary' })

  checkSummary()
  const finish = screen.getByText('Finish')
  await userEvent.click(finish)
  await waitForElementToBeRemoved(finish)
}

describe('NetworkForm', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'AAA network test'
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(WifiUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.post(AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(mockAAAPolicyListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.post(CertificateUrls.getCertificateTemplates.url,
        (_, res, ctx) => res(ctx.json(certificateTemplateList))),
      rest.post(CertificateUrls.getCAs.url,
        (_, res, ctx) => res(ctx.json(certificateAuthorityList))),
      rest.post(AaaUrls.queryAAAPolicyList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.get(MacRegListUrlsInfo.getMacRegistrationPools.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(mockMacRegistrationPoolList)))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  it.skip('should create AAA network successfully', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })
    await fillInBeforeSettings('AAA network test')
    await userEvent.click((await screen.findAllByRole('combobox'))[0])
    await userEvent.click((await screen.findAllByTitle('test1'))[0])
    const toggle = screen.getAllByRole('switch')
    fireEvent.click(toggle[0])
    fireEvent.click(toggle[0])
    await fillInAfterSettings(async () => {
    })
  })

  it.skip('should render Network AAA diagram with AAA buttons', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('AAA network test')

    let toggle = screen.getAllByRole('switch', { checked: false })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await userEvent.click(toggle[0]) // Proxy Service
      await userEvent.click(toggle[1]) // Accounting Service
    })

    let diagram: HTMLImageElement[] = screen.getAllByAltText('Enterprise AAA (802.1X)')
    let authBtn = screen.getByRole('button', { name: 'Authentication Service' })
    let accBtn = screen.getByRole('button', { name: 'Accounting Service' })
    expect(authBtn).toBeVisible()
    expect(authBtn).toBeDisabled()
    expect(accBtn).toBeVisible()
    expect(diagram[1].src).toContain('aaa.png')

    await userEvent.click(accBtn)
    diagram = screen.getAllByAltText('Enterprise AAA (802.1X)')
    authBtn = screen.getByRole('button', { name: 'Authentication Service' })
    expect(diagram[1].src).toContain('aaa.png')
    expect(accBtn).not.toBeDisabled()

    await userEvent.click(authBtn)
    diagram = screen.getAllByAltText('Enterprise AAA (802.1X)')
    expect(diagram[1].src).toContain('aaa.png')
  })

  it('should render AAA Network successfully with mac address format', async () => {
    render(<Provider>
      <MLOContext.Provider value={{
        isDisableMLO: true,
        disableMLO: jest.fn
      }}>
        <Form>
          <AaaSettingsForm />
        </Form>
      </MLOContext.Provider>
    </Provider>, { route: { params } })

    const macAuthenticationSwitch = await screen.findByTestId('macAuth8021x')
    expect(macAuthenticationSwitch).toBeVisible()
    await userEvent.click(macAuthenticationSwitch)
    expect(await screen.findByText(/MAC Address Format/i)).toBeInTheDocument()
    expect(await screen.findByText('AA-BB-CC-DD-EE-FF')).toBeVisible()
  })

  it('should render AAA Network with R370 compatibility tooltip', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider>
      <MLOContext.Provider value={{
        isDisableMLO: true,
        disableMLO: jest.fn
      }}>
        <Form>
          <AaaSettingsForm />
        </Form>
      </MLOContext.Provider>
    </Provider>, { route: { params } })

    const toolTips = await screen.findAllByTestId('ApCompatibilityToolTip')
    expect(toolTips.length).toBe(1)
    toolTips.forEach(t => expect(t).toBeVisible())
    expect(await screen.findByTestId('ApCompatibilityDrawer')).toBeVisible()
  })

  it('should render correctly when certificateTemplate enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CERTIFICATE_TEMPLATE)

    render(<Provider>
      <MLOContext.Provider value={{
        isDisableMLO: true,
        disableMLO: jest.fn
      }}>
        <Form>
          <AaaSettingsForm />
        </Form>
      </MLOContext.Provider>
    </Provider>, { route: { params } })

    await screen.findByText('Use External AAA Service')
    const useCertRadio = await screen.findByLabelText('Use Certificate Auth')
    await userEvent.click(useCertRadio)
    expect(await screen.findByText('Certificate Template')).toBeVisible()
    await userEvent.click(await screen.findByText('Add'))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Add Certificate Template')).toBeVisible()

    // Mock modal callback
    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    mockedCertTemplateModalCallback('new-cert-template-id')

    await waitFor(() => expect(dialog).not.toBeVisible())

    // Verify autofill id into the form
    expect(await screen.findByText('new-cert-template-id')).toBeVisible()
  })

  it('should render correctly when multiple certificate template enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CERTIFICATE_TEMPLATE
      || ff === Features.MULTIPLE_CERTIFICATE_TEMPLATE)

    render(<Provider>
      <MLOContext.Provider value={{
        isDisableMLO: true,
        disableMLO: jest.fn
      }}>
        <Form>
          <AaaSettingsForm />
        </Form>
      </MLOContext.Provider>
    </Provider>, { route: { params } })

    await screen.findByText('Use External AAA Service')
    const useCertRadio = await screen.findByLabelText('Use Certificate Auth')
    await userEvent.click(useCertRadio)
    expect(await screen.findByText('Certificate Template')).toBeVisible()
    await userEvent.click(await screen.findByText('Add'))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Add Certificate Template')).toBeVisible()

    // Mock modal callback
    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    mockedCertTemplateModalCallback('new-cert-template-id-1')
    mockedCertTemplateModalCallback('new-cert-template-id-2')

    await waitFor(() => expect(dialog).not.toBeVisible())

    // Verify autofill ids into the form
    expect(await screen.findByText('new-cert-template-id-1')).toBeVisible()
    expect(await screen.findByText('new-cert-template-id-2')).toBeVisible()
  })

  it('should render correctly when certificateTemplate disabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.CERTIFICATE_TEMPLATE)
    render(<Provider>
      <MLOContext.Provider value={{
        isDisableMLO: true,
        disableMLO: jest.fn
      }}>
        <Form>
          <AaaSettingsForm />
        </Form>
      </MLOContext.Provider>
    </Provider>, { route: { params } })

    expect(screen.queryByText('Use Certificate Auth')).not.toBeInTheDocument()
    expect(screen.queryByText('Use External AAA Service')).not.toBeInTheDocument()
  })

  // eslint-disable-next-line max-len
  it('should render correctly when certificateTemplate enabled and enable accounting service', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(
      ff => ff === Features.CERTIFICATE_TEMPLATE ||
      ff === Features.WIFI_NETWORK_RADIUS_ACCOUNTING_TOGGLE
    )

    render(<Provider>
      <MLOContext.Provider value={{
        isDisableMLO: true,
        disableMLO: jest.fn
      }}>
        <Form>
          <AaaSettingsForm />
        </Form>
      </MLOContext.Provider>
    </Provider>, { route: { params } })

    await screen.findByText('Use External AAA Service')
    const useCertRadio = await screen.findByLabelText('Use Certificate Auth')
    await userEvent.click(useCertRadio)
    expect(await screen.findByText('Certificate Template')).toBeVisible()
    await userEvent.click(await screen.findByText('Add'))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Add Certificate Template')).toBeVisible()
    expect(screen.getByText('Accounting Service')).toBeInTheDocument()
  })

  describe('MAC Registration List', () => {
    // eslint-disable-next-line max-len
    it('should show MAC registration list options when MAC authentication is enabled and feature is enabled', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.WIFI_DOT1X_WITH_MAC_REGISTRATION_ENABLED
      )

      render(<Provider>
        <MLOContext.Provider value={{
          isDisableMLO: true,
          disableMLO: jest.fn
        }}>
          <Form>
            <AaaSettingsForm />
          </Form>
        </MLOContext.Provider>
      </Provider>, { route: { params } })

      const macAuthSwitch = await screen.findByTestId('macAuth8021x')
      await userEvent.click(macAuthSwitch)

      // Should show MAC registration options
      expect(await screen.findByText('MAC Registration List')).toBeInTheDocument()
      expect(await screen.findByText('External MAC Auth')).toBeInTheDocument()
    })

    it('should not show MAC registration list options when feature is disabled', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff !== Features.WIFI_DOT1X_WITH_MAC_REGISTRATION_ENABLED
      )

      render(<Provider>
        <MLOContext.Provider value={{
          isDisableMLO: true,
          disableMLO: jest.fn
        }}>
          <Form>
            <AaaSettingsForm />
          </Form>
        </MLOContext.Provider>
      </Provider>, { route: { params } })

      const macAuthSwitch = await screen.findByTestId('macAuth8021x')
      await userEvent.click(macAuthSwitch)

      // Should not show MAC registration options
      expect(screen.queryByText('MAC Registration List')).not.toBeInTheDocument()
      expect(screen.queryByText('External MAC Auth')).not.toBeInTheDocument()
    })

    // eslint-disable-next-line max-len
    it('should not show MAC registration list options when MAC authentication is disabled', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.WIFI_DOT1X_WITH_MAC_REGISTRATION_ENABLED
      )

      render(<Provider>
        <MLOContext.Provider value={{
          isDisableMLO: true,
          disableMLO: jest.fn
        }}>
          <Form>
            <AaaSettingsForm />
          </Form>
        </MLOContext.Provider>
      </Provider>, { route: { params } })

      // MAC authentication is disabled by default
      expect(screen.queryByText('MAC Registration List')).not.toBeInTheDocument()
      expect(screen.queryByText('External MAC Auth')).not.toBeInTheDocument()
    })

    // eslint-disable-next-line max-len
    it('should show MAC registration list component when MAC registration list is selected', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.WIFI_DOT1X_WITH_MAC_REGISTRATION_ENABLED
      )

      render(<Provider>
        <MLOContext.Provider value={{
          isDisableMLO: true,
          disableMLO: jest.fn
        }}>
          <Form>
            <AaaSettingsForm />
          </Form>
        </MLOContext.Provider>
      </Provider>, { route: { params } })

      const macAuthSwitch = await screen.findByTestId('macAuth8021x')
      await userEvent.click(macAuthSwitch)

      // Select MAC Registration List
      const macRegistrationRadio = await screen.findByLabelText('MAC Registration List')
      await userEvent.click(macRegistrationRadio)

      // Should show MAC registration list component
      expect(await screen.findByText('Select MAC Registration List')).toBeInTheDocument()
    })

    it('should disable MAC authentication switch in edit mode', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.WIFI_DOT1X_WITH_MAC_REGISTRATION_ENABLED
      )

      render(<Provider>
        <MLOContext.Provider value={{
          isDisableMLO: true,
          disableMLO: jest.fn
        }}>
          <NetworkFormContext.Provider value={{
            editMode: true,
            cloneMode: false,
            isRuckusAiMode: false,
            data: null,
            setData: jest.fn()
          }}>
            <Form>
              <AaaSettingsForm />
            </Form>
          </NetworkFormContext.Provider>
        </MLOContext.Provider>
      </Provider>, { route: { params } })

      // In edit mode, the MAC authentication switch should be disabled
      const macAuthSwitch = await screen.findByTestId('macAuth8021x')
      expect(macAuthSwitch).toBeDisabled()
    })

    // eslint-disable-next-line max-len
    it('should hide identity group selector when MAC registration list is selected', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.WIFI_DOT1X_WITH_MAC_REGISTRATION_ENABLED ||
        ff === Features.WIFI_IDENTITY_AND_IDENTITY_GROUP_MANAGEMENT_TOGGLE ||
        ff === Features.CERTIFICATE_TEMPLATE
      )

      render(<Provider>
        <MLOContext.Provider value={{
          isDisableMLO: true,
          disableMLO: jest.fn
        }}>
          <NetworkFormContext.Provider value={{
            editMode: false,
            cloneMode: false,
            isRuckusAiMode: false,
            data: null,
            setData: jest.fn()
          }}>
            <Form>
              <AaaSettingsForm />
            </Form>
          </NetworkFormContext.Provider>
        </MLOContext.Provider>
      </Provider>, { route: { params } })

      // Enable MAC authentication
      const macAuthSwitch = await screen.findByTestId('macAuth8021x')
      await userEvent.click(macAuthSwitch)

      // Initially, identity group selector should be visible
      expect(screen.getByTestId('rc-IdentityGroupSelector')).toBeInTheDocument()

      // Select MAC Registration List
      const macRegistrationRadio = await screen.findByLabelText('MAC Registration List')
      await userEvent.click(macRegistrationRadio)

      // Identity group selector should be hidden when MAC registration list is selected
      expect(screen.queryByTestId('rc-IdentityGroupSelector')).not.toBeInTheDocument()
    })

    // eslint-disable-next-line max-len
    it('should correctly select MAC registration list and radio in edit mode when macRegistrationListId is defined', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.WIFI_DOT1X_WITH_MAC_REGISTRATION_ENABLED
      )

      const mockData = {
        wlan: {
          macAddressAuthentication: true,
          macRegistrationListId: 'test-mac-registration-list-id',
          macAddressAuthenticationConfiguration: {
            macAddressAuthentication: true
          }
        }
      }

      render(<Provider>
        <MLOContext.Provider value={{
          isDisableMLO: true,
          disableMLO: jest.fn
        }}>
          <NetworkFormContext.Provider value={{
            editMode: true,
            cloneMode: false,
            isRuckusAiMode: false,
            data: mockData,
            setData: jest.fn()
          }}>
            <Form>
              <AaaSettingsForm />
            </Form>
          </NetworkFormContext.Provider>
        </MLOContext.Provider>
      </Provider>, { route: { params } })

      // In edit mode with macRegistrationListId defined, MAC authentication should be enabled
      const macAuthSwitch = await screen.findByTestId('macAuth8021x')
      expect(macAuthSwitch).toBeChecked()

      // MAC Registration List radio should be selected
      const macRegistrationRadio = await screen.findByLabelText('MAC Registration List')
      expect(macRegistrationRadio).toBeChecked()

      // External MAC Auth radio should not be selected
      const externalMacAuthRadio = await screen.findByLabelText('External MAC Auth')
      expect(externalMacAuthRadio).not.toBeChecked()

      // MAC registration list component should be visible
      expect(await screen.findByText('Select MAC Registration List')).toBeInTheDocument()
    })
  })

  describe('resolveMacAddressAuthenticationConfiguration', () => {
    it('should return the original value when isWifiRbacEnabled is false', () => {
      const mockData: NetworkSaveData = {
        wlan: {
          macAddressAuthenticationConfiguration: { macAddressAuthentication: true }
        }
      }

      const result = resolveMacAddressAuthenticationConfiguration(mockData, false)

      expect(result).toEqual({ macAddressAuthentication: true })
    })

    it('should merge macAddressAuthentication when isWifiRbacEnabled is true', () => {
      const mockData: NetworkSaveData = {
        wlan: {
          macAddressAuthentication: false,
          macAddressAuthenticationConfiguration: { macAuthMacFormat: 'Upper' }
        }
      }

      const result = resolveMacAddressAuthenticationConfiguration(mockData, true)

      expect(result).toEqual({
        macAddressAuthentication: false,
        macAuthMacFormat: 'Upper'
      })
    })

    it('should handle undefined macAddressAuthenticationConfiguration and wlan gracefully', () => {
      const mockData: NetworkSaveData = {
        wlan: {
          macAddressAuthentication: true
        }
      }

      const result = resolveMacAddressAuthenticationConfiguration(mockData, true)

      expect(result).toEqual({
        macAddressAuthentication: true
      })
    })

    // eslint-disable-next-line max-len
    it('should return undefined if wlan and macAddressAuthenticationConfiguration are both undefined and isWifiRbacEnabled is false', () => {
      const mockData: NetworkSaveData = {}

      const result = resolveMacAddressAuthenticationConfiguration(mockData, false)

      expect(result).toBeUndefined()
    })
  })
})
