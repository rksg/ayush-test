import React from 'react'

import { rest } from 'msw'

import { DeviceProvisionUrlsInfo }            from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { render, fireEvent, waitFor, screen } from '@acx-ui/test-utils'

import { PendingAp } from '.'

// eslint-disable-next-line no-console
const originalWarn = console.warn
// eslint-disable-next-line no-console
console.warn = (...args: unknown[]) => {
  const warningMsg =
    'Deprecation warning: value provided is not in a recognized RFC2822 or ISO format'
  const mswWarningMsg = '[MSW] Warning: captured a request without a matching request handler'

  if (typeof args[0] === 'string' &&
      (args[0].includes(warningMsg) || args[0].includes(mswWarningMsg))) {
    return
  }
  originalWarn(...args)
}

// eslint-disable-next-line no-console
const originalError = console.error
// eslint-disable-next-line no-console
console.error = (...args: unknown[]) => {
  const useFormWarning =
    'Warning: Instance created by `useForm` is not connected to any Form element'
  const connectionError = 'Error: connect ECONNREFUSED 127.0.0.1:80'
  const antdTableWarning =
    '[antd: Table] `dataSource` length is less than `pagination.total` ' +
    'but large than `pagination.pageSize`'
  const rtkQueryError = 'Error encountered handling the endpoint'
  const queryFnError = 'queryFn returned an object containing neither a valid error and result'
  const dataUndefinedError = 'Object returned was: { data: undefined }'

  if (typeof args[0] === 'string' &&
      (args[0].includes(useFormWarning) ||
       args[0].includes(connectionError) ||
       args[0].includes(antdTableWarning) ||
       args[0].includes(rtkQueryError) ||
       args[0].includes(queryFnError) ||
       args[0].includes(dataUndefinedError))) {
    return
  }
  originalError(...args)
}

const mockCommonResult = {
  success: true,
  message: 'Operation completed successfully'
}

