/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'
import { hasRoles } from '@acx-ui/user'

import { fakeDelegationList } from '../__tests__/fixtures'

import { AdministrationDelegationsTable } from './AdministrationDelegationsTable'


const mockedRevokeFn = jest.fn()
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  hasRoles: jest.fn()
}))
const services = require('@acx-ui/rc/services')
describe('administrators delegation list', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    (hasRoles as jest.Mock).mockReturnValue(true)

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    services.useGetDelegationsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeDelegationList }
    })

    mockServer.use(
      rest.delete(
        AdministrationUrlsInfo.revokeInvitation.url,
        (req, res, ctx) => {
          mockedRevokeFn(req.url.pathname)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should be able to invite 3rd Party Administrator', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    services.useGetDelegationsQuery = jest.fn().mockImplementation(() => {
      return { data: [] }
    })

    render(
      <Provider>
        <AdministrationDelegationsTable isSupport={false}/>
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Admin Name')
    expect(await screen.findByRole('button', { name: 'Invite 3rd Party Admin' })).not.toBeDisabled()
    await userEvent.click(await screen.findByRole('button', { name: /Invite 3rd Party Admin/i }))
    await waitFor(async () => {
      expect(await screen.findByRole('dialog')).toBeInTheDocument()
    })

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it('should be able to invite 3rd Party Administrator for feature flag on', async () => {
    // jest.mocked(useIsSplitOn).mockReturnValue(false)
    services.useGetDelegationsQuery = jest.fn().mockImplementation(() => {
      return { data: [] }
    })

    render(
      <Provider>
        <AdministrationDelegationsTable isSupport={false}/>
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Admin Name')
    expect(await screen.findByRole('button', { name: 'Invite 3rd Party Admin' })).not.toBeDisabled()
    await userEvent.click(await screen.findByRole('button', { name: /Invite 3rd Party Admin/i }))
    await waitFor(async () => {
      expect(await screen.findByText('Add 3rd Party Administrator')).toBeVisible()
    })

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it('should render correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <AdministrationDelegationsTable isSupport={false}/>
      </Provider>, {
        route: { params }
      })
    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(2)
    expect(screen.queryByText('Email')).toBeNull()
    expect(await screen.findByRole('row', { name: /Invitation Sent/i })).toBeValid()
    expect(await screen.findByRole('button', { name: 'Invite 3rd Party Admin' })).toBeDisabled()

    await userEvent.click(await screen.findByRole('button', { name: /Cancel Invitation/i }))
    await waitFor(async () => {
      expect(await screen.findByText('Cancel invitation?')).toBeVisible()
    })

    const okBtn = await within(screen.getByRole('dialog'))
      .findByRole('button', { name: /Cancel Invitation/i })
    await userEvent.click(okBtn)

    await waitFor(async () => {
      expect(await within(screen.getByRole('table'))
        .findByRole('button', { name: /Cancel Invitation/i })).toBeDisabled()
    })

    expect(mockedRevokeFn).toBeCalled()
    await waitFor(async () => {
      expect(okBtn).not.toBeVisible()
    })

    // TODO: test accessible after received message via socketio
    // await waitFor(async () => {
    //   expect(await screen.findByText('Access rights of 3rd party administrator were revoked')).toBeVisible()
    // })
    // expect(await within(screen.getByRole('table'))
    //   .findByRole('button', { name: /Cancel Invitation/i })).not.toBeDisabled()
  })

  it('should be able to revoke 3rd party administrator invitation', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const fakeDelegationListAccepted = [ ...fakeDelegationList ]
    fakeDelegationListAccepted[0].status = 'ACCEPTED'

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getDelegations.url.split('?type=')[0],
        (req, res, ctx) => res(ctx.json(fakeDelegationListAccepted))
      )
    )

    render(
      <Provider>
        <AdministrationDelegationsTable isSupport={false}/>
      </Provider>, {
        route: { params }
      })

    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(2)
    expect(await screen.findByRole('row', { name: /Access granted/i })).toBeValid()
    expect(await screen.findByRole('button', { name: 'Invite 3rd Party Admin' })).toBeDisabled()

    await userEvent.click(await screen.findByRole('button', { name: /Revoke access/i }))
    await waitFor(async () => {
      expect(await screen.findByText(/Are you sure you want to revoke access of partner/i)).toBeVisible()
    })

    const okBtn = await within(screen.getByRole('dialog'))
      .findByRole('button', { name: /revoke access/i })
    await userEvent.click(okBtn)
    await waitFor(async () => {
      expect(okBtn).not.toBeVisible()
    })
  })
  it('should be able to revoke 3rd party administrator invitation through row actions', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const fakeDelegationListAccepted = [ ...fakeDelegationList ]
    fakeDelegationListAccepted[0].status = 'ACCEPTED'
    fakeDelegationListAccepted.push({
      id: 'ffc2146b0f9041fa85caec2537a57d10',
      createdDate: '2023-02-13T11:51:07.793+00:00',
      updatedDate: '2023-02-13T11:51:07.793+00:00',
      delegatedTo: '3fde9aa0ef9a4d2181394095725d27a5',
      type: 'VAR',
      status: 'INVITED',
      delegatedBy: 'dog1551@email.com',
      delegatedToName: 'TEST INC',
      delegatedToAdmin: 'amy.cheng@ruckuswireless.com'
    })
    services.useGetDelegationsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeDelegationListAccepted }
    })

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getDelegations.url.split('?type=')[0],
        (req, res, ctx) => res(ctx.json(fakeDelegationListAccepted))
      )
    )

    render(
      <Provider>
        <AdministrationDelegationsTable isSupport={false}/>
      </Provider>, {
        route: { params }
      })

    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(3)

    await userEvent.click(within(row[1]).getByRole('radio'))
    await userEvent.click(screen.getAllByRole('button', { name: /Revoke access/i })[0])
    await waitFor(async () => {
      expect(await screen.findByText(/Are you sure you want to revoke access of partner/i)).toBeVisible()
    })

    const okBtn = await within(screen.getByRole('dialog'))
      .findByRole('button', { name: /revoke access/i })
    await userEvent.click(okBtn)
    await waitFor(async () => {
      expect(okBtn).not.toBeVisible()
    })
  })
  it('should show applicable row actions when row selected', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const fakeDelegationListAccepted = [ ...fakeDelegationList ]
    fakeDelegationListAccepted[0].status = 'ACCEPTED'
    fakeDelegationListAccepted.push({
      id: 'ffc2146b0f9041fa85caec2537a57d10',
      createdDate: '2023-02-13T11:51:07.793+00:00',
      updatedDate: '2023-02-13T11:51:07.793+00:00',
      delegatedTo: '3fde9aa0ef9a4d2181394095725d27a5',
      type: 'VAR',
      status: 'INVITED',
      delegatedBy: 'dog1551@email.com',
      delegatedToName: 'TEST INC',
      delegatedToAdmin: 'amy.cheng@ruckuswireless.com'
    })
    services.useGetDelegationsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeDelegationListAccepted }
    })

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getDelegations.url.split('?type=')[0],
        (req, res, ctx) => res(ctx.json(fakeDelegationListAccepted))
      )
    )

    render(
      <Provider>
        <AdministrationDelegationsTable isSupport={false}/>
      </Provider>, {
        route: { params }
      })

    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(3)
    await userEvent.click(within(row[2]).getByRole('radio'))
    expect(screen.queryByRole('Revoke access')).toBeNull()
    expect(screen.getAllByText('Cancel invitation')).toHaveLength(2)

    await userEvent.click(within(row[1]).getByRole('radio'))
    expect(screen.getAllByText('Revoke access')).toHaveLength(2)
    expect(screen.getAllByText('Cancel invitation')).toHaveLength(1)
  })
  it('should cancel invitation correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const fakeDelegationListAccepted = [ ...fakeDelegationList ]
    fakeDelegationListAccepted[0].status = 'ACCEPTED'
    fakeDelegationListAccepted.push({
      id: 'ffc2146b0f9041fa85caec2537a57d10',
      createdDate: '2023-02-13T11:51:07.793+00:00',
      updatedDate: '2023-02-13T11:51:07.793+00:00',
      delegatedTo: '3fde9aa0ef9a4d2181394095725d27a5',
      type: 'VAR',
      status: 'INVITED',
      delegatedBy: 'dog1551@email.com',
      delegatedToName: 'TEST INC',
      delegatedToAdmin: 'amy.cheng@ruckuswireless.com'
    })
    services.useGetDelegationsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeDelegationListAccepted }
    })

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getDelegations.url.split('?type=')[0],
        (req, res, ctx) => res(ctx.json(fakeDelegationListAccepted))
      )
    )

    render(
      <Provider>
        <AdministrationDelegationsTable isSupport={false}/>
      </Provider>, {
        route: { params }
      })

    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(3)
    await userEvent.click(within(row[2]).getByRole('radio'))
    expect(screen.queryByRole('Revoke access')).toBeNull()
    expect(screen.getAllByText('Cancel invitation')).toHaveLength(2)

    await userEvent.click(screen.getAllByText('Cancel invitation')[0])
    expect(await screen.findByText('Cancel invitation?')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel Invitation' }))
    await waitFor(() => {
      expect(screen.queryByText('Cancel invitation?')).toBeNull()
    })
  })
  it('should sort status correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const fakeDelegationListAccepted = [ ...fakeDelegationList ]
    fakeDelegationListAccepted[0].status = 'INVITED'
    fakeDelegationListAccepted.push({
      id: 'ffc2146b0f9041fa85caec2537a57d10',
      createdDate: '2023-02-13T11:51:07.793+00:00',
      updatedDate: '2023-02-13T11:51:07.793+00:00',
      delegatedTo: '3fde9aa0ef9a4d2181394095725d27a5',
      type: 'VAR',
      status: 'ACCEPTED',
      delegatedBy: 'dog1551@email.com',
      delegatedToName: 'TEST INC',
      delegatedToAdmin: 'amy.cheng@ruckuswireless.com'
    })
    services.useGetDelegationsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeDelegationListAccepted }
    })

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getDelegations.url.split('?type=')[0],
        (req, res, ctx) => res(ctx.json(fakeDelegationListAccepted))
      )
    )

    render(
      <Provider>
        <AdministrationDelegationsTable isSupport={false}/>
      </Provider>, {
        route: { params }
      })

    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(3)
    within(row[0]).getByText('Status')
    within(row[1]).getByText('TEST INC')
    within(row[2]).getByText('RUCKUS NETWORKS, INC')

    await userEvent.click(within(row[0]).getByText('Action'))
    await userEvent.click(within(row[0]).getByText('Action'))
    const reorderedRows = await screen.findAllByRole('row')
    expect(reorderedRows.length).toBe(3)
    within(reorderedRows[0]).getByText('Status')
    within(reorderedRows[1]).getByText('RUCKUS NETWORKS, INC')
    within(reorderedRows[2]).getByText('TEST INC')
  })

  it('should render correctly when it is support user', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const fakeDelegationListAccepted = [ ...fakeDelegationList ]
    fakeDelegationListAccepted[0].status = 'ACCEPTED'

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getDelegations.url.split('?type=')[0],
        (req, res, ctx) => res(ctx.json(fakeDelegationListAccepted))
      )
    )

    render(
      <Provider>
        <AdministrationDelegationsTable isSupport={true}/>
      </Provider>, {
        route: { params }
      })

    const colHeaders = await screen.findAllByRole('columnheader')
    expect(colHeaders.length).toBe(4)
    expect(screen.queryByRole('columnheader', { name: 'Action' })).toBeNull()
    expect(await screen.findByRole('row', { name: /Access granted/i })).toBeValid()
    expect(screen.queryByRole('button', { name: 'Invite 3rd Party Admin' })).toBeNull()
  })
  it('should render correctly when multi var feature flag on', async () => {
    const delegation = {
      id: 'ggc2146b0f9041fa85caec2537a57d10',
      createdDate: '2023-02-13T11:51:07.793+00:00',
      updatedDate: '2023-02-13T11:51:07.793+00:00',
      delegatedTo: '3fde9aa0ef9a4d2181394095725d27a5',
      type: 'VAR',
      status: 'ACCEPTED',
      delegatedBy: 'dog2662@email.com',
      delegatedToName: 'RUCKUS NETWORKS, INC',
      delegatedToAdmin: 'amy.cheng@ruckuswireless.com'
    }
    const delegationList = [ ...fakeDelegationList, delegation ]
    services.useGetDelegationsQuery = jest.fn().mockImplementation(() => {
      return { data: delegationList }
    })

    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MULTIPLE_VAR_INVITATION_TOGGLE)
    render(
      <Provider>
        <AdministrationDelegationsTable isSupport={false}/>
      </Provider>, {
        route: { params }
      })
    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(3)
    screen.getByText('Admin Name')
    screen.getByText('Email')
    screen.getByText('Status')
    screen.getByText('Action')
    expect(await screen.findByRole('button', { name: 'Invite 3rd Party Admin' })).toBeEnabled()

    await userEvent.click(screen.getByText('Action'))
    await userEvent.click(screen.getByRole('img', { name: 'caret-up' }))
  })
})

