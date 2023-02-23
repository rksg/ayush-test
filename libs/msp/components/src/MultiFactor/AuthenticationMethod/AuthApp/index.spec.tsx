/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { UserUrlsInfo, MFAStatus } from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { AuthApp } from './'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

export const fakeMFATenantDetail = {
  tenantStatus: MFAStatus.DISABLED,
  recoveryCodes: ['678490','287605','230202','791760','169187'],
  mfaMethods: [],
  userId: '9bd8c312-00e3-4ced-a63e-c4ead7bf36c7'
}

const mockedRegisterPhoneResponse = {
  key: 'ASFVZB7MCMYICUNR',
  url: 'https://chart.googleapis.com/chart?chs=200x200&chld=M%%7C0&cht=qr&chl=otpauth%3A%2F%2Ftotp%2FRUCKUSCloud%3Anull%3Fsecret%3DASFVZB7MCMYICUNR%26issuer%3DRUCKUSCloud'
}

const mockedCloseDrawer = jest.fn()
describe('Authentication App Drawer', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        UserUrlsInfo.mfaRegisterPhone.url,
        (_req, res, ctx) => res(ctx.json(mockedRegisterPhoneResponse))
      ),
      rest.post(
        UserUrlsInfo.setupMFAAccount.url,
        (_req, res, ctx) => res(ctx.status(200))
      )
    )
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <AuthApp
          visible={true}
          setVisible={mockedCloseDrawer}
          userId={fakeMFATenantDetail.userId}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Manage Authentication App')
    await screen.findByText(mockedRegisterPhoneResponse.key)
    const qrImg = await screen.findByRole('img')
    expect(qrImg).toHaveAttribute('src', mockedRegisterPhoneResponse.url)

    await userEvent.type(await screen.findByRole('textbox'), '123456')
    await userEvent.click(await screen.findByRole('button', { name: 'Confirm' }))
  })

  it('should block submit when form is invalid', async () => {
    render(
      <Provider>
        <AuthApp
          visible={true}
          setVisible={mockedCloseDrawer}
          userId={fakeMFATenantDetail.userId}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('Manage Authentication App')
    await screen.findByText(mockedRegisterPhoneResponse.key)
    await userEvent.click(await screen.findByRole('button', { name: 'Confirm' }))
    await waitFor(async () => {
      await screen.findByText('Please enter verification code')
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))
  })
})