import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { AaaUrls, ApLanPortTypeEnum, EthernetPortAuthType, EthernetPortProfileUrls, PolicyOperation, PolicyType, getEthernetPortAuthTypeString, getEthernetPortTypeString, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                                                                             from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved }                                                                                                                       from '@acx-ui/test-utils'

import { dummayRadiusServiceList, dummyAccounting, dummyAuthRadius, dummyEthernetPortProfileAccessPortBased, dummyEthernetPortProfileTrunkSupplicant, mockAuthRadiusId, mockAuthRadiusName, mockAuthRadiusName2 } from '../__tests__/fixtures'

import EditEthernetPortProfile from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

let params: { tenantId: string, policyId: string }
const editViewPath = '/:tenantId/' + getPolicyRoutePath({
  type: PolicyType.ETHERNET_PORT_PROFILE,
  oper: PolicyOperation.EDIT
})

const mockedMainEthernetProfile = jest.fn()
const mockedDeleteRadiusId = jest.fn()
const mockedUpdateRadiusId = jest.fn()

describe('EditEthernetPortProfile', () => {
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      policyId: 'testPolicyId'
    }

    mockedMainEthernetProfile.mockClear()
    mockedDeleteRadiusId.mockClear()
    mockedUpdateRadiusId.mockClear()

    mockServer.use(
      rest.put(
        EthernetPortProfileUrls.updateEthernetPortProfile.url,
        (req, res, ctx) => {
          mockedMainEthernetProfile(req.body)
          return res(ctx.status(202))
        }
      ),

      rest.get(
        EthernetPortProfileUrls.getEthernetPortProfile.url,
        (req, res, ctx) => res(ctx.json(dummyEthernetPortProfileTrunkSupplicant))
      ),

      rest.delete(
        EthernetPortProfileUrls.deleteEthernetPortProfileRadiusId.url,
        (req, res, ctx) => {
          mockedDeleteRadiusId()
          return res(ctx.status(202))
        }
      ),

      rest.put(
        EthernetPortProfileUrls.updateEthernetPortProfileRadiusId.url,
        (req, res, ctx) => {
          mockedUpdateRadiusId(req.body)
          return res(ctx.status(202))
        }
      ),

      rest.post(
        AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(dummayRadiusServiceList))
      ),

      rest.get(
        AaaUrls.getAAAPolicy.url,
        (req, res, ctx) => {
          if (req.params.policyId === mockAuthRadiusId) {
            return res(ctx.json(dummyAuthRadius))
          } else {
            return res(ctx.json(dummyAccounting))
          }
        }
      )
    )
  })

  it('should edit Ethernet Port profile successful', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditEthernetPortProfile />
      </Provider>
      , { route: { path: editViewPath, params } }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const policyNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(policyNameField, '1')
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/ethernetPortProfile/list`,
      hash: '',
      search: ''
    }))
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <EditEthernetPortProfile />
      </Provider>
      , { route: { path: editViewPath, params } }
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
        <EditEthernetPortProfile />
      </Provider>
      , { route: { path: editViewPath, params } }
    )
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/ethernetPortProfile/list`,
      hash: '',
      search: ''
    })
  })


  it('If select access type the supplicant options should be hidden', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditEthernetPortProfile />
      </Provider>
      , { route: { path: editViewPath, params } }
    )

    const typeCombo = await screen.findByRole('combobox', { name: 'Port Type' })
    await user.click(typeCombo)
    await user.click(
      await screen.findByText(getEthernetPortTypeString(ApLanPortTypeEnum.ACCESS))
    )

    const vlanUntagIdField = screen.getByRole('spinbutton', { name: 'VLAN Untag ID' })
    await user.type(vlanUntagIdField, '3')

    expect(screen.queryByRole('combobox', { name: 'Credential Type' })).not.toBeInTheDocument()
  })

  // eslint-disable-next-line max-len
  it('If select access type and enable 802.1x and select Auth service will with Auth service api call', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditEthernetPortProfile />
      </Provider>
      , { route: { path: editViewPath, params } }
    )

    const typeCombo = await screen.findByRole('combobox', { name: 'Port Type' })
    await user.click(typeCombo)
    await user.click(
      await screen.findByText(getEthernetPortTypeString(ApLanPortTypeEnum.ACCESS))
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

    await user.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => expect(mockedMainEthernetProfile).toBeCalledWith({
      name: 'ethernetPortProfile_2',
      type: 'ACCESS',
      untagId: 1,
      vlanMembers: 1,
      authRadiusId: '__Auth_Radius_ID__',
      enableAuthProxy: false,
      enableAccountingService: false,
      authType: 'PORT_BASED_AUTHENTICATOR'
    }))

    await waitFor(() => expect(mockedDeleteRadiusId).not.toBeCalled())
    await waitFor(() => expect(mockedUpdateRadiusId).toBeCalled())
  })

  it('If change Auth service will with Auth service delete api call', async () => {
    mockServer.use(
      rest.get(
        EthernetPortProfileUrls.getEthernetPortProfile.url,
        (req, res, ctx) => res(ctx.json(dummyEthernetPortProfileAccessPortBased))
      )
    )

    const user = userEvent.setup()
    render(
      <Provider>
        <EditEthernetPortProfile />
      </Provider>
      , { route: { path: editViewPath, params } }
    )

    const authServerCombo = await screen.findByText(mockAuthRadiusName)
    await user.click(authServerCombo)
    await user.click(await screen.findByText(mockAuthRadiusName2))

    await user.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => expect(mockedDeleteRadiusId).toBeCalled())
    await waitFor(() => expect(mockedUpdateRadiusId).toBeCalled())
  })


  it('Enable MAC based and set guest VLAN could save success', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditEthernetPortProfile />
      </Provider>
      , { route: { path: editViewPath, params } }
    )

    const typeCombo = await screen.findByRole('combobox', { name: 'Port Type' })
    await user.click(typeCombo)
    await user.click(
      await screen.findByText(getEthernetPortTypeString(ApLanPortTypeEnum.ACCESS))
    )

    await user.click(screen.getByRole('switch', { name: '802.1X Authentication' }))

    const _8021XCombo = screen.getByRole('combobox', { name: '802.1X Role' })
    await user.click(_8021XCombo)
    await user.click(
      // eslint-disable-next-line max-len
      (await screen.findAllByText(getEthernetPortAuthTypeString(EthernetPortAuthType.MAC_BASED)))[0]
    )

    const authServerCombo = await screen.findByText('Select RADIUS')
    await user.click(authServerCombo)
    await user.click(await screen.findByText(mockAuthRadiusName))


    await user.click(screen.getByRole('switch', { name: 'Dynamic VLAN' }))

    const guestVlanField = screen.getByRole('spinbutton', { name: 'Guest VLAN' })
    await user.type(guestVlanField, '3')

    await user.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => expect(mockedMainEthernetProfile).toBeCalledWith({
      name: 'ethernetPortProfile_2',
      type: 'ACCESS',
      untagId: 1,
      vlanMembers: 1,
      authRadiusId: '__Auth_Radius_ID__',
      enableAuthProxy: false,
      enableAccountingService: false,
      authType: 'MAC_BASED_AUTHENTICATOR',
      dynamicVlanEnabled: true,
      unauthenticatedGuestVlan: 3
    }))
  })
})