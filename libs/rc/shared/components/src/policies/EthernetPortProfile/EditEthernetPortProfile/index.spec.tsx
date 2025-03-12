import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import { ethernetPortProfileApi, policyApi } from '@acx-ui/rc/services'
import {
  AaaUrls,
  EthernetPortProfileUrls,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  dummyRadiusServiceList,
  dummyAccounting,
  dummyAuthRadius,
  dummyEthernetPortProfileAccessPortBased,
  dummyEthernetPortProfileTrunkSupplicant,
  mockAuthRadiusId,
  mockAuthRadiusName,
  mockAuthRadiusName2,
  mockEthernetPortProfileId,
  dummyEthernetPortProfileTrunk,
  mockEthernetPortProfileId6,
  dummyEthernetPortProfileAccess,
  dummyRadiusServiceByEthernetList,
  dummyTableResultWithSingle } from '../__tests__/fixtures'

import { EditEthernetPortProfile } from '.'


const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

// jest.mocked(useIsSplitOn).mockReturnValue(true)

jest.mocked(useIsSplitOn).mockImplementation(
  ff => ff === Features.ETHERNET_PORT_PROFILE_DVLAN_TOGGLE
)

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
    mockedUsedNavigate.mockClear()

    store.dispatch(ethernetPortProfileApi.util.resetApiState())
    store.dispatch(policyApi.util.resetApiState())


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
        (req, res, ctx) => {
          if (req.params.id === mockEthernetPortProfileId) {
            return res(ctx.json(dummyEthernetPortProfileTrunk))
          } else if (req.params.id === mockEthernetPortProfileId6) {
            return res(ctx.json(dummyEthernetPortProfileAccess))
          } else {
            return res(ctx.json(dummyEthernetPortProfileTrunkSupplicant))
          }
        }
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
        (req, res, ctx) => res(ctx.json(dummyRadiusServiceList))
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
      ),

      rest.post(
        AaaUrls.queryAAAPolicyList.url,
        (req, res, ctx) => {
          // console.log(req.body)
          return res(ctx.json(dummyRadiusServiceByEthernetList))
        }
      ),

      rest.post(
        EthernetPortProfileUrls.getEthernetPortProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json(dummyTableResultWithSingle))
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

    const policyNameField = await screen.findByRole('textbox', { name: 'Profile Name' })
    await user.type(policyNameField, 'ab')
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

    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/ethernetPortProfile/list`,
      hash: '',
      search: ''
    })
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

    await user.click(screen.getByRole('switch', { name: 'Accounting Service' }))
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => expect(mockedUpdateRadiusId).toBeCalled())
    await waitFor(() => expect(mockedDeleteRadiusId).toBeCalled())
  })
})