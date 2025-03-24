import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'


import { Features, useIsSplitOn }                                                                                        from '@acx-ui/feature-toggle'
import { AaaUrls, CertificateUrls, CommonUrlsInfo, NetworkSaveData, PersonaUrls, RulesManagementUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                                                      from '@acx-ui/store'
import { act, mockServer, render, screen, fireEvent, waitForElementToBeRemoved, within, waitFor }                        from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                                                                  from '@acx-ui/user'

import { certificateAuthorityList, certificateTemplateList, policySetList } from '../../policies/CertificateTemplate/__test__/fixtures'
import { mockPersonaGroupTableResult }                                      from '../../users/__tests__/fixtures'
import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  networkDeepResponse,
  mockAAAPolicyListResponse
} from '../__tests__/fixtures'
import { MLOContext, NetworkForm } from '../NetworkForm'

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
      )
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

    const queryPolicySetFn = jest.fn()
    const searchPersonaGroupListFn = jest.fn()

    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => {
          queryPolicySetFn()
          return res(ctx.json(policySetList))
        }
      ),rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (req, res, ctx) => {
          searchPersonaGroupListFn()
          return res(ctx.json(mockPersonaGroupTableResult))
        }
      )
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

    await waitFor(() => expect(queryPolicySetFn).toHaveBeenCalled())
    await waitFor(() => expect(searchPersonaGroupListFn).toHaveBeenCalled())

    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    await waitFor(() => expect(dialog).not.toBeVisible())
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
