import { Form } from 'antd'

import { render, renderHook, screen } from '@acx-ui/test-utils'

import Summary from './Summary'


describe('Summary', () => {
  it('renders summary correctly', async () => {
    const data = {
      caType: 'ONBOARD',
      onboard: { certificateAuthorityName: '123' },
      name: 'test'
    }
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue(data)
      return form
    })
    render(<Form form={formRef.current}><Summary /></Form>)

    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText('CA Type')).toBeInTheDocument()
    expect(screen.getByText('Onboard Certificate Authority')).toBeInTheDocument()
    expect(screen.getByText('Certificate Template Name')).toBeInTheDocument()
    expect(screen.getByText('Adaptive Policy Set')).toBeInTheDocument()
    expect(screen.getByText('Chromebook Enrollment')).toBeInTheDocument()
    expect(screen.getByText('Onboard')).toBeInTheDocument()
    expect(screen.getByText('123')).toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('Disabled')).toBeInTheDocument()
  })

  it('render adaptive policy set correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldValue('policySetName', '123')
      form.setFieldValue('defaultAccess', 'true')
      return form
    })

    render(<Form form={formRef.current}><Summary /></Form>)
    expect(screen.getByText('123')).toBeVisible()
    expect(screen.getByText('Accept')).toBeVisible()
  })

  it('render chromebook enrollment correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        chromebook: {
          enabled: true,
          enrollmentType: 'DEVICE',
          certRemovalType: 'NONE',
          apiKey: 'apiKey123'
        }
      })
      return form
    })

    render(<Form form={formRef.current}><Summary /></Form>)
    expect(screen.getByText('Enabled')).toBeVisible()
    expect(screen.getByText('Device')).toBeVisible()
    expect(screen.getByText('apiKey123')).toBeVisible()
  })
})
