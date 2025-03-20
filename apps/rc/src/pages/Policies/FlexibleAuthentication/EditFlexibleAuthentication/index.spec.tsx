import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { switchApi }   from '@acx-ui/rc/services'
import {
  SwitchUrlsInfo,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { store, Provider }                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { flexAuthList } from '../__tests__/fixtures'

import EditFlexibleAuthentication from '.'

const mockedUpdateProfile = jest.fn()

describe('EditFlexibleAuthentication', ()=>{
  let params: { tenantId: string, policyId: string }
  params = {
    tenantId: 'tenant-id',
    policyId: '7de28fc02c0245648dfd58590884bad2'
  }
  const editProfilePath = '/:tenantId/' + getPolicyRoutePath({
    type: PolicyType.FLEX_AUTH,
    oper: PolicyOperation.EDIT
  })

  beforeEach(() => {
    mockedUpdateProfile.mockClear()
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getFlexAuthenticationProfiles.url,
        (req, res, ctx) => res(ctx.json(flexAuthList))
      ),
      rest.put(
        SwitchUrlsInfo.updateFlexAuthenticationProfile.url,
        (req, res, ctx) => {
          mockedUpdateProfile()
          return res(ctx.json({}))
        }
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <EditFlexibleAuthentication />
      </Provider>, {
        route: { params, path: editProfilePath }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Edit Authentication')).toBeVisible()
    expect(await screen.findByLabelText(/Profile Name/)).toHaveValue('Profile01--auth10-guest5')

    const guestVlanInput = await screen.findByLabelText(/Guest VLAN/)
    expect(guestVlanInput).not.toBeDisabled()
    await userEvent.clear(guestVlanInput)
    await userEvent.type(guestVlanInput, '10')
    await waitFor(async () => {
      expect(
        await screen.findByText('VLAN ID can not be the same as Auth Default VLAN')
      ).toBeVisible()
    })

    await userEvent.clear(guestVlanInput)
    await userEvent.type(guestVlanInput, '3')

    const button = await screen.findByRole('button', { name: 'Apply' })
    await userEvent.click(button)
    expect(mockedUpdateProfile).toBeCalled()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <EditFlexibleAuthentication />
      </Provider>, {
        route: { params, path: editProfilePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Policies & Profiles' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Authentication' })).toBeVisible()
  })

})
