import '@testing-library/jest-dom'
import { useRef } from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent                   from '@testing-library/user-event'
import moment, { Moment }          from 'moment-timezone'
import { IntlProvider }            from 'react-intl'

import { formatter, DateFormatEnum } from '@acx-ui/formatter'
import {
  DateRange,
  useDateFilter,
  getJwtTokenPayload,
  AccountTier
} from '@acx-ui/utils'

import { DatePicker, DateTimePicker, RangePicker } from '.'

const mockGetJwtTokenPayload = getJwtTokenPayload as jest.Mock
const mockUseDateFilter = useDateFilter as jest.Mock

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: jest.fn(),
  useDateFilter: jest.fn()
}))

describe('DatePicker', () => {
  it('should open when click on date select', async () => {
    render(
      <IntlProvider locale='en'>
        <DatePicker />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Select date')
    await user.click(calenderSelect)
    expect(await screen.findByText('Su')).toBeDefined()
  })
})

describe('RangePicker', () => {
  beforeEach(() => {
    mockUseDateFilter.mockReturnValue({
      startDate: '2022-01-01T00:00:00+08:00',
      endDate: '2022-01-02T00:00:00+08:00',
      range: 'Last 24 Hours'
    })
    mockGetJwtTokenPayload.mockReturnValue({ acx_account_tier: AccountTier.PLATINUM })
  })
  afterEach(() => {
    mockGetJwtTokenPayload.mockClear()
  })
  it('should open when click on date select', async () => {
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.last24Hours}
          selectedRange={{
            startDate: moment().subtract(1, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
          onDateApply={() => {}}
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
          showTimePicker
        />
      </IntlProvider>

    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    expect(await screen.findAllByText('Su')).toHaveLength(2)
  })
  it('should close when click on apply', async () => {
    const { container } = render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.last7Days}
          onDateApply={() => {}}
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
          showTimePicker
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
        />
      </IntlProvider>

    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const applyButton = await screen.findByText('Apply')
    await user.click(applyButton)
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.getElementsByClassName('ant-picker-dropdown-hidden').length).toBe(1)
  })
  it('should close when click outside', async () => {
    const { container } = render(
      <IntlProvider locale='en'>
        <RangePicker
          onDateApply={() => {}}
          selectionType={DateRange.last7Days}
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
          showTimePicker
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    expect(await screen.findAllByText('Su')).toHaveLength(2)
    await user.click(document.body)
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.getElementsByClassName('ant-picker-dropdown-hidden').length).toBe(1)
  })
  it('should close when click on cancel', async () => {
    const { container } = render(
      <IntlProvider locale='en'>
        <RangePicker
          onDateApply={() => {}}
          selectionType={DateRange.last7Days}
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const cancelButton = await screen.findByText('Cancel')
    await user.click(cancelButton)
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.getElementsByClassName('ant-picker-dropdown-hidden').length).toBe(1)
  })
  it('should close when click on ranges', async () => {
    Object.defineProperty(HTMLElement.prototype, 'innerText', {
      get () {
        return this.textContent
      }
    })
    const { container } = render(
      <IntlProvider locale='en'>
        <RangePicker
          onDateApply={() => {}}
          selectionType={DateRange.last7Days}
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    await user.click(await screen.findByText('Last 24 Hours'))
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.getElementsByClassName('ant-picker-dropdown-hidden').length).toBe(1)
  })
  it('should select date when click on date selection', async () => {
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
          onDateApply={() => {}}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const yesterday = moment().subtract(1, 'day')
    const dateSelect = await screen.findAllByTitle(yesterday.format('YYYY-MM-DD'))
    await user.click(dateSelect[0])
    const today = formatter(DateFormatEnum.DateFormat)(moment())
    const yestFormat = formatter(DateFormatEnum.DateFormat)(yesterday)
    expect(screen.getByRole('display-date-range')).toHaveTextContent(`${yestFormat} - ${today}`)
  })
  it('should select time when click on time selection', async () => {
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.last7Days}
          showTimePicker
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
          onDateApply={() => {}}
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const timeSelect = await screen.findAllByRole('time-picker')
    await user.click(timeSelect[0])
    const hourSelect = await screen.findAllByText('20')
    await user.click(hourSelect[hourSelect.length - 1])
    expect(screen.getByRole('display-date-range')).toHaveTextContent('20:')
  })
  it('should select end time when click on end time selection', async () => {
    render(
      <IntlProvider locale='en'>
        <RangePicker
          showTimePicker
          selectionType={DateRange.last7Days}
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
          onDateApply={() => {}}
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
        />
      </IntlProvider>

    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const timeSelect = await screen.findAllByRole('time-picker')
    await user.click(timeSelect[2])
    const hourSelect = await screen.findAllByText('20')
    await user.click(hourSelect[hourSelect.length - 1])
    expect(screen.getByRole('display-date-range')).toHaveTextContent('20:')
  })
  it('should reset endTime to startTime when select startTime greater than endTime', async () => {
    render(
      <IntlProvider locale='en'>
        <RangePicker
          showTimePicker
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
          selectionType={DateRange.custom}
          onDateApply={() => {}}
          selectedRange={{
            startDate: moment('03/01/2022').seconds(0),
            endDate: moment('03/01/2022').seconds(0)
          }}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const timeSelect = await screen.findAllByRole('time-picker')
    await user.click(timeSelect[0])
    const hourSelect = await screen.findAllByText('20')
    await user.click(hourSelect[hourSelect.length - 1])
    expect(screen.getByRole('display-date-range')).toHaveTextContent('20:')
  })
  it('should display selection for null values', async () => {
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          selectedRange={{ startDate: null, endDate: null }}
          onDateApply={() => {}}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    expect(screen.getByRole('display-date-range')).toHaveTextContent('-')
  })
  it.skip('should display only start date when end date is not selected', async () => {
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: null
          }}
          onDateApply={() => {}}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const dateSelect = await screen.findAllByTitle(moment().format('YYYY-MM-DD'))
    await user.click(dateSelect[0])
    expect(
      screen.getByRole('display-date-range')
    ).toHaveTextContent(formatter(DateFormatEnum.DateFormat)(moment()))
  })
  it.skip('should display only end date when start date is not selected', async () => {
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          selectedRange={{
            startDate: null,
            endDate: moment().subtract(7, 'days').seconds(0)
          }}
          onDateApply={() => {}}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('End date')
    await user.click(calenderSelect)
    const dateSelect = await screen.findAllByTitle(moment().format('YYYY-MM-DD'))
    await user.click(dateSelect[0])
    expect(
      screen.getByRole('display-date-range')
    ).toHaveTextContent(formatter(DateFormatEnum.DateFormat)(moment()))
  })
  it('should disable apply when startdate and end date are same', async () => {
    const apply = jest.fn()
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          selectedRange={{
            startDate: moment('03/01/2022').hours(12),
            endDate: moment('03/01/2022').hours(12)
          }}
          onDateApply={apply}
          showTimePicker
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const timeSelect = await screen.findAllByRole('time-picker')
    await user.click(timeSelect[2])
    const hourSelect = await screen.findAllByText('11')
    await user.click(hourSelect[hourSelect.length - 1])
    expect(screen.getByRole('display-date-range')).not.toHaveTextContent('11:')
    const applyButton = await screen.findByText('Apply')
    await user.click(applyButton)
    expect(apply).toBeCalledTimes(0)
  })
  it('should restrict date for gold tier license', async () => {
    mockGetJwtTokenPayload.mockReturnValue({ acx_account_tier: AccountTier.GOLD })
    const apply = jest.fn()
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          selectedRange={{
            startDate: moment().subtract(3, 'months').seconds(0),
            endDate: moment().seconds(0)
          }}
          onDateApply={apply}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const dateSelect = await screen.findAllByTitle(
      moment().subtract(2, 'months').format('YYYY-MM-DD')
    )
    await user.click(dateSelect[0])
    const applyButton = await screen.findByText('Apply')
    await user.click(applyButton)
    expect(apply).toHaveBeenCalledTimes(1)
  })

  it('should display all time', async () => {
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          selectedRange={{ startDate: null, endDate: null }}
          onDateApply={() => {}}
          showAllTime={true}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    expect(screen.getByRole('display-date-range')).toHaveTextContent('-')
  })
  it('should display last 8 hours option', async () => {
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          selectedRange={{ startDate: null, endDate: null }}
          onDateApply={() => {}}
          isDashBoard={true}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    expect(await screen.findByText('Last 8 Hours')).toBeInTheDocument()
  })
  it('should from all time change to last 24 hours correctly', async () => {
    mockUseDateFilter.mockReturnValue({
      startDate: '2022-01-01T00:00:00+08:00',
      endDate: null,
      range: 'All Time'
    })

    render(
      <IntlProvider locale='en'>
        <RangePicker
          showTimePicker
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}

          selectionType={DateRange.custom}
          onDateApply={() => {}}
          selectedRange={{
            startDate: moment('03/01/2022').seconds(0),
            endDate: moment('03/01/2022').seconds(0)
          }}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    expect(screen.getByRole('display-date-range')).toHaveTextContent('-')
  })
})

