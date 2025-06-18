import { nanoid } from '@reduxjs/toolkit'
import userEvent  from '@testing-library/user-event'
import { Form }   from 'antd'

import { CertificateCategoryType }    from '@acx-ui/rc/utils'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import OrganizationInfoSettings from './OrganizationInfoSettings'




describe('OrganizationInfoSettings', () => {
  it('should render the form with given values', () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        onboard: {
          organizationPattern: 'Sample Corp. Inc.',
          organizationUnitPattern: 'IT',
          localityPattern: 'Westminster',
          statePattern: 'Colorado',
          countryPattern: 'US'
        }
      })
      return form
    })
    render(<Form form={formRef.current}><OrganizationInfoSettings /></Form>)
    const organizationPatternInput = screen.getByLabelText('Organization Pattern')
    const organizationUnitPatternInput = screen.getByLabelText('Organization Unit Pattern')
    const localityPatternInput = screen.getByLabelText('Locality Pattern')
    const statePatternInput = screen.getByLabelText('State Pattern')
    const countryPatternInput = screen.getByLabelText('Country Pattern')

    expect(organizationPatternInput).toHaveValue('Sample Corp. Inc.')
    expect(organizationUnitPatternInput).toHaveValue('IT')
    expect(localityPatternInput).toHaveValue('Westminster')
    expect(statePatternInput).toHaveValue('Colorado')
    expect(countryPatternInput).toHaveValue('US')
  })

  it('should update the input values', async () => {
    render(<Form><OrganizationInfoSettings /></Form>)
    const organizationPatternInput = screen.getByLabelText('Organization Pattern')
    const organizationUnitPatternInput = screen.getByLabelText('Organization Unit Pattern')
    const localityPatternInput = screen.getByLabelText('Locality Pattern')
    const statePatternInput = screen.getByLabelText('State Pattern')
    const countryPatternInput = screen.getByLabelText('Country Pattern')

    await userEvent.type(organizationPatternInput, 'Sample Corp. Inc.')
    await userEvent.type(organizationUnitPatternInput, 'IT')
    await userEvent.type(localityPatternInput, 'Westminster')
    await userEvent.type(statePatternInput, 'Colorado')
    await userEvent.type(countryPatternInput, 'US')

    expect(organizationPatternInput).toHaveValue('Sample Corp. Inc.')
    expect(organizationUnitPatternInput).toHaveValue('IT')
    expect(localityPatternInput).toHaveValue('Westminster')
    expect(statePatternInput).toHaveValue('Colorado')
    expect(countryPatternInput).toHaveValue('US')
  })

  it('should validate the invalid input values', async () => {
    render(<Form><OrganizationInfoSettings /></Form>)
    const organizationInput = screen.getByLabelText('Organization Pattern')
    const organizationUnitInput = screen.getByLabelText('Organization Unit Pattern')
    const localityInput = screen.getByLabelText('Locality Pattern')
    const stateInput = screen.getByLabelText('State Pattern')
    const countryInput = screen.getByLabelText('Country Pattern')

    const randomString = nanoid(256)
    await userEvent.type(organizationInput, randomString)
    await userEvent.type(organizationUnitInput, randomString)
    await userEvent.type(localityInput, randomString)
    await userEvent.type(stateInput, randomString)
    await userEvent.type(countryInput, randomString)

    expect(await screen.findByText('Organization Pattern must be up to 255 characters'))
      .toBeInTheDocument()
    expect(await screen.findByText('Organization Unit Pattern must be up to 255 characters'))
      .toBeInTheDocument()
    expect(await screen.findByText('Locality Pattern must be up to 255 characters'))
      .toBeInTheDocument()
    expect(await screen.findByText('State Pattern must be up to 255 characters'))
      .toBeInTheDocument()
    expect(await screen.findByText('Country Pattern must be up to 255 characters'))
      .toBeInTheDocument()
  })

  it('should update the input values with policyType CERTIFICATE_AUTHORITY', async () => {
    render(<Form><OrganizationInfoSettings
      type={CertificateCategoryType.CERTIFICATE_AUTHORITY} /></Form>)
    const emailInput = screen.getByLabelText('Email Address')
    const titleInput = screen.getByLabelText('Title')
    const organizationInput = screen.getByLabelText('Organization')
    const organizationUnitInput = screen.getByLabelText('Organization Unit')
    const localityInput = screen.getByLabelText('Locality')
    const stateInput = screen.getByLabelText('State')
    const countryInput = screen.getByLabelText('Country')

    await userEvent.type(emailInput, 'abc@email.com')
    await userEvent.type(titleInput, 'Mr.')
    await userEvent.type(organizationInput, 'Sample Corp. Inc.')
    await userEvent.type(organizationUnitInput, 'IT')
    await userEvent.type(localityInput, 'Westminster')
    await userEvent.type(stateInput, 'Colorado')
    await userEvent.type(countryInput, 'US')

    expect(emailInput).toHaveValue('abc@email.com')
    expect(titleInput).toHaveValue('Mr.')
    expect(organizationInput).toHaveValue('Sample Corp. Inc.')
    expect(organizationUnitInput).toHaveValue('IT')
    expect(localityInput).toHaveValue('Westminster')
    expect(stateInput).toHaveValue('Colorado')
    expect(countryInput).toHaveValue('US')
  })

  it('should update the invalid CERTIFICATE_AUTHORITY input values', async () => {
    render(<Form>
      <OrganizationInfoSettings type={CertificateCategoryType.CERTIFICATE_AUTHORITY} />
    </Form>)
    const emailInput = screen.getByLabelText('Email Address')
    const titleInput = screen.getByLabelText('Title')
    const organizationInput = screen.getByLabelText('Organization')
    const organizationUnitInput = screen.getByLabelText('Organization Unit')
    const localityInput = screen.getByLabelText('Locality')
    const stateInput = screen.getByLabelText('State')
    const countryInput = screen.getByLabelText('Country')

    const randomString = nanoid(256)
    await userEvent.type(emailInput, 'abc')
    await userEvent.type(titleInput, randomString)
    await userEvent.type(organizationInput, randomString)
    await userEvent.type(organizationUnitInput, randomString)
    await userEvent.type(localityInput, randomString)
    await userEvent.type(stateInput, randomString)
    await userEvent.type(countryInput, randomString)

    expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument()
    expect(await screen.findByText('Title must be up to 255 characters')).toBeInTheDocument()
    expect(await screen.findByText('Organization must be up to 255 characters')).toBeInTheDocument()
    expect(await screen.findByText('Organization Unit must be up to 255 characters'))
      .toBeInTheDocument()
    expect(await screen.findByText('Locality must be up to 255 characters')).toBeInTheDocument()
    expect(await screen.findByText('State must be up to 255 characters')).toBeInTheDocument()
    expect(await screen.findByText('Country must be up to 255 characters')).toBeInTheDocument()
  })

  it('should validate the invalid email format', async () => {
    render(<Form>
      <OrganizationInfoSettings type={CertificateCategoryType.CERTIFICATE_AUTHORITY} />
    </Form>)
    const emailInput = screen.getByLabelText('Email Address')
    await userEvent.type(emailInput, '#test@commscope.com')

    expect(await screen.findByText('Please enter a valid email address'))
      .toBeInTheDocument()
  })
})
