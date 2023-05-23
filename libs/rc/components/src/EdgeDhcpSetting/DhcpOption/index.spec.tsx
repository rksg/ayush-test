import userEvent from '@testing-library/user-event'

import { findTBody, render, screen, within } from '@acx-ui/test-utils'

import { mockedOptionData } from '../__tests__/fixtures'

import OptionTable from '.'

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

describe('Option table(Edge)', () => {
  it('should render data succefully', async () => {
    render(<OptionTable value={mockedOptionData} />)

    const tableRow = await screen.findAllByRole('row', { name: /Domain/i })
    expect(tableRow.length).toBe(2)
  })

  it('should show no data', async () => {
    render(<OptionTable />)

    const tbody = await findTBody()
    const noDataElement = within(tbody).getByRole('row')
    expect(noDataElement.className).toBe('ant-table-placeholder')
  })

  it('should open drawer', async () => {
    const user = userEvent.setup()
    render(<OptionTable value={mockedOptionData} />)

    await user.click(screen.getByRole('button', { name: 'Add Option' }))
    const drawer = await screen.findByRole('dialog')
    expect(drawer).toBeVisible()
  })

  it('should show edit button', async () => {
    render(<OptionTable value={mockedOptionData} />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const row = await screen.findByRole('row', { name: /Domain Server/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
  })

  it('should hidden edit button', async () => {
    render(<OptionTable value={mockedOptionData} />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const rows = await screen.findAllByRole('row', { name: /Domain/i })
    await userEvent.click(within(rows[0]).getByRole('checkbox'))
    await userEvent.click(within(rows[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })

  it('should be blocked when select duplicated option name', async () => {
    const user = userEvent.setup()
    render(<OptionTable value={mockedOptionData} />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const row = await screen.findByRole('row', { name: /Domain Server/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    const drawer = await screen.findByRole('dialog')
    user.selectOptions(
      await within(drawer).findByRole('combobox', { name: 'Option Name' }),
      await screen.findByRole('option', { name: 'Domain name' })
    )
    expect(await screen.findByText('Option Name with that name already exists')).toBeVisible()
  })

  it('should be blocked by invalid domain server value', async () => {
    const user = userEvent.setup()
    render(<OptionTable value={mockedOptionData} />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    const row = await screen.findByRole('row', { name: /Domain Server/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    const drawer = await screen.findByRole('dialog')
    const optionValueField = within(drawer).getByRole('textbox', { name: 'Option Value' })
    await user.type(optionValueField, '123')
    expect(
      await screen.findByText('Please enter a list of IP addresses, separated by commas')
    ).toBeVisible()
  })

  it('should be blocked by invalid ntp servers value', async () => {
    const user = userEvent.setup()
    render(<OptionTable value={mockedOptionData} />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    await user.click(await screen.findByRole('button', { name: 'Add Option' }))
    const drawer = await screen.findByRole('dialog')
    await user.selectOptions(
      await within(drawer).findByRole('combobox', { name: 'Option Name' }),
      await screen.findByRole('option', { name: 'NTP Servers' })
    )
    const optionValueField = within(drawer).getByRole('textbox', { name: 'Option Value' })
    await user.type(optionValueField, '123')
    expect(
      await screen.findByText('Please enter a list of IP addresses, separated by commas')
    ).toBeVisible()
  })

  it('should be blocked by invalid vendor-encapsulated-options value', async () => {
    const user = userEvent.setup()
    render(<OptionTable value={mockedOptionData} />)

    const tbody = await findTBody()

    expect(tbody).toBeVisible()

    await user.click(await screen.findByRole('button', { name: 'Add Option' }))
    const drawer = await screen.findByRole('dialog')
    await user.selectOptions(
      await within(drawer).findByRole('combobox', { name: 'Option Name' }),
      await screen.findByRole('option', { name: 'vendor-encapsulated-options' })
    )
    const optionValueField = within(drawer).getByRole('textbox', { name: 'Option Value' })
    await user.type(optionValueField, '123')
    expect(await screen.findByText('Please enter an even-length hexadecimal value')).toBeVisible()
  })
})