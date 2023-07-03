import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                                    from '@acx-ui/msp/utils'
import { Provider  }                                      from '@acx-ui/store'
import { render, screen, fireEvent, mockServer, waitFor } from '@acx-ui/test-utils'

import { ResendInviteModal } from '.'

const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))

describe('ResendInviteModal', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    jest.spyOn(services, 'useResendEcInvitationMutation')
    mockServer.use(
      rest.post(
        MspUrlsInfo.resendEcInvitation.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }
  })
  it('should render successfully', async () => {
    render(
      <Provider>
        <ResendInviteModal
          visible={true}
          setVisible={jest.fn()}
          tenantId={params.tenantId}
        />
      </Provider>)

    const resendButton = screen.getByRole('button', { name: 'Resend Invitation' })
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })

    expect(screen.getByRole('textbox', { name:
      'Enter the email of the administrator you need to re-send an invitation to:' })).toBeVisible()
    expect(resendButton).toBeDisabled()
    expect(cancelButton).toBeEnabled()
  })
  it('cancel button should close dialog', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <ResendInviteModal
          visible={true}
          setVisible={mockedCloseDialog}
          tenantId={params.tenantId}
        />
      </Provider>)
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelButton)

    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
  it('should show error message when invalid email', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <ResendInviteModal
          visible={true}
          setVisible={mockedCloseDialog}
          tenantId={params.tenantId}
        />
      </Provider>)
    const resendButton = screen.getByRole('button', { name: 'Resend Invitation' })
    const input = screen.getByRole('textbox')

    await userEvent.type(input, 'invalid_email')
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeVisible()
    })
    expect(resendButton).toBeDisabled()
  })
  it('should handle resend when valid email', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <ResendInviteModal
          visible={true}
          setVisible={mockedCloseDialog}
          tenantId={params.tenantId}
        />
      </Provider>)
    const resendButton = screen.getByRole('button', { name: 'Resend Invitation' })
    const input = screen.getByRole('textbox')

    await userEvent.type(input, 'valid@mail.com')
    await waitFor(() => {
      expect(resendButton).toBeEnabled()
    })

    fireEvent.click(resendButton)
    const value: [Function, Object] = [
      expect.any(Function),
      expect.objectContaining({
        data: { requestId: '123' },
        status: 'fulfilled'
      })
    ]

    await waitFor(() => {
      expect(services.useResendEcInvitationMutation).toHaveLastReturnedWith(value)
    })
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
})

