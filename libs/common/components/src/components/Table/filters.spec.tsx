import userEvent         from '@testing-library/user-event'
import moment            from 'moment'
import { BrowserRouter } from 'react-router-dom'

import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { renderFilter, filterOption, getFilteredData } from './filters'

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
          filterComponent: { type: 'rangepicker', unlimitedRange: true }
        },
        0,
        undefined,
        {},
        filterableCol,
        false,
        200
      )}</BrowserRouter>)
      const startDateInputs = screen.getAllByPlaceholderText('Start date')
      expect(startDateInputs.length).toBeGreaterThan(0)
      const hasFromTimeValue = Array.from(startDateInputs).some(input =>
        input.getAttribute('value') === 'From Time'
      )
      expect(hasFromTimeValue).toBe(true)
      await userEvent.click(startDateInputs[0])
      const yesterday = moment().subtract(1, 'day')
      const dateSelect = await screen.findAllByTitle(yesterday.format('YYYY-MM-DD'))
      await userEvent.click(dateSelect[0])
      const today = formatter(DateFormatEnum.DateFormat)(moment())
      const yestFormat = formatter(DateFormatEnum.DateFormat)(yesterday)
      expect(screen.getByRole('display-date-range')).toHaveTextContent(`${yestFormat} - ${today}`)
      const applyButton = await screen.findByRole('button', { name: 'Apply' })
      await userEvent.click(applyButton)
    })
    it('should render with range picker component and close when click on cancel', async () => {
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
      const startDateInputs = screen.getAllByPlaceholderText('Start date')
      expect(startDateInputs.length).toBeGreaterThan(0)
      const hasFromTimeValue = Array.from(startDateInputs).some(input =>
        input.getAttribute('value') === 'From Time'
      )
      expect(hasFromTimeValue).toBe(true)
      await userEvent.click(startDateInputs[0])
      const yesterday = moment().subtract(1, 'day')
      const dateSelect = await screen.findAllByTitle(yesterday.format('YYYY-MM-DD'))
      await userEvent.click(dateSelect[0])
      const today = formatter(DateFormatEnum.DateFormat)(moment())
      const yestFormat = formatter(DateFormatEnum.DateFormat)(yesterday)
      expect(screen.getByRole('display-date-range')).toHaveTextContent(`${yestFormat} - ${today}`)
      const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
      await userEvent.click(cancelButton)
    })
    it('should render with range picker component and close when click on All Time', async () => {
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
      const startDateInputs = screen.getAllByPlaceholderText('Start date')
      expect(startDateInputs.length).toBeGreaterThan(0)
      const hasFromTimeValue = Array.from(startDateInputs).some(input =>
        input.getAttribute('value') === 'From Time'
      )
      expect(hasFromTimeValue).toBe(true)
      await userEvent.click(startDateInputs[0])
      const yesterday = moment().subtract(1, 'day')
      const dateSelect = await screen.findAllByTitle(yesterday.format('YYYY-MM-DD'))
      await userEvent.click(dateSelect[0])
      const today = formatter(DateFormatEnum.DateFormat)(moment())
      const yestFormat = formatter(DateFormatEnum.DateFormat)(yesterday)
      expect(screen.getByRole('display-date-range')).toHaveTextContent(`${yestFormat} - ${today}`)
      const option = await screen.findByText('All Time')
      await userEvent.click(option)
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

  describe('getFilteredData', () => {
    describe('columns with string values', () => {
      const activeFilters = [
        {
          key: 'name',
          dataIndex: 'name',
          filterable: true,
          filterMultiple: false
        },
        {
          key: 'value',
          dataIndex: 'value',
          filterable: true,
          filterMultiple: false
        }
      ]

      it('should return filtered data without children', () => {
        const dataSource = [
          { name: 'john', value: 'apples' },
          { name: 'jane', value: 'banana' }
        ]
        const filterValues = { name: ['john'], value: ['apples', 'banana'] }

        expect(
          getFilteredData(dataSource, filterValues, activeFilters, [], '')
        ).toEqual([
          {
            name: 'john',
            value: 'apples',
            children: undefined
          }
        ])
      })

      it('should return filtered data with children', () => {
        const dataSource = [
          {
            name: 'john',
            value: 'carrot',
            children: [
              { name: 'jack', value: 'apples' },
              { name: 'jack', value: 'banana' },
              { name: 'john', value: 'carrot' }
            ]
          },
          { name: 'jane', value: 'banana' }
        ]
        const filterValues = { name: ['jack'], value: ['apples', 'banana'] }

        expect(
          getFilteredData(dataSource, filterValues, activeFilters, [], '')
        ).toEqual([
          {
            name: 'john',
            value: 'carrot',
            children: [
              { name: 'jack', value: 'apples' },
              { name: 'jack', value: 'banana' }
            ]
          }
        ])
      })

      it('should return no children when parent is filtered', () => {
        const dataSource = [
          {
            name: 'john',
            value: 'carrot',
            children: [
              { name: 'jack', value: 'apples' },
              { name: 'jack', value: 'banana' },
              { name: 'john', value: 'carrot' }
            ]
          },
          { name: 'jane', value: 'banana' }
        ]
        const filterValues = { name: ['jack'], value: ['apples', 'banana'] }

        expect(
          getFilteredData(dataSource, filterValues, activeFilters, [], '', [
            'name'
          ])
        ).toEqual([])
        expect(
          getFilteredData(dataSource, filterValues, activeFilters, [], '', [
            'value'
          ])
        ).toEqual([])
      })
    })

    describe('columns with boolean values', () => {
      const activeFilters = [
        {
          key: 'value',
          dataIndex: 'value',
          filterable: true,
          filterMultiple: false
        }
      ]

      it('should return filtered data without children', () => {
        const dataSource = [
          { name: 'john', value: true },
          { name: 'jane', value: false }
        ]
        const filterValues = { value: ['true'] }

        expect(
          getFilteredData(dataSource, filterValues, activeFilters, [], '')
        ).toEqual([
          {
            name: 'john',
            value: true,
            children: undefined
          }
        ])
      })

      it('should return filtered data with children', () => {
        const dataSource = [
          {
            name: 'john',
            value: false,
            children: [
              { name: 'jack', value: true },
              { name: 'jack', value: false },
              { name: 'john', value: true }
            ]
          },
          { name: 'jane', value: true }
        ]
        const filterValues = { value: ['true'] }

        expect(
          getFilteredData(dataSource, filterValues, activeFilters, [], '')
        ).toEqual([
          {
            name: 'john',
            value: false,
            children: [
              { name: 'jack', value: true },
              { name: 'john', value: true }
            ]
          },
          {
            name: 'jane',
            value: true,
            children: undefined
          }
        ])
      })

      it('should return no children when parent is filtered', () => {
        const dataSource = [
          {
            name: 'john',
            value: false,
            children: [
              { name: 'jack', value: true },
              { name: 'jack', value: false },
              { name: 'john', value: true }
            ]
          },
          { name: 'jane', value: true }
        ]
        const filterValues = { value: ['true'] }

        expect(
          getFilteredData(dataSource, filterValues, activeFilters, [], '', [
            'value'
          ])
        ).toEqual([
          {
            name: 'jane',
            value: true,
            children: undefined
          }
        ])
      })
    })
  })
})

describe('filterOption', () => {
  it('return correct state', () => {
    expect(filterOption('an', { key: 'jj', title: 'ant' })).toBe(true)
    expect(filterOption('j', { key: 'jj', title: 'ant' })).toBe(false)
  })
})
