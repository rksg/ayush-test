import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import moment    from 'moment-timezone'

import { AlgorithmType, EXPIRATION_DATE_FORMAT, ExpirationDateEntity, ExpirationType } from '@acx-ui/rc/utils'
import { render, renderHook, screen }                                                  from '@acx-ui/test-utils'

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
    expect(screen.getAllByText('--')).toHaveLength(1)
    expect(screen.getByText('Disabled')).toBeInTheDocument()
    const showMoreSettingsButton = screen.getByRole('button', { name: 'Show more settings' })
    expect(showMoreSettingsButton).toBeInTheDocument()

    await userEvent.click(showMoreSettingsButton)
    expect(screen.getByRole('tab', { name: 'Validity Period' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Certificate Strength' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Organization Info' })).toBeInTheDocument()
    expect(screen.getAllByText('--')).toHaveLength(3)

    await userEvent.click(showMoreSettingsButton)
    expect(screen.queryByRole('tab', { name: 'Validity Period' })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Certificate Strength' })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Organization Info' })).not.toBeInTheDocument()
  })

  it('renders Validity Period date correctly', async () => {
    const notBefore = new ExpirationDateEntity()
    notBefore.setToByDate('2022-01-01')
    const notAfter = new ExpirationDateEntity()
    notAfter.setToByDate('2022-02-01')
    const data = {
      notBefore,
      notAfter
    }
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue(data)
      return form
    })

    render(<Form form={formRef.current}><Summary /></Form>)
    await userEvent.click(screen.getByRole('button', { name: 'Show more settings' }))
    await userEvent.click(screen.getByRole('tab', { name: 'Validity Period' }))
    expect(screen.getByText('Start Date')).toBeVisible()
    expect(screen.getByText('Expiration Date')).toBeVisible()
    expect(screen.getByText(moment('01/01/2022').format(EXPIRATION_DATE_FORMAT))).toBeVisible()
    expect(screen.getByText(moment('02/01/2022').format(EXPIRATION_DATE_FORMAT))).toBeVisible()
  })

  it('renders Validity Period after time correctly', async () => {
    const notBefore = new ExpirationDateEntity()
    notBefore.setToAfterTime(ExpirationType.WEEKS_AFTER_TIME, 1)
    const notAfter = new ExpirationDateEntity()
    notAfter.setToAfterTime(ExpirationType.MONTHS_AFTER_TIME, 2)
    const data = {
      notBefore,
      notAfter
    }
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue(data)
      return form
    })

    render(<Form form={formRef.current}><Summary /></Form>)
    await userEvent.click(screen.getByRole('button', { name: 'Show more settings' }))
    await userEvent.click(screen.getByRole('tab', { name: 'Validity Period' }))
    expect(screen.getByText('Start Date')).toBeVisible()
    expect(screen.getByText('Expiration Date')).toBeVisible()
    expect(screen.getByText('1 week(s) before issuance')).toBeVisible()
    expect(screen.getByText('2 month(s) after issuance')).toBeVisible()
  })

  it('renders Certificate Strength correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        keyLength: 2048,
        algorithm: AlgorithmType.SHA_256
      })
      return form
    })

    render(<Form form={formRef.current}><Summary /></Form>)
    await userEvent.click(screen.getByRole('button', { name: 'Show more settings' }))
    await userEvent.click(screen.getByRole('tab', { name: 'Certificate Strength' }))
    expect(screen.getByText('Key Length')).toBeVisible()
    expect(screen.getByText('Algorithm')).toBeVisible()
    expect(screen.getByText('2048')).toBeVisible()
    expect(screen.getByText('SHA-256')).toBeVisible()
  })

  it('renders Organization Info correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        onboard: {
          organizationPattern: 'organizationTest',
          organizationUnitPattern: 'organizationUnitTest',
          localityPattern: 'localityTest',
          statePattern: 'stateTest',
          countryPattern: 'countryTest'
        }
      })
      return form
    })

    render(<Form form={formRef.current}><Summary /></Form>)
    await userEvent.click(screen.getByRole('button', { name: 'Show more settings' }))
    await userEvent.click(screen.getByRole('tab', { name: 'Organization Info' }))
    expect(screen.getByText('Organization Pattern')).toBeVisible()
    expect(screen.getByText('Organization Unit Pattern')).toBeVisible()
    expect(screen.getByText('Locality Pattern')).toBeVisible()
    expect(screen.getByText('State Pattern')).toBeVisible()
    expect(screen.getByText('Country Pattern')).toBeVisible()
    expect(screen.getByText('organizationTest')).toBeVisible()
    expect(screen.getByText('organizationUnitTest')).toBeVisible()
    expect(screen.getByText('localityTest')).toBeVisible()
    expect(screen.getByText('stateTest')).toBeVisible()
    expect(screen.getByText('countryTest')).toBeVisible()
  })

  it('renders null Organization Info correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldValue('policySetName', '123')
      form.setFieldValue('caType', 'ONBOARD')
      return form
    })

    render(<Form form={formRef.current}><Summary /></Form>)
    await userEvent.click(screen.getByRole('button', { name: 'Show more settings' }))
    await userEvent.click(screen.getByRole('tab', { name: 'Organization Info' }))
    expect(screen.getByText('Organization Pattern')).toBeVisible()
    expect(screen.getByText('Organization Unit Pattern')).toBeVisible()
    expect(screen.getByText('Locality Pattern')).toBeVisible()
    expect(screen.getByText('State Pattern')).toBeVisible()
    expect(screen.getByText('Country Pattern')).toBeVisible()
    expect(screen.getAllByText('--')).toHaveLength(5)
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
          notifyAppId: 'appId123',
          apiKey: 'apiKey123'
        }
      })
      return form
    })

    render(<Form form={formRef.current}><Summary /></Form>)
    expect(screen.getByText('Enabled')).toBeVisible()
    expect(screen.getByText('Device')).toBeVisible()
    expect(screen.getByText('appId123')).toBeVisible()
    expect(screen.getByText('apiKey123')).toBeVisible()
  })
})