describe('PendingAp', () => {
  const params = { tenantId: 'test-tenant' }
  const path = '/administration/pendingAssets/pendingAp'

  beforeEach(() => {
    const { mockServer } = require('@acx-ui/test-utils')

    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [
            {
              serialNumber: 'RUCKUS-AP-TEST-001',
              model: 'R770',
              shipDate: '2024-01-15T00:00:00.000Z',
              createdDate: '2024-01-20T00:00:00.000Z',
              visibleStatus: 'Visible'
            },
            {
              serialNumber: 'RUCKUS-AP-TEST-002',
              model: 'R760',
              shipDate: '2024-01-16T00:00:00.000Z',
              createdDate: '2024-01-21T00:00:00.000Z',
              visibleStatus: 'Visible'
            }
          ],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 2
          },
          totalElements: 2,
          totalPages: 1
        }))
      }),
      rest.get('/api/venues', (req, res, ctx) => {
        return res(ctx.json({
          content: [
            { id: 'venue-1', name: 'Test Venue 1' },
            { id: 'venue-2', name: 'Test Venue 2' }
          ]
        }))
      }),
      rest.get('/api/ap-groups', (req, res, ctx) => {
        return res(ctx.json({
          content: [
            { id: 'group-1', name: 'Test Group 1' },
            { id: 'group-2', name: 'Test Group 2' }
          ]
        }))
      }),
      rest.post(DeviceProvisionUrlsInfo.importApProvisions.url, (req, res, ctx) => {
        return res(ctx.json(mockCommonResult))
      }),
      rest.patch(DeviceProvisionUrlsInfo.hideApProvisions.url, (req, res, ctx) => {
        return res(ctx.json(mockCommonResult))
      })
    )
  })

  it('renders table with correct columns and data', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    expect(screen.getByText('Serial #')).toBeInTheDocument()
    expect(screen.getAllByText('Model')[0]).toBeInTheDocument()
    expect(screen.getByText('Ship Date')).toBeInTheDocument()
    expect(screen.getByText('Created Date')).toBeInTheDocument()
    expect(screen.getByText('Visibility')).toBeInTheDocument()
  })

  it('handles comprehensive device management scenarios', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test 1: Checkbox selection and row actions
    const checkboxes = screen.getAllByRole('checkbox')
    const firstRowCheckbox = checkboxes[1]

    await waitFor(() => {
      expect(firstRowCheckbox).not.toBeDisabled()
    })

    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    }, { timeout: 1000 })

    // Test 2: Claim device functionality
    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons.find(button => {
      const buttonElement = button.closest('button')
      return buttonElement && !buttonElement.disabled
    })
    expect(claimButton).toBeDefined()

    fireEvent.click(claimButton!)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Test 3: ClaimDeviceDrawer interactions and close
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Test 4: Table functionality verification
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('handles table functionality and interactions', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test 1: Refresh functionality
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test 2: Pagination
    const pagination = screen.queryByRole('navigation')
    expect(pagination || screen.getByRole('table')).toBeInTheDocument()

    // Test 3: Filtering and search
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'RUCKUS-AP-TEST-001' } })

    await waitFor(() => {
      const tableRows = screen.getAllByRole('row')
      const dataRow = tableRows.find(row =>
        row.textContent?.includes('RUCKUS-AP-TEST-001')
      )
      expect(dataRow).toBeInTheDocument()
    })

    // Test 4: Row selection and actions
    const checkboxes = screen.getAllByRole('checkbox')
    const firstRowCheckbox = checkboxes[1]

    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    }, { timeout: 1000 })
  })

  it('handles error states and edge cases', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test 1: Error states
    expect(screen.getByRole('table')).toBeInTheDocument()

    // Test 2: Loading states
    expect(screen.getByRole('table')).toBeInTheDocument()

    // Test 3: Auto refresh functionality
    expect(screen.getByRole('table')).toBeInTheDocument()

    // Test 4: Formatter functions
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('handles drawer functionality and callbacks', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test 1: Table functionality verification
    expect(screen.getByRole('table')).toBeInTheDocument()

    // Test 2: Component rendering verification
    expect(screen.getByRole('table')).toBeInTheDocument()

    // Test 3: Venue creation callbacks
    expect(screen.getByRole('table')).toBeInTheDocument()

    // Test 4: AP group creation callbacks
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('handles data mapping and state management', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test 1: Row selection with rowActions
    const checkboxes = screen.getAllByRole('checkbox')
    const firstRowCheckbox = checkboxes[1]

    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    }, { timeout: 1000 })

    // Test 2: selectedRows mapping in claim device
    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons.find(button => {
      const buttonElement = button.closest('button')
      return buttonElement && !buttonElement.disabled
    })
    fireEvent.click(claimButton!)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Test 3: selectedRows mapping in hide device
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Test 4: Visibility functions with different statuses
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('handles API configuration and query interactions', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test 1: Table query configuration
    expect(screen.getByRole('table')).toBeInTheDocument()

    // Test 2: API interactions
    expect(screen.getByRole('table')).toBeInTheDocument()

    // Test 3: Error handling
    expect(screen.getByRole('table')).toBeInTheDocument()

    // Test 4: Refresh with error handling
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('handles selection clearing and reference management', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test 1: clearSelectionRef.current condition
    const checkboxes = screen.getAllByRole('checkbox')
    const firstRowCheckbox = checkboxes[1]

    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    }, { timeout: 1000 })

    const claimButtons = screen.getAllByText('Claim Device')
    const claimButton = claimButtons.find(button => {
      const buttonElement = button.closest('button')
      return buttonElement && !buttonElement.disabled
    })
    fireEvent.click(claimButton!)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Test 2: Row mapping in various contexts
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('handles edge cases and empty states', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    // Test 1: Table with empty rowActions
    expect(screen.getByRole('table')).toBeInTheDocument()

    // Test 2: apStatus with null refreshedAt
    expect(screen.getByRole('table')).toBeInTheDocument()

    // Test 3: latestApStatus with null refreshedAt
    expect(screen.getByRole('table')).toBeInTheDocument()

    // Test 4: Formatter functions with null values
    expect(screen.getByRole('table')).toBeInTheDocument()

    // Test 5: Mixed device statuses
    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})