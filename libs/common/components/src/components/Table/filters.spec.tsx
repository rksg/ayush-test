import userEvent         from '@testing-library/user-event'
import moment            from 'moment'
import { BrowserRouter } from 'react-router-dom'

import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { renderFilter, filterOption } from './filters'

describe('Table Filters', () => {
  afterEach(() => jest.resetAllMocks())

  describe('renderFilter', () => {
    it('should handle unchecking selected data with correct data', async () => {
      const filterableCol = jest.fn()
      render(renderFilter<{ name: string }>(
        {
          key: 'name',
          dataIndex: 'name',
          filterable: true,
          filterValueNullable: false,
          filterMultiple: false
        },
        0,
        [{ name: 'john tan' }, { name: 'dragon den' }],
        { 'john tan': true as unknown as boolean[] },
        filterableCol,
        false,
        200
      ))
      const select = await screen.findByRole('combobox', { hidden: true , queryFallbacks: true })
      fireEvent.mouseDown(select)
      fireEvent.click((await screen.findAllByText('john tan'))[0])
    })

    it('should render with undefined data', () => {
      const filterableCol = jest.fn()
      render(renderFilter<{ name: string }>(
        {
          key: 'name',
          dataIndex: 'name',
          filterable: true,
          filterMultiple: false
        },
        0,
        undefined,
        {},
        filterableCol,
        false,
        200
      ))
    })

    it('should render with filterable array data', () => {
      const filterableCol = jest.fn()
      render(renderFilter<{ name: string }>(
        {
          key: 'name',
          dataIndex: 'name',
          filterable: [{ key: 'john', value: 'tan' }],
          filterMultiple: false
        },
        0,
        undefined,
        {},
        filterableCol,
        false,
        200
      ))
    })
    it('should render with filterValueNullable = false', async () => {
      const filterableCol = jest.fn()
      render(renderFilter<{ name: string }>(
        {
          key: 'name',
          dataIndex: 'name',
          filterable: [{ key: 'john', value: 'tan' }],
          filterMultiple: false,
          filterValueNullable: false
        },
        0,
        [{ name: 'john tan' }, { name: 'dragon den' }],
        {},
        filterableCol,
        false,
        200
      ))
      const select = await screen.findByRole('combobox', { hidden: true , queryFallbacks: true })
      fireEvent.mouseDown(select)
      fireEvent.click((await screen.findAllByText('tan'))[0])
    })

    it('should render with checkbox component', async () => {
      const filterableCol = jest.fn()
      render(renderFilter<{ includeExpired: boolean }>(
        {
          key: 'includeExpired',
          dataIndex: 'includeExpired',
          filterKey: 'includeExpired',
          filterable: true,
          filterComponent: { type: 'checkbox', label: 'Show expired guests' },
          defaultFilteredValue: [true]
        },
        0,
        undefined,
        {},
        filterableCol,
        false,
        200
      ))
      const checkbox = await screen.findByRole('checkbox', { name: 'Show expired guests' })
      await userEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })
    it('should render undefined value with checkbox component', async () => {
      const filterableCol = jest.fn()
      render(renderFilter<{ includeExpired: boolean }>(
        {
          key: 'includeExpired',
          dataIndex: 'includeExpired',
          filterKey: 'includeExpired',
          filterable: true,
          filterComponent: { type: 'checkbox', label: 'Show expired guests' },
          defaultFilteredValue: [true],
          filterValueNullable: false
        },
        0,
        undefined,
        { includeExpired: [] },
        filterableCol,
        false,
        200
      ))
      const checkbox = await screen.findByRole('checkbox', { name: 'Show expired guests' })
      await userEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })
    it('should render with range picker component', async () => {
      const filterableCol = jest.fn()
      render(<BrowserRouter>{renderFilter<{ fromTime: string }>(
        {
          key: 'fromTime',
          dataIndex: 'fromTime',
          title: 'From Time',
          filterable: true,
          filterKey: 'fromTime',
          filterComponent: { type: 'rangepicker' }
        },
        0,
        undefined,
        {},
        filterableCol,
        false,
        200
      )}</BrowserRouter>)
      const calenderSelect = await screen.findByText('From Time')
      await userEvent.click(calenderSelect)
      const yesterday = moment().subtract(1, 'day')
      const dateSelect = await screen.findAllByTitle(yesterday.format('YYYY-MM-DD'))
      await userEvent.click(dateSelect[0])
      const today = formatter(DateFormatEnum.DateFormat)(moment())
      const yestFormat = formatter(DateFormatEnum.DateFormat)(yesterday)
      expect(screen.getByRole('display-date-range')).toHaveTextContent(`${yestFormat} - ${today}`)
      const applyButton = await screen.findByRole('button', { name: 'Apply' })
      await userEvent.click(applyButton)
    })
    it('should render undefined value with range picker component', async () => {
      const filterableCol = jest.fn()
      render(<BrowserRouter>{renderFilter<{ fromTime: string }>(
        {
          key: 'fromTime',
          dataIndex: 'fromTime',
          title: 'From Time',
          filterable: true,
          filterKey: 'fromTime',
          filterComponent: { type: 'rangepicker' }
        },
        0,
        undefined,
        { fromTime: null, toTime: null },
        filterableCol,
        false,
        200
      )}</BrowserRouter>)
    })
  })
})

describe('filterOption', () => {
  it('return correct state', () => {
    expect(filterOption('an', { key: 'jj', title: 'ant' })).toBe(true)
    expect(filterOption('j', { key: 'jj', title: 'ant' })).toBe(false)
  })
})
