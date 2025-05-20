import { cleanup, waitFor } from '@testing-library/react'
import userEvent            from '@testing-library/user-event'

import { UnifiedServiceCategory } from '@acx-ui/rc/utils'
import { render, screen }         from '@acx-ui/test-utils'

import { ServicesToolBar, ServiceSortOrder } from './ServicesToolBar'

describe('ServicesToolBar', () => {
  const mockedSetSearchTerm = jest.fn()
  const mockedSetFilters = jest.fn()
  const mockedSetSortOrder = jest.fn()

  const renderToolbar = () => {
    render(
      <ServicesToolBar
        setSearchTerm={mockedSetSearchTerm}
        setFilters={mockedSetFilters}
        setSortOrder={mockedSetSortOrder}
        defaultSortOrder={ServiceSortOrder.ASC}
      />
    )
  }

  afterEach(() => {
    jest.clearAllMocks()
    cleanup()
  })

  it('should debounce and call setSearchTerm when typing in search input', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(require('lodash'), 'debounce').mockImplementation((fn: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const immediateFn = (...args: any[]) => fn(...args)
      return Object.assign(immediateFn, { cancel: jest.fn() })
    })

    renderToolbar()

    const input = screen.getByPlaceholderText('Search for network controls...')
    await userEvent.type(input, 'aaa')

    await waitFor(() => {
      expect(mockedSetSearchTerm).toHaveBeenCalledWith('aaa')
    })
  })

  it('should call setFilters with products when selecting a product', async () => {
    renderToolbar()

    await userEvent.click(screen.getByText('Product'))
    await userEvent.click(screen.getByText('Wi-Fi'))

    await waitFor(() => {
      expect(mockedSetFilters).toHaveBeenCalledWith(expect.any(Function))
    })

    // Get the first argument passed to the first call of mockedSetFilters (expected to be a function),
    // then call it with an empty object and expect it to return an object with products: ['wifi']
    const update = mockedSetFilters.mock.calls[0][0]
    expect(update({})).toEqual({ products: ['wifi'] })
  })

  it('should call setFilters with categories when selecting a category', async () => {
    renderToolbar()

    await userEvent.click(screen.getByText('Category'))
    await userEvent.click(screen.getByText('Authentication & Identity Management'))

    await waitFor(() => {
      expect(mockedSetFilters).toHaveBeenCalledWith(expect.any(Function))
    })

    // Get the first argument passed to the first call of mockedSetFilters (expected to be a function),
    // then call it with an empty object and expect it to return an object with categories: [UnifiedServiceCategory.AUTHENTICATION_IDENTITY]
    const update = mockedSetFilters.mock.calls[0][0]
    expect(update({})).toEqual({ categories: [UnifiedServiceCategory.AUTHENTICATION_IDENTITY] })
  })

  it('should call setSortOrder when selecting a sort option', async () => {
    renderToolbar()

    await userEvent.click(screen.getByText('Name (A > Z)'))
    await userEvent.click(screen.getByText('Name (Z > A)'))

    expect(mockedSetSortOrder).toHaveBeenCalledWith(ServiceSortOrder.DESC)
  })

  it('should cleanup debounce on unmount', () => {
    const cancelFn = jest.fn()
    jest.spyOn(require('lodash'), 'debounce').mockReturnValue({
      cancel: cancelFn
    })
    renderToolbar()
    cleanup()
    expect(cancelFn).toHaveBeenCalled()
  })
})
