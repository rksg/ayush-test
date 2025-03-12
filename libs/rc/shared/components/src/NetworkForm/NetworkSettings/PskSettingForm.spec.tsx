import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed }                               from '@acx-ui/feature-toggle'
import {
  AaaUrls, AccessControlUrls, CommonUrlsInfo, ExpirationType,
  MacRegListUrlsInfo, RulesManagementUrlsInfo, SoftGreUrls,
  VlanPoolRbacUrls, WifiCallingUrls, WifiRbacUrlsInfo, WifiUrlsInfo,PersonaUrls
} from '@acx-ui/rc/utils'
import { Provider }                                                                  from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                              from '@acx-ui/user'

import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  networkDeepResponse,
  mockMacRegistrationPoolList,
  mockUpdatedMacRegistrationPoolList,
  mockAAAPolicyListResponse,
  mockSoftGreTable, mockedMacRegistrationPools,
  mockIdentityGroupQuery
} from '../__tests__/fixtures'
import { NetworkForm } from '../NetworkForm'


jest.mock('../../EdgeSdLan/useEdgeSdLanActions', () => ({
  ...jest.requireActual('../../EdgeSdLan/useEdgeSdLanActions'),
  useSdLanScopedNetworkVenues: jest.fn().mockReturnValue({})
}))

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  useNetworkVxLanTunnelProfileInfo: jest.fn().mockReturnValue({
    enableTunnel: false,
    enableVxLan: false,
    vxLanTunnels: undefined
  }),
  useUpdateEdgeSdLanActivations: jest.fn().mockReturnValue(() => {})
}))

jest.mock('../Venues/TunnelColumn/useTunnelColumn', () => ({
  ...jest.requireActual('../Venues/TunnelColumn/useTunnelColumn'),
  useTunnelColumn: jest.fn().mockReturnValue([])
}))

jest.mock('../../ApCompatibility', () => ({
  ...jest.requireActual('../../ApCompatibility'),
  ApCompatibilityToolTip: () => <div data-testid={'ApCompatibilityToolTip'} />,
  ApCompatibilityDrawer: () => <div data-testid={'ApCompatibilityDrawer'} />
}))

