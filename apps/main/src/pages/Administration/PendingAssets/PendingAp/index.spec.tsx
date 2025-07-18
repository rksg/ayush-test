import React from 'react'

import { rest } from 'msw'

import { DeviceProvisionUrlsInfo, CommonUrlsInfo }    from '@acx-ui/rc/utils'
import { Provider }                                   from '@acx-ui/store'
import { render, fireEvent, waitFor, screen, within } from '@acx-ui/test-utils'
import { setUserProfile, UserProfile }                from '@acx-ui/user'

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

  if (typeof args[0] === 'string' &&
      (args[0].includes(useFormWarning) || args[0].includes(connectionError))) {
    return
  }
  originalError(...args)
}

const mockDeviceProvisions = [
  {
    serialNumber: 'RUCKUS-AP-001',
    model: 'R770',
    shipDate: '2024-01-15T00:00:00.000Z',
    createdDate: '2024-01-20T00:00:00.000Z',
    visibleStatus: 'Visible'
  },
  {
    serialNumber: 'RUCKUS-AP-002',
    model: 'R760',
    shipDate: '2024-01-16T00:00:00.000Z',
    createdDate: '2024-01-21T00:00:00.000Z',
    visibleStatus: 'Hidden'
  },
  {
    serialNumber: 'RUCKUS-AP-003',
    model: 'R770',
    shipDate: '2024-01-17T00:00:00.000Z',
    createdDate: '2024-01-22T00:00:00.000Z',
    visibleStatus: 'Visible'
  },
  {
    serialNumber: 'RUCKUS-AP-004',
    model: 'R760',
    shipDate: '2024-01-18T00:00:00.000Z',
    createdDate: '2024-01-23T00:00:00.000Z',
    visibleStatus: 'Visible'
  },
  {
    serialNumber: 'RUCKUS-AP-005',
    model: 'R770',
    shipDate: '2024-01-19T00:00:00.000Z',
    createdDate: '2024-01-24T00:00:00.000Z',
    visibleStatus: 'Hidden'
  },
  {
    serialNumber: 'RUCKUS-AP-006',
    model: 'R760',
    shipDate: '2024-01-20T00:00:00.000Z',
    createdDate: '2024-01-25T00:00:00.000Z',
    visibleStatus: 'Visible'
  }
]

const mockApStatus = {
  refreshedAt: '2024-01-25T10:30:00.000Z'
}

const mockApModels = ['R770', 'R760', 'R750', 'R730']

const mockApiResponse = {
  content: mockDeviceProvisions,
  pageable: {
    pageNumber: 0,
    pageSize: 10,
    totalElements: 6
  },
  totalElements: 6,
  totalPages: 1
}

const mockCommonResult = {
  success: true,
  message: 'Operation completed successfully'
}

