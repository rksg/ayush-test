import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed }                        from '@acx-ui/feature-toggle'
import { CreateDpskPassphrasesFormFields, DpskUrls, NewDpskBaseUrlWithId } from '@acx-ui/rc/utils'
import { Provider }                                                        from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor }                 from '@acx-ui/test-utils'

import {
  mockedCloudpathDpsk,
  mockedDpskPassphraseMultipleDevices
} from './__tests__/fixtures'
import AddDpskPassphrasesForm from './AddDpskPassphrasesForm'


describe('AddDpskPassphrasesForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        NewDpskBaseUrlWithId,
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
        <AddDpskPassphrasesForm form={formRef.current} editMode={{ isEdit: false }} />
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
        <AddDpskPassphrasesForm form={formRef.current} editMode={{ isEdit: false }} />
      </Provider>,
      { route: { params: { tenantId: 'T1', serviceId: 'S1' }, path: '/:tenantId/:serviceId' } }
    )

    await userEvent.click((await screen.findAllByRole('radio', { name: /Same as pool/i }))[0])
    const macField = await screen.findByLabelText('MAC Address')
    expect(macField).toBeVisible()

    await userEvent.type(macField, 'aabbccddeeff ')
    expect(await screen.findByText('This field is invalid')).toBeVisible()
  })

  it('should disallow decreasing the number of devices when editing', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm<CreateDpskPassphrasesFormFields>()[0]
    })

    render(
      <Provider>
        <AddDpskPassphrasesForm
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
    await waitFor(() => {
      // eslint-disable-next-line max-len
      expect(screen.queryByRole('alert')).toHaveTextContent(`Please enter a number equal to or greater than the existing value: ${existingNumberOfDevices}`)
    })
  })

  it('should validate the contact email address', async () => {
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === Features.CLOUDPATH_BETA)

    const { result: formRef } = renderHook(() => {
      return Form.useForm<CreateDpskPassphrasesFormFields>()[0]
    })

    render(
      <Provider>
        <AddDpskPassphrasesForm form={formRef.current} editMode={{ isEdit: false }} />
      </Provider>,
      { route: { params: { tenantId: 'T1', serviceId: 'S1' }, path: '/:tenantId/:serviceId' } }
    )

    await userEvent.click(await screen.findByLabelText('Contact Email Address'))

    jest.mocked(useIsTierAllowed).mockReset()
  })

  it('should remove the mac address when new flow DPSK feature flag is open', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result: formRef } = renderHook(() => {
      return Form.useForm<CreateDpskPassphrasesFormFields>()[0]
    })

    render(
      <Provider>
        <AddDpskPassphrasesForm form={formRef.current} editMode={{ isEdit: false }} />
      </Provider>,
      { route: { params: { tenantId: 'T1', serviceId: 'S1' }, path: '/:tenantId/:serviceId' } }
    )

    expect(screen.queryByText(/mac address/i)).toBeNull()
  })
})

