/* eslint-disable max-len */
import { renderHook } from '@testing-library/react'
import userEvent      from '@testing-library/user-event'
import { Form }       from 'antd'
import { rest }       from 'msw'
import { act }        from 'react-dom/test-utils'

import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'
import { UserUrlsInfo, MFAStatus, MFAMethod } from '@acx-ui/user'

import { AuthenticationMethod } from '.'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

const mockedFormValues = {
  tenantStatus: MFAStatus.ENABLED,
  enabled: true,
  contactId: 'test@email.com',
  recoveryCodes: ['678490','287605','230202','791760','169187'],
  mfaMethods: [MFAMethod.EMAIL],
  userId: '9bd8c312-00e3-4ced-a63e-c4ead7bf36c7',
  otpToggle: true,
  authAppToggle: false
}
const { result: formRef } = renderHook(() => {
  const [ form ] = Form.useForm()
  return form
})

const mockedDisableMFAMethodFn = jest.fn()
describe('MFA Authentication Method', () => {
  beforeEach(() => {
    mockServer.use(
      rest.put(
        UserUrlsInfo.disableMFAMethod.url,
        (_req, res, ctx) => {
          mockedDisableMFAMethodFn()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly render', async () => {
    mockServer.use(
      rest.post(
        UserUrlsInfo.mfaRegisterPhone.url,
        (_req, res, ctx) => res(ctx.json({}))
      )
    )

    render(
      <Provider>
        <Form form={formRef.current}>
          <AuthenticationMethod
            formRef={formRef.current}
          />
        </Form>
      </Provider>, {
        route: { params }
      })

    act(() => {
      formRef.current.setFieldsValue(mockedFormValues)
    })
    await screen.findByText('Set authentication method')
    await screen.findByText('test@email.com')
    expect(await screen.findByRole('switch', { name: 'otp' })).toBeDisabled()
    await userEvent.click(await screen.findByRole('switch', { name: 'app' }))
    expect(await screen.findByRole('dialog')).toBeVisible()
    await screen.findByRole('button', { name: 'Confirm' })
    await userEvent.click(await screen.findByText('Change'))
    await screen.findByRole('button', { name: 'Verify' })
  })

  it('should correctly show OTP setup drawer', async () => {
    render(
      <Provider>
        <Form form={formRef.current}>
          <AuthenticationMethod
            formRef={formRef.current}
          />
        </Form>
      </Provider>, {
        route: { params }
      })

    act(() => {
      formRef.current.setFieldsValue({
        tenantStatus: MFAStatus.ENABLED,
        enabled: true,
        recoveryCodes: ['678490','287605','230202','791760','169187'],
        mfaMethods: [MFAMethod.MOBILEAPP],
        userId: '9bd8c312-00e3-4ced-a63e-c4ead7bf36c7',
        otpToggle: false,
        authAppToggle: true
      })
    })
    await screen.findByText('Set authentication method')
    expect(await screen.findByRole('switch', { name: 'app' })).toBeDisabled()
    await userEvent.click(await screen.findByRole('switch', { name: 'otp' }))
    expect(await screen.findByRole('dialog')).toBeVisible()
    await screen.findByRole('button', { name: 'Verify' })
  })
})

describe('Disable MFA Authentication Method', () => {
  const mockAllEnabled = {
    tenantStatus: MFAStatus.ENABLED,
    enabled: true,
    contactId: 'test@email.com',
    recoveryCodes: ['678490','287605','230202','791760','169187'],
    mfaMethods: [MFAMethod.EMAIL, MFAMethod.MOBILEAPP],
    userId: '9bd8c312-00e3-4ced-a63e-c4ead7bf36c7',
    otpToggle: true,
    authAppToggle: true
  }

  beforeEach(() => {
    mockServer.use(
      rest.put(
        UserUrlsInfo.disableMFAMethod.url,
        (_req, res, ctx) => {
          mockedDisableMFAMethodFn()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly disabled OTP', async () => {
    render(
      <Provider>
        <Form form={formRef.current}>
          <AuthenticationMethod
            formRef={formRef.current}
          />
        </Form>
      </Provider>, {
        route: { params }
      })

    act(() => {
      formRef.current.setFieldsValue(mockAllEnabled)
    })

    await screen.findByText('Set authentication method')
    expect(await screen.findByRole('switch', { name: 'otp' })).not.toBeDisabled()
    expect(await screen.findByRole('switch', { name: 'otp' })).toBeChecked()
    await userEvent.click(await screen.findByRole('switch', { name: 'otp' }))
    expect(mockedDisableMFAMethodFn).toBeCalled()
  })

  it('should display toast when disabled OTP failed', async () => {
    mockServer.use(
      rest.put(
        UserUrlsInfo.disableMFAMethod.url,
        (_req, res, ctx) => {
          mockedDisableMFAMethodFn(_req.url)
          return res(ctx.status(400))
        }
      )
    )

    render(
      <Provider>
        <Form form={formRef.current}>
          <AuthenticationMethod
            formRef={formRef.current}
          />
        </Form>
      </Provider>, {
        route: { params }
      })

    act(() => {
      formRef.current.setFieldsValue(mockAllEnabled)
    })
    await screen.findByText('Set authentication method')
    await screen.findByText('test@email.com')
    await waitFor(async () => {
      expect(await screen.findByRole('switch', { name: 'otp' })).toBeChecked()
    })

    expect(await screen.findByRole('switch', { name: 'app' })).toBeChecked()
    await userEvent.click(await screen.findByRole('switch', { name: 'otp' }))
    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })

  it('should display toast when disabled auth by app failed', async () => {
    mockServer.use(
      rest.put(
        UserUrlsInfo.disableMFAMethod.url,
        (_req, res, ctx) => {
          mockedDisableMFAMethodFn(_req.url)
          return res(ctx.status(400))
        }
      )
    )

    render(
      <Provider>
        <Form form={formRef.current}>
          <AuthenticationMethod
            formRef={formRef.current}
          />
        </Form>
      </Provider>, {
        route: { params }
      })

    act(() => {
      formRef.current.setFieldsValue(mockAllEnabled)
    })
    await screen.findByText('Set authentication method')
    await screen.findByText('test@email.com')
    await waitFor(async () => {
      expect(await screen.findByRole('switch', { name: 'otp' })).toBeChecked()
    })

    expect(await screen.findByRole('switch', { name: 'app' })).toBeChecked()
    await userEvent.click(await screen.findByRole('switch', { name: 'app' }))
    // TODO
    // expect(await screen.findByText('Server Error')).toBeVisible()
  })
})
