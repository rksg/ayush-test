import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { switchApi }   from '@acx-ui/rc/services'
import {
  SwitchUrlsInfo,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { store, Provider }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { flexAuthList } from '../__tests__/fixtures'

import AddFlexibleAuthentication from '.'

const mockedAddProfile = jest.fn()

describe('AddFlexibleAuthentication', ()=>{
  let params: { tenantId: string }
  params = {
    tenantId: 'tenant-id'
  }
  const addProfilePath = '/:tenantId/' + getPolicyRoutePath({
    type: PolicyType.FLEX_AUTH,
    oper: PolicyOperation.CREATE
  })

  beforeEach(() => {
    mockedAddProfile.mockClear()
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getFlexAuthenticationProfiles.url,
        (req, res, ctx) => res(ctx.json(flexAuthList))
      ),
      rest.post(
        SwitchUrlsInfo.addFlexAuthenticationProfile.url,
        (req, res, ctx) => {
          mockedAddProfile()
          return res(ctx.json({}))
        }
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <AddFlexibleAuthentication />
      </Provider>, {
        route: { params, path: addProfilePath }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Add Authentication')).toBeVisible()
    await userEvent.type(await screen.findByLabelText(/Profile Name/),'Profile-1')
    await userEvent.type(await screen.findByLabelText(/Auth Default VLAN/),'1')
    await userEvent.type(await screen.findByLabelText(/Guest VLAN/),'1')

    const button = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(button)
    expect(mockedAddProfile).not.toBeCalled()

    expect(
      await screen.findByText('VLAN ID can not be the same as Auth Default VLAN')
    ).toBeVisible()
    await userEvent.type(await screen.findByLabelText(/Guest VLAN/),'9')

    await userEvent.click(button)
    expect(mockedAddProfile).toBeCalled()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <AddFlexibleAuthentication />
      </Provider>, {
        route: { params, path: addProfilePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Policies & Profiles' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Authentication' })).toBeVisible()
  })

})
