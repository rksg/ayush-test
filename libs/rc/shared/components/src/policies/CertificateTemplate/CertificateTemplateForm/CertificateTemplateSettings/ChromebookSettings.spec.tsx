import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { ChromebookCertRemovalType, ChromebookEnrollmentType } from '@acx-ui/rc/utils'
import { Provider }                                            from '@acx-ui/store'
import { render, renderHook, screen }                          from '@acx-ui/test-utils'

import ChromebookSettings from './ChromebookSettings'

describe('ChromebookSettings', () => {
  it('should render the component with data', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        chromebook: {
          enabled: true,
          enrollmentType: ChromebookEnrollmentType.DEVICE,
          certRemovalType: ChromebookCertRemovalType.NONE,
          accountCredential: '{"project_id": "123"}',
          notifyAppId: 'testAppId',
          apiKey: 'testApiKey'
        }
      })
      return form
    })
    render(<Provider><Form form={formRef.current}><ChromebookSettings /></Form></Provider>)
    expect(screen.getByText('Enable Chromebook Enrollment')).toBeVisible()
    expect(screen.getByText('Enrollment Type')).toBeVisible()
    expect(screen.getByText('Existing Certificates')).toBeVisible()
    expect(screen.getByText('App ID To Notify')).toBeVisible()
    expect(screen.getByText('Google API Key')).toBeVisible()
    expect(screen.getByText('Service Account JSON Private Key')).toBeVisible()
    expect(screen.getByText('Device')).toBeVisible()
    expect(screen.getByText('Do not remove existing certificates.')).toBeVisible()
    expect(screen.getByLabelText('Google API Key')).toHaveValue('testApiKey')
    expect(screen.getByText('123.json')).toBeVisible()
  })

  it('should update the input values', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    render(<Provider><Form form={formRef.current}><ChromebookSettings /></Form></Provider>)
    const enableChromebookInput = screen.getByLabelText('Enable Chromebook Enrollment')
    await userEvent.click(enableChromebookInput)
    const notifyAppIdInput = screen.getByLabelText('App ID To Notify')
    const apiKeyInput = screen.getByLabelText('Google API Key')
    const credential = screen.getByTestId('credential')

    await userEvent.type(notifyAppIdInput, 'testAppId')
    await userEvent.type(apiKeyInput, 'testApiKey')
    // eslint-disable-next-line max-len
    const file = new File(['{"type":"service_account","project_id":"test","private_key_id":"123","private_key":"123","client_email":"123","client_id":"123","auth_uri":"123","token_uri":"123"}'], 'public.json', { type: 'application/json' })
    await userEvent.upload(credential, file)

    expect(enableChromebookInput).toBeChecked()
    expect(notifyAppIdInput).toHaveValue('testAppId')
    expect(apiKeyInput).toHaveValue('testApiKey')
    expect(await screen.findByText('public.json')).toBeVisible()
  })

  it('should validate credential for required field', async () => {
    render(<Provider><Form><ChromebookSettings /></Form></Provider>)
    const enableChromebookInput = screen.getByLabelText('Enable Chromebook Enrollment')
    await userEvent.click(enableChromebookInput)
    const credential = screen.getByTestId('credential')
    // eslint-disable-next-line max-len
    const file = new File(['{"type":"service_account"}'], 'public.json', { type: 'application/json' })
    Object.defineProperty(file, 'size', { value: 1024 * 11 })
    await userEvent.upload(credential, file)

    expect(await screen.findByText('Missing column: project_id')).toBeVisible()
  })

  it('should validate credential for file type', async () => {
    render(<Provider><Form><ChromebookSettings /></Form></Provider>)
    const enableChromebookInput = screen.getByLabelText('Enable Chromebook Enrollment')
    await userEvent.click(enableChromebookInput)
    const credential = screen.getByTestId('credential')
    const file = new File(['{"type":"service_account"}'], 'public.json')
    Object.defineProperty(file, 'size', { value: 1024 * 11 })
    await userEvent.upload(credential, file)

    expect(await screen.findByText('Invalid file type.')).toBeVisible()
  })

  it('should display error message when the file size is too big', async () => {
    render(<Provider><Form><ChromebookSettings /></Form></Provider>)
    const enableChromebookInput = screen.getByLabelText('Enable Chromebook Enrollment')
    await userEvent.click(enableChromebookInput)
    const publicFileInput = screen.getByTestId('credential')
    const file = new File([''], 'public.json', { type: 'application/json' })
    Object.defineProperty(file, 'size', { value: 1024 * 1024 * 11 })
    await userEvent.upload(publicFileInput, file)
    expect(await screen.findByText('File size (11 MB) is too big.')).toBeInTheDocument()
  })
})
