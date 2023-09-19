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
  })
})

describe('filterOption', () => {
  it('return correct state', () => {
    expect(filterOption('an', { key: 'jj', title: 'ant' })).toBe(true)
    expect(filterOption('j', { key: 'jj', title: 'ant' })).toBe(false)
  })
})
