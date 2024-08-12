import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Menu }  from 'antd'

import { render, screen } from '@acx-ui/test-utils'

import { regionMenu } from './stories'

import { Dropdown } from '.'

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

describe('DateTimeDropdown', () => {
  it('renders correctly and handle events', () => {
    const testDate = moment('2024-08-12T10:30:00')
    const [testForm] = Form.useForm()
    const testTime = useRef(5.5)
    const testOnChange: DatePickerProps['onChange'] = (date) => {
      testForm.setFieldValue(['settings', 'date'], date)
    }
    const testDisabledDate : RangePickerProps['disabledDate']= (current) => {
      return current
    }
    return <DateTimeDropdown
      name={'Testing'}
      dateLabel={'This is Date Label'}
      timeLabel={'This is Time Label'}
      initialDate={testDate}
      disabledDate={testDisabledDate}
      time={testTime}
      onchange={testOnChange}
      form={testForm}
    />
  })

  it('renders', () => {

  })
})