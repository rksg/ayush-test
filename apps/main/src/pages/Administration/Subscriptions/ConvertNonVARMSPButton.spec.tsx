/* eslint-disable max-len */
import React from 'react'

import { waitForElementToBeRemoved, within } from '@testing-library/react'
import  userEvent                            from '@testing-library/user-event'
import { rest }                              from 'msw'

import { MspUrlsInfo }                        from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo, TenantType } from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'
import { DetailLevel, setUserProfile, UserProfile, UserProfileContext, UserProfileContextProps, UserUrlsInfo } from '@acx-ui/user'

import { ConvertNonVARMSPButton } from './ConvertNonVARMSPButton'

const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
}

const fakeNonMspEcProfile = {
  msp_label: '',
  name: '',
  service_effective_date: '',
  service_expiration_date: '',
  is_active: 'false'
}

const fakeUserProfile = {
  region: '[NA]',
  allowedRegions: [
    {
      name: 'US',
      description: 'United States of America',
      link: 'https://dev.ruckus.cloud',
      current: true
    }
  ],
  externalId: '0032h00000LUqcoAAD',
  pver: 'acx-hybrid',
  companyName: 'Dog Company 1551',
  firstName: 'FisrtName 1551',
  lastName: 'LastName 1551',
  username: 'dog1551@email.com',
  role: 'PRIME_ADMIN',
  roles: ['PRIME_ADMIN'],
  detailLevel: DetailLevel.DEBUGGING,
  dateFormat: 'mm/dd/yyyy',
  email: 'dog1551@email.com',
  var: false,
  tenantId: '8c36a0a9ab9d4806b060e112205add6f',
  varTenantId: '8c36a0a9ab9d4806b060e112205add6f',
  adminId: '4159559db15c4027903d9c3d4bdb8a7e',
  support: false,
  dogfood: false
} as UserProfile

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

