/* eslint-disable max-len */
import React from 'react'

import { fireEvent, waitForElementToBeRemoved, within } from '@testing-library/react'
import { rest }                                         from 'msw'

import {
  AdministrationUrlsInfo, TenantType

} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'
import { UserUrlsInfo } from '@acx-ui/user'

import { ConvertNonVARMSPButton } from './ConvertNonVARMSPButton'

const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
}

const fakeTenantDetails = {
  id: 'ee87b5336d5d483faeda5b6aa2cbed6f',
  createdDate: '2023-01-31T04:19:00.241+00:00',
  updatedDate: '2023-02-15T02:34:21.877+00:00',
  entitlementId: '140360222',
  maintenanceState: false,
  name: 'Dog Company 1551',
  externalId: '0012h00000NrlYAAAZ',
  upgradeGroup: 'production',
  tenantMFA: {
    mfaStatus: 'DISABLED',
    recoveryCodes: '["825910","333815","825720","919107","836842"]' },
  preferences: '{"global":{"mapRegion":"UA"}}',
  ruckusUser: false,
  isActivated: true,
  status: 'active',
  tenantType: 'REC'
}

const fakeDelegationList = [
  {
    id: 'ffc2146b0f9041fa85caec2537a57d09',
    createdDate: '2023-02-13T11:51:07.793+00:00',
    updatedDate: '2023-02-13T11:51:07.793+00:00',
    delegatedTo: '3fde9aa0ef9a4d2181394095725d27a5',
    type: 'VAR',
    status: 'INVITED',
    delegatedBy: 'dog1551@email.com',
    delegatedToName: 'RUCKUS NETWORKS, INC',
    delegatedToAdmin: 'amy.cheng@ruckuswireless.com'
  }
]


