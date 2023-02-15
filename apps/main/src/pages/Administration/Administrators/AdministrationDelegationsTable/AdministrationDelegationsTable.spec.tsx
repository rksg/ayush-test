/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { fakeDelegationList } from '../__tests__/fixtures'

import { AdministrationDelegationsTable } from './AdministrationDelegationsTable'


const mockedRevokeFn = jest.fn()
describe('administrators delegation list', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getDelegations.url.split('?type=')[0],
        (req, res, ctx) => res(ctx.json(fakeDelegationList))
      ),
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
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getDelegations.url.split('?type=')[0],
        (req, res, ctx) => res(ctx.json([]))
      )
    )

    render(
      <Provider>
        <AdministrationDelegationsTable isSupport={false}/>
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Partner Name')
    expect(await screen.findByRole('button', { name: 'Invite 3rd Party Administrator' })).not.toBeDisabled()
    await userEvent.click(await screen.findByRole('button', { name: /Invite 3rd Party Administrator/i }))
    await waitFor(async () => {
      expect(await screen.findByRole('dialog')).toBeInTheDocument()
    })
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <AdministrationDelegationsTable isSupport={false}/>
      </Provider>, {
        route: { params }
      })
    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(2)
    expect(await screen.findByRole('row', { name: /Invitation Sent/i })).toBeValid()
    expect(await screen.findByRole('button', { name: 'Invite 3rd Party Administrator' })).toBeDisabled()

    await userEvent.click(await screen.findByRole('button', { name: /Cancel Invitation/i }))
    await waitFor(async () => {
      expect(await screen.findByText('Cancel invitation?')).toBeVisible()
    })

    await userEvent.click(await within(screen.getByRole('dialog'))
      .findByRole('button', { name: /Cancel Invitation/i }))

    await waitFor(async () => {
      expect(await within(screen.getByRole('table'))
        .findByRole('button', { name: /Cancel Invitation/i })).toBeDisabled()
    })

    expect(mockedRevokeFn).toBeCalled()

    // TODO: test accessible after received message via socketio
    // await waitFor(async () => {
    //   expect(await screen.findByText('Access rights of 3rd party administrator were revoked')).toBeVisible()
    // })
    // expect(await within(screen.getByRole('table'))
    //   .findByRole('button', { name: /Cancel Invitation/i })).not.toBeDisabled()
  })

  it('should be able to revoke 3rd party administrator invitation', async () => {
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
    expect(await screen.findByRole('button', { name: 'Invite 3rd Party Administrator' })).toBeDisabled()

    await userEvent.click(await screen.findByRole('button', { name: /Revoke access/i }))
    await waitFor(async () => {
      expect(await screen.findByText(/Are you sure you want to revoke access of partner/i)).toBeVisible()
    })
  })

  it('should render correctly when it is support user', async () => {
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
    expect(colHeaders.length).toBe(3)
    expect(screen.queryByRole('columnheader', { name: 'Action' })).toBeNull()
    expect(await screen.findByRole('row', { name: /Access granted/i })).toBeValid()
    expect(screen.queryByRole('button', { name: 'Invite 3rd Party Administrator' })).toBeNull()
  })
})