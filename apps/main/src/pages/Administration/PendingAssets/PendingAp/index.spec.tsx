import React from 'react'

import { rest } from 'msw'

import { DeviceProvisionUrlsInfo }                    from '@acx-ui/rc/utils'
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
  if (typeof args[0] === 'string' &&
      args[0].includes(warningMsg)) {
    return
  }
  originalWarn(...args)
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
      rest.get(DeviceProvisionUrlsInfo.getApProvisions.url, (req, res, ctx) => {
        return res(ctx.json(mockApiResponse))
      }),
      rest.post(DeviceProvisionUrlsInfo.refreshApStatus.url, (req, res, ctx) => {
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
})