async function fillInBeforeSettings (networkName: string) {
  const insertInput = await screen.findByLabelText(/Network Name/)
  fireEvent.change(insertInput, { target: { value: networkName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating)

  await userEvent.click(await screen.findByRole('radio', { name: /defined for the network/ }))
  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

  await waitFor(async () => {
    expect(await screen.findByRole('heading', { level: 3, name: 'Settings' })).toBeVisible()
  })
}

async function fillInAfterSettings (checkSummary: Function, waitForIpValidation?: boolean) {
  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
  if (waitForIpValidation) {
    const validating = await screen.findAllByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  }
  await screen.findByRole('heading', { level: 3, name: 'Venues' })

  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
  await screen.findByRole('heading', { level: 3, name: 'Summary' })

  checkSummary()
  const finish = await screen.findByText('Add')
  await userEvent.click(finish)
  await waitForElementToBeRemoved(finish)
}

const macList = {
  content: [
    {
      id: '373377b0cb6e46ea8982b1c80aabe1fa1',
      autoCleanup: true,
      description: '',
      enabled: true,
      expirationEnabled: true,
      name: 'Registration pool',
      expirationType: ExpirationType.SPECIFIED_DATE,
      expirationDate: '2050-11-02T06:59:59Z',
      defaultAccess: 'REJECT',
      policySetId: '373377b0cb6e46ea8982b1c80aabe1fa'
    }
  ],
  pageable: {
    sort: { unsorted: true, sorted: false, empty: true },
    pageNumber: 0,
    pageSize: 10,
    offset: 0,
    paged: true,
    unpaged: false
  },
  totalPages: 1,
  totalElements: 1,
  last: true,
  sort: { unsorted: true, sorted: false, empty: true },
  numberOfElements: 1,
  first: true,
  size: 10,
  number: 0,
  empty: false
}
const policySetList = {
  paging: { totalCount: 3, page: 1, pageSize: 3, pageCount: 1 },
  content: [
    {
      id: 'e4fc0210-a491-460c-bd74-549a9334325a',
      name: 'ps12',
      description: 'ps12'
    },
    {
      id: 'a76cac94-3180-4f5f-9c3b-50319cb24ef8',
      name: 'ps2',
      description: 'ps2'
    },
    {
      id: '2f617cdd-a8b7-47e7-ba1e-fd41caf3dac8',
      name: 'ps4',
      description: 'ps4'
    }
  ]
}

const mockedAclPolicyResponse = {
  data: [],
  fields: ['name', 'id'],
  totalCount: 0,
  totalPages: 0,
  page: 1
}

describe('NetworkForm', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'PSK network test'
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
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.get(WifiRbacUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.post(AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(mockAAAPolicyListResponse))),
      rest.post(AaaUrls.queryAAAPolicyList.url,
        (req, res, ctx) => res(ctx.json(mockAAAPolicyListResponse))),
      rest.post(MacRegListUrlsInfo.createMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(MacRegListUrlsInfo.searchMacRegistrationPools.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(macList))),
      rest.get(MacRegListUrlsInfo.getMacRegistrationPools.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(mockMacRegistrationPoolList))),
      rest.get(RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(policySetList))),
      rest.post(RulesManagementUrlsInfo.getPolicySetsByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({}))),
      rest.get(WifiUrlsInfo.getVlanPools.url,
        (req, res, ctx) => res(ctx.json([{
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          name: 'pool1',
          vlanMembers: ['123'],
          id: '1c061cf2649344adaf1e79a9d624a451'
        }]))
      ),
      rest.post(AccessControlUrls.getL2AclPolicyListQuery.url,
        (_, res, ctx) => res(ctx.json(mockedAclPolicyResponse))),
      rest.post(AccessControlUrls.getL3AclPolicyListQuery.url,
        (_, res, ctx) => res(ctx.json(mockedAclPolicyResponse))),
      rest.post(AccessControlUrls.getApplicationPolicyListQuery.url,
        (_, res, ctx) => res(ctx.json(mockedAclPolicyResponse))),
      rest.post(AccessControlUrls.getAccessControlProfileQueryList.url,
        (_, res, ctx) => res(ctx.json(mockedAclPolicyResponse))),
      rest.post(AccessControlUrls.getDevicePolicyListQuery.url,
        (req, res, ctx) => res(ctx.json(mockedAclPolicyResponse))),
      rest.get(
        AaaUrls.getAAAPolicyRbac.url,
        (_, res, ctx) => {
          return res(ctx.json({
            primary: {
              ip: '1.1.1.1',
              port: '1812',
              sharedSecret: '124124124214'
            }
          }))
        }
      ),
      rest.post(WifiUrlsInfo.getVlanPoolViewModelList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))),
      rest.post(VlanPoolRbacUrls.getVLANPoolPolicyList.url,
        (_, res, ctx) => res(ctx.json({ page: 1, totalCount: 0, data: [] }))),
      rest.post(SoftGreUrls.getSoftGreViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockSoftGreTable))),
      rest.post(WifiCallingUrls.queryWifiCalling.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))),
      rest.get(WifiRbacUrlsInfo.getRadiusServerSettings.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(WifiUrlsInfo.queryMacRegistrationPool.url,
        (_, res, ctx) => res(ctx.json(mockedMacRegistrationPools)))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  it('should create PSK network with WPA2 successfully', async () => {
    render(<Provider><Form><NetworkForm /></Form></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const passphraseTextbox = await screen.findAllByLabelText('Passphrase')
    fireEvent.change(passphraseTextbox[0], { target: { value: '11111111' } })

    await fillInAfterSettings(async () => {
      expect(await screen.findByText('PSK network test')).toBeVisible()
    })
  })

  it('should create PSK network with WPA2 and mac auth', async () => {
    render(<Provider><Form><NetworkForm /></Form></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const passphraseTextbox = await screen.findAllByLabelText(/Passphrase/)
    fireEvent.change(passphraseTextbox[0], { target: { value: '11111111' } })
    await userEvent.click(await screen.findByRole('switch'))
    // await userEvent.click((await screen.findAllByRole('combobox'))[3])
    // await userEvent.click((await screen.findAllByTitle('test1'))[0])
  })

  it('should create PSK network with WPA2 and mac auth (for mac registration list)', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff !== Features.WIFI_RBAC_API
      && ff !== Features.RBAC_SERVICE_POLICY_TOGGLE
      && ff !== Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)

    mockServer.use(
      rest.get(MacRegListUrlsInfo.getMacRegistrationPools.url
        .split('?')[0],
      (_, res, ctx) => res(ctx.json(mockMacRegistrationPoolList))),
      rest.post(PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (req, res, ctx) => {
          const searchParams = req.url.searchParams
          if (
            searchParams.get('size') === '10000' &&
          searchParams.get('page') === '0' &&
          searchParams.get('sort') === 'name,asc'
          ) {
            return res(ctx.json(mockIdentityGroupQuery))
          }
          return res(ctx.json(mockIdentityGroupQuery))
        })
    )

    render(<Provider><Form><NetworkForm /></Form></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const passphraseTextbox = await screen.findAllByLabelText(/Passphrase/)
    fireEvent.change(passphraseTextbox[0], { target: { value: '11111111' } })
    await userEvent.click(await screen.findByRole('switch'))
    // await userEvent.click((await screen.findAllByRole('combobox'))[3])
    // await userEvent.click((await screen.findAllByTitle('test1'))[0])

    await userEvent.click(await screen.findByRole('radio', {
      name: /mac registration list/i
    }))

    await screen.findByText(/select mac registration list/i)

    await userEvent.click((await screen.findAllByRole('button', {
      name: /add/i
    }))[0])

    await screen.findByText(/add mac registration list/i)

    const buttons = await screen.findAllByRole('button', {
      name: /cancel/i
    })

    await screen.findByText(/add mac registration list/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /name/i
    }), 'macReg6')

    await userEvent.click(await screen.findByRole('button', {
      name: /apply/i
    }))

    mockServer.use(
      rest.get(MacRegListUrlsInfo.getMacRegistrationPools.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(mockUpdatedMacRegistrationPoolList)))
    )

    await userEvent.click(buttons[1])

    expect(await screen.findByText(/add mac registration list/i)).not.toBeVisible()
  })


  it('should create PSK network with WP3 and mac auth security protocol', async () => {
    render(<Provider><Form><NetworkForm /></Form></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const securityProtocols = await screen.findByRole('combobox', { name: 'Security Protocol' })

    fireEvent.mouseDown(securityProtocols)

    const option = screen.getAllByText('WPA3')[0]

    await userEvent.click(option)

    const passphraseTextbox = await screen.findAllByLabelText('Passphrase')
    fireEvent.change(passphraseTextbox[0], { target: { value: '11111111' } })

    await userEvent.click(await screen.findByRole('switch'))
    // await userEvent.click((await screen.findAllByRole('combobox'))[3])
    // await userEvent.click((await screen.findAllByTitle('test1'))[0])
    await userEvent.click((await screen.findAllByRole('switch'))[1])
    await userEvent.click((await screen.findAllByRole('switch'))[1])
  }, 20000)

  it('should create PSK network with WEP security protocol', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_WLAN_DEPRECATE_WEP)

    render(<Provider><Form><NetworkForm /></Form></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const securityProtocols = await screen.findByRole('combobox', { name: 'Security Protocol' })

    fireEvent.mouseDown(securityProtocols)

    const mixOption1 = await screen.findByText('WPA')
    await userEvent.click(mixOption1)

    fireEvent.mouseDown(securityProtocols)

    const mixOption2 = await screen.findByText('WPA2 (Recommended)')
    await userEvent.click(mixOption2)

    fireEvent.mouseDown(securityProtocols)

    const mixOption3 = await screen.findByText('WPA2/WPA3 mixed mode')
    await userEvent.click(mixOption3)

    fireEvent.mouseDown(securityProtocols)
    const option = await screen.findByText('WEP')
    await userEvent.click(option)
    await userEvent.click(await screen.findByText('Generate'))
  })

  it('should not create PSK network with WEP security protocol', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_WLAN_DEPRECATE_WEP)

    render(<Provider><Form><NetworkForm /></Form></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const securityProtocols = await screen.findByRole('combobox', { name: 'Security Protocol' })

    fireEvent.mouseDown(securityProtocols)

    const mixOption1 = await screen.findByText('WPA')
    await userEvent.click(mixOption1)

    fireEvent.mouseDown(securityProtocols)

    const mixOption2 = await screen.findByText('WPA2 (Recommended)')
    await userEvent.click(mixOption2)

    fireEvent.mouseDown(securityProtocols)

    const mixOption3 = await screen.findByText('WPA2/WPA3 mixed mode')
    await userEvent.click(mixOption3)

    fireEvent.mouseDown(securityProtocols)
    const option = await screen.findByTitle('WEP (Unsafe)')
    expect(option).toHaveClass('ant-select-item-option-disabled')
    await userEvent.click(option)
    expect(screen.queryAllByTitle('Generate').length).toBe(0)
  })

  it('should render PSK network with R370 compatibility tooltip', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_R370_TOGGLE)

    render(<Provider><Form><NetworkForm /></Form></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const toolTips = await screen.findAllByTestId('ApCompatibilityToolTip')
    expect(toolTips.length).toBe(1)
    toolTips.forEach(t => expect(t).toBeVisible())
    expect(await screen.findByTestId('ApCompatibilityDrawer')).toBeVisible()
  })
})