const mockedTenantFn = jest.fn()
const mockedSaveFn = jest.fn()
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Convert NonVAR MSP Button', () => {
  beforeEach(() => {
    mockedTenantFn.mockReset()

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDetails.url,
        (req, res, ctx) => {
          mockedTenantFn()
          return res(ctx.json(fakeTenantDetails))
        }
      ),
      rest.get(
        AdministrationUrlsInfo.getDelegations.url.split('?type=')[0],
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.get(
        UserUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.put(
        UserUrlsInfo.saveUserSettings.url,
        (req, res, ctx) => {
          mockedSaveFn({
            params: req.url.pathname,
            body: req.body
          })
          return res(ctx.status(202))
        }
      ),
      rest.post(
        AdministrationUrlsInfo.convertNonVARToMSP.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('should correctly work', async () => {
    render(
      <Provider>
        <ConvertNonVARMSPButton />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedTenantFn).toBeCalled()
    })
    const btn = await screen.findByRole('button', { name: 'Go to MSP Subscriptions' })
    fireEvent.click(btn)
    await screen.findByText('Checking MSP Licenses')
    await waitFor(async () => {
      expect(await screen.findByText('MSP Licenses Detected')).toBeVisible()
    })
    fireEvent.click(await screen.findByRole('button', { name: 'Take me to the MSP dashboard' }))
    await waitFor(() => {
      expect(mockedSaveFn).toBeCalledWith({
        params: `/api/tenant/${params.tenantId}/admin-settings/ui/COMMON`,
        body: {
          MSP: { nonVarMspOnboard: true }
        }
      })
    })

    expect(mockedUsedNavigate).toHaveBeenCalledWith(`/v/${params.tenantId}/customers`, { replace: true })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('dialog'))
  })

  it('should submit with merged data', async () => {
    mockServer.use(
      rest.get(
        UserUrlsInfo.getAllUserSettings.url,
        (req, res, ctx) => res(ctx.json({ COMMON: JSON.stringify({
          other: true,
          MSP: { mspEcNameChanged: false }
        }) }))
      )
    )

    render(
      <Provider>
        <ConvertNonVARMSPButton />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedTenantFn).toBeCalled()
    })
    const btn = await screen.findByRole('button', { name: 'Go to MSP Subscriptions' })
    fireEvent.click(btn)
    await screen.findByText('Checking MSP Licenses')
    await waitFor(async () => {
      expect(await screen.findByText('MSP Licenses Detected')).toBeVisible()
    })
    fireEvent.click(await screen.findByRole('button', { name: 'Take me to the MSP dashboard' }))
    await waitFor(() => {
      expect(mockedSaveFn).toBeCalledWith({
        params: `/api/tenant/${params.tenantId}/admin-settings/ui/COMMON`,
        body: {
          other: true,
          MSP: {
            nonVarMspOnboard: true,
            mspEcNameChanged: false
          }
        }
      })
    })
    expect(mockedUsedNavigate).toHaveBeenCalledWith(`/v/${params.tenantId}/customers`, { replace: true })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('dialog'))
  })

  it('should blocked when account is delegated to others', async () => {
    let mockedFn = jest.fn()
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getDelegations.url.split('?type=')[0],
        (req, res, ctx) => {
          mockedFn()
          return res(ctx.json(fakeDelegationList))
        }
      )
    )

    render(
      <Provider>
        <ConvertNonVARMSPButton />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedFn).toBeCalled()
    })
    const btn = await screen.findByRole('button', { name: 'Go to MSP Subscriptions' })
    fireEvent.click(btn)
    await screen.findByText('Operation not allowed')
    // eslint-disable-next-line testing-library/no-node-access
    const targetDialog = screen.getByText('Operation not allowed').closest('.ant-modal-root') as HTMLDivElement
    fireEvent.click(await within(targetDialog).findByRole('button', { name: 'OK' }))
    await waitForElementToBeRemoved(() => screen.queryAllByRole('dialog'))
  })

  it('should handle no MSP licenses detected', async () => {
    let mockedFn = jest.fn()
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.convertNonVARToMSP.url,
        (req, res, ctx) => {
          mockedFn()
          return res(ctx.status(404))
        }
      )
    )

    render(
      <Provider>
        <ConvertNonVARMSPButton />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedTenantFn).toBeCalledWith()
    })
    const btn = await screen.findByRole('button', { name: 'Go to MSP Subscriptions' })
    fireEvent.click(btn)
    await screen.findByText('Checking MSP Licenses')
    await waitFor(async () => {
      expect(await screen.findByText('No MSP Licenses Detected')).toBeVisible()
    })
    // eslint-disable-next-line testing-library/no-node-access
    const targetDialog = screen.getByText('No MSP Licenses Detected').closest('.ant-modal-root') as HTMLDivElement
    fireEvent.click(await within(targetDialog).findByRole('button', { name: 'OK' }))
    await waitForElementToBeRemoved(() => screen.queryAllByRole('dialog'))
  })

  it('should handle convert failed error', async () => {
    let mockedFn = jest.fn()
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.convertNonVARToMSP.url,
        (req, res, ctx) => {
          mockedFn()
          return res(ctx.status(500))
        }
      )
    )

    render(
      <Provider>
        <ConvertNonVARMSPButton />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedTenantFn).toBeCalledWith()
    })
    const btn = await screen.findByRole('button', { name: 'Go to MSP Subscriptions' })
    fireEvent.click(btn)
    await screen.findByText('Checking MSP Licenses')
    await waitFor(async () => {
      expect(await screen.findByText('Server Error')).toBeVisible()
    })
    // eslint-disable-next-line testing-library/no-node-access
    const targetDialog = screen.getByText('Server Error').closest('.ant-modal-root') as HTMLDivElement
    fireEvent.click(await within(targetDialog).findByRole('button', { name: 'OK' }))
    await waitForElementToBeRemoved(() => screen.queryAllByRole('dialog'))
  })

  it('should render empty when tenant type is MSP_NON_VAR', async () => {
    const fakeNonVARMSPTenantDetails = { ...fakeTenantDetails }
    fakeNonVARMSPTenantDetails.tenantType = TenantType.MSP_NON_VAR
    let mockedFn = jest.fn()
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getTenantDetails.url,
        (req, res, ctx) => {
          mockedFn()
          return res(ctx.json(fakeNonVARMSPTenantDetails))
        }
      )
    )

    render(
      <Provider>
        <ConvertNonVARMSPButton />
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedFn).toBeCalled()
    })
    expect(screen.queryByRole('button', { name: 'Go to MSP Subscriptions' })).not.toBeInTheDocument()
  })
})