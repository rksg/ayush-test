import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { CreateDpskPassphrasesFormFields } from '@acx-ui/rc/utils'
import { render, renderHook, screen }      from '@acx-ui/test-utils'

import AddDpskPassphrasesForm from './AddDpskPassphrasesForm'

describe('AddDpskPassphrasesForm', () => {
  it('should hide the MAC Address field when selecting Unlimited option', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm<CreateDpskPassphrasesFormFields>()
      return form
    })

    render(<AddDpskPassphrasesForm form={formRef.current} />)

    await userEvent.click(await screen.findByLabelText('Unlimited'))

    const macAddressElem = screen.queryByLabelText('MAC Address')
    expect(macAddressElem).not.toBeInTheDocument()
  })
})
