/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { policyApi }    from '@acx-ui/rc/services'
import {
  LbsServerProfileUrls,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  dummyLbsServerProfileData,
  dummyTableResult,
  mockedPolicyId1,
  mockedTenantId
} from '../__tests__/fixtures'

import { LbsServerProfileForm } from './LbsServerProfileForm'


const createPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.LBS_SERVER_PROFILE, oper: PolicyOperation.CREATE })
const editPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.LBS_SERVER_PROFILE, oper: PolicyOperation.EDIT })

const mockedUseNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate
}))

describe('LbsServerProfileForm', () => {
  beforeEach(() => {
    store.dispatch(policyApi.util.resetApiState())
    mockServer.use(
      rest.post(
        LbsServerProfileUrls.getLbsServerProfileList.url,
        (_, res, ctx) => { return res(ctx.json(dummyTableResult)) }
      ),
      rest.get(
        LbsServerProfileUrls.getLbsServerProfile.url,
        (_, res, ctx) => { return res(ctx.json(dummyLbsServerProfileData)) }
      )
    )
  })

  it('should create LBS Server Profile successfully', async () => {
    const addLbsServerProfile = jest.fn()
    mockServer.use(
      rest.post(
        LbsServerProfileUrls.addLbsServerProfile.url,
        (_, res, ctx) => {
          addLbsServerProfile()
          return res(ctx.json({ response: { id: mockedPolicyId1 } }))
        }
      ),
      rest.post(
        LbsServerProfileUrls.addLbsServerProfile.url,
        (_, res, ctx) => {
          return res(ctx.json({ response: { id: mockedPolicyId1 } }))
        }
      )
    )

    render(<Provider><LbsServerProfileForm editMode={false} /></Provider>, {
      route: { params: { tenantId: mockedTenantId, policyId: mockedPolicyId1 }, path: createPath }
    })

    //step 1 setting form
    await userEvent.type(await screen.findByLabelText('Profile Name'), 'test3')
    await userEvent.type(await screen.findByLabelText('LBS Server Venue Name'), 'lbsvenue03')
    await userEvent.type(await screen.findByLabelText('Server Address'), 'abc.venue.ruckuslbs.com')
    await userEvent.type(await screen.findByLabelText('Port'), '8883')
    await userEvent.type(await screen.findByLabelText('Password'), 'qwerasdf')

    await userEvent.click(await screen.findByText('Add'))

    expect(addLbsServerProfile).toBeCalledTimes(1)
  })

  it('should render breadcrumb correctly', async () => {
    render(<Provider><LbsServerProfileForm editMode={false} /></Provider>, {
      route: { params: { tenantId: mockedTenantId, policyId: mockedPolicyId1 }, path: createPath }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Location Based Service Server'
    })).toBeVisible()
  })

  it('should edit LBS Server Profile successfully', async () => {
    const editLbsServerProfile = jest.fn()
    mockServer.use(
      rest.post(
        LbsServerProfileUrls.addLbsServerProfile.url,
        (_, res, ctx) => {
          return res(ctx.json({ response: { id: mockedPolicyId1 } }))
        }
      ),
      rest.put(
        LbsServerProfileUrls.updateLbsServerProfile.url,
        (_, res, ctx) => {
          editLbsServerProfile()
          return res(ctx.json({ response: { id: mockedPolicyId1 } }))
        }
      )
    )

    render(<Provider><LbsServerProfileForm editMode={true} /></Provider>, {
      route: { params: { tenantId: mockedTenantId, policyId: mockedPolicyId1 }, path: editPath }
    })

    await userEvent.type(await screen.findByLabelText('LBS Server Venue Name'), '-2')
    await userEvent.type(await screen.findByLabelText('Port'), '8884')

    await userEvent.type(await screen.findByLabelText('Server Address'), 'abc.venue.ruckuslbs.com')
    await userEvent.type(await screen.findByLabelText('Password'), 'qwerasdf')

    await userEvent.click(await screen.findByText('Finish'))

    await waitFor(() => expect(editLbsServerProfile).toBeCalledTimes(1))
  })


  it('should cancel LBS Server Profile Form successfully', async () => {
    mockServer.use(
      rest.post(
        LbsServerProfileUrls.addLbsServerProfile.url,
        (_, res, ctx) => {
          return res(ctx.json({ response: { id: mockedPolicyId1 } }))
        }
      ),
      rest.put(
        LbsServerProfileUrls.updateLbsServerProfile.url,
        (_, res, ctx) => {
          return res(ctx.json({ response: { id: mockedPolicyId1 } }))
        }
      )
    )

    render(<Provider><LbsServerProfileForm editMode={true} /></Provider>, {
      route: { params: { tenantId: mockedTenantId, policyId: mockedPolicyId1 }, path: editPath }
    })
    await userEvent.click(await screen.findByText('Cancel'))

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      hash: '',
      pathname: '/' + mockedTenantId + '/t/policies/lbsServerProfile/list',
      search: ''
    }, { replace: true })
  })

  it('should popup duplicate message', async () => {
    const addLbsServerProfile = jest.fn()
    mockServer.use(
      rest.post(
        LbsServerProfileUrls.addLbsServerProfile.url,
        (_, res, ctx) => {
          addLbsServerProfile()
          return res(ctx.json({ response: { id: mockedPolicyId1 } }))
        }
      ),
      rest.put(
        LbsServerProfileUrls.updateLbsServerProfile.url,
        (_, res, ctx) => {
          return res(ctx.json({ response: { id: mockedPolicyId1 } }))
        }
      )
    )

    render(<Provider><LbsServerProfileForm editMode={false} /></Provider>, {
      route: { params: { tenantId: mockedTenantId, policyId: mockedPolicyId1 }, path: editPath }
    })

    await userEvent.type(await screen.findByLabelText('Profile Name'), 'test3')
    await userEvent.type(await screen.findByLabelText('LBS Server Venue Name'), 'lbsvenue02')
    await userEvent.type(await screen.findByLabelText('Server Address'), 'xyz.venue.ruckuslbs.com')
    await userEvent.type(await screen.findByLabelText('Port'), '8883')
    await userEvent.type(await screen.findByLabelText('Password'), 'qwerasdf')

    await userEvent.click(await screen.findByText('Add'))

    await waitFor(() => expect(screen.queryByText('The LBS Server Venue Name and Server Address are duplicates of another profile')).toBeVisible()) })
})