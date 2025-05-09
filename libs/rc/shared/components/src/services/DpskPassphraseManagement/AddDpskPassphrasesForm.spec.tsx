import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed }        from '@acx-ui/feature-toggle'
import { CreateDpskPassphrasesFormFields, DpskUrls }       from '@acx-ui/rc/utils'
import { Provider }                                        from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor } from '@acx-ui/test-utils'

import {
  mockedServiceId,
  mockedCloudpathDpsk,
  mockedDpskPassphraseMultipleDevices
} from './__tests__/fixtures'
import AddDpskPassphrasesForm from './AddDpskPassphrasesForm'

jest.mock('@acx-ui/rc/components', () => ({
  ExpirationDateSelector: () => <div data-testid='ExpirationDateSelector'>
    Passphrase Expiration
    <input type='radio' id='NEVER' value='NEVER' /><label htmlFor='NEVER'>Same as pool</label>
  </div>,
  PhoneInput: ({ name, callback }: {
    name: string,
    callback?: (value: string) => void
  }) => <input data-testid='PhoneInput'
    name={name}
    onChange={e => callback && callback(e.target.value)} />
}))


describe('AddDpskPassphrasesForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json({ ...mockedCloudpathDpsk }))
      ),
      rest.get(
        DpskUrls.getPassphrase.url,
        (req, res, ctx) => res(ctx.json({ ...mockedDpskPassphraseMultipleDevices }))
      )
    )
  })
  it('should hide the MAC Address field when selecting Unlimited option', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm<CreateDpskPassphrasesFormFields>()
      return form
    })

    render(
      <Provider>
        <AddDpskPassphrasesForm
          serviceId={mockedServiceId}
          form={formRef.current}
          editMode={{ isEdit: false }}
        />
      </Provider>
    )

    await userEvent.click(await screen.findByLabelText('Unlimited'))

    const macAddressElem = screen.queryByLabelText('MAC Address')
    expect(macAddressElem).not.toBeInTheDocument()
  })

  it('should show the MAC Address field and do validation', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm<CreateDpskPassphrasesFormFields>()[0]
    })

    render(
      <Provider>
        <AddDpskPassphrasesForm
          serviceId={mockedServiceId}
          form={formRef.current}
          editMode={{ isEdit: false }}
        />
      </Provider>,
      { route: { params: { tenantId: 'T1', serviceId: 'S1' }, path: '/:tenantId/:serviceId' } }
    )

    await userEvent.click((await screen.findAllByRole('radio', { name: /Same as pool/i }))[0])
    const macField = await screen.findByLabelText('MAC Address')
    expect(macField).toBeVisible()

    await userEvent.type(macField, 'aabbccddeeff ')
    expect(await screen.findByText('This field is invalid')).toBeVisible()
  })

  it.skip('should disallow decreasing the number of devices when editing', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm<CreateDpskPassphrasesFormFields>()[0]
    })

    render(
      <Provider>
        <AddDpskPassphrasesForm
          serviceId={mockedServiceId}
          form={formRef.current}
          editMode={{ isEdit: true, passphraseId: '123456' }}
        />
      </Provider>,
      { route: { params: { tenantId: 'T1', serviceId: 'S1' }, path: '/:tenantId/:serviceId' } }
    )

    const numberOfDevicesElem = (await screen.findAllByRole('spinbutton'))[1]
    const existingNumberOfDevices = mockedDpskPassphraseMultipleDevices.numberOfDevices
    await userEvent.clear(numberOfDevicesElem)
    await userEvent.type(numberOfDevicesElem, (existingNumberOfDevices - 1).toString())

    // eslint-disable-next-line max-len
    const alertMessage = `Please enter a number equal to or greater than the existing value: ${existingNumberOfDevices}`

    await waitFor(() => {
      // eslint-disable-next-line max-len
      const targetAlert = screen.queryAllByRole('alert').find(element => element.textContent?.includes(alertMessage))
      expect(targetAlert).toBeVisible()
    })
  })

  it('should validate the contact email address', async () => {
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === Features.CLOUDPATH_BETA)

    const { result: formRef } = renderHook(() => {
      return Form.useForm<CreateDpskPassphrasesFormFields>()[0]
    })

    render(
      <Provider>
        <AddDpskPassphrasesForm
          serviceId={mockedServiceId}
          form={formRef.current}
          editMode={{ isEdit: false }}
        />
      </Provider>,
      { route: { params: { tenantId: 'T1', serviceId: 'S1' }, path: '/:tenantId/:serviceId' } }
    )

    await userEvent.click(await screen.findByLabelText('Contact Email Address'))

    jest.mocked(useIsTierAllowed).mockReset()
  })

  it('should fail validation when passphrase is shorter than 8 characters', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm<CreateDpskPassphrasesFormFields>()[0]
    })

    render(
      <Provider>
        <AddDpskPassphrasesForm
          serviceId={mockedServiceId}
          form={formRef.current}
          editMode={{ isEdit: false }}
        />
      </Provider>,
      { route: { params: { tenantId: 'T1', serviceId: 'S1' }, path: '/:tenantId/:serviceId' } }
    )

    await userEvent.type(await screen.findByLabelText('Passphrase'), ' ')
    expect(await screen.findByText('Passphrase must be at least 8 characters')).toBeVisible()
  })

  it('should fail validation when passphrase is longer than 63 characters', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm<CreateDpskPassphrasesFormFields>()[0]
    })

    render(
      <Provider>
        <AddDpskPassphrasesForm
          serviceId={mockedServiceId}
          form={formRef.current}
          editMode={{ isEdit: false }}
        />
      </Provider>,
      { route: { params: { tenantId: 'T1', serviceId: 'S1' }, path: '/:tenantId/:serviceId' } }
    )

    await userEvent.type(await screen.findByLabelText('Passphrase'), ' '.repeat(64))
    expect(await screen.findByText('Passphrase must be less than 64 characters')).toBeVisible()
  })

  it('should fail validation when passphrase length does not match enforced length', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff
      === Features.DPSK_PASSPHRASE_LENGTH_ENFORCEMENT)
    const { result: formRef } = renderHook(() => {
      return Form.useForm<CreateDpskPassphrasesFormFields>()[0]
    })

    render(
      <Provider>
        <AddDpskPassphrasesForm
          serviceId={mockedServiceId}
          form={formRef.current}
          editMode={{ isEdit: false }}
        />
      </Provider>,
      { route: { params: { tenantId: 'T1', serviceId: 'S1' }, path: '/:tenantId/:serviceId' } }
    )

    await userEvent.type(await screen.findByLabelText('Passphrase'), ' ')
    expect(await screen.findByText('Passphrase must be 16 characters')).toBeVisible()
  })
})
