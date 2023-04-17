/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import DelegationInviteDialog from '.'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

const mockedCloseDialog = jest.fn()
const mockedFindVARFn = jest.fn()
const mockedInviteVARFn = jest.fn()
describe('Add administrator dialog component', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.findVAR.url,
        (req, res, ctx) => {
          mockedFindVARFn(req.url.searchParams + '')
          return res(ctx.json([]))
        }
      ),
      rest.post(
        AdministrationUrlsInfo.inviteVAR.url,
        (req, res, ctx) => {
          mockedInviteVARFn(req.body)
          return res(ctx.json({}))
        }
      )
    )
  })

  it('should submit correctly', async () => {
    render(
      <Provider>
        <DelegationInviteDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params }
      })


    const emailInput = await screen.findByRole('textbox', { name: 'Administrator Email' })
    await userEvent.type(emailInput, 'c123@email.com')

    fireEvent.click(await screen.findByRole('button', { name: 'Find' }))
    await waitFor(() => {
      expect(mockedFindVARFn).toHaveBeenCalledWith('username=c123%40email.com')
    })

    await waitFor(async () => {
      expect(await screen.findByText(/The following 3rd party administrator was found/i)).toBeVisible()
    })

    const inviteBtn = await screen.findByRole('button', { name: 'Send Invitation' })
    fireEvent.click(inviteBtn)
    await waitFor(() => {
      expect(inviteBtn).not.toBeVisible()
    })
    expect(mockedCloseDialog).toBeCalledWith(false)
  })

  it('should correctly display MSP EC admin not found error message', async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.findVAR.url,
        (req, res, ctx) => {
          return res(ctx.status(404), ctx.json({
            errors: [{
              code: 'TNT-10301',
              message: 'VAR not found in Ruckus Support'
            }],
            requestId: '123456'
          }))
        }
      )
    )
    render(
      <Provider>
        <DelegationInviteDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params }
      })

    const emailInput = await screen.findByRole('textbox', { name: 'Administrator Email' })
    await userEvent.type(emailInput, 'c123@gamil.com')

    fireEvent.click(await screen.findByRole('button', { name: 'Find' }))
    await waitFor(async () => {
      expect(await screen.findByText('The specified email address is not linked to any 3rd party administrator. Try using a different email address.')).toBeVisible()
    })
  })

  it('should correctly display MSP EC admin not found by TNT-10306 error message', async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.findVAR.url,
        (req, res, ctx) => {
          return res(ctx.status(404), ctx.json({
            errors: [{
              code: 'TNT-10306',
              message: 'Non valid email format'
            }],
            requestId: '123456'
          }))
        }
      )
    )
    render(
      <Provider>
        <DelegationInviteDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params }
      })

    const emailInput = await screen.findByRole('textbox', { name: 'Administrator Email' })
    await userEvent.type(emailInput, 'c123@gamil.com')

    await userEvent.click(await screen.findByRole('button', { name: 'Find' }))
    await waitFor(async () => {
      expect(await screen.findByText('Non valid email format')).toBeVisible()
    })
  })

  it('should correctly display MSP EC admin not found by other error message', async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.findVAR.url,
        (req, res, ctx) => {
          return res(ctx.status(400), ctx.json({
            errors: [{
              code: 'TNT-11111',
              message: 'Error'
            }],
            requestId: '123456'
          }))
        }
      )
    )
    render(
      <Provider>
        <DelegationInviteDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params }
      })

    const emailInput = await screen.findByRole('textbox', { name: 'Administrator Email' })
    await userEvent.type(emailInput, 'c123@gamil.com')

    await userEvent.click(await screen.findByRole('button', { name: 'Find' }))
    await waitFor(async () => {
      expect(await screen.findByText('An error occurred: Error')).toBeVisible()
    })
  })

  it('should correctly display MSP EC admin invited error message', async () => {
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.inviteVAR.url,
        (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({
            errors: [{
              code: 'TNT-10304',
              message: 'Error'
            }],
            requestId: '123456'
          }))
        }
      )
    )
    render(
      <Provider>
        <DelegationInviteDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params }
      })

    const emailInput = await screen.findByRole('textbox', { name: 'Administrator Email' })
    await userEvent.type(emailInput, 'c123@gamil.com')

    await userEvent.click(await screen.findByRole('button', { name: 'Find' }))
    await waitFor(async () => {
      expect(await screen.findByText(/The following 3rd party administrator was found/i)).toBeVisible()
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Send Invitation' }))
    await waitFor(async () => {
      expect(await screen.findByText('You cannot invite support user as a VAR')).toBeVisible()
    })
  })
})