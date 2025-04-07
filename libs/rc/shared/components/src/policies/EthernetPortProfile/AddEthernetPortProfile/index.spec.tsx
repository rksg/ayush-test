import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  AaaUrls,
  EthernetPortAuthType,
  EthernetPortProfileUrls,
  EthernetPortType,
  PolicyOperation,
  PolicyType,
  getEthernetPortAuthTypeString,
  getEthernetPortTypeString,
  getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  dummyRadiusServiceList,
  dummyAuthRadius,
  mockAccuntingRadiusName,
  mockAuthRadiusName,
  mockEthernetPortProfileId } from '../__tests__/fixtures'

import { AddEthernetPortProfile } from '.'




const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

let params: { tenantId: string }
const createViewPath = '/:tenantId/' + getPolicyRoutePath({
  type: PolicyType.ETHERNET_PORT_PROFILE,
  oper: PolicyOperation.CREATE
})

const mockedMainEthernetProfile = jest.fn()
const mockedUpdateRadiusId = jest.fn()

describe('AddEthernetPortProfile', () => {
  beforeEach(() => {

    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.ETHERNET_PORT_SUPPORT_PROXY_RADIUS_TOGGLE ||
      ff === Features.WIFI_WIRED_CLIENT_VISIBILITY_TOGGLE)

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockedMainEthernetProfile.mockClear()
    mockedUpdateRadiusId.mockClear()

    mockServer.use(
      rest.post(
        EthernetPortProfileUrls.createEthernetPortProfile.url,
        (req, res, ctx) => {
          mockedMainEthernetProfile(req.body)
          return res(ctx.json({
            response: {
              id: mockEthernetPortProfileId
            }
          }))
        }
      ),

      rest.put(
        EthernetPortProfileUrls.updateEthernetPortProfileRadiusId.url,
        (req, res, ctx) => {
          mockedUpdateRadiusId()
          return res(ctx.status(202))
        }
      ),

      rest.post(
        AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(dummyRadiusServiceList))
      ),

      rest.get(
        AaaUrls.getAAAPolicy.url,
        (req, res, ctx) => res(ctx.json(dummyAuthRadius))
      )
    )
  })

  it('should create Ethernet Port profile successful', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddEthernetPortProfile />
      </Provider>
      , { route: { path: createViewPath, params } }
    )

    const policyNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(policyNameField, 'testEthernetPortProfile1')
    await user.click(screen.getByRole('switch', { name: 'Client Visibility' }))
    expect(
      screen.getByText(
        'Enabling on the uplink will disconnect AP(s)')
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/ethernetPortProfile/list`,
      hash: '',
      search: ''
    }))
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <AddEthernetPortProfile />
      </Provider>
      , { route: { path: createViewPath, params } }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Ethernet Port Profile'
    })).toBeVisible()
  })

  it('Click cancel button and go back to list page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddEthernetPortProfile />
      </Provider>
      , { route: { path: createViewPath, params } }
    )
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/ethernetPortProfile/list`,
      hash: '',
      search: ''
    })
  })

  // eslint-disable-next-line max-len
  it('If select access type and enable 802.1x and select Auth service will with Auth service api call', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddEthernetPortProfile />
      </Provider>
      , { route: { path: createViewPath, params } }
    )


    const policyNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(policyNameField, 'testEthernetPortProfile1')

    const typeCombo = await screen.findByRole('combobox', { name: 'Port Type' })
    await user.click(typeCombo)
    await user.click(
      await screen.findByText(getEthernetPortTypeString(EthernetPortType.ACCESS))
    )

    await user.click(screen.getByRole('switch', { name: '802.1X Authentication' }))

    const _8021XCombo = screen.getByRole('combobox', { name: '802.1X Role' })
    await user.click(_8021XCombo)
    await user.click(
      // eslint-disable-next-line max-len
      (await screen.findAllByText(getEthernetPortAuthTypeString(EthernetPortAuthType.PORT_BASED)))[1]
    )

    const authServerCombo = await screen.findByText('Select RADIUS')
    await user.click(authServerCombo)
    await user.click(await screen.findByText(mockAuthRadiusName))

    await user.click(screen.getByRole('switch', { name: 'Accounting Service' }))

    const acctServerCombo = (await screen.findAllByText('Select RADIUS'))[0]
    await user.click(acctServerCombo)
    await user.click(await screen.findByText(mockAccuntingRadiusName))

    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(mockedMainEthernetProfile).toBeCalledWith({
      name: 'testEthernetPortProfile1',
      type: 'ACCESS',
      untagId: 1,
      vlanMembers: 1,
      authRadiusId: '__Auth_Radius_ID__',
      accountingRadiusId: '__Accounting_Radius_ID_1__',
      enableAuthProxy: false,
      accountingEnabled: true,
      enableAccountingProxy: false,
      authType: 'PORT_BASED_AUTHENTICATOR'
    }))

    await waitFor(() => expect(mockedUpdateRadiusId).toBeCalledTimes(2))

  })

  it('should render suppalicant successful', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddEthernetPortProfile />
      </Provider>
      , { route: { path: createViewPath, params } }
    )

    const policyNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(policyNameField, 'testEthernetPortProfile1')

    await user.click(screen.getByRole('switch', { name: '802.1X Authentication' }))

    const credentialTypeCombo = screen.getByRole('combobox', { name: 'Credential Type' })
    await user.click(credentialTypeCombo)
    await user.click(await screen.findByText('Custom Auth'))

    const customAuthUserNameField = screen.getByRole('textbox', { name: 'Username' })
    await user.type(customAuthUserNameField, 'customAuthName')

    const customAuthPasswordField = screen.getByLabelText('Password')
    await user.type(customAuthPasswordField, 'customAuthPassword')

    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(mockedMainEthernetProfile).toBeCalledWith({
      name: 'testEthernetPortProfile1',
      type: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      authType: 'SUPPLICANT',
      supplicantAuthenticationOptions: {
        password: 'customAuthPassword',
        type: 'CUSTOM',
        username: 'customAuthName'
      }
    }))
  })

  it('If select access type the supplicant options should be hidden', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddEthernetPortProfile />
      </Provider>
      , { route: { path: createViewPath, params } }
    )

    await user.click(screen.getByRole('switch', { name: '802.1X Authentication' }))

    const typeCombo = await screen.findByRole('combobox', { name: 'Port Type' })
    await user.click(typeCombo)
    await user.click(
      await screen.findByText(getEthernetPortTypeString(EthernetPortType.ACCESS))
    )

    const vlanUntagIdField = screen.getByRole('spinbutton', { name: 'VLAN Untag ID' })
    await user.type(vlanUntagIdField, '3')

    expect(screen.queryByRole('combobox', { name: 'Credential Type' })).not.toBeInTheDocument()
  })

  it('Enable MAC based and set guest VLAN could save success', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.ETHERNET_PORT_PROFILE_DVLAN_TOGGLE)

    const user = userEvent.setup()
    render(
      <Provider>
        <AddEthernetPortProfile />
      </Provider>
      , { route: { path: createViewPath, params } }
    )

    const policyNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(policyNameField, 'testEthernetPortProfile1')

    const typeCombo = await screen.findByRole('combobox', { name: 'Port Type' })
    await user.click(typeCombo)
    await user.click(
      await screen.findByText(getEthernetPortTypeString(EthernetPortType.ACCESS))
    )

    await user.click(await screen.findByRole('switch', { name: '802.1X Authentication' }))

    const _8021XCombo = screen.getByRole('combobox', { name: '802.1X Role' })
    await user.click(_8021XCombo)
    await user.click(
      // eslint-disable-next-line max-len
      await screen.findByText(getEthernetPortAuthTypeString(EthernetPortAuthType.MAC_BASED))
    )

    const authServerCombo = await screen.findByText('Select RADIUS')
    await user.click(authServerCombo)
    await user.click(await screen.findByText(mockAuthRadiusName))


    await user.click(screen.getByRole('switch', { name: 'Dynamic VLAN' }))

    const guestVlanField = screen.getByRole('spinbutton', { name: 'Guest VLAN' })
    await user.type(guestVlanField, '3')

    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(mockedMainEthernetProfile).toBeCalledWith({
      name: 'testEthernetPortProfile1',
      type: 'ACCESS',
      untagId: 1,
      vlanMembers: 1,
      authRadiusId: '__Auth_Radius_ID__',
      accountingEnabled: false,
      authType: 'MAC_BASED_AUTHENTICATOR',
      dynamicVlanEnabled: true,
      unauthenticatedGuestVlan: 3
    }))
  })
})