describe('DateTimePicker', () => {
  it('should render default picker correctly', async () => {
    const mockedInitialDate = moment('07-15-2023', 'MM-DD-YYYY')
    const mockApply = jest.fn()
    const title = 'testTitle'
    render(<IntlProvider locale='en'>
      <DateTimePicker
        initialDate={{ current: mockedInitialDate }}
        onApply={mockApply}
        title={title}
      />
    </IntlProvider>)
    const calendarIcon = await screen.findByTestId('ClockOutlined')
    expect(calendarIcon).toBeVisible()
    const user = userEvent.setup()
    expect(screen.queryByRole('button', { name: 'Jul' })).toBeNull()
    await user.click(calendarIcon)
    expect(await screen.findByRole('button', { name: 'Jul' })).toBeInTheDocument()
  })
  it('should render picker with apply msg', async () => {
    const mockedInitialDate = moment('07-15-2023', 'MM-DD-YYYY')
    const mockApply = jest.fn()
    const applyMsg = 'this is a test message'
    const title = 'testTitle'
    render(<IntlProvider locale='en'>
      <DateTimePicker
        initialDate={{ current: mockedInitialDate }}
        onApply={mockApply}
        title={title}
        applyFooterMsg={applyMsg}
      />
    </IntlProvider>)
    const calendarIcon = await screen.findByTestId('ClockOutlined')
    expect(calendarIcon).toBeVisible()
    const user = userEvent.setup()
    expect(screen.queryByText('this is a test message')).toBeNull()
    await user.click(calendarIcon)
    expect(await screen.findByText('this is a test message')).toBeInTheDocument()
  })
  it('should handle title hover correctly', async () => {
    const mockedInitialDate = moment('07-15-2023', 'MM-DD-YYYY')
    const mockApply = jest.fn()
    const title = 'testTitle'
    render(<IntlProvider locale='en'>
      <DateTimePicker
        initialDate={{ current: mockedInitialDate }}
        onApply={mockApply}
        title={title}
      />
    </IntlProvider>)
    const calendarIcon = await screen.findByTestId('ClockOutlined')
    expect(calendarIcon).toBeVisible()
    const user = userEvent.setup()
    expect(screen.queryByTitle(title)).toBeNull()
    await user.hover(calendarIcon)
    expect(await screen.findByRole('tooltip', { name: title })).toBeInTheDocument()
  })
  it('should handle apply with calendar select correctly', async () => {
    const mockedInitialDate = moment('07-15-2023', 'MM-DD-YYYY')
    const mockApply = jest.fn()
    const title = 'testTitle'
    const MockIcon = () => <div data-testid='testIcon'>test icon</div>
    const TestComp = ({ date }: { date: Moment }) => {
      const timeRef = useRef(date)
      return <IntlProvider locale='en'>
        <DateTimePicker
          title={title}
          initialDate={timeRef}
          onApply={mockApply}
          icon={<MockIcon />}
        />
      </IntlProvider>

    }
    render(<TestComp date={mockedInitialDate} />)
    const user = userEvent.setup()
    await user.click(await screen.findByTestId('testIcon'))
    expect(await screen.findByPlaceholderText('Select date')).toHaveFocus()
    await user.click(await screen.findByText('16'))
    await user.click(await screen.findByRole('time-picker-hours'))
    await user.click(await screen.findByText('00'))
    await user.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(mockApply).toBeCalledTimes(1)
    expect(mockApply).toBeCalledWith(mockedInitialDate.clone().add(1, 'days'))
  })
  it('should handle cancel correctly', async () => {
    const mockedInitialDate = moment('07-15-2023', 'MM-DD-YYYY')
    const mockApply = jest.fn()
    render(<IntlProvider locale='en'>
      <DateTimePicker
        initialDate={{ current: mockedInitialDate }}
        onApply={mockApply}
      />
      <div data-testid='other'>test div</div>
    </IntlProvider>)
    const user = userEvent.setup()
    const calendarIcon = await screen.findByTestId('ClockOutlined')
    expect(calendarIcon).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Jul' })).toBeNull()
    await user.click(calendarIcon)
    expect(await screen.findByPlaceholderText('Select date')).toHaveFocus()
    const cancelBtn = await screen.findByRole('button', { name: 'Cancel' })
    await user.click(cancelBtn)
    await user.click(screen.getByTestId('other'))
    expect(await screen.findByPlaceholderText('Select date')).not.toHaveFocus()
  })
  it('should handle same date apply correctly', async () => {
    const mockedInitialDate = moment('07-15-2023 14:30', 'MM-DD-YYYY HH:mm')
    const mockApply = jest.fn()
    const mockDisableHours = jest.fn()
    const mockDisableMinutes = jest.fn()
    const TestComp = ({ date }: { date: Moment }) => {
      const timeRef = useRef(date)
      return <IntlProvider locale='en'>
        <DateTimePicker
          initialDate={timeRef}
          onApply={mockApply}
          disabledDateTime={{
            disabledHours: mockDisableHours,
            disabledMinutes: mockDisableMinutes
          }}
        />
      </IntlProvider>

    }
    render(<TestComp date={mockedInitialDate} />)
    const user = userEvent.setup()
    await waitFor(async () => {
      await user.click(await screen.findByTestId('ClockOutlined'))
      await user.click(await screen.findByRole('time-picker-minutes'))
      await user.click(await screen.findByText('45'))
      await user.click(await screen.findByRole('time-picker-hours'))
      const text23 = await screen.findAllByText('23')
      await user.click(text23[text23.length - 1])
      await user.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(mockApply).toHaveBeenCalledTimes(1)
    })
    expect(mockApply).toHaveBeenNthCalledWith(
      1,
      mockedInitialDate.clone().add(15, 'minutes').add(9, 'hours'))
    expect(mockDisableHours).toBeCalled()
    expect(mockDisableMinutes).toBeCalled()
  })
})