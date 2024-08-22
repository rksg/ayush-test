import '@testing-library/jest-dom'
import { MutableRefObject } from 'react'

import userEvent                             from '@testing-library/user-event'
import { Form, Menu }                        from 'antd'
import { DatePickerProps, RangePickerProps } from 'antd/lib/date-picker'
import dayjs                                 from 'dayjs'
import moment                                from 'moment-timezone'

import { fireEvent, render, renderHook, screen } from '@acx-ui/test-utils'

import { regionMenu } from './stories'

import { DateTimeDropdown, Dropdown } from '.'

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    showSearch, // remove and left unassigned to prevent warning
    ...props
  }: React.PropsWithChildren<{ showSearch: boolean, onChange?: (value: string) => void }>) => {
    return (<select {...props} onChange={(e) => props.onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>)
  }
  Select.Option = 'option'
  Select.OptGroup = 'optgroup'
  return { ...components, Select }
})

describe('Dropdown', () => {
  it('renders dropdown and handle events', async () => {
    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {})
    render(
      <Dropdown overlay={regionMenu}>{(selectedKeys) =>
        <span data-testid='trigger'>{selectedKeys}</span>
      }</Dropdown>
    )
    const trigger = screen.getByTestId('trigger')
    expect(trigger).toHaveTextContent('EU')
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('menuitem', { name: 'Asia' }))
    expect(trigger).toHaveTextContent('Asia')
    expect(mockLog).toHaveBeenCalledWith(expect.objectContaining({ domEvent: expect.anything() }))
  })

  it('renders null if there are no selected items', () => {
    const menu = <Menu items={[ { key: 'US', label: 'US' } ]} />
    render(
      <Dropdown overlay={menu}>{(selectedKeys) =>
        <span data-testid='trigger'>{selectedKeys}</span>
      }</Dropdown>
    )
    expect(screen.getByTestId('trigger')).toHaveTextContent('')
  })

  it('renders custom overlay', () => {
    render(
      <Dropdown
        overlay={
          <Dropdown.OverlayContainer>
            Custom content in here
          </Dropdown.OverlayContainer>
        }
      >{() => <div>Open Overlay</div>}</Dropdown>
    )
  })
})

export const renderFormHook = () => {
  const { result: { current: form } } = renderHook(() => {
    const [form] = Form.useForm()
    return form
  })
  return { form, formRender: render(<Form form={form} data-testid='form' />) }
}

const mockTime : MutableRefObject<number> = { current: 5.5 }
describe('DateTimeDropdown', () => {
  jest.spyOn(Date,'now').mockReturnValue(+new Date('2024-08-12T10:30:00')) // mock current datetime
  it('renders correctly for', async () => {
    const testDate = moment('2024-08-13T00:00:00')
    const testOnChange: DatePickerProps['onChange'] = () => {}
    render( <Form> <DateTimeDropdown
      name={'Testing'}
      dateLabel={'This is Date Label'}
      timeLabel={'This is Time Label'}
      initialDate={testDate}
      time={mockTime}
      onchange={testOnChange}
    />
    </Form>
    )
    expect(await screen.findByText('This is Date Label')).toBeVisible()
    expect(await screen.findByText('This is Time Label')).toBeVisible()

    const datpickerInput = await screen.findByTitle('2024-08-13')
    expect(datpickerInput).toBeVisible()
    expect(datpickerInput).toHaveValue('2024-08-13')

    expect(screen.getByPlaceholderText('Select hour')).toBeInTheDocument()
    expect(screen.getByText('05:30 (UTC+00)')).toBeVisible()

    expect(screen.queryByText('00:00 (UTC+00)')).not.toBeDisabled()
    expect(screen.queryByText('23:45 (UTC+00)')).not.toBeDisabled()

  })

  it('should handle time disabling events', async () => {
    const testDate = moment('2024-08-13T00:00:00')
    const { form } = renderFormHook()
    const spy = jest.spyOn(form, 'setFieldValue')

    const testOnChange: DatePickerProps['onChange'] = () => {
      form.setFieldValue(['settings', 'hour'], null)
    }

    render( <Form> <DateTimeDropdown
      name={'Testing'}
      dateLabel={'This is Date Label'}
      timeLabel={'This is Time Label'}
      initialDate={testDate}
      time={mockTime}
      onchange={testOnChange}
    />
    </Form>
    )
    const dateInitialInput = await screen.findByTitle('2024-08-13')
    expect(dateInitialInput).toBeVisible()
    expect(dateInitialInput).toHaveValue('2024-08-13')

    expect(screen.queryByText('00:00 (UTC+00)')).not.toBeDisabled()
    expect(screen.queryByText('23:45 (UTC+00)')).not.toBeDisabled()

    const datepicker = screen.getByRole('img', { name: 'calendar' })
    expect(datepicker).toBeEnabled()
    await userEvent.click(datepicker)

    // Select current date
    const datepickerInput = screen.getByPlaceholderText('Select date')
    fireEvent.change(datepickerInput, { target: { value: '2024-08-12' } })
    await userEvent.click(screen.getByRole('cell', { name: '2024-08-12' }))
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls).toEqual([
      [['settings', 'hour'], null]
    ])

    // Time before current should be disabled
    expect(screen.queryByText('10:15 (UTC+00)')).toBeDisabled()
    expect(screen.queryByText('00:00 (UTC+00)')).toBeDisabled()
    expect(screen.queryByText('10:30 (UTC+00)')).not.toBeDisabled()
    expect(screen.queryByText('23:45 (UTC+00)')).not.toBeDisabled()
  })
})