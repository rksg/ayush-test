import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { CreateDpskPassphrasesFormFields, NewDpskBaseUrlWithId } from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, renderHook, screen }                from '@acx-ui/test-utils'

import { mockedCloudpathDpsk } from './__tests__/fixtures'
import AddDpskPassphrasesForm  from './AddDpskPassphrasesForm'


describe('AddDpskPassphrasesForm', () => {
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
    mockServer.use(
      rest.get(
        NewDpskBaseUrlWithId,
        (req, res, ctx) => res(ctx.json({ ...mockedCloudpathDpsk }))
      )
    )

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm<CreateDpskPassphrasesFormFields>()
      return form
    })

    jest.mocked(useIsSplitOn).mockReturnValue(true)

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
})
