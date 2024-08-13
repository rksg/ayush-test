import '@testing-library/jest-dom'
import { MutableRefObject, useRef } from 'react'

import userEvent                             from '@testing-library/user-event'
import { Form, Menu }                        from 'antd'
import { DatePickerProps, RangePickerProps } from 'antd/lib/date-picker'
import dayjs                                 from 'dayjs'
import moment                                from 'moment-timezone'

import { render, renderHook, screen } from '@acx-ui/test-utils'

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

  it.only('renders correctly and handle events', async () => {
    const testDate = moment('2024-08-12T10:30:00')
    const { form } = renderFormHook()

    const testOnChange: DatePickerProps['onChange'] = (date) => {
      form.setFieldValue(['settings', 'date'], date)
      form.setFieldValue(['settings', 'hour'], null)
    }
    const testDisabledDate : RangePickerProps['disabledDate']= (current) => {
      return current && current < dayjs().startOf('day')
    }
    render( <DateTimeDropdown
      name={'Testing'}
      dateLabel={'This is Date Label'}
      timeLabel={'This is Time Label'}
      initialDate={testDate}
      disabledDate={testDisabledDate}
      time={mockTime}
      onchange={testOnChange}
    />
    )
    expect(await screen.findByText('This is Date Label')).toBeVisible()
    expect(await screen.findByText('This is Time Label')).toBeVisible()

    expect(await screen.findByPlaceholderText('Select hour')).toBeVisible()
  })

  it('should reset time when date is changed', () => {
  })
})