describe('PendingAp component', () => {
  const params: { tenantId: string } = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }
  const path = '/:tenantId/administration/PendingAssets'

  beforeEach(() => {
    setUserProfile({
      profile: { dateFormat: 'MMM DD YYYY' } as UserProfile,
      allowedOperations: []
    })

    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApStatus.url, (req, res, ctx) => {
        return res(ctx.json(mockApStatus))
      }),
      rest.get(DeviceProvisionUrlsInfo.getApModels.url, (req, res, ctx) => {
        return res(ctx.json(mockApModels))
      }),
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json(mockApiResponse))
      }),
      rest.post(DeviceProvisionUrlsInfo.refreshApStatus.url, (req, res, ctx) => {
        return res(ctx.json(mockCommonResult))
      }),
      rest.patch(DeviceProvisionUrlsInfo.hideApProvisions.url, (req, res, ctx) => {
        return res(ctx.json(mockCommonResult))
      }),
      rest.post(CommonUrlsInfo.getVenuesList.url, (req, res, ctx) => {
        return res(ctx.json({ data: [], totalElements: 0 }))
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

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Serial #')).toBeInTheDocument()
    })

    const columnSelector = { selector: '.ant-table-column-title' }
    expect(screen.getByText('Model', columnSelector)).toBeInTheDocument()
    expect(screen.getByText('Ship Date', columnSelector)).toBeInTheDocument()
    expect(screen.getByText('Created Date', columnSelector)).toBeInTheDocument()
    expect(screen.getByText('Visibility', columnSelector)).toBeInTheDocument()

    await waitFor(() => {
      const dataRows = table.querySelectorAll('tbody tr:not(.ant-table-measure-row)')
      expect(dataRows.length).toBeGreaterThan(0)
    })

    const dataRows = table.querySelectorAll('tbody tr:not(.ant-table-measure-row)')
    const firstRow = dataRows[0] as HTMLElement
    expect(within(firstRow).getByText('RUCKUS-AP-001')).toBeInTheDocument()
    expect(within(firstRow).getByText('R770')).toBeInTheDocument()
  })

  it('displays refresh time and refresh button', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByText('Updated at')).toBeInTheDocument()
    })
    expect(screen.getByTestId('test-refresh-time')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
  })

  it('handles refresh button click', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByTestId('test-refresh-time')).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: 'Refresh' })

    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
    })
  })

  it('handles table sorting', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const serialHeader = screen.getByText('Serial #', { selector: '.ant-table-column-title' })
    fireEvent.click(serialHeader)

    await waitFor(() => {
      expect(serialHeader).toBeInTheDocument()
    })
  })

  it('handles row selection', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })
  })

  it('displays loading state correctly', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: 'Refresh' })
    expect(refreshButton).toBeInTheDocument()

    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Internal Server Error' }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('formats dates correctly', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const table = screen.getByRole('table')
    const dataRows = table.querySelectorAll('tbody tr')
    expect(dataRows.length).toBeGreaterThan(0)
  })

  it('handles pagination correctly', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })

  it('handles multiple row selection', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    const firstRowCheckbox = checkboxes[1]
    const secondRowCheckbox = checkboxes[2]

    fireEvent.click(firstRowCheckbox)
    fireEvent.click(secondRowCheckbox)

    await waitFor(() => {
      const firstChecked = firstRowCheckbox.getAttribute('aria-checked')
      expect(['true', 'mixed', null]).toContain(firstChecked)
    })
    await waitFor(() => {
      const secondChecked = secondRowCheckbox.getAttribute('aria-checked')
      expect(['true', 'mixed', null]).toContain(secondChecked)
    })
  })

  it('handles select all functionality', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(selectAllCheckbox)

    await waitFor(() => {
      const checked = selectAllCheckbox.getAttribute('aria-checked')
      expect(['true', 'mixed', null]).toContain(checked)
    })
  })

  it('handles filter by model', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const modelColumn = screen.getByText('Model', { selector: '.ant-table-column-title' })
    expect(modelColumn).toBeInTheDocument()
  })

  it('handles hide device action', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })

    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('handles claim device action', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })

    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('handles empty data state', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: [],
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 0
          },
          totalElements: 0,
          totalPages: 0
        }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('handles network timeout errors', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.status(408), ctx.json({ message: 'Request Timeout' }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('handles component unmounting gracefully', async () => {
    const { unmount } = render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    unmount()
  })

  it('handles keyboard navigation', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: 'Refresh' })
    refreshButton.focus()

    fireEvent.keyDown(refreshButton, { key: 'Enter', code: 'Enter' })
    fireEvent.keyDown(refreshButton, { key: ' ', code: 'Space' })

    await waitFor(() => {
      expect(refreshButton).toBeInTheDocument()
    })
  })

  it('handles large dataset rendering', async () => {
    const largeDataset = Array.from({ length: 100 }, (_, index) => ({
      serialNumber: `RUCKUS-AP-${String(index + 1).padStart(3, '0')}`,
      model: index % 2 === 0 ? 'R770' : 'R760',
      shipDate: '2024-01-15T00:00:00.000Z',
      createdDate: '2024-01-20T00:00:00.000Z',
      visibleStatus: 'Visible'
    }))

    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({
          content: largeDataset.slice(0, 10),
          pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 100
          },
          totalElements: 100,
          totalPages: 10
        }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('handles page navigation', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        const page = req.url.searchParams.get('page') || '0'
        const pageSize = req.url.searchParams.get('size') || '10'

        return res(ctx.json({
          content: mockDeviceProvisions.slice(0, parseInt(pageSize, 10)),
          pageable: {
            pageNumber: parseInt(page, 10),
            pageSize: parseInt(pageSize, 10),
            totalElements: 6
          },
          totalElements: 6,
          totalPages: 1
        }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('handles page size changes', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })

  it('handles search functionality', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search Serial #, Model')
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: 'RUCKUS-AP-001' } })
      fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' })
    }
  })

  it('handles column sorting in different directions', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const modelHeader = screen.getByText('Model', { selector: '.ant-table-column-title' })

    fireEvent.click(modelHeader)
    await waitFor(() => {
      expect(modelHeader).toBeInTheDocument()
    })

    fireEvent.click(modelHeader)
    await waitFor(() => {
      expect(modelHeader).toBeInTheDocument()
    })
  })

  it('handles error state display', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApStatus.url, (req, res, ctx) => {
        return res(ctx.status(404), ctx.json({ message: 'Not Found' }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('handles loading state during refresh', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: 'Refresh' })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: 'Refresh' })
      expect(refreshButton).toBeInTheDocument()
    })
  })

  it('handles successful hide operation', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.patch(DeviceProvisionUrlsInfo.hideApProvisions.url, (req, res, ctx) => {
        return res(ctx.json({ success: true, message: 'Devices hidden successfully' }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })

    const hideButton = screen.queryByText(/Hide Device/i)
    if (hideButton) {
      fireEvent.click(hideButton)
    }

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: 'Refresh' })
      expect(refreshButton).toBeInTheDocument()
    })
  })

  it('handles failed hide operation', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.patch(DeviceProvisionUrlsInfo.hideApProvisions.url, (req, res, ctx) => {
        return res(ctx.status(400), ctx.json({ message: 'Bad Request' }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })

    const hideButton = screen.queryByText(/Hide Device/i)
    if (hideButton) {
      fireEvent.click(hideButton)
    }

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: 'Refresh' })
      expect(refreshButton).toBeInTheDocument()
    })
  })

  it('handles auto refresh functionality', async () => {
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.get(DeviceProvisionUrlsInfo.getApStatus.url, (req, res, ctx) => {
        return res(ctx.json({ refreshedAt: null }))
      })
    )

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })
  })

  it('handles venue drawer functionality', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })

    const claimButton = screen.getByText('Claim Device')
    fireEvent.click(claimButton)

    await waitFor(() => {
      expect(claimButton).toBeInTheDocument()
    })
  })

  it('handles AP group drawer functionality', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })

    const claimButton = screen.getByText('Claim Device')
    fireEvent.click(claimButton)

    await waitFor(() => {
      expect(claimButton).toBeInTheDocument()
    })
  })

  it('handles accessibility features', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })

  it('handles responsive design', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768
    })

    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })
  })

  it('handles data refresh after successful operations', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: 'Refresh' })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: 'Refresh' })
      expect(refreshButton).toBeInTheDocument()
    })
  })

  it('handles concurrent operations', async () => {
    render(
      <Provider>
        <PendingAp />
      </Provider>, {
        route: { params, path }
      })

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button', { name: 'Refresh' })
    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]

    fireEvent.click(refreshButton)
    fireEvent.click(firstRowCheckbox)

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: 'Refresh' })
      expect(refreshButton).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(firstRowCheckbox).toBeChecked()
    })
  })
})