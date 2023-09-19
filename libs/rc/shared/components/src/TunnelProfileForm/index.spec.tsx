import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { render, screen, fireEvent, waitFor } from '@acx-ui/test-utils'

import { TunnelProfileForm } from './index'

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={undefined}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

describe('TunnelProfileForm', () => {
  it('should render TunnelProfileForm successfully', () => {
    render(
      <Form>
        <TunnelProfileForm />
      </Form>
    )
    expect(screen.getByRole('textbox', { name: 'Profile Name' })).toBeVisible()
    // screen.getByRole('combobox', { name: 'Tags' })
    expect(screen.getByRole('radio', { name: 'Auto' })).toBeVisible()
    expect(screen.getByRole('radio', { name: 'Manual' })).toBeVisible()
    expect(screen.getByRole('switch', { name: 'Force Fragmentation' })).toBeVisible()
    expect(screen.getByText('Idle Period')).toBeVisible()
    expect(screen.getByRole('spinbutton')).toBeVisible()
  })

  it('should show MTU size field when select Manual', async () => {
    const user = userEvent.setup()
    render(
      <Form>
        <TunnelProfileForm />
      </Form>
    )
    user.click(screen.getByRole('radio', { name: 'Manual' }))
    expect(await screen.findByRole('spinbutton')).toBeVisible()
  })

  it('should show error when ageTime is less than 5', async () => {
    render(
      <Form>
        <TunnelProfileForm />
      </Form>
    )
    const ageTimeInput = await screen.findByRole('spinbutton')
    fireEvent.change(ageTimeInput, { target: { value: 1 } })

    await waitFor(() => {
      expect(screen.queryByText('Value must between 5-10080 minutes or 1-7 days or 1 week'))
        .toBeVisible()
    })
  })

  it('should show error when ageTime is greater than 10080', async () => {
    render(
      <Form>
        <TunnelProfileForm />
      </Form>
    )
    const ageTimeInput = await screen.findByRole('spinbutton')
    fireEvent.change(ageTimeInput, { target: { value: 10081 } })

    await waitFor(() => {
      expect(screen.queryByText('Value must between 5-10080 minutes or 1-7 days or 1 week'))
        .toBeVisible()
    })
  })

  it('should trigger ageTime validate when change unit', async () => {
    render(
      <Form>
        <TunnelProfileForm />
      </Form>
    )
    const ageTimeInput = await screen.findByRole('spinbutton')
    fireEvent.change(ageTimeInput, { target: { value: 5 } })
    const ageTimeUnitSelect = screen.getByRole('combobox')
    await userEvent.selectOptions(
      ageTimeUnitSelect,
      await screen.findByRole('option', { name: 'Week' })
    )

    await waitFor(() => {
      expect(screen.queryByText('Value must between 5-10080 minutes or 1-7 days or 1 week'))
        .toBeVisible()
    })
  })

  it('Input invalid profile name will show error message', async () => {
    render(
      <Form>
        <TunnelProfileForm />
      </Form>
    )
    const profileNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await userEvent.type(profileNameField, '``')
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Avoid spaces at the beginning/end, and do not use "`" or "$(" characters.'))
      .toBeVisible()
  })
})