const fakeDogfoodUser = { ...fakeUserProfile, dogfood: true }
const fakeSupportUser = { ...fakeUserProfile, support: true }
const fakeVARUser = { ...fakeUserProfile, var: true }
const fakeMspEcProfile = { ...fakeNonMspEcProfile, msp_label: 'msp_user' }
const isPrimeAdmin: () => boolean = jest.fn().mockReturnValue(true)
const mockedMSPEcProfileFn = jest.fn()
const mockedTenantFn = jest.fn()
const mockedSaveFn = jest.fn()
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Convert NonVAR MSP Button', () => {
  beforeEach(() => {
    mockedTenantFn.mockClear()
    mockedMSPEcProfileFn.mockClear()
    mockedSaveFn.mockClear()
    mockedUsedNavigate.mockClear()

    setUserProfile({ profile: fakeUserProfile, allowedOperations: [] })

    mockServer.use(
      rest.get(
        MspUrlsInfo.getMspEcProfile.url,
        (req, res, ctx) => {
          mockedMSPEcProfileFn()
          return res(ctx.json(fakeNonMspEcProfile))
        }
      ),
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
        <UserProfileContext.Provider
          value={{ data: fakeUserProfile, isPrimeAdmin } as UserProfileContextProps}
        >
          <ConvertNonVARMSPButton />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedTenantFn).toBeCalled()
    })
    const btn = await screen.findByRole('button', { name: 'Go to MSP Subscriptions' })
    await userEvent.click(btn)
    await waitFor(async () => {
      expect(await screen.findByText('MSP Licenses Detected')).toBeVisible()
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Take me to the MSP dashboard' }))
    await waitFor(() => {
      expect(mockedSaveFn).toBeCalledWith({
        params: `/api/tenant/${params.tenantId}/admin-settings/ui/COMMON`,
        body: {
          MSP: { nonVarMspOnboard: true }
        }
      })
    })

    expect(mockedUsedNavigate).toHaveBeenCalledWith(`/${params.tenantId}/v/dashboard/mspCustomers`, { replace: true })
    await waitFor(() => {
      expect(screen.queryAllByRole('dialog').length).toBe(0)
    })
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
        <UserProfileContext.Provider
          value={{ data: fakeUserProfile, isPrimeAdmin } as UserProfileContextProps}
        >
          <ConvertNonVARMSPButton />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedTenantFn).toBeCalled()
    })
    const btn = await screen.findByRole('button', { name: 'Go to MSP Subscriptions' })
    await userEvent.click(btn)
    await waitFor(async () => {
      expect(await screen.findByText('MSP Licenses Detected')).toBeVisible()
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Take me to the MSP dashboard' }))
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
    expect(mockedUsedNavigate).toHaveBeenCalledWith(`/${params.tenantId}/v/dashboard/mspCustomers`, { replace: true })
    await waitFor(() => {
      expect(screen.queryAllByRole('dialog').length).toBe(0)
    })
  })

  it('should blocked when account is delegated to others', async () => {
    const mockedFn = jest.fn()
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
        <UserProfileContext.Provider
          value={{ data: fakeUserProfile, isPrimeAdmin } as UserProfileContextProps}
        >
          <ConvertNonVARMSPButton />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedFn).toBeCalled()
    })
    const btn = await screen.findByRole('button', { name: 'Go to MSP Subscriptions' })
    await userEvent.click(btn)
    const dialog = await screen.findByRole('dialog')
    await screen.findByText('Operation not allowed')
    await userEvent.click(await within(dialog).findByRole('button', { name: 'OK' }))
    await waitForElementToBeRemoved(dialog)
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
        <UserProfileContext.Provider
          value={{ data: fakeUserProfile, isPrimeAdmin } as UserProfileContextProps}
        >
          <ConvertNonVARMSPButton />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedTenantFn).toBeCalledWith()
    })
    const btn = await screen.findByRole('button', { name: 'Go to MSP Subscriptions' })
    await userEvent.click(btn)
    const dialog = await screen.findByRole('dialog')
    await screen.findByText('Checking MSP Licenses')
    await waitFor(async () => {
      expect(await screen.findByText('No MSP Licenses Detected')).toBeVisible()
    })
    // eslint-disable-next-line testing-library/no-node-access
    const targetDialog = screen.getByText('No MSP Licenses Detected').closest('.ant-modal-root') as HTMLDivElement
    await userEvent.click(await within(targetDialog).findByRole('button', { name: 'OK' }))
    await waitForElementToBeRemoved(targetDialog)
    expect(dialog).not.toBeInTheDocument()
  })

  it('should handle convert failed error', async () => {
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.convertNonVARToMSP.url,
        (req, res, ctx) => {
          return res(ctx.status(500))
        }
      )
    )

    render(
      <Provider>
        <UserProfileContext.Provider
          value={{ data: fakeUserProfile, isPrimeAdmin } as UserProfileContextProps}
        >
          <ConvertNonVARMSPButton />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await waitFor(() => {
      expect(mockedTenantFn).toBeCalledWith()
    })
    const btn = await screen.findByRole('button', { name: 'Go to MSP Subscriptions' })
    await userEvent.click(btn)
    const dialog = await screen.findByRole('dialog')
    await screen.findByText('Checking MSP Licenses')
    await waitFor(async () => {
      expect(await screen.findByText('Server Error')).toBeVisible()
    })
    // eslint-disable-next-line testing-library/no-node-access
    const targetDialog = screen.getByText('Server Error').closest('.ant-modal-root') as HTMLDivElement
    await userEvent.click(await within(targetDialog).findByRole('button', { name: 'OK' }))
    await waitForElementToBeRemoved(targetDialog)
    expect(dialog).not.toBeInTheDocument()
  })

  describe('Should not render convert nonVAR MSP button', () => {
    it('when it is MSP EC user', async () => {
      let mockedmspFn = jest.fn()
      mockServer.use(
        rest.get(
          MspUrlsInfo.getMspEcProfile.url,
          (req, res, ctx) => {
            mockedmspFn()
            return res(ctx.json(fakeMspEcProfile))
          }
        ))

      render(
        <Provider>
          <UserProfileContext.Provider
            value={{ data: fakeUserProfile, isPrimeAdmin } as UserProfileContextProps}
          >
            <ConvertNonVARMSPButton />
          </UserProfileContext.Provider>
        </Provider>, {
          route: { params }
        })

      await waitFor(() => {
        expect(mockedmspFn).toBeCalled()
      })
      expect(screen.queryByRole('button', { name: 'Go to MSP Subscriptions' })).not.toBeInTheDocument()
    })

    it('when user is VAR', async () => {
      render(
        <Provider>
          <UserProfileContext.Provider
            value={{ data: fakeVARUser, isPrimeAdmin } as UserProfileContextProps}
          >
            <ConvertNonVARMSPButton />
          </UserProfileContext.Provider>
        </Provider>, {
          route: { params }
        })

      await waitFor(() => {
        expect(mockedMSPEcProfileFn).toBeCalled()
      })
      expect(screen.queryByRole('button', { name: 'Go to MSP Subscriptions' })).not.toBeInTheDocument()
    })

    it('when it is dogfood user', async () => {
      render(
        <Provider>
          <UserProfileContext.Provider
            value={{ data: fakeDogfoodUser, isPrimeAdmin } as UserProfileContextProps}
          >
            <ConvertNonVARMSPButton />
          </UserProfileContext.Provider>
        </Provider>, {
          route: { params }
        })

      await waitFor(() => {
        expect(mockedMSPEcProfileFn).toBeCalled()
      })
      expect(screen.queryByRole('button', { name: 'Go to MSP Subscriptions' })).not.toBeInTheDocument()
    })

    it('when it is support user', async () => {
      render(
        <Provider>
          <UserProfileContext.Provider
            value={{ data: fakeSupportUser, isPrimeAdmin } as UserProfileContextProps}
          >
            <ConvertNonVARMSPButton />
          </UserProfileContext.Provider>
        </Provider>, {
          route: { params }
        })

      await waitFor(() => {
        expect(mockedMSPEcProfileFn).toBeCalled()
      })
      expect(screen.queryByRole('button', { name: 'Go to MSP Subscriptions' })).not.toBeInTheDocument()
    })

    it('when tenant type is MSP_NON_VAR', async () => {
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
          <UserProfileContext.Provider
            value={{ data: fakeUserProfile, isPrimeAdmin } as UserProfileContextProps}
          >
            <ConvertNonVARMSPButton />
          </UserProfileContext.Provider>
        </Provider>, {
          route: { params }
        })

      await waitFor(() => {
        expect(mockedFn).toBeCalled()
      })
      expect(screen.queryByRole('button', { name: 'Go to MSP Subscriptions' })).not.toBeInTheDocument()
    })
  })
})
