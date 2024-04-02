import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'


import { Features, useIsSplitOn }                                                                    from '@acx-ui/feature-toggle'
import { AaaUrls, CertificateUrls, CommonUrlsInfo, NetworkTypeEnum, WifiUrlsInfo, WlanSecurityEnum } from '@acx-ui/rc/utils'
import { Provider }                                                                                  from '@acx-ui/store'
import { act, mockServer, render, screen, fireEvent, waitForElementToBeRemoved }                     from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                                              from '@acx-ui/user'

import { certificateAuthorityList, certificateTemplateList } from '../../policies/CertificateTemplate/__test__/fixtures'
import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  cloudpathResponse,
  networkDeepResponse,
  mockAAAPolicyListResponse
} from '../__tests__/fixtures'
import { MLOContext, NetworkForm } from '../NetworkForm'
import NetworkFormContext          from '../NetworkFormContext'

import { AaaSettingsForm } from './AaaSettingsForm'

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
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json(cloudpathResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.post(AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(mockAAAPolicyListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [networkDeepResponse] }))),
      rest.post(CertificateUrls.getCertificateTemplates.url,
        (_, res, ctx) => res(ctx.json(certificateTemplateList))),
      rest.post(CertificateUrls.getCAs.url,
        (_, res, ctx) => res(ctx.json(certificateAuthorityList)))
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

    await screen.findByText(/MAC Authentication/i)
    await userEvent.click(await screen.findByTestId('macAuth8021x'))
    expect(await screen.findByText(/MAC Address Format/i)).toBeInTheDocument()
    expect(await screen.findByText('AA-BB-CC-DD-EE-FF')).toBeVisible()
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
    const addCertTemplateBtn = await screen.findByText('Add')
    await userEvent.click(addCertTemplateBtn)
    expect(await screen.findByText('Add Certificate Template')).toBeVisible()
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

  it('should data render correctly  when certificateTemplate enabled for editMode', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CERTIFICATE_TEMPLATE)
    const contextValue = {
      editMode: true,
      cloneMode: false,
      data: {
        type: NetworkTypeEnum.AAA,
        wlan: {
          wlanSecurity: WlanSecurityEnum.WPA2Enterprise
        },
        tenantId: '84f5749615134e53804c3a0e4b193b56',
        useHotspot20: false,
        useCertificateTemplate: true,
        name: 'testct',
        enableAuthProxy: false,
        enableAccountingProxy: false,
        id: '49794b0e3f1c4fdeaff85e0bc013179c'
      }
    }

    render(<Provider>
      <MLOContext.Provider value={{
        isDisableMLO: true,
        disableMLO: jest.fn
      }}>
        <NetworkFormContext.Provider value={contextValue}>
          <Form>
            <AaaSettingsForm />
          </Form>
        </NetworkFormContext.Provider>
      </MLOContext.Provider>
    </Provider>, { route: { params } })

    expect(await screen.findByText('Certificate Template')).toBeVisible()
    expect(await screen.findByText('certificateTemplate1')).toBeVisible()
  })
})