describe('when use it not permitted role', () => {
  const params = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
  beforeEach(() => {
    (hasRoles as jest.Mock).mockReturnValue(false)
  })

  it('Invite 3rd Party Administrator button should not disappear', async () => {

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getDelegations.url.split('?type=')[0],
        (req, res, ctx) => res(ctx.json(fakeDelegationList))
      )
    )

    render(
      <Provider>
        <AdministrationDelegationsTable isSupport={true}/>
      </Provider>, {
        route: { params }
      })

    await screen.findAllByRole('row')
    expect(screen.queryByRole('button', { name: 'Invite 3rd Party Administrator' })).toBeNull()
  })

  it('Revoke Invitation button should disappear when use does not has permmision', async () => {
    const fakeDelegationListAccepted = [ ...fakeDelegationList ]
    fakeDelegationListAccepted[0].status = 'ACCEPTED'
    services.useGetDelegationsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeDelegationListAccepted }
    })

    render(
      <Provider>
        <AdministrationDelegationsTable isSupport={false}/>
      </Provider>, {
        route: { params }
      })

    await screen.findAllByRole('row')
    expect(await screen.findByRole('row', { name: /Access granted/i })).toBeValid()
    expect(screen.queryByRole('columnheader', { name: 'Action' })).toBeNull()
  })
})