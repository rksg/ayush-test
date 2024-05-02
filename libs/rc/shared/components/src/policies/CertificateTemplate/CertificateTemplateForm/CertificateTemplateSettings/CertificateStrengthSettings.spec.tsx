import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { AlgorithmType }              from '@acx-ui/rc/utils'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import CertificateStrengthSettings from './CertificateStrengthSettings'

describe('CertificateStrengthSettings', () => {
  it('should render without error', async () => {
    render(<Form><CertificateStrengthSettings /></Form>)
    const slider = await screen.findByRole('slider')
    const select = await screen.findByRole('combobox')

    expect(slider).toBeVisible()
    expect(slider).toHaveAttribute('aria-valuemin', '2048')
    expect(slider).toHaveAttribute('aria-valuemax', '4096')

    await userEvent.click(select)
    expect(screen.getByText('SHA-256')).toBeInTheDocument()
    expect(screen.getByText('SHA-384')).toBeInTheDocument()
    expect(screen.getByText('SHA-512')).toBeInTheDocument()
  })

  it('should render with given values', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        keyLength: 2048,
        algorithm: AlgorithmType.SHA_256
      })
      return form
    })

    render(<Form form={formRef.current}><CertificateStrengthSettings /></Form>)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '2048')
    expect(screen.getByText('SHA-256')).toBeVisible()
  